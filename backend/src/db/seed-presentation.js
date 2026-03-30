import { pool } from "../config/db.js";
import { applyMigrations } from "./migrate.js";
import { hashPassword } from "../utils/password.js";

const PRES_EMAIL_LIKE = "pres.%@school.local";
const PRES_BRANCH_CODE_PREFIX = "PRES-";
const PRES_ANNOUNCEMENT_PREFIX = "[PRES]";
const PRES_PROJECT_PREFIX = "[PRES]";

function placeholders(values) {
  return values.map(() => "?").join(", ");
}

async function idsByQuery(query, params = []) {
  const [rows] = await pool.query(query, params);
  return rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
}

async function deleteByIds(table, column, ids) {
  if (!ids.length) {
    return;
  }
  await pool.query(
    `DELETE FROM ${table} WHERE ${column} IN (${placeholders(ids)})`,
    ids
  );
}

async function tableExists(tableName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = :tableName
     LIMIT 1`,
    { tableName }
  );
  return rows.length > 0;
}

async function wipePresentationData() {
  const presUserIds = await idsByQuery(
    "SELECT id FROM users WHERE email LIKE ?",
    [PRES_EMAIL_LIKE]
  );
  const presStudentIds =
    presUserIds.length > 0
      ? await idsByQuery(
          `SELECT students.id
           FROM students
           WHERE students.user_id IN (${placeholders(presUserIds)})`,
          presUserIds
        )
      : [];
  const presTeacherIds =
    presUserIds.length > 0
      ? await idsByQuery(
          `SELECT teachers.id
           FROM teachers
           WHERE teachers.user_id IN (${placeholders(presUserIds)})`,
          presUserIds
        )
      : [];
  const presBranchIds = await idsByQuery(
    "SELECT id FROM branches WHERE code LIKE ?",
    [`${PRES_BRANCH_CODE_PREFIX}%`]
  );
  const presModuleIds =
    presBranchIds.length > 0
      ? await idsByQuery(
          `SELECT modules.id
           FROM modules
           WHERE modules.branch_id IN (${placeholders(presBranchIds)})`,
          presBranchIds
        )
      : [];
  const presSessionIds =
    presModuleIds.length > 0
      ? await idsByQuery(
          `SELECT sessions.id
           FROM sessions
           WHERE sessions.module_id IN (${placeholders(presModuleIds)})`,
          presModuleIds
        )
      : [];

  let presProjectIds = [];
  const clauses = [];
  const params = [];
  if (presBranchIds.length > 0) {
    clauses.push(`pfe_projects.branch_id IN (${placeholders(presBranchIds)})`);
    params.push(...presBranchIds);
  }
  if (presTeacherIds.length > 0) {
    clauses.push(
      `pfe_projects.coordinator_teacher_id IN (${placeholders(presTeacherIds)})`
    );
    params.push(...presTeacherIds);
  }
  if (presStudentIds.length > 0) {
    clauses.push(`pfe_projects.student_owner_id IN (${placeholders(presStudentIds)})`);
    params.push(...presStudentIds);
  }
  clauses.push("pfe_projects.name LIKE ?");
  params.push(`${PRES_PROJECT_PREFIX}%`);

  presProjectIds = await idsByQuery(
    `SELECT pfe_projects.id
     FROM pfe_projects
     WHERE ${clauses.join(" OR ")}`,
    params
  );

  if (presSessionIds.length > 0 || presStudentIds.length > 0) {
    const rowsClauses = [];
    const rowsParams = [];
    if (presSessionIds.length > 0) {
      rowsClauses.push(`session_id IN (${placeholders(presSessionIds)})`);
      rowsParams.push(...presSessionIds);
    }
    if (presStudentIds.length > 0) {
      rowsClauses.push(`student_id IN (${placeholders(presStudentIds)})`);
      rowsParams.push(...presStudentIds);
    }
    await pool.query(
      `DELETE FROM attendance WHERE ${rowsClauses.join(" OR ")}`,
      rowsParams
    );
    await pool.query(
      `DELETE FROM session_feedback WHERE ${rowsClauses.join(" OR ")}`,
      rowsParams
    );
  }

  if (presProjectIds.length > 0 || presTeacherIds.length > 0) {
    const juryClauses = [];
    const juryParams = [];
    if (presProjectIds.length > 0) {
      juryClauses.push(`project_id IN (${placeholders(presProjectIds)})`);
      juryParams.push(...presProjectIds);
    }
    if (presTeacherIds.length > 0) {
      juryClauses.push(`teacher_id IN (${placeholders(presTeacherIds)})`);
      juryParams.push(...presTeacherIds);
    }
    await pool.query(
      `DELETE FROM pfe_jury WHERE ${juryClauses.join(" OR ")}`,
      juryParams
    );
  }

  if (await tableExists("pfe_project_students")) {
    if (presProjectIds.length > 0 || presStudentIds.length > 0) {
      const psClauses = [];
      const psParams = [];
      if (presProjectIds.length > 0) {
        psClauses.push(`project_id IN (${placeholders(presProjectIds)})`);
        psParams.push(...presProjectIds);
      }
      if (presStudentIds.length > 0) {
        psClauses.push(`student_id IN (${placeholders(presStudentIds)})`);
        psParams.push(...presStudentIds);
      }
      await pool.query(
        `DELETE FROM pfe_project_students WHERE ${psClauses.join(" OR ")}`,
        psParams
      );
    }
  }

  await deleteByIds("pfe_projects", "id", presProjectIds);
  await deleteByIds("sessions", "id", presSessionIds);

  if (presTeacherIds.length > 0 || presModuleIds.length > 0) {
    const tmClauses = [];
    const tmParams = [];
    if (presTeacherIds.length > 0) {
      tmClauses.push(`teacher_id IN (${placeholders(presTeacherIds)})`);
      tmParams.push(...presTeacherIds);
    }
    if (presModuleIds.length > 0) {
      tmClauses.push(`module_id IN (${placeholders(presModuleIds)})`);
      tmParams.push(...presModuleIds);
    }
    await pool.query(
      `DELETE FROM teacher_modules WHERE ${tmClauses.join(" OR ")}`,
      tmParams
    );
  }

  if (presStudentIds.length > 0 || presModuleIds.length > 0) {
    const smClauses = [];
    const smParams = [];
    if (presStudentIds.length > 0) {
      smClauses.push(`student_id IN (${placeholders(presStudentIds)})`);
      smParams.push(...presStudentIds);
    }
    if (presModuleIds.length > 0) {
      smClauses.push(`module_id IN (${placeholders(presModuleIds)})`);
      smParams.push(...presModuleIds);
    }
    await pool.query(
      `DELETE FROM student_modules WHERE ${smClauses.join(" OR ")}`,
      smParams
    );
  }

  await deleteByIds("teachers", "id", presTeacherIds);
  await deleteByIds("students", "id", presStudentIds);
  await deleteByIds("modules", "id", presModuleIds);
  await deleteByIds("branches", "id", presBranchIds);

  await pool.query("DELETE FROM announcements WHERE title LIKE ?", [
    `${PRES_ANNOUNCEMENT_PREFIX}%`,
  ]);
  await deleteByIds("users", "id", presUserIds);
}

async function ensureBranch(name, code) {
  const [existing] = await pool.query(
    "SELECT id FROM branches WHERE code = :code LIMIT 1",
    { code }
  );
  if (existing.length > 0) {
    return Number(existing[0].id);
  }
  const [result] = await pool.query(
    "INSERT INTO branches (name, code) VALUES (:name, :code)",
    { name, code }
  );
  return Number(result.insertId);
}

async function ensureModule(name, code, branchId) {
  const [existing] = await pool.query(
    "SELECT id FROM modules WHERE code = :code AND branch_id = :branchId LIMIT 1",
    { code, branchId }
  );
  if (existing.length > 0) {
    return Number(existing[0].id);
  }
  const [result] = await pool.query(
    "INSERT INTO modules (name, code, branch_id) VALUES (:name, :code, :branchId)",
    { name, code, branchId }
  );
  return Number(result.insertId);
}

async function createUserWithRole({ email, fullName, role, branchId, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, branch_id, is_active)
     VALUES (:email, :passwordHash, :role, :fullName, :branchId, 1)`,
    { email, passwordHash, role, fullName, branchId }
  );
  return Number(result.insertId);
}

