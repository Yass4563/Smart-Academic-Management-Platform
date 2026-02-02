import path from "path";
import fs from "fs";
import multer from "multer";
import { env } from "../config/env.js";

const uploadRoot = path.resolve(env.uploadDir);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});
