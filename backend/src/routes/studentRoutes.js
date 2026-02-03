import { Router } from "express";
import { body } from "express-validator";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { upload } from "../utils/upload.js";
import {
  getProfile,
  getModules,
  getSessions,
  getOverview,
  getAttendanceHistory,
  scanAttendance,
  submitFeedback,
  submitProject,
} from "../controllers/studentController.js";

const router = Router();

router.use(requireAuth, requireRole("STUDENT"));

router.get("/profile", getProfile);
router.get("/modules", getModules);
router.get("/sessions", getSessions);
router.get("/overview", getOverview);
router.get("/attendance/history", getAttendanceHistory);

router.post(
  "/attendance/scan",
  body("qrToken").isString().notEmpty(),
  validate,
  scanAttendance
);

router.post(
  "/feedback",
  body("sessionId").isInt({ min: 1 }),
  body("understandingScore").isInt({ min: 1, max: 9 }),
  validate,
  submitFeedback
);

router.post(
  "/pfe/submit",
  upload.fields([
    { name: "report", maxCount: 1 },
    { name: "demo", maxCount: 1 },
  ]),
  body("name").isString().notEmpty(),
  validate,
  submitProject
);

export default router;
