import xlsx from "xlsx";
import { nanoid } from "nanoid";
import { hashPassword } from "../utils/password.js";
import { pool } from "../config/db.js";
import { createUser, findUserByEmail } from "../services/users.js";
import { createBranch, deleteBranch, listBranches, updateBranch } from "../services/branches.js";
import { createModule, deleteModule, listModules, updateModule } from "../services/modules.js";
import { createTeacherProfile, assignTeacherToModule } from "../services/teachers.js";
import { createStudentProfile, enrollStudentInModule, listStudents } from "../services/students.js";
import { listTeachers } from "../services/teachers.js";

function generateTempPassword() {
  return nanoid(10);
}

function normalizeFullNameForPassword(fullName) {
  return fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export async function getBranches(req, res, next) {
  try {
    const branches = await listBranches();
    return res.json({ branches });
  } catch (error) {
    return next(error);
  }
}

export async function createBranchHandler(req, res, next) {
  try {
    const id = await createBranch(req.body);
    return res.status(201).json({ id });
  } catch (error) {
    return next(error);
  }
}

export async function updateBranchHandler(req, res, next) {
  try {
    await updateBranch(req.params.id, req.body);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function deleteBranchHandler(req, res, next) {
  try {
    await deleteBranch(req.params.id);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function getModules(req, res, next) {
  try {
    const modules = await listModules();
    return res.json({ modules });
  } catch (error) {
    return next(error);
  }
}

export async function createModuleHandler(req, res, next) {
  try {
    const id = await createModule({
      name: req.body.name,
      code: req.body.code,
      branchId: req.body.branchId,
    });
    return res.status(201).json({ id });
  } catch (error) {
    return next(error);
  }
}

export async function updateModuleHandler(req, res, next) {
  try {
    await updateModule(req.params.id, {
      name: req.body.name,
      code: req.body.code,
      branchId: req.body.branchId,
    });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function deleteModuleHandler(req, res, next) {
  try {
    await deleteModule(req.params.id);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function createTeacher(req, res, next) {
  try {
    const { email, fullName, branchId, title } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    const userId = await createUser({
      email,
      passwordHash,
      role: "TEACHER",
      fullName,
      branchId,
    });
    const teacherId = await createTeacherProfile(userId, title ?? null);
    return res.status(201).json({ userId, teacherId, tempPassword });
  } catch (error) {
    return next(error);
  }
}

export async function assignTeacher(req, res, next) {
  try {
    const { teacherId, moduleId } = req.body;
    await assignTeacherToModule(teacherId, moduleId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function getTeachers(req, res, next) {
  try {
    const teachers = await listTeachers();
    return res.json({ teachers });
  } catch (error) {
    return next(error);
  }
}

export async function getStudents(req, res, next) {
  try {
    const students = await listStudents();
    return res.json({ students });
  } catch (error) {
    return next(error);
  }
}

export async function enrollStudent(req, res, next) {
  try {
    const { studentId, moduleId } = req.body;
    await enrollStudentInModule(studentId, moduleId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function importStudents(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Missing Excel file" });
    }
    const branches = await listBranches();
    const branchByCode = new Map(
      branches.map((branch) => [branch.code.toLowerCase(), branch.id])
    );
    const branchByName = new Map(
      branches.map((branch) => [branch.name.toLowerCase(), branch.id])
    );
    const branchCodeById = new Map(
      branches.map((branch) => [branch.id, branch.code])
    );
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Read raw rows and start from the second row (index 1) to skip headers.
    const rows = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      range: 1,
      blankrows: false,
    });

    const results = [];
    for (const row of rows) {
      const fullName = String(row[0] ?? "").trim();
      const email = String(row[1] ?? "").trim();
      const branchValue = String(row[2] ?? "").trim();
      if (!email || !fullName) {
        continue;
      }
      const existing = await findUserByEmail(email);
      if (existing) {
        results.push({ email, status: "skipped" });
        continue;
      }
      let branchId = req.body.branchId ?? null;
      if (branchValue) {
        const normalized = branchValue.toLowerCase();
        branchId =
          branchByCode.get(normalized) ??
          branchByName.get(normalized) ??
          null;
        if (!branchId) {
          results.push({ email, status: "invalid-branch", branch: branchValue });
          continue;
        }
      }
      if (!branchId) {
        results.push({ email, status: "invalid-branch", branch: branchValue || "missing" });
        continue;
      }
      const branchCode = (branchCodeById.get(Number(branchId)) ?? "").toLowerCase();
      const normalizedName = normalizeFullNameForPassword(fullName);
      const generatedPassword = `${normalizedName}@${branchCode}`;
      const passwordHash = await hashPassword(generatedPassword);
      const userId = await createUser({
        email,
        passwordHash,
        role: "STUDENT",
        fullName,
        branchId,
      });
      await createStudentProfile(userId, row.student_number ?? null);
      results.push({ email, status: "created", password: generatedPassword });
    }

    return res.status(201).json({ count: results.length, results });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminOverview(req, res, next) {
  try {
    const [students] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'STUDENT'"
    );
    const [teachers] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'TEACHER' AND is_active = 1"
    );
    const [modules] = await pool.query("SELECT COUNT(*) AS total FROM modules");
    const [branches] = await pool.query("SELECT COUNT(*) AS total FROM branches");

    const [attendance] = await pool.query(
      `SELECT DATE_FORMAT(marked_at, '%Y-%m') AS month, COUNT(*) AS total
       FROM attendance
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`
    );

    const [enrollment] = await pool.query(
      `SELECT modules.name, COUNT(student_modules.student_id) AS students
       FROM modules
       LEFT JOIN student_modules ON student_modules.module_id = modules.id
       GROUP BY modules.id
       ORDER BY students DESC
       LIMIT 6`
    );

    const [recentUsers] = await pool.query(
      `SELECT full_name AS label, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return res.json({
      stats: {
        totalStudents: students[0]?.total ?? 0,
        activeTeachers: teachers[0]?.total ?? 0,
        modules: modules[0]?.total ?? 0,
        branches: branches[0]?.total ?? 0,
      },
      attendanceTrends: attendance,
      moduleEnrollment: enrollment,
      recentActivity: recentUsers,
    });
  } catch (error) {
    return next(error);
  }
}
