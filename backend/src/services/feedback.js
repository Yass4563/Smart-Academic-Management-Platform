import { pool } from "../config/db.js";

export async function upsertFeedback({ sessionId, studentId, understandingScore, question }) {
  await pool.query(
    `INSERT INTO session_feedback (session_id, student_id, understanding_score, question)
     VALUES (:sessionId, :studentId, :understandingScore, :question)
     ON DUPLICATE KEY UPDATE understanding_score = VALUES(understanding_score), question = VALUES(question)`,
    { sessionId, studentId, understandingScore, question }
  );
}

export async function listFeedbackBySession(sessionId) {
  const [rows] = await pool.query(
    `SELECT session_feedback.id, session_feedback.understanding_score, session_feedback.question,
            users.full_name, users.email
     FROM session_feedback
     JOIN students ON students.id = session_feedback.student_id
     JOIN users ON users.id = students.user_id
     WHERE session_feedback.session_id = :sessionId
     ORDER BY session_feedback.created_at DESC`,
    { sessionId }
  );
  return rows;
}

export async function feedbackSummaryByModule(moduleId) {
  const [rows] = await pool.query(
    `SELECT sessions.id AS session_id, sessions.title, sessions.session_date,
            AVG(session_feedback.understanding_score) AS avg_score,
            COUNT(session_feedback.id) AS responses
     FROM sessions
     LEFT JOIN session_feedback ON session_feedback.session_id = sessions.id
     WHERE sessions.module_id = :moduleId
     GROUP BY sessions.id
     ORDER BY sessions.session_date DESC`,
    { moduleId }
  );
  return rows;
}
