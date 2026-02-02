import { pool } from "../config/db.js";

export async function createStudentProfile(userId, studentNumber = null) {
  const [result] = await pool.query(
    "INSERT INTO students (user_id, student_number) VALUES (:userId, :studentNumber)",
    { userId, studentNumber }
  );
  return result.insertId;
}

export async function enrollStudentInModule(studentId, moduleId) {
  await pool.query(
    "INSERT IGNORE INTO student_modules (student_id, module_id) VALUES (:studentId, :moduleId)",
    { studentId, moduleId }
  );
}

export async function listStudentModules(userId) {
  const [rows] = await pool.query(
    `SELECT modules.id, modules.name, modules.code
     FROM students
     JOIN student_modules ON student_modules.student_id = students.id
     JOIN modules ON modules.id = student_modules.module_id
     WHERE students.user_id = :userId
     ORDER BY modules.name`,
    { userId }
  );
  return rows;
}

export async function getStudentIdByUser(userId) {
  const [rows] = await pool.query(
    "SELECT id FROM students WHERE user_id = :userId",
    { userId }
  );
  return rows[0]?.id ?? null;
}

export async function listStudents() {
  const [rows] = await pool.query(
    `SELECT students.id AS student_id,
            users.id AS user_id,
            users.full_name,
            users.email,
            users.branch_id,
            users.is_active,
            students.student_number
     FROM students
     JOIN users ON users.id = students.user_id
     ORDER BY users.full_name`
  );
  return rows;
}
