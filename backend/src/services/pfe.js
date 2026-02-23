import { pool } from "../config/db.js";

function parsePeopleList(rawValue) {
  if (!rawValue) {
    return [];
  }
  return String(rawValue)
    .split("||")
    .map((entry) => {
      const [id, name] = String(entry).split("::");
      return {
        id: Number(id),
        name: name ?? "",
      };
    })
    .filter((entry) => Number.isFinite(entry.id) && entry.id > 0 && entry.name);
}

function normalizeProjectRow(row) {
  return {
    ...row,
    assigned_students: parsePeopleList(row.assigned_students_raw),
    jury_members: parsePeopleList(row.jury_members_raw),
    is_coordinator: Boolean(row.is_coordinator),
    is_jury_member: Boolean(row.is_jury_member),
    can_grade: Boolean(row.can_grade),
  };
}

export async function createProjectByTeacher({
  coordinatorTeacherId,
  branchId,
  name,
  githubLink = null,
  deadlineAt = null,
  studentIds = [],
  juryTeacherIds = [],
}) {
  const uniqStudentIds = [...new Set(studentIds.map((id) => Number(id)).filter(Boolean))];
  const uniqJuryTeacherIds = [...new Set(juryTeacherIds.map((id) => Number(id)).filter(Boolean))].filter(
    (id) => id !== Number(coordinatorTeacherId)
  );

  if (uniqStudentIds.length === 0) {
    throw new Error("Select at least one student.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [allBranchStudents] = await connection.query(
      `SELECT students.id, users.full_name
       FROM students
       JOIN users ON users.id = students.user_id
       WHERE users.branch_id = :branchId`,
      { branchId }
    );
    const studentsInBranch = allBranchStudents.filter((student) =>
      uniqStudentIds.includes(Number(student.id))
    );
    if (studentsInBranch.length !== uniqStudentIds.length) {
      throw new Error("Some selected students do not belong to your branch.");
    }

    const [alreadyAssigned] = await connection.query(
      `SELECT pfe_project_students.student_id
       FROM pfe_project_students`
    );
    const alreadyAssignedSet = new Set(alreadyAssigned.map((row) => Number(row.student_id)));
    const overlapping = uniqStudentIds.filter((id) => alreadyAssignedSet.has(id));
    if (overlapping.length > 0) {
      throw new Error("One or more selected students are already assigned to another project.");
    }

    if (uniqJuryTeacherIds.length > 0) {
      const [juryTeachers] = await connection.query(
        `SELECT teachers.id
         FROM teachers
         JOIN users ON users.id = teachers.user_id
         WHERE users.role = 'TEACHER'`
      );
      const validJuryIds = new Set(juryTeachers.map((row) => Number(row.id)));
      if (uniqJuryTeacherIds.some((id) => !validJuryIds.has(id))) {
        throw new Error("Some selected jury members are invalid.");
      }
    }

    const firstStudentId = uniqStudentIds[0];
    const members = studentsInBranch
      .map((student) => student.full_name)
      .sort((a, b) => a.localeCompare(b))
      .join(", ");

    const [projectResult] = await connection.query(
      `INSERT INTO pfe_projects
       (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, deadline_at)
       VALUES (:branchId, :studentOwnerId, :coordinatorTeacherId, :name, :members, :githubLink, :deadlineAt)`,
      {
        branchId,
        studentOwnerId: firstStudentId,
        coordinatorTeacherId,
        name,
        members,
        githubLink,
        deadlineAt,
      }
    );
    const projectId = projectResult.insertId;

    for (const studentId of uniqStudentIds) {
      await connection.query(
        `INSERT INTO pfe_project_students (project_id, student_id)
         VALUES (:projectId, :studentId)`,
        { projectId, studentId }
      );
    }

    for (const teacherId of uniqJuryTeacherIds) {
      await connection.query(
        `INSERT IGNORE INTO pfe_jury (project_id, teacher_id)
         VALUES (:projectId, :teacherId)`,
        { projectId, teacherId }
      );
    }

    await connection.commit();
    return projectId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listProjectsForTeacher(teacherId) {
  const [rows] = await pool.query(
    `SELECT pfe_projects.*,
            users.full_name AS owner_name,
            coordinator_users.full_name AS coordinator_name,
            (
              SELECT GROUP_CONCAT(CONCAT(students.id, '::', su.full_name) ORDER BY su.full_name SEPARATOR '||')
              FROM pfe_project_students
              JOIN students ON students.id = pfe_project_students.student_id
              JOIN users su ON su.id = students.user_id
              WHERE pfe_project_students.project_id = pfe_projects.id
            ) AS assigned_students_raw,
            (
              SELECT GROUP_CONCAT(CONCAT(teachers.id, '::', ju.full_name) ORDER BY ju.full_name SEPARATOR '||')
              FROM pfe_jury
              JOIN teachers ON teachers.id = pfe_jury.teacher_id
              JOIN users ju ON ju.id = teachers.user_id
              WHERE pfe_jury.project_id = pfe_projects.id
            ) AS jury_members_raw,
            (pfe_projects.coordinator_teacher_id = :teacherId) AS is_coordinator,
            EXISTS(
              SELECT 1
              FROM pfe_jury
              WHERE pfe_jury.project_id = pfe_projects.id
                AND pfe_jury.teacher_id = :teacherId
            ) AS is_jury_member,
            (
              (pfe_projects.coordinator_teacher_id = :teacherId)
              OR EXISTS(
                SELECT 1
                FROM pfe_jury
                WHERE pfe_jury.project_id = pfe_projects.id
                  AND pfe_jury.teacher_id = :teacherId
              )
            ) AS can_grade
     FROM pfe_projects
     LEFT JOIN students owner_student ON owner_student.id = pfe_projects.student_owner_id
     LEFT JOIN users ON users.id = owner_student.user_id
     LEFT JOIN teachers coordinator_teacher ON coordinator_teacher.id = pfe_projects.coordinator_teacher_id
     LEFT JOIN users coordinator_users ON coordinator_users.id = coordinator_teacher.user_id
     WHERE pfe_projects.coordinator_teacher_id = :teacherId
        OR EXISTS(
          SELECT 1
          FROM pfe_jury
          WHERE pfe_jury.project_id = pfe_projects.id
            AND pfe_jury.teacher_id = :teacherId
        )
     ORDER BY pfe_projects.created_at DESC`,
    { teacherId }
  );
  return rows.map(normalizeProjectRow);
}

export async function listProjectOptionsForTeacher(branchId, teacherId) {
  const [students] = await pool.query(
    `SELECT students.id, users.full_name, users.email
     FROM students
     JOIN users ON users.id = students.user_id
     LEFT JOIN pfe_project_students ON pfe_project_students.student_id = students.id
     WHERE users.branch_id = :branchId
       AND users.is_active = 1
       AND pfe_project_students.student_id IS NULL
     ORDER BY users.full_name`,
    { branchId }
  );

  const [teachers] = await pool.query(
    `SELECT teachers.id, users.full_name, users.email
     FROM teachers
     JOIN users ON users.id = teachers.user_id
     WHERE users.is_active = 1
       AND teachers.id <> :teacherId
     ORDER BY users.full_name`,
    { teacherId }
  );

  return { students, teachers };
}

export async function getAssignedProjectForStudent(studentId) {
  const [rows] = await pool.query(
    `SELECT pfe_projects.*,
            coordinator_users.full_name AS coordinator_name,
            (
              SELECT GROUP_CONCAT(CONCAT(students.id, '::', su.full_name) ORDER BY su.full_name SEPARATOR '||')
              FROM pfe_project_students
              JOIN students ON students.id = pfe_project_students.student_id
              JOIN users su ON su.id = students.user_id
              WHERE pfe_project_students.project_id = pfe_projects.id
            ) AS assigned_students_raw,
            (
              SELECT GROUP_CONCAT(CONCAT(teachers.id, '::', ju.full_name) ORDER BY ju.full_name SEPARATOR '||')
              FROM pfe_jury
              JOIN teachers ON teachers.id = pfe_jury.teacher_id
              JOIN users ju ON ju.id = teachers.user_id
              WHERE pfe_jury.project_id = pfe_projects.id
            ) AS jury_members_raw
     FROM pfe_project_students
     JOIN pfe_projects ON pfe_projects.id = pfe_project_students.project_id
     LEFT JOIN teachers coordinator_teacher ON coordinator_teacher.id = pfe_projects.coordinator_teacher_id
     LEFT JOIN users coordinator_users ON coordinator_users.id = coordinator_teacher.user_id
     WHERE pfe_project_students.student_id = :studentId
     LIMIT 1`,
    { studentId }
  );
  if (rows.length === 0) {
    return null;
  }
  return normalizeProjectRow(rows[0]);
}

export async function submitProjectLinks({
  projectId,
  studentId,
  githubLink = null,
  reportLink,
  demoVideoLink,
}) {
  const [assigned] = await pool.query(
    `SELECT 1
     FROM pfe_project_students
     WHERE project_id = :projectId
       AND student_id = :studentId
     LIMIT 1`,
    { projectId, studentId }
  );
  if (assigned.length === 0) {
    return false;
  }

  await pool.query(
    `UPDATE pfe_projects
     SET report_path = :reportLink,
         demo_video_path = :demoVideoLink,
         github_link = COALESCE(:githubLink, github_link)
     WHERE id = :projectId`,
    { projectId, reportLink, demoVideoLink, githubLink }
  );
  return true;
}

export async function setProjectDeadline(projectId, deadlineAt) {
  await pool.query(
    "UPDATE pfe_projects SET deadline_at = :deadlineAt WHERE id = :id",
    { id: projectId, deadlineAt }
  );
}

export async function setProjectGrade(projectId, grade) {
  await pool.query(
    "UPDATE pfe_projects SET grade = :grade WHERE id = :id",
    { id: projectId, grade }
  );
}

export async function addJuryMember(projectId, teacherId) {
  await pool.query(
    "INSERT IGNORE INTO pfe_jury (project_id, teacher_id) VALUES (:projectId, :teacherId)",
    { projectId, teacherId }
  );
}

export async function isProjectCoordinator(projectId, teacherId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM pfe_projects
     WHERE id = :projectId
       AND coordinator_teacher_id = :teacherId
     LIMIT 1`,
    { projectId, teacherId }
  );
  return rows.length > 0;
}

export async function canTeacherGradeProject(projectId, teacherId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM pfe_projects
     WHERE id = :projectId
       AND (
         coordinator_teacher_id = :teacherId
         OR EXISTS(
           SELECT 1
           FROM pfe_jury
           WHERE pfe_jury.project_id = pfe_projects.id
             AND pfe_jury.teacher_id = :teacherId
         )
       )
     LIMIT 1`,
    { projectId, teacherId }
  );
  return rows.length > 0;
}
