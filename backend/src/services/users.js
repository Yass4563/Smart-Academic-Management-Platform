import { pool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT id, email, password_hash, role, full_name, branch_id, is_active FROM users WHERE email = :email",
    { email }
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, email, role, full_name, branch_id, is_active FROM users WHERE id = :id",
    { id }
  );
  return rows[0] ?? null;
}

export async function createUser({ email, passwordHash, role, fullName, branchId }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, branch_id)
     VALUES (:email, :passwordHash, :role, :fullName, :branchId)` ,
    { email, passwordHash, role, fullName, branchId }
  );
  return result.insertId;
}
