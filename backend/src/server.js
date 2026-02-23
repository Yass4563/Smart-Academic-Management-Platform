import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";
import { applyMigrations } from "./db/migrate.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import { notFound, errorHandler } from "./middlewares/errors.js";

const app = express();

app.use(helmet());
const allowedOrigins = env.corsOrigin.split(",").map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/health", async (req, res) => {
  try {
    await pingDb();
    return res.json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ status: "db_error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/announcements", announcementRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await applyMigrations();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on :${env.port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", error);
  process.exit(1);
});
