import { pool } from "../config/db.js";
import { applyMigrations } from "./migrate.js";
import { hashPassword } from "../utils/password.js";

const DEV_EMAIL_LIKE = "dev.%@school.local";
const DEV_BRANCH_CODE_PREFIX = "DEV-";
const DEV_ANNOUNCEMENT_PREFIX = "[DEV]";

function placeholders(values) {
  return values.map(() => "?").join(", ");
}

async function idsByQuery(query, params = []) {
  const [rows] = await pool.query(query, params);
  return rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
}

async function deleteByIds(table, column, ids) {
  if (!ids.length) {
    return;
  }
  await pool.query(
    `DELETE FROM ${table} WHERE ${column} IN (${placeholders(ids)})`,
    ids
  );
}

async function tableExists(tableName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = :tableName
     LIMIT 1`,
    { tableName }
  );
  return rows.length > 0;
}

async function wipeDevData() {
  const devUserIds = await idsByQuery(
    "SELECT id FROM users WHERE email LIKE ?",
    [DEV_EMAIL_LIKE]
  );
  const devStudentIds =
    devUserIds.length > 0
      ? await idsByQuery(
          `SELECT students.id
           FROM students
           WHERE students.user_id IN (${placeholders(devUserIds)})`,
          devUserIds
        )
      : [];
  const devTeacherIds =
    devUserIds.length > 0
      ? await idsByQuery(
          `SELECT teachers.id
           FROM teachers
           WHERE teachers.user_id IN (${placeholders(devUserIds)})`,
          devUserIds
        )
      : [];
  const devBranchIds = await idsByQuery(
    "SELECT id FROM branches WHERE code LIKE ?",
    [`${DEV_BRANCH_CODE_PREFIX}%`]
  );
  const devModuleIds =
    devBranchIds.length > 0
      ? await idsByQuery(
          `SELECT modules.id
           FROM modules
           WHERE modules.branch_id IN (${placeholders(devBranchIds)})`,
          devBranchIds
        )
      : [];
  const devSessionIds =
    devModuleIds.length > 0
      ? await idsByQuery(
          `SELECT sessions.id
           FROM sessions
           WHERE sessions.module_id IN (${placeholders(devModuleIds)})`,
          devModuleIds
        )
      : [];

  let devProjectIds = [];
  if (devBranchIds.length > 0 || devTeacherIds.length > 0 || devStudentIds.length > 0) {
    const clauses = [];
    const params = [];
    if (devBranchIds.length > 0) {
      clauses.push(`pfe_projects.branch_id IN (${placeholders(devBranchIds)})`);
      params.push(...devBranchIds);
    }
    if (devTeacherIds.length > 0) {
      clauses.push(
        `pfe_projects.coordinator_teacher_id IN (${placeholders(devTeacherIds)})`
      );
      params.push(...devTeacherIds);
    }
    if (devStudentIds.length > 0) {
      clauses.push(`pfe_projects.student_owner_id IN (${placeholders(devStudentIds)})`);
      params.push(...devStudentIds);
    }
    clauses.push("pfe_projects.name LIKE ?");
    params.push("[DEV]%");
    devProjectIds = await idsByQuery(
      `SELECT pfe_projects.id
       FROM pfe_projects
       WHERE ${clauses.join(" OR ")}`,
      params
    );
  }

  if (devSessionIds.length > 0 || devStudentIds.length > 0) {
    const clauses = [];
    const params = [];
    if (devSessionIds.length > 0) {
      clauses.push(`session_id IN (${placeholders(devSessionIds)})`);
      params.push(...devSessionIds);
    }
    if (devStudentIds.length > 0) {
      clauses.push(`student_id IN (${placeholders(devStudentIds)})`);
      params.push(...devStudentIds);
    }
    await pool.query(
      `DELETE FROM attendance WHERE ${clauses.join(" OR ")}`,
      params
    );
    await pool.query(
      `DELETE FROM session_feedback WHERE ${clauses.join(" OR ")}`,
      params
    );
  }

  if (devProjectIds.length > 0 || devTeacherIds.length > 0) {
    const clauses = [];
    const params = [];
    if (devProjectIds.length > 0) {
      clauses.push(`project_id IN (${placeholders(devProjectIds)})`);
      params.push(...devProjectIds);
    }
    if (devTeacherIds.length > 0) {
      clauses.push(`teacher_id IN (${placeholders(devTeacherIds)})`);
      params.push(...devTeacherIds);
    }
    await pool.query(
      `DELETE FROM pfe_jury WHERE ${clauses.join(" OR ")}`,
      params
    );
  }

  if (await tableExists("pfe_project_students")) {
    if (devProjectIds.length > 0 || devStudentIds.length > 0) {
      const clauses = [];
      const params = [];
      if (devProjectIds.length > 0) {
        clauses.push(`project_id IN (${placeholders(devProjectIds)})`);
        params.push(...devProjectIds);
      }
      if (devStudentIds.length > 0) {
        clauses.push(`student_id IN (${placeholders(devStudentIds)})`);
        params.push(...devStudentIds);
      }
      await pool.query(
        `DELETE FROM pfe_project_students WHERE ${clauses.join(" OR ")}`,
        params
      );
    }
  }

  await deleteByIds("pfe_projects", "id", devProjectIds);
  await deleteByIds("sessions", "id", devSessionIds);

  if (devTeacherIds.length > 0 || devModuleIds.length > 0) {
    const clauses = [];
    const params = [];
    if (devTeacherIds.length > 0) {
      clauses.push(`teacher_id IN (${placeholders(devTeacherIds)})`);
      params.push(...devTeacherIds);
    }
    if (devModuleIds.length > 0) {
      clauses.push(`module_id IN (${placeholders(devModuleIds)})`);
      params.push(...devModuleIds);
    }
    await pool.query(
      `DELETE FROM teacher_modules WHERE ${clauses.join(" OR ")}`,
      params
    );
  }

  if (devStudentIds.length > 0 || devModuleIds.length > 0) {
    const clauses = [];
    const params = [];
    if (devStudentIds.length > 0) {
      clauses.push(`student_id IN (${placeholders(devStudentIds)})`);
      params.push(...devStudentIds);
    }
    if (devModuleIds.length > 0) {
      clauses.push(`module_id IN (${placeholders(devModuleIds)})`);
      params.push(...devModuleIds);
    }
    await pool.query(
      `DELETE FROM student_modules WHERE ${clauses.join(" OR ")}`,
      params
    );
  }

  await deleteByIds("teachers", "id", devTeacherIds);
  await deleteByIds("students", "id", devStudentIds);
  await deleteByIds("modules", "id", devModuleIds);
  await deleteByIds("branches", "id", devBranchIds);

  await pool.query("DELETE FROM announcements WHERE title LIKE ?", [
    `${DEV_ANNOUNCEMENT_PREFIX}%`,
  ]);
  await deleteByIds("users", "id", devUserIds);
}

async function ensureBranch(name, code) {
  const [existing] = await pool.query(
    "SELECT id FROM branches WHERE code = :code LIMIT 1",
    { code }
  );
  if (existing.length > 0) {
    return Number(existing[0].id);
  }
  const [result] = await pool.query(
    "INSERT INTO branches (name, code) VALUES (:name, :code)",
    { name, code }
  );
  return Number(result.insertId);
}

async function ensureModule(name, code, branchId) {
  const [existing] = await pool.query(
    "SELECT id FROM modules WHERE code = :code AND branch_id = :branchId LIMIT 1",
    { code, branchId }
  );
  if (existing.length > 0) {
    return Number(existing[0].id);
  }
  const [result] = await pool.query(
    "INSERT INTO modules (name, code, branch_id) VALUES (:name, :code, :branchId)",
    { name, code, branchId }
  );
  return Number(result.insertId);
}

async function createUserWithRole({ email, fullName, role, branchId, passwordHash }) {
  const [userResult] = await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, branch_id, is_active)
     VALUES (:email, :passwordHash, :role, :fullName, :branchId, 1)`,
    { email, passwordHash, role, fullName, branchId }
  );
  return Number(userResult.insertId);
}

