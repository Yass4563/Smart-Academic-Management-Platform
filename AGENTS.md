# AGENTS.md

## Purpose
This file defines how AI agents should interact with this repository.

The frontend is already implemented.  
The agent is expected to design, implement, and evolve the **entire remaining system** (backend, database, APIs, integrations, and deployment logic) with a high degree of autonomy.

The agent is trusted to make architectural decisions, refactor when necessary, and introduce new files, folders, and dependencies as required.

---

## Project Overview
**Smart Academic Management Platform**

A full-stack academic platform for students, teachers, and administrators, providing:
- Role-based access (Admin / Teacher / Student)
- QR-code attendance tracking
- Session feedback and understanding analytics
- Project (PFE) submission, evaluation, and ranking
- Optional Telegram bot for reminders and announcements

The goal is a **clean, scalable, production-ready system**, not a prototype.

---

## Tech Stack (Preferred, but extensible)

### Frontend (already implemented)
- React.js
- Bootstrap or Tailwind CSS
- Chart.js

### Backend
- Node.js
- Express.js
- MySQL
- JWT authentication
- `qrcode` for QR generation
- `node-telegram-bot-api` for Telegram integration

The agent **may introduce additional libraries** if they provide clear benefits (security, maintainability, scalability).

---

## Agent Authority & Freedom

The agent is explicitly allowed to:
- Design the database schema (ERD)
- Create and restructure backend folders
- Define REST API routes and middleware
- Add migrations, seeders, and validation layers
- Refactor existing code if needed
- Introduce background jobs, cron tasks, or queues
- Improve security, performance, and DX
- Decide how frontend ↔ backend integration should work

The agent should **optimize for long-term maintainability**, not minimal code.

---

## Non-Negotiable Requirements

### Authentication & Authorization
- Email/password login
- JWT-based authentication
- Strict role-based access control (Admin, Teacher, Student)
- Tokens must never be stored insecurely

### Roles & Capabilities

#### Admin
- Manage academic branches (e.g. DUT)
- Import students from Excel (name + email)
- Auto-generate student accounts
- CRUD branches and modules
- Register teachers
- Assign teachers to modules

#### Student
- View profile and enrolled modules
- For each session:
  - Submit questions
  - Rate understanding (1–9)
- Attendance via QR code
- PFE:
  - Upload project details (name, members, supervisor)
  - GitHub link
  - Report (PDF)
  - Demo video

#### Teacher
- View assigned modules and sessions
- Monitor attendance, questions, and understanding metrics
- PFE management:
  - View projects by branch
  - Review submissions
  - Define deadlines
  - Add jury members
  - Assign final grades (0–20)

---

## Core Features to Implement

### QR-Code Attendance
- Unique QR per session
- Time-limited or session-bound validity
- Real-time attendance tracking
- Export attendance (CSV / PDF)

### Feedback & Analytics
- Store per-session understanding scores
- Aggregate analytics:
  - Difficulty trends
  - Session comparisons
  - Frequent questions/topics

### Project (PFE) System
- Secure file uploads
- Role-based access to submissions
- Deadlines and grading
- Supervisor and jury assignment

### Telegram Bot (Optional but Supported)
- Session reminders
- Deadline reminders
- Broadcast announcements
- Admin/Teacher-triggered messages

---

## Code Quality Expectations

- Use clear, consistent naming
- Separate concerns (routes / controllers / services / models)
- Validate all user input
- Handle errors explicitly
- Prefer readability over cleverness
- Avoid hardcoding configuration (use env variables)

---

## Files & Directories

The agent may freely:
- Create `/backend`, `/server`, or similar directories
- Add `/docs` for architecture or API documentation
- Introduce `/scripts`, `/migrations`, `/seeders`
- Add OpenAPI / Swagger documentation if useful

No directories are protected.

---

## Assumptions

If a requirement is ambiguous:
- Make a **reasonable engineering decision**
- Prefer extensible solutions
- Document assumptions in code comments or `/docs`

The agent does **not** need to ask for permission to proceed.

---

## Success Criteria

The project is considered successful if:
- All roles function correctly
- The system is secure and consistent
- The frontend integrates cleanly with the backend
- The architecture can realistically scale to a real academic institution

This is intended to be a **serious academic / professional project**, not a demo.