async function seedPresentationData() {
  const sharedPassword = "Pres12345!";
  const sharedPasswordHash = await hashPassword(sharedPassword);
  const now = new Date();
  const dateShift = (days) => {
    const value = new Date(now);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
  };

  const branches = {
    cs: await ensureBranch("Presentation Computer Science", "PRES-CS"),
    ai: await ensureBranch("Presentation Artificial Intelligence", "PRES-AI"),
    biz: await ensureBranch("Presentation Business & Finance", "PRES-BIZ"),
  };

  const modules = {
    cs: [
      await ensureModule("Software Engineering", "PRES-CS-SE", branches.cs),
      await ensureModule("Database Systems", "PRES-CS-DB", branches.cs),
      await ensureModule("Cloud Foundations", "PRES-CS-CLD", branches.cs),
    ],
    ai: [
      await ensureModule("Machine Learning", "PRES-AI-ML", branches.ai),
      await ensureModule("Computer Vision", "PRES-AI-CV", branches.ai),
      await ensureModule("Natural Language Processing", "PRES-AI-NLP", branches.ai),
    ],
    biz: [
      await ensureModule("Corporate Finance", "PRES-BIZ-FIN", branches.biz),
      await ensureModule("Business Analytics", "PRES-BIZ-BA", branches.biz),
      await ensureModule("Strategic Management", "PRES-BIZ-SM", branches.biz),
    ],
  };

  const adminUserId = await createUserWithRole({
    email: "pres.admin@school.local",
    fullName: "Presentation Admin",
    role: "ADMIN",
    branchId: null,
    passwordHash: sharedPasswordHash,
  });

  const teacherDefs = [
    { key: "coordCs", email: "pres.teacher.coord.cs@school.local", name: "Presentation Coordinator CS", branchId: branches.cs, title: "Professor" },
    { key: "coordAi", email: "pres.teacher.coord.ai@school.local", name: "Presentation Coordinator AI", branchId: branches.ai, title: "Professor" },
    { key: "coordBiz", email: "pres.teacher.coord.biz@school.local", name: "Presentation Coordinator Business", branchId: branches.biz, title: "Professor" },
    { key: "jury1", email: "pres.teacher.jury.one@school.local", name: "Presentation Jury One", branchId: branches.cs, title: "Associate Professor" },
    { key: "jury2", email: "pres.teacher.jury.two@school.local", name: "Presentation Jury Two", branchId: branches.ai, title: "Associate Professor" },
    { key: "jury3", email: "pres.teacher.jury.three@school.local", name: "Presentation Jury Three", branchId: branches.biz, title: "Assistant Professor" },
  ];

  const teacherUserIds = {};
  for (const teacher of teacherDefs) {
    teacherUserIds[teacher.key] = await createUserWithRole({
      email: teacher.email,
      fullName: teacher.name,
      role: "TEACHER",
      branchId: teacher.branchId,
      passwordHash: sharedPasswordHash,
    });
  }

  for (const teacher of teacherDefs) {
    await pool.query(
      "INSERT INTO teachers (user_id, title) VALUES (:userId, :title)",
      { userId: teacherUserIds[teacher.key], title: teacher.title }
    );
  }

  const [teacherRows] = await pool.query(
    "SELECT id, user_id FROM teachers WHERE user_id IN (:ids)",
    { ids: Object.values(teacherUserIds) }
  );
  const teacherIdByUser = new Map(
    teacherRows.map((row) => [Number(row.user_id), Number(row.id)])
  );

  const coordinatorTeacherIds = {
    cs: teacherIdByUser.get(teacherUserIds.coordCs),
    ai: teacherIdByUser.get(teacherUserIds.coordAi),
    biz: teacherIdByUser.get(teacherUserIds.coordBiz),
  };
  const juryTeacherIds = {
    one: teacherIdByUser.get(teacherUserIds.jury1),
    two: teacherIdByUser.get(teacherUserIds.jury2),
    three: teacherIdByUser.get(teacherUserIds.jury3),
  };

  const teacherModulePairs = [
    [coordinatorTeacherIds.cs, modules.cs[0]],
    [coordinatorTeacherIds.cs, modules.cs[1]],
    [coordinatorTeacherIds.cs, modules.cs[2]],
    [coordinatorTeacherIds.ai, modules.ai[0]],
    [coordinatorTeacherIds.ai, modules.ai[1]],
    [coordinatorTeacherIds.ai, modules.ai[2]],
    [coordinatorTeacherIds.biz, modules.biz[0]],
    [coordinatorTeacherIds.biz, modules.biz[1]],
    [coordinatorTeacherIds.biz, modules.biz[2]],
    [juryTeacherIds.one, modules.cs[1]],
    [juryTeacherIds.two, modules.ai[1]],
    [juryTeacherIds.three, modules.biz[1]],
  ];

  for (const [teacherId, moduleId] of teacherModulePairs) {
    await pool.query(
      "INSERT INTO teacher_modules (teacher_id, module_id) VALUES (:teacherId, :moduleId)",
      { teacherId, moduleId }
    );
  }

  const studentDefs = [
    { email: "pres.student.cs1@school.local", name: "Presentation Student CS One", branchId: branches.cs, apogee: "PRES-CS-001", modules: [0, 1], attendance: 0.85 },
    { email: "pres.student.cs2@school.local", name: "Presentation Student CS Two", branchId: branches.cs, apogee: "PRES-CS-002", modules: [0, 1, 2], attendance: 0.92 },
    { email: "pres.student.cs3@school.local", name: "Presentation Student CS Three", branchId: branches.cs, apogee: "PRES-CS-003", modules: [1], attendance: 0.65 },
    { email: "pres.student.cs4@school.local", name: "Presentation Student CS Four", branchId: branches.cs, apogee: "PRES-CS-004", modules: [0, 2], attendance: 0.78 },
    { email: "pres.student.cs5@school.local", name: "Presentation Student CS Five", branchId: branches.cs, apogee: "PRES-CS-005", modules: [0, 1, 2], attendance: 0.88 },
    { email: "pres.student.ai1@school.local", name: "Presentation Student AI One", branchId: branches.ai, apogee: "PRES-AI-001", modules: [0, 1], attendance: 0.80 },
    { email: "pres.student.ai2@school.local", name: "Presentation Student AI Two", branchId: branches.ai, apogee: "PRES-AI-002", modules: [0, 2], attendance: 0.72 },
    { email: "pres.student.ai3@school.local", name: "Presentation Student AI Three", branchId: branches.ai, apogee: "PRES-AI-003", modules: [0, 1, 2], attendance: 0.95 },
    { email: "pres.student.ai4@school.local", name: "Presentation Student AI Four", branchId: branches.ai, apogee: "PRES-AI-004", modules: [1, 2], attendance: 0.55 },
    { email: "pres.student.biz1@school.local", name: "Presentation Student Biz One", branchId: branches.biz, apogee: "PRES-BIZ-001", modules: [0, 1], attendance: 0.83 },
    { email: "pres.student.biz2@school.local", name: "Presentation Student Biz Two", branchId: branches.biz, apogee: "PRES-BIZ-002", modules: [0, 2], attendance: 0.68 },
    { email: "pres.student.biz3@school.local", name: "Presentation Student Biz Three", branchId: branches.biz, apogee: "PRES-BIZ-003", modules: [1, 2], attendance: 0.77 },
  ];

  const studentUserRecords = [];
  for (const student of studentDefs) {
    const userId = await createUserWithRole({
      email: student.email,
      fullName: student.name,
      role: "STUDENT",
      branchId: student.branchId,
      passwordHash: sharedPasswordHash,
    });
    studentUserRecords.push({ ...student, userId });
  }

  for (const student of studentUserRecords) {
    await pool.query(
      "INSERT INTO students (user_id, student_number) VALUES (:userId, :studentNumber)",
      { userId: student.userId, studentNumber: student.apogee }
    );
  }

  const [studentRows] = await pool.query(
    "SELECT id, user_id FROM students WHERE user_id IN (:ids)",
    { ids: studentUserRecords.map((student) => student.userId) }
  );
  const studentIdByUser = new Map(
    studentRows.map((row) => [Number(row.user_id), Number(row.id)])
  );

  for (const student of studentUserRecords) {
    const studentId = studentIdByUser.get(student.userId);
    if (!studentId) {
      continue;
    }
    const moduleList =
      student.branchId === branches.cs
        ? modules.cs
        : student.branchId === branches.ai
          ? modules.ai
          : modules.biz;
    
    for (const moduleIndex of student.modules) {
      await pool.query(
        "INSERT INTO student_modules (student_id, module_id) VALUES (:studentId, :moduleId)",
        { studentId, moduleId: moduleList[moduleIndex] }
      );
    }
  }

  const sessionSeeds = [
    { moduleId: modules.cs[0], title: "Project Scoping Workshop", dayOffset: -8, start: "09:00:00", end: "11:00:00" },
    { moduleId: modules.cs[0], title: "Architecture Deep Dive", dayOffset: -6, start: "14:00:00", end: "16:00:00" },
    { moduleId: modules.cs[1], title: "Database Design Lab", dayOffset: -3, start: "13:00:00", end: "15:00:00" },
    { moduleId: modules.cs[1], title: "Query Optimization Session", dayOffset: -1, start: "10:00:00", end: "12:00:00" },
    { moduleId: modules.cs[2], title: "Cloud Infrastructure Basics", dayOffset: 1, start: "09:00:00", end: "11:00:00" },
    { moduleId: modules.ai[0], title: "Model Evaluation Clinic", dayOffset: -5, start: "10:00:00", end: "12:00:00" },
    { moduleId: modules.ai[0], title: "Feature Engineering Workshop", dayOffset: -2, start: "15:00:00", end: "17:00:00" },
    { moduleId: modules.ai[1], title: "Computer Vision Fundamentals", dayOffset: 0, start: "11:00:00", end: "13:00:00" },
    { moduleId: modules.ai[2], title: "NLP Demo Session", dayOffset: 2, start: "14:00:00", end: "16:00:00" },
    { moduleId: modules.ai[2], title: "Transformer Models Discussion", dayOffset: 4, start: "10:00:00", end: "12:00:00" },
    { moduleId: modules.biz[0], title: "Financial Analysis Workshop", dayOffset: -4, start: "09:30:00", end: "11:30:00" },
    { moduleId: modules.biz[1], title: "Dashboard Storytelling", dayOffset: -2, start: "08:30:00", end: "10:30:00" },
    { moduleId: modules.biz[1], title: "Data Visualization Best Practices", dayOffset: 1, start: "13:00:00", end: "15:00:00" },
    { moduleId: modules.biz[2], title: "Strategy Review", dayOffset: 3, start: "11:00:00", end: "13:00:00" },
  ];

  for (const seed of sessionSeeds) {
    await pool.query(
      `INSERT INTO sessions (module_id, title, session_date, start_time, end_time)
       VALUES (:moduleId, :title, :sessionDate, :startTime, :endTime)`,
      {
        moduleId: seed.moduleId,
        title: seed.title,
        sessionDate: dateShift(seed.dayOffset),
        startTime: seed.start,
        endTime: seed.end,
      }
    );
  }

  const [sessionRowsAll] = await pool.query(
    "SELECT id, module_id FROM sessions WHERE module_id IN (:ids)",
    { ids: [...modules.cs, ...modules.ai, ...modules.biz] }
  );

  // Create student maps to track individual attendance rates
  const studentAttendanceMap = new Map();
  const studentModulesMap = new Map();
  for (const student of studentUserRecords) {
    const studentDef = studentDefs.find(s => s.email === student.email);
    if (studentDef) {
      studentAttendanceMap.set(student.userId, studentDef.attendance);
      studentModulesMap.set(student.userId, studentDef.modules);
    }
  }

  const csStudents = studentUserRecords
    .filter((student) => student.branchId === branches.cs)
    .map((student) => ({ 
      id: studentIdByUser.get(student.userId), 
      userId: student.userId, 
      attendance: studentAttendanceMap.get(student.userId),
      modules: studentModulesMap.get(student.userId) || []
    }))
    .filter(s => s.id);
  const aiStudents = studentUserRecords
    .filter((student) => student.branchId === branches.ai)
    .map((student) => ({ 
      id: studentIdByUser.get(student.userId), 
      userId: student.userId, 
      attendance: studentAttendanceMap.get(student.userId),
      modules: studentModulesMap.get(student.userId) || []
    }))
    .filter(s => s.id);
  const bizStudents = studentUserRecords
    .filter((student) => student.branchId === branches.biz)
    .map((student) => ({ 
      id: studentIdByUser.get(student.userId), 
      userId: student.userId, 
      attendance: studentAttendanceMap.get(student.userId),
      modules: studentModulesMap.get(student.userId) || []
    }))
    .filter(s => s.id);

  const csTeam = csStudents.slice(0, 3);
  const aiTeam = aiStudents.slice(0, 3);
  const bizTeam = bizStudents.slice(0, 2);

  // Generate realistic attendance records based on individual student attendance rates
  for (const session of sessionRowsAll) {
    const moduleId = Number(session.module_id);
    let enrolledStudents = [];
    
    if (modules.cs.includes(moduleId)) {
      const moduleIndex = modules.cs.indexOf(moduleId);
      // Only get CS students enrolled in this specific module
      enrolledStudents = csStudents.filter(s => s.modules && s.modules.includes(moduleIndex));
      
      for (const student of enrolledStudents) {
        if (Math.random() < student.attendance) {
          await pool.query(
            "INSERT INTO attendance (session_id, student_id) VALUES (:sessionId, :studentId)",
            { sessionId: session.id, studentId: student.id }
          );
          // 60% of attending students provide feedback
          if (Math.random() < 0.6) {
            await pool.query(
              `INSERT INTO session_feedback (session_id, student_id, understanding_score, question)
               VALUES (:sessionId, :studentId, :score, :question)`,
              {
                sessionId: session.id,
                studentId: student.id,
                score: 6 + Math.floor(Math.random() * 4),
                question: ["Requesting more examples", "Need clarification on advanced topics", "Can we discuss implementation details?"][Math.floor(Math.random() * 3)],
              }
            );
          }
        }
      }
    } else if (modules.ai.includes(moduleId)) {
      const moduleIndex = modules.ai.indexOf(moduleId);
      // Only get AI students enrolled in this specific module
      enrolledStudents = aiStudents.filter(s => s.modules && s.modules.includes(moduleIndex));
      
      for (const student of enrolledStudents) {
        if (Math.random() < student.attendance) {
          await pool.query(
            "INSERT INTO attendance (session_id, student_id) VALUES (:sessionId, :studentId)",
            { sessionId: session.id, studentId: student.id }
          );
          // 50% of attending students provide feedback
          if (Math.random() < 0.5) {
            await pool.query(
              `INSERT INTO session_feedback (session_id, student_id, understanding_score, question)
               VALUES (:sessionId, :studentId, :score, :question)`,
              {
                sessionId: session.id,
                studentId: student.id,
                score: 5 + Math.floor(Math.random() * 5),
                question: ["Interested in research applications", "How does this apply in practice?", "Can you explain the math more?"][Math.floor(Math.random() * 3)],
              }
            );
          }
        }
      }
    } else if (modules.biz.includes(moduleId)) {
      const moduleIndex = modules.biz.indexOf(moduleId);
      // Only get Business students enrolled in this specific module
      enrolledStudents = bizStudents.filter(s => s.modules && s.modules.includes(moduleIndex));
      
      for (const student of enrolledStudents) {
        if (Math.random() < student.attendance) {
          await pool.query(
            "INSERT INTO attendance (session_id, student_id) VALUES (:sessionId, :studentId)",
            { sessionId: session.id, studentId: student.id }
          );
          // 65% of attending students provide feedback
          if (Math.random() < 0.65) {
            await pool.query(
              `INSERT INTO session_feedback (session_id, student_id, understanding_score, question)
               VALUES (:sessionId, :studentId, :score, :question)`,
              {
                sessionId: session.id,
                studentId: student.id,
                score: 7 + Math.floor(Math.random() * 3),
                question: ["Real-world case studies?", "How to implement this strategy?", "Any industry best practices?"][Math.floor(Math.random() * 3)],
              }
            );
          }
        }
      }
    }
  }

  const [p1] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, report_path, demo_video_path, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :report, :demo, :deadlineAt, :grade)`,
    {
      branchId: branches.cs,
      ownerId: csTeam[0].id,
      coordId: coordinatorTeacherIds.cs,
      name: "[PRES] Campus Space Planner",
      members: "Presentation Student CS One, Presentation Student CS Two, Presentation Student CS Three",
      github: "https://github.com/example/pres-campus-space-planner",
      report: "https://drive.google.com/file/d/PRESCSREPORT/view",
      demo: "https://drive.google.com/file/d/PRESCSDEMO/view",
      deadlineAt: `${dateShift(7)} 23:59:00`,
      grade: 18.5,
    }
  );
  const csProjectId = Number(p1.insertId);

  const [p2] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, report_path, demo_video_path, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :report, :demo, :deadlineAt, :grade)`,
    {
      branchId: branches.cs,
      ownerId: csTeam[1].id,
      coordId: coordinatorTeacherIds.cs,
      name: "[PRES] Microservices Framework",
      members: "Presentation Student CS Four, Presentation Student CS Five",
      github: "https://github.com/example/pres-microservices-framework",
      report: "https://drive.google.com/file/d/PRESCSMS/view",
      demo: "https://drive.google.com/file/d/PRESCSMSDEMO/view",
      deadlineAt: `${dateShift(7)} 23:59:00`,
      grade: 16.0,
    }
  );
  const csProjectId2 = Number(p2.insertId);

  const [p3] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, report_path, demo_video_path, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :report, :demo, :deadlineAt, :grade)`,
    {
      branchId: branches.ai,
      ownerId: aiTeam[0].id,
      coordId: coordinatorTeacherIds.ai,
      name: "[PRES] Student Success Predictor",
      members: "Presentation Student AI One, Presentation Student AI Two, Presentation Student AI Three",
      github: "https://github.com/example/pres-student-success-predictor",
      report: "https://drive.google.com/file/d/PRESAIREPORT/view",
      demo: "https://drive.google.com/file/d/PRESAIDEMO/view",
      deadlineAt: `${dateShift(10)} 23:59:00`,
      grade: 17.5,
    }
  );
  const aiProjectId = Number(p3.insertId);

  const [p4] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :deadlineAt, :grade)`,
    {
      branchId: branches.ai,
      ownerId: aiTeam[1].id,
      coordId: coordinatorTeacherIds.ai,
      name: "[PRES] Image Classification Suite",
      members: "Presentation Student AI Four",
      github: "https://github.com/example/pres-image-classification",
      deadlineAt: `${dateShift(10)} 23:59:00`,
      grade: 14.5,
    }
  );
  const aiProjectId2 = Number(p4.insertId);

  const [p5] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, github_link, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :github, :deadlineAt, :grade)`,
    {
      branchId: branches.biz,
      ownerId: bizTeam[0].id,
      coordId: coordinatorTeacherIds.biz,
      name: "[PRES] SME Credit Risk Explorer",
      members: "Presentation Student Biz One, Presentation Student Biz Two",
      github: "https://github.com/example/pres-credit-risk-explorer",
      deadlineAt: `${dateShift(12)} 23:59:00`,
      grade: 16.5,
    }
  );
  const bizProjectId = Number(p5.insertId);

  const [p6] = await pool.query(
    `INSERT INTO pfe_projects
     (branch_id, student_owner_id, coordinator_teacher_id, name, members, deadline_at, grade)
     VALUES (:branchId, :ownerId, :coordId, :name, :members, :deadlineAt, :grade)`,
    {
      branchId: branches.biz,
      ownerId: bizTeam[1].id,
      coordId: coordinatorTeacherIds.biz,
      name: "[PRES] Market Trend Analysis",
      members: "Presentation Student Biz Three",
      deadlineAt: `${dateShift(12)} 23:59:00`,
      grade: 15.0,
    }
  );
  const bizProjectId2 = Number(p6.insertId);

  if (await tableExists("pfe_project_students")) {
    for (const student of csTeam) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: csProjectId, studentId: student.id }
      );
    }
    for (const student of csStudents.slice(3, 5)) {
      if (student) {
        await pool.query(
          "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
          { projectId: csProjectId2, studentId: student.id }
        );
      }
    }
    for (const student of aiTeam) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: aiProjectId, studentId: student.id }
      );
    }
    if (aiStudents[3]) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: aiProjectId2, studentId: aiStudents[3].id }
      );
    }
    for (const student of bizTeam) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: bizProjectId, studentId: student.id }
      );
    }
    if (bizStudents[2]) {
      await pool.query(
        "INSERT INTO pfe_project_students (project_id, student_id) VALUES (:projectId, :studentId)",
        { projectId: bizProjectId2, studentId: bizStudents[2].id }
      );
    }
  }

  const juryPairs = [
    [csProjectId, juryTeacherIds.one],
    [csProjectId, juryTeacherIds.two],
    [csProjectId2, juryTeacherIds.one],
    [aiProjectId, juryTeacherIds.two],
    [aiProjectId, juryTeacherIds.three],
    [aiProjectId2, juryTeacherIds.two],
    [bizProjectId, juryTeacherIds.three],
    [bizProjectId, juryTeacherIds.one],
    [bizProjectId2, juryTeacherIds.three],
  ];
  for (const [projectId, teacherId] of juryPairs) {
    await pool.query(
      "INSERT INTO pfe_jury (project_id, teacher_id) VALUES (:projectId, :teacherId)",
      { projectId, teacherId }
    );
  }

  await pool.query(
    `INSERT INTO announcements (created_by, title, message)
     VALUES (:adminId, :title1, :msg1),
            (:adminId, :title2, :msg2),
            (:adminId, :title3, :msg3),
            (:adminId, :title4, :msg4),
            (:adminId, :title5, :msg5),
            (:adminId, :title6, :msg6)`,
    {
      adminId: adminUserId,
      title1: "[PRES] Semester Kickoff",
      msg1: "Welcome to the live presentation dataset for Smart Academic Platform.",
      title2: "[PRES] Attendance Milestone",
      msg2: "Please review attendance and feedback metrics in your dashboards.",
      title3: "[PRES] PFE Defense Window",
      msg3: "Jury members can now review submissions and submit grades.",
      title4: "[PRES] Module Registration Update",
      msg4: "New module registration periods are now open for next semester.",
      title5: "[PRES] System Maintenance Notice",
      msg5: "Scheduled maintenance on database systems completed successfully.",
      title6: "[PRES] Academic Excellence Awards",
      msg6: "Congratulations to all students achieving high attendance records.",
    }
  );

  // eslint-disable-next-line no-console
  console.log("Presentation seed complete.");
  // eslint-disable-next-line no-console
  console.log(`Shared presentation password: ${sharedPassword}`);
  // eslint-disable-next-line no-console
  console.log("Admin: pres.admin@school.local");
  // eslint-disable-next-line no-console
  console.log("Coordinator teacher: pres.teacher.coord.cs@school.local");
  // eslint-disable-next-line no-console
  console.log("Jury teacher: pres.teacher.jury.one@school.local");
  // eslint-disable-next-line no-console
  console.log("Student: pres.student.cs1@school.local");
}

async function main() {
  const wipeOnly = process.argv.includes("--wipe-only");
  await applyMigrations();
  await wipePresentationData();
  if (!wipeOnly) {
    await seedPresentationData();
  } else {
    // eslint-disable-next-line no-console
    console.log("Presentation seed data wiped.");
  }
  await pool.end();
}

main().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  try {
    await pool.end();
  } catch {
    // noop
  }
  process.exit(1);
});
