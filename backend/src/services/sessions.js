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
    "SELECT * FROM sessions WHERE module_id = :moduleId ORDER BY session_date DESC, start_time DESC",
    { moduleId }
  );
  return rows;
}

export async function listSessionsForStudent(userId) {
  const [rows] = await pool.query(
    `SELECT sessions.*
     FROM students
     JOIN student_modules ON student_modules.student_id = students.id
     JOIN sessions ON sessions.module_id = student_modules.module_id
     WHERE students.user_id = :userId
     ORDER BY sessions.session_date DESC, sessions.start_time DESC`,
    { userId }
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
