import { pool } from "../config/db.js";

export async function listBranches() {
  const [rows] = await pool.query("SELECT id, name, code FROM branches ORDER BY name");
  return rows;
}

export async function createBranch({ name, code }) {
  const [result] = await pool.query(
    "INSERT INTO branches (name, code) VALUES (:name, :code)",
    { name, code }
  );
  return result.insertId;
}

export async function updateBranch(id, { name, code }) {
  await pool.query(
    "UPDATE branches SET name = :name, code = :code WHERE id = :id",
    { id, name, code }
  );
}

export async function deleteBranch(id) {
  await pool.query("DELETE FROM branches WHERE id = :id", { id });
}
