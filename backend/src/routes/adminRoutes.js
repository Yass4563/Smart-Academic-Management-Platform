import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  assignTeacher,
  createBranchHandler,
  createModuleHandler,
  createTeacher,
  getAdminOverview,
  enrollStudent,
  getStudents,
  getTeachers,
  deleteBranchHandler,
  deleteModuleHandler,
  getBranches,
  getModules,
  importStudents,
  updateBranchHandler,
  updateModuleHandler,
} from "../controllers/adminController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth, requireRole("ADMIN"));

router.get("/branches", getBranches);
router.get("/overview", getAdminOverview);
router.post(
  "/branches",
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  validate,
  createBranchHandler
);
router.put(
  "/branches/:id",
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  validate,
  updateBranchHandler
);
router.delete("/branches/:id", deleteBranchHandler);

router.get("/modules", getModules);
router.post(
  "/modules",
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  body("branchId").isInt({ min: 1 }),
  validate,
  createModuleHandler
);
router.put(
  "/modules/:id",
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  body("branchId").isInt({ min: 1 }),
  validate,
  updateModuleHandler
);
router.delete("/modules/:id", deleteModuleHandler);

router.post(
  "/teachers",
  body("email").isEmail(),
  body("fullName").isString().notEmpty(),
  body("branchId").optional().isInt({ min: 1 }),
  validate,
  createTeacher
);
router.get("/teachers", getTeachers);

router.post(
  "/assign-teacher",
  body("teacherId").isInt({ min: 1 }),
  body("moduleId").isInt({ min: 1 }),
  validate,
  assignTeacher
);

router.post(
  "/students/import",
  upload.single("file"),
  body("branchId").optional().isInt({ min: 1 }),
  validate,
  importStudents
);
router.get("/students", getStudents);
router.post(
  "/students/enroll",
  body("studentId").isInt({ min: 1 }),
  body("moduleId").isInt({ min: 1 }),
  validate,
  enrollStudent
);

export default router;
