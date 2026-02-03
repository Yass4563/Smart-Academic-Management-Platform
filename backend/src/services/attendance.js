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

export async function listAttendanceForStudent(userId) {
  const [rows] = await pool.query(
    `SELECT attendance.id, attendance.marked_at, sessions.id AS session_id,
            sessions.title, sessions.session_date, modules.name AS module_name
     FROM students
     JOIN attendance ON attendance.student_id = students.id
     JOIN sessions ON sessions.id = attendance.session_id
     JOIN modules ON modules.id = sessions.module_id
     WHERE students.user_id = :userId
     ORDER BY attendance.marked_at DESC`,
    { userId }
  );
  return rows;
}

export async function attendanceRateByModule(userId) {
  const [rows] = await pool.query(
    `SELECT modules.id AS module_id,
            modules.name AS module_name,
            COUNT(attendance.id) AS present_count,
            (SELECT COUNT(*) FROM sessions WHERE sessions.module_id = modules.id) AS total_sessions
     FROM students
     JOIN student_modules ON student_modules.student_id = students.id
     JOIN modules ON modules.id = student_modules.module_id
     LEFT JOIN sessions ON sessions.module_id = modules.id
     LEFT JOIN attendance ON attendance.session_id = sessions.id AND attendance.student_id = students.id
     WHERE students.user_id = :userId
     GROUP BY modules.id`,
    { userId }
  );
  return rows;
}
