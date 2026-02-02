import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";
import { hashPassword } from "../utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const raw = fs.readFileSync(schemaPath, "utf-8");
  const statements = raw
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@school.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const fullName = process.env.SEED_ADMIN_NAME ?? "System Admin";

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = :email",
    { email }
  );
  if (rows.length > 0) {
    return { email, password: "(already exists)" };
  }

  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name)
     VALUES (:email, :passwordHash, 'ADMIN', :fullName)`,
    { email, passwordHash, fullName }
  );
  return { email, password };
}

async function main() {
  await runSchema();
  const admin = await ensureAdmin();
  // eslint-disable-next-line no-console
  console.log("Seed complete.");
  // eslint-disable-next-line no-console
  console.log(`Admin login: ${admin.email} / ${admin.password}`);
  await pool.end();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
