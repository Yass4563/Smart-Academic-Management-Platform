import { pool } from "../config/db.js";

export async function listModules() {
  const [rows] = await pool.query(
    `SELECT modules.id,
            modules.name,
            modules.code,
            modules.branch_id,
            branches.name AS branch_name,
            (SELECT COUNT(*) FROM student_modules WHERE student_modules.module_id = modules.id) AS student_count,
            (SELECT COUNT(*)
             FROM sessions
             WHERE sessions.module_id = modules.id
               AND (
                 (sessions.qr_expires_at IS NOT NULL AND sessions.qr_expires_at <= NOW())
                 OR (
                   sessions.qr_expires_at IS NULL
                   AND CONCAT(sessions.session_date, ' ', sessions.end_time) < NOW()
                 )
               )) AS completed_session_count,
            (SELECT users.full_name
             FROM teacher_modules
             JOIN teachers ON teachers.id = teacher_modules.teacher_id
             JOIN users ON users.id = teachers.user_id
             WHERE teacher_modules.module_id = modules.id
             LIMIT 1) AS teacher_name
     FROM modules
     LEFT JOIN branches ON branches.id = modules.branch_id
     ORDER BY modules.name`
  );
  return rows;
}

export async function createModule({ name, code, branchId }) {
  const [result] = await pool.query(
    "INSERT INTO modules (name, code, branch_id) VALUES (:name, :code, :branchId)",
    { name, code, branchId }
  );
  return result.insertId;
}

export async function updateModule(id, { name, code, branchId }) {
  await pool.query(
    "UPDATE modules SET name = :name, code = :code, branch_id = :branchId WHERE id = :id",
    { id, name, code, branchId }
  );
}

export async function deleteModule(id) {
  await pool.query("DELETE FROM modules WHERE id = :id", { id });
}
