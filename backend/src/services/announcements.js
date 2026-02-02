import { pool } from "../config/db.js";

export async function createAnnouncement({ createdBy, title, message }) {
  const [result] = await pool.query(
    "INSERT INTO announcements (created_by, title, message) VALUES (:createdBy, :title, :message)",
    { createdBy, title, message }
  );
  return result.insertId;
}

export async function listAnnouncements(limit = 50) {
  const [rows] = await pool.query(
    `SELECT announcements.id, announcements.title, announcements.message, announcements.created_at,
            users.full_name AS created_by_name, users.role AS created_by_role
     FROM announcements
     JOIN users ON users.id = announcements.created_by
     ORDER BY announcements.created_at DESC
     LIMIT :limit`,
    { limit }
  );
  return rows;
}
