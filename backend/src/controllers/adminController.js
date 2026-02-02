import xlsx from "xlsx";
import { nanoid } from "nanoid";
import { hashPassword } from "../utils/password.js";
import { createUser, findUserByEmail } from "../services/users.js";
import { createBranch, deleteBranch, listBranches, updateBranch } from "../services/branches.js";
import { createModule, deleteModule, listModules, updateModule } from "../services/modules.js";
import { createTeacherProfile, assignTeacherToModule } from "../services/teachers.js";
import { createStudentProfile, listStudents } from "../services/students.js";
import { listTeachers } from "../services/teachers.js";

function generateTempPassword() {
  return nanoid(10);
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
    await createTeacherProfile(userId, title ?? null);
    return res.status(201).json({ userId, tempPassword });
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

export async function importStudents(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Missing Excel file" });
    }
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const results = [];
    for (const row of rows) {
      const email = String(row.email || row.Email || row.EMAIL).trim();
      const fullName = String(row.full_name || row.FullName || row.Name || "").trim();
      if (!email) {
        continue;
      }
      const existing = await findUserByEmail(email);
      if (existing) {
        results.push({ email, status: "skipped" });
        continue;
      }
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);
      const userId = await createUser({
        email,
        passwordHash,
        role: "STUDENT",
        fullName,
        branchId: req.body.branchId ?? null,
      });
      await createStudentProfile(userId, row.student_number ?? null);
      results.push({ email, status: "created", tempPassword });
    }

    return res.status(201).json({ count: results.length, results });
  } catch (error) {
    return next(error);
  }
}
