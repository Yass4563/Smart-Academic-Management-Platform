# Smart Academic Management Platform - Backend

## Setup

1. Create a MySQL database named `smart_academic`.
2. Copy `backend/.env.example` to `backend/.env` and fill values.
3. Install dependencies:

```bash
cd backend
npm install
```

4. Initialize schema + create admin user:

```bash
npm run seed
```

For quick deterministic demo data (teachers, students, sessions, attendance, PFE):

```bash
npm run seed:dev
```

To wipe only dev-seeded records:

```bash
npm run seed:dev:wipe
```

For a richer presentation dataset (all roles and major workflows):

```bash
npm run seed:presentation
```

To wipe only presentation-seeded records:

```bash
npm run seed:presentation:wipe
```

5. Start the API:

```bash
npm run dev
```

## Notes
- `UPLOAD_DIR` defaults to `src/uploads` and is served at `/uploads`.
- Announcements will auto-send to Telegram if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_DEFAULT_CHAT_ID` are set.
- Seed admin defaults to `admin@school.local / Admin123!` unless overridden by env.

## Core Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/branches`
- `GET /api/admin/overview`
- `POST /api/admin/branches`
- `GET /api/admin/modules`
- `POST /api/admin/modules`
- `POST /api/admin/teachers`
- `GET /api/admin/teachers`
- `POST /api/admin/students/import`
- `GET /api/admin/students`

Import file supports columns: `Full Name`, `Code Apogée` (or `Student Number`), `Email`, and `Branch` (branch code or name).
- `GET /api/student/profile`
- `GET /api/student/modules`
- `GET /api/student/sessions`
- `GET /api/student/overview`
- `GET /api/student/attendance/history`
- `POST /api/student/attendance/scan`
- `POST /api/student/feedback`
- `GET /api/student/pfe/project`
- `POST /api/student/pfe/submit`
- `GET /api/teacher/modules`
- `POST /api/teacher/sessions`
- `GET /api/teacher/modules/:moduleId/sessions`
- `POST /api/teacher/qr`
- `GET /api/teacher/sessions/:sessionId/attendance`
- `GET /api/teacher/sessions/:sessionId/attendance/export?format=csv|pdf`
- `GET /api/teacher/sessions/:sessionId/feedback`
- `GET /api/teacher/modules/:moduleId/feedback-summary`
- `GET /api/teacher/projects/options`
- `POST /api/teacher/projects`
- `GET /api/teacher/projects`
- `POST /api/teacher/projects/deadline`
- `POST /api/teacher/projects/jury`
- `POST /api/teacher/projects/grade`
- `GET /api/announcements`
- `POST /api/announcements`
