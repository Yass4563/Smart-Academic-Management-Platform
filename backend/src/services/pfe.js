import { pool } from "../config/db.js";

export async function upsertProject({
  branchId,
  studentId,
  name,
  members,
  supervisor,
  githubLink,
  reportPath,
  demoVideoPath,
}) {
  const [existing] = await pool.query(
    "SELECT id FROM pfe_projects WHERE student_owner_id = :studentId",
    { studentId }
  );
  if (existing.length > 0) {
    const id = existing[0].id;
    await pool.query(
      `UPDATE pfe_projects
       SET name = :name,
           members = :members,
           supervisor = :supervisor,
           github_link = :githubLink,
           report_path = COALESCE(:reportPath, report_path),
           demo_video_path = COALESCE(:demoVideoPath, demo_video_path)
       WHERE id = :id`,
      { id, name, members, supervisor, githubLink, reportPath, demoVideoPath }
    );
    return id;
  }
  const [result] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, name, members, supervisor, github_link, report_path, demo_video_path)
     VALUES (:branchId, :studentId, :name, :members, :supervisor, :githubLink, :reportPath, :demoVideoPath)`,
    { branchId, studentId, name, members, supervisor, githubLink, reportPath, demoVideoPath }
  );
  return result.insertId;
}

export async function listProjectsByBranch(branchId) {
  const [rows] = await pool.query(
    `SELECT pfe_projects.*, users.full_name AS student_name
     FROM pfe_projects
     JOIN students ON students.id = pfe_projects.student_owner_id
     JOIN users ON users.id = students.user_id
     WHERE pfe_projects.branch_id = :branchId
     ORDER BY pfe_projects.created_at DESC`,
    { branchId }
  );
  return rows;
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
