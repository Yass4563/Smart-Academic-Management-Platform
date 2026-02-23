import { pool } from "../config/db.js";

async function hasTable(tableName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = :tableName
     LIMIT 1`,
    { tableName }
  );
  return rows.length > 0;
}

async function hasColumn(tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = :tableName
       AND column_name = :columnName
     LIMIT 1`,
    { tableName, columnName }
  );
  return rows.length > 0;
}

export async function applyMigrations() {
  const hasPfeProjects = await hasTable("pfe_projects");
  if (!hasPfeProjects) {
    return;
  }

  const pfeProjectsHasCoordinator = await hasColumn("pfe_projects", "coordinator_teacher_id");
  if (!pfeProjectsHasCoordinator) {
    await pool.query(
      "ALTER TABLE pfe_projects ADD COLUMN coordinator_teacher_id INT NULL AFTER student_owner_id"
    );
  }

  const hasProjectStudents = await hasTable("pfe_project_students");
  if (!hasProjectStudents) {
    await pool.query(
      `CREATE TABLE pfe_project_students (
        project_id INT NOT NULL,
        student_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, student_id),
        UNIQUE KEY uniq_student_pfe_project (student_id),
        FOREIGN KEY (project_id) REFERENCES pfe_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )`
    );
  }

  await pool.query(
    `INSERT IGNORE INTO pfe_project_students (project_id, student_id)
     SELECT id, student_owner_id
     FROM pfe_projects
     WHERE student_owner_id IS NOT NULL`
  );
}
