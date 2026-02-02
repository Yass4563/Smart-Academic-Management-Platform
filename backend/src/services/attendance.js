import { pool } from "../config/db.js";

export async function markAttendance({ sessionId, studentId }) {
  await pool.query(
    "INSERT IGNORE INTO attendance (session_id, student_id) VALUES (:sessionId, :studentId)",
    { sessionId, studentId }
  );
}

export async function listAttendance(sessionId) {
  const [rows] = await pool.query(
    `SELECT attendance.id, attendance.marked_at, users.full_name, users.email
     FROM attendance
     JOIN students ON students.id = attendance.student_id
     JOIN users ON users.id = students.user_id
     WHERE attendance.session_id = :sessionId
     ORDER BY attendance.marked_at DESC`,
    { sessionId }
  );
  return rows;
}
