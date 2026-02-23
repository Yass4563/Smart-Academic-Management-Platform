# Smart Academic Management Platform - Full Presentation Draft

## 1. Goal and Scope

This presentation demonstrates the complete workflow across all roles:

- Admin setup and governance
- Teacher course delivery and analytics
- Student learning journey
- PFE lifecycle with coordinator, assigned students, and jury-based grading

## 2. Demo Preparation

Run in `backend/`:

```bash
npm run seed
npm run seed:presentation
```

Start backend and frontend:

```bash
npm run dev
```

```bash
cd ..
npm run dev
```

## 3. Demo Credentials

All presentation users share:

- Password: `Pres12345!`

Accounts:

- Admin: `pres.admin@school.local`
- CS Coordinator Teacher: `pres.teacher.coord.cs@school.local`
- AI Coordinator Teacher: `pres.teacher.coord.ai@school.local`
- Business Coordinator Teacher: `pres.teacher.coord.biz@school.local`
- Jury Teacher: `pres.teacher.jury.one@school.local`
- Student (CS): `pres.student.cs1@school.local`
- Student (AI): `pres.student.ai1@school.local`
- Student (Business): `pres.student.biz1@school.local`

## 4. Suggested Timeline (35-45 min)

- Intro and architecture: 3 min
- Admin walkthrough: 10 min
- Teacher walkthrough: 12 min
- Student walkthrough: 8 min
- PFE deep dive: 8 min
- Q and A: 4 min

## 5. Presentation Script

### 5.1 Introduction (3 min)

Talking points:

- The platform centralizes academic operations across admin, teacher, and student roles.
- It includes attendance, feedback analytics, and a full PFE governance workflow.
- Access is role-based and data visibility is permission-aware.

### 5.2 Admin Walkthrough (10 min)

Login:

- User: `pres.admin@school.local`
- Show Admin dashboard landing and KPIs.

Flow:

1. Open `Overview`.
2. Explain statistics and activity visualizations.
3. Open `Branches` and show branch-level distribution.
4. Open `Modules` and show branch linkage and enrollment counts.
5. Open `Students` and show simplified roster:
   - Student Name
   - Code Apogee
   - Email
   - Branch Name
6. Open `Teachers` and show teacher records and assigned modules.

Key message:

- Admin controls structure and users while preserving clean operational visibility.

### 5.3 Teacher Walkthrough (12 min)

Login:

- User: `pres.teacher.coord.cs@school.local`

Flow:

1. Open `Overview`.
2. Open `My Modules` and discuss assigned teaching scope.
3. Open `Attendance`:
   - show sessions
   - generate QR
   - open attendance details
   - export attendance report
4. Open `Feedback`:
   - session trend and score distribution
   - open student questions
5. Open `PFE Projects`:
   - show created project where this teacher is coordinator
   - explain assigned students and jury members
   - show deadline editing and coordinator controls

Key message:

- Teacher tools cover operational delivery plus measurable learning insight.

### 5.4 Student Walkthrough (8 min)

Login:

- User: `pres.student.cs1@school.local`

Flow:

1. Open `Overview`.
2. Open `My Modules` and show personalized module scope.
3. Open `Scan QR` and explain attendance capture.
4. Open `PFE Project`:
   - emphasize that visibility is assignment-based
   - show coordinator, team, deadline
   - submit/update Google Drive report and demo links
   - optional GitHub link
5. Open `Profile`.

Key message:

- Student experience is personalized and constrained to relevant academic assets.

### 5.5 PFE Governance Deep Dive (8 min)

Coordinator login:

- `pres.teacher.coord.cs@school.local`

Show:

1. Creating a project with selected students.
2. Assigning jury members.
3. Link-only submission policy (Google Drive).
4. Grading permissions:
   - coordinator can grade
   - jury can grade
   - non-jury/non-coordinator cannot grade

Switch login to jury:

- `pres.teacher.jury.one@school.local`

Show:

1. Jury can open assigned project.
2. Jury can submit grade.
3. Jury cannot perform coordinator-only actions.

Key message:

- PFE process is controlled, auditable, and role-secure.

## 6. Feature Checklist (for confidence before live demo)

- Admin dashboards load without API errors.
- Search/filter works in branches/modules/students/teachers.
- Attendance QR generation works.
- Attendance export works.
- Feedback charts and questions render.
- Student PFE tab appears only for assigned students.
- PFE submission accepts Google Drive links and persists.
- Coordinator and jury permissions enforce as expected.

## 7. Risks and Fallbacks

- If data seems inconsistent, rerun:

```bash
npm run seed:presentation:wipe
npm run seed:presentation
```

- If auth hangs, verify DB health and backend `/health`.
- If frontend state appears stale, hard refresh after reseed.

## 8. Closing Slide Talking Points

- One platform, three roles, unified academic lifecycle.
- Real-time operational workflows: attendance, feedback, and PFE governance.
- Strong role-based boundaries with clear ownership and accountability.
