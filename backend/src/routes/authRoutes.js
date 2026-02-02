import { Router } from "express";
import { body } from "express-validator";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  validate,
  login
);

router.get("/me", requireAuth, me);

export default router;
