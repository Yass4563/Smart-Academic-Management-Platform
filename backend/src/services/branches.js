import { pool } from "../config/db.js";

export async function listBranches() {
  const [rows] = await pool.query(
    `SELECT branches.id,
            branches.name,
            branches.code,
            (SELECT COUNT(*) FROM users WHERE users.branch_id = branches.id AND users.role = 'STUDENT') AS student_count,
            (SELECT COUNT(*) FROM modules WHERE modules.branch_id = branches.id) AS module_count
     FROM branches
     ORDER BY branches.name`
  );
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
