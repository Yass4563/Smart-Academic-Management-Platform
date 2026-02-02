import dotenv from "dotenv";

dotenv.config();

const required = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(`Missing required env vars: ${missing.join(", ")}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "insecure_default",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "smart_academic",
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID ?? "",
  },
  uploadDir: process.env.UPLOAD_DIR ?? "src/uploads",
};
