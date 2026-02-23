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

export async function createBranch({ name, code, modules = [] }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "INSERT INTO branches (name, code) VALUES (:name, :code)",
      { name, code }
    );
    const branchId = result.insertId;

    for (const module of modules) {
      const moduleName = String(module?.name ?? "").trim();
      const moduleCode = String(module?.code ?? "").trim();
      if (!moduleName || !moduleCode) {
        continue;
      }
      const [moduleResult] = await connection.query(
        "INSERT INTO modules (name, code, branch_id) VALUES (:name, :code, :branchId)",
        { name: moduleName, code: moduleCode, branchId }
      );
      await connection.query(
        `INSERT IGNORE INTO student_modules (student_id, module_id)
         SELECT students.id, :moduleId
         FROM students
         JOIN users ON users.id = students.user_id
         WHERE users.branch_id = :branchId`,
        { branchId, moduleId: moduleResult.insertId }
      );
    }

    await connection.commit();
    return branchId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
