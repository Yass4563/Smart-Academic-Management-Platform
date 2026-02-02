import { Router } from "express";
import { body } from "express-validator";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getAnnouncements, createAnnouncementHandler } from "../controllers/announcementController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getAnnouncements);

router.post(
  "/",
  requireRole("ADMIN", "TEACHER"),
  body("title").isString().notEmpty(),
  body("message").isString().notEmpty(),
  validate,
  createAnnouncementHandler
);

export default router;
