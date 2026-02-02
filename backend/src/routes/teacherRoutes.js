import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  getModules,
  createSessionHandler,
  getSessions,
  generateQr,
  attendanceBySession,
  exportAttendance,
  feedbackBySession,
  feedbackSummary,
  listProjects,
  setDeadline,
  addJury,
  gradeProject,
} from "../controllers/teacherController.js";

const router = Router();

router.use(requireAuth, requireRole("TEACHER"));

router.get("/modules", getModules);

router.post(
  "/sessions",
  body("moduleId").isInt({ min: 1 }),
  body("title").isString().notEmpty(),
  body("sessionDate").isISO8601(),
  body("startTime").isString().notEmpty(),
  body("endTime").isString().notEmpty(),
  validate,
  createSessionHandler
);

router.get(
  "/modules/:moduleId/sessions",
  param("moduleId").isInt({ min: 1 }),
  validate,
  getSessions
);

router.post(
  "/qr",
  body("moduleId").isInt({ min: 1 }),
  body("sessionId").isInt({ min: 1 }),
  body("expiresInMinutes").optional().isInt({ min: 1, max: 240 }),
  validate,
  generateQr
);

router.get(
  "/sessions/:sessionId/attendance",
  param("sessionId").isInt({ min: 1 }),
  validate,
  attendanceBySession
);

router.get(
  "/sessions/:sessionId/attendance/export",
  param("sessionId").isInt({ min: 1 }),
  query("format").optional().isIn(["csv", "pdf"]),
  validate,
  exportAttendance
);

router.get(
  "/sessions/:sessionId/feedback",
  param("sessionId").isInt({ min: 1 }),
  validate,
  feedbackBySession
);

router.get(
  "/modules/:moduleId/feedback-summary",
  param("moduleId").isInt({ min: 1 }),
  validate,
  feedbackSummary
);

router.get("/projects", listProjects);

router.post(
  "/projects/deadline",
  body("projectId").isInt({ min: 1 }),
  body("deadlineAt").isISO8601(),
  validate,
  setDeadline
);

router.post(
  "/projects/jury",
  body("projectId").isInt({ min: 1 }),
  validate,
  addJury
);

router.post(
  "/projects/grade",
  body("projectId").isInt({ min: 1 }),
  body("grade").isFloat({ min: 0, max: 20 }),
  validate,
  gradeProject
);

export default router;
