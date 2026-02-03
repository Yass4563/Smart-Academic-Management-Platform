import { pool } from "../config/db.js";

export async function createSession({ moduleId, title, sessionDate, startTime, endTime }) {
  const [result] = await pool.query(
    `INSERT INTO sessions (module_id, title, session_date, start_time, end_time)
     VALUES (:moduleId, :title, :sessionDate, :startTime, :endTime)` ,
    { moduleId, title, sessionDate, startTime, endTime }
  );
  return result.insertId;
}

export async function listSessionsByModule(moduleId) {
  const [rows] = await pool.query(
    `SELECT sessions.*,
            (SELECT COUNT(*) FROM attendance WHERE attendance.session_id = sessions.id) AS present_count,
            (SELECT COUNT(*) FROM student_modules WHERE student_modules.module_id = sessions.module_id) AS total_students
     FROM sessions
     WHERE sessions.module_id = :moduleId
     ORDER BY sessions.session_date DESC, sessions.start_time DESC`,
    { moduleId }
  );
  return rows;
}

export async function listSessionsForStudent(userId) {
  const [rows] = await pool.query(
    `SELECT sessions.*,
            modules.name AS module_name,
            modules.code AS module_code
     FROM students
     JOIN student_modules ON student_modules.student_id = students.id
     JOIN sessions ON sessions.module_id = student_modules.module_id
     JOIN modules ON modules.id = sessions.module_id
     WHERE students.user_id = :userId
     ORDER BY sessions.session_date DESC, sessions.start_time DESC`,
    { userId }
  );
  return rows;
}

export async function listUpcomingSessionsForStudent(userId, limit = 5) {
  const [rows] = await pool.query(
    `SELECT sessions.*, modules.name AS module_name
     FROM students
     JOIN student_modules ON student_modules.student_id = students.id
     JOIN sessions ON sessions.module_id = student_modules.module_id
     JOIN modules ON modules.id = sessions.module_id
     WHERE students.user_id = :userId
       AND CONCAT(sessions.session_date, ' ', sessions.start_time) >= NOW()
     ORDER BY sessions.session_date ASC, sessions.start_time ASC
     LIMIT :limit`,
    { userId, limit }
  );
  return rows;
}

export async function updateSessionQr(id, { qrToken, qrExpiresAt }) {
  await pool.query(
    "UPDATE sessions SET qr_token = :qrToken, qr_expires_at = :qrExpiresAt WHERE id = :id",
    { id, qrToken, qrExpiresAt }
  );
}

export async function findSessionByQrToken(qrToken) {
  const [rows] = await pool.query(
    "SELECT * FROM sessions WHERE qr_token = :qrToken",
    { qrToken }
  );
  return rows[0] ?? null;
}

export async function getSession(moduleId, sessionId) {
  const [rows] = await pool.query(
    "SELECT * FROM sessions WHERE id = :sessionId AND module_id = :moduleId",
    { sessionId, moduleId }
  );
  return rows[0] ?? null;
}