async function seedDevData() {
  const sharedPasswordHash = await hashPassword("Dev12345!");
  const today = new Date();
  const toDate = (offsetDays) => {
    const value = new Date(today);
    value.setDate(value.getDate() + offsetDays);
    return value.toISOString().slice(0, 10);
  };

  const branchCsId = await ensureBranch("Development Computer Science", "DEV-CS");
  const branchBizId = await ensureBranch("Development Business", "DEV-BIZ");

  const modules = {
    csAlgo: await ensureModule("Algorithms", "DEV-CS-ALG", branchCsId),
    csWeb: await ensureModule("Web Engineering", "DEV-CS-WEB", branchCsId),
    bizMgmt: await ensureModule("Business Management", "DEV-BIZ-MGT", branchBizId),
    bizStats: await ensureModule("Business Statistics", "DEV-BIZ-STA", branchBizId),
  };

  const teacherUsers = {
    coordCs: await createUserWithRole({
      email: "dev.teacher.coord.cs@school.local",
      fullName: "Dev Coordinator CS",
      role: "TEACHER",
      branchId: branchCsId,
      passwordHash: sharedPasswordHash,
    }),
    coordBiz: await createUserWithRole({
      email: "dev.teacher.coord.biz@school.local",
      fullName: "Dev Coordinator Biz",
      role: "TEACHER",
      branchId: branchBizId,
      passwordHash: sharedPasswordHash,
    }),
    jury: await createUserWithRole({
      email: "dev.teacher.jury@school.local",
      fullName: "Dev Jury Member",
      role: "TEACHER",
      branchId: branchCsId,
      passwordHash: sharedPasswordHash,
    }),
  };

  const [teacherRows] = await pool.query(
    `INSERT INTO teachers (user_id, title)
     VALUES (:coordCs, 'Professor'),
            (:coordBiz, 'Professor'),
            (:jury, 'Associate Professor')`,
    teacherUsers
  );
  const [teachers] = await pool.query(
    "SELECT id, user_id FROM teachers WHERE user_id IN (:u1, :u2, :u3)",
    {
      u1: teacherUsers.coordCs,
      u2: teacherUsers.coordBiz,
      u3: teacherUsers.jury,
    }
  );
  const teacherByUser = new Map(teachers.map((row) => [Number(row.user_id), Number(row.id)]));

  await pool.query(
    `INSERT INTO teacher_modules (teacher_id, module_id)
     VALUES (:tCs, :mCsAlgo),
            (:tCs, :mCsWeb),
            (:tBiz, :mBizMgmt),
            (:tBiz, :mBizStats)`,
    {
      tCs: teacherByUser.get(teacherUsers.coordCs),
      tBiz: teacherByUser.get(teacherUsers.coordBiz),
      mCsAlgo: modules.csAlgo,
      mCsWeb: modules.csWeb,
      mBizMgmt: modules.bizMgmt,
      mBizStats: modules.bizStats,
    }
  );

  const studentDefs = [
    { email: "dev.student.cs1@school.local", name: "Dev Student CS One", branchId: branchCsId, apogee: "DEV-CS-001" },
    { email: "dev.student.cs2@school.local", name: "Dev Student CS Two", branchId: branchCsId, apogee: "DEV-CS-002" },
    { email: "dev.student.cs3@school.local", name: "Dev Student CS Three", branchId: branchCsId, apogee: "DEV-CS-003" },
    { email: "dev.student.cs4@school.local", name: "Dev Student CS Four", branchId: branchCsId, apogee: "DEV-CS-004" },
    { email: "dev.student.biz1@school.local", name: "Dev Student Biz One", branchId: branchBizId, apogee: "DEV-BIZ-001" },
    { email: "dev.student.biz2@school.local", name: "Dev Student Biz Two", branchId: branchBizId, apogee: "DEV-BIZ-002" },
  ];

  const studentUserIds = [];
  for (const student of studentDefs) {
    const userId = await createUserWithRole({
      email: student.email,
      fullName: student.name,
      role: "STUDENT",
      branchId: student.branchId,
      passwordHash: sharedPasswordHash,
    });
    studentUserIds.push({ userId, ...student });
  }

  for (const student of studentUserIds) {
    await pool.query(
      "INSERT INTO students (user_id, student_number) VALUES (:userId, :studentNumber)",
      { userId: student.userId, studentNumber: student.apogee }
    );
  }

  const [studentRows] = await pool.query(
    "SELECT students.id, students.user_id FROM students WHERE students.user_id IN (:ids)",
    { ids: studentUserIds.map((item) => item.userId) }
  );
  const studentIdByUser = new Map(studentRows.map((row) => [Number(row.user_id), Number(row.id)]));

  const studentModulePairs = [];
  for (const student of studentUserIds) {
    const sid = studentIdByUser.get(student.userId);
    if (!sid) continue;
    if (student.branchId === branchCsId) {
      studentModulePairs.push([sid, modules.csAlgo], [sid, modules.csWeb]);
    } else {
      studentModulePairs.push([sid, modules.bizMgmt], [sid, modules.bizStats]);
    }
  }
  for (const [studentId, moduleId] of studentModulePairs) {
    await pool.query(
      "INSERT INTO student_modules (student_id, module_id) VALUES (:studentId, :moduleId)",
      { studentId, moduleId }
    );
  }

  await pool.query(
    `INSERT INTO sessions (module_id, title, session_date, start_time, end_time)
     VALUES (:mCsAlgo, 'Algorithm Foundations', :dPast, '09:00:00', '11:00:00'),
            (:mCsAlgo, 'Algorithm Complexity', :dFuture, '10:00:00', '12:00:00'),
            (:mBizMgmt, 'Management Basics', :dPast, '13:00:00', '15:00:00')`,
    {
      mCsAlgo: modules.csAlgo,
      mBizMgmt: modules.bizMgmt,
      dPast: toDate(-5),
      dFuture: toDate(4),
    }
  );

  const [sessionRows] = await pool.query(
    "SELECT id, module_id FROM sessions WHERE module_id IN (:m1, :m2)",
    { m1: modules.csAlgo, m2: modules.bizMgmt }
  );
  const pastAlgoSession = sessionRows.find((row) => Number(row.module_id) === modules.csAlgo);
  const pastBizSession = sessionRows.find((row) => Number(row.module_id) === modules.bizMgmt);

  const csStudent1 = studentIdByUser.get(studentUserIds[0].userId);
  const csStudent2 = studentIdByUser.get(studentUserIds[1].userId);
  const bizStudent1 = studentIdByUser.get(studentUserIds[4].userId);

  if (pastAlgoSession && csStudent1 && csStudent2) {
    await pool.query(
      `INSERT INTO attendance (session_id, student_id)
       VALUES (:sessionId, :s1), (:sessionId, :s2)`,
      { sessionId: pastAlgoSession.id, s1: csStudent1, s2: csStudent2 }
    );
    await pool.query(
      `INSERT INTO session_feedback (session_id, student_id, understanding_score, question)
       VALUES (:sessionId, :s1, 8, 'Could we get extra exercises please'),
              (:sessionId, :s2, 7, 'Need clarification on complexity analysis.')`,
      { sessionId: pastAlgoSession.id, s1: csStudent1, s2: csStudent2 }
    );
  }

  if (pastBizSession && bizStudent1) {
    await pool.query(
      "INSERT INTO attendance (session_id, student_id) VALUES (:sessionId, :studentId)",
      { sessionId: pastBizSession.id, studentId: bizStudent1 }
    );
  }

  const csTeam = [
    studentIdByUser.get(studentUserIds[0].userId),
    studentIdByUser.get(studentUserIds[1].userId),
    studentIdByUser.get(studentUserIds[2].userId),
  ].filter(Boolean);
  const bizTeam = [
    studentIdByUser.get(studentUserIds[4].userId),
    studentIdByUser.get(studentUserIds[5].userId),
  ].filter(Boolean);

  const [projectInsert] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, report_path, demo_video_path, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :report, :demo, :deadline, :grade)`,
    {
      branchId: branchCsId,
      ownerId: csTeam[0],
      coordId: teacherByUser.get(teacherUsers.coordCs),
      name: "[DEV] Smart Attendance Analytics",
      members: "Dev Student CS One, Dev Student CS Two, Dev Student CS Three",
      github: "https://github.com/example/dev-smart-attendance-analytics",
      report: "https://drive.google.com/file/d/DEVREPORT1/view",
      demo: "https://drive.google.com/file/d/DEVDEMO1/view",
      deadline: `${toDate(10)} 23:59:00`,
      grade: 17.5,
    }
  );
  const projectCsId = Number(projectInsert.insertId);

  const [projectInsert2] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, deadline_at)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :deadline)`,
    {
      branchId: branchBizId,
      ownerId: bizTeam[0],
      coordId: teacherByUser.get(teacherUsers.coordBiz),
      name: "[DEV] SME Financial Forecasting",
      members: "Dev Student Biz One, Dev Student Biz Two",
      github: "https://github.com/example/dev-sme-forecasting",
      deadline: `${toDate(14)} 23:59:00`,
    }
  );
  const projectBizId = Number(projectInsert2.insertId);

  if (await tableExists("pfe_project_students")) {
    for (const studentId of csTeam) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: projectCsId, studentId }
      );
    }
    for (const studentId of bizTeam) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: projectBizId, studentId }
      );
    }
  }

  await pool.query(
    `INSERT INTO pfe_jury (project_id, teacher_id)
     VALUES (:projectId, :juryId)`,
    {
      projectId: projectCsId,
      juryId: teacherByUser.get(teacherUsers.jury),
    }
  );

  const [admins] = await pool.query(
    "SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1"
  );
  if (admins.length > 0) {
    await pool.query(
      `INSERT INTO announcements (created_by, title, message)
       VALUES (:adminId, :title1, :msg1),
              (:adminId, :title2, :msg2)`,
      {
        adminId: admins[0].id,
        title1: "[DEV] Welcome to Demo Dataset",
        msg1: "This announcement is seeded for development testing.",
        title2: "[DEV] Midterm Schedule Reminder",
        msg2: "Please verify attendance and feedback modules during QA.",
      }
    );
  }

  // eslint-disable-next-line no-console
  console.log("Dev seed complete.");
  // eslint-disable-next-line no-console
  console.log("Dev login password for all dev users: Dev12345!");
  // eslint-disable-next-line no-console
  console.log("Example teacher: dev.teacher.coord.cs@school.local");
  // eslint-disable-next-line no-console
  console.log("Example student: dev.student.cs1@school.local");
}

async function main() {
  const wipeOnly = process.argv.includes("--wipe-only");
  await applyMigrations();
  await wipeDevData();
  if (!wipeOnly) {
    await seedDevData();
  } else {
    // eslint-disable-next-line no-console
    console.log("Dev seed data wiped.");
  }
  await pool.end();
}

main().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  try {
    await pool.end();
  } catch {
    // noop
  }
  process.exit(1);
});
