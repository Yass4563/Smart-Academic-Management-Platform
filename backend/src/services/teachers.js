import { pool } from "../config/db.js";

export async function createTeacherProfile(userId, title = null) {
  const [result] = await pool.query(
    "INSERT INTO teachers (user_id, title) VALUES (:userId, :title)",
    { userId, title }
  );
  return result.insertId;
}

export async function assignTeacherToModule(teacherId, moduleId) {
  await pool.query(
    "INSERT IGNORE INTO teacher_modules (teacher_id, module_id) VALUES (:teacherId, :moduleId)",
    { teacherId, moduleId }
  );
}

export async function listTeacherModules(userId) {
  const [rows] = await pool.query(
    `SELECT modules.id,
            modules.name,
            modules.code,
            modules.branch_id,
            (SELECT COUNT(*) FROM student_modules WHERE student_modules.module_id = modules.id) AS total_students,
            (SELECT COUNT(*) FROM sessions WHERE sessions.module_id = modules.id) AS total_sessions
     FROM teachers
     JOIN teacher_modules ON teacher_modules.teacher_id = teachers.id
     JOIN modules ON modules.id = teacher_modules.module_id
     WHERE teachers.user_id = :userId
     ORDER BY modules.name`,
    { userId }
  );
  return rows;
}

export async function getTeacherIdByUser(userId) {
  const [rows] = await pool.query(
    "SELECT id FROM teachers WHERE user_id = :userId",
    { userId }
  );
  return rows[0]?.id ?? null;
}

export async function listTeachers() {
  const [rows] = await pool.query(
    `SELECT teachers.id AS teacher_id,
            users.id AS user_id,
            users.full_name,
            users.email,
            users.branch_id,
            users.is_active,
            teachers.title,
            GROUP_CONCAT(modules.id ORDER BY modules.name) AS module_ids,
            GROUP_CONCAT(modules.name ORDER BY modules.name) AS module_names
     FROM teachers
     JOIN users ON users.id = teachers.user_id
     LEFT JOIN teacher_modules ON teacher_modules.teacher_id = teachers.id
     LEFT JOIN modules ON modules.id = teacher_modules.module_id
     GROUP BY teachers.id, users.id
     ORDER BY users.full_name`
  );
  return rows;
}
