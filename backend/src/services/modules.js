import { pool } from "../config/db.js";

export async function listModules() {
  const [rows] = await pool.query(
    `SELECT modules.id, modules.name, modules.code, modules.branch_id, branches.name AS branch_name
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
