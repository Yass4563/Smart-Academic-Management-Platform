import { nanoid } from "nanoid";
import qrcode from "qrcode";
import csvWriter from "csv-writer";
import PDFDocument from "pdfkit";
import {
  canTeacherAccessModule,
  canTeacherAccessSession,
  listTeacherModules,
  getTeacherIdByUser,
} from "../services/teachers.js";
import { createSession, listSessionsByModule, updateSessionQr, getSession } from "../services/sessions.js";
import { listAttendance } from "../services/attendance.js";
import { listFeedbackBySession, feedbackSummaryByModule } from "../services/feedback.js";
import {
  addJuryMember,
  canTeacherGradeProject,
  createProjectByTeacher,
  getProjectMeta,
  isTeacherEligibleAsJury,
  isProjectCoordinator,
  listProjectOptionsForTeacher,
  listProjectsForTeacher,
  setProjectDeadline,
  setProjectGrade,
} from "../services/pfe.js";

const { createObjectCsvStringifier } = csvWriter;

async function getTeacherIdOrRespond(req, res) {
  const teacherId = await getTeacherIdByUser(req.user.id);
  if (!teacherId) {
    res.status(400).json({ message: "Teacher profile missing" });
    return null;
  }
  return teacherId;
}

export async function getModules(req, res, next) {
  try {
    const modules = await listTeacherModules(req.user.id);
    return res.json({ modules });
  } catch (error) {
    return next(error);
  }
}

export async function createSessionHandler(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessModule(teacherId, Number(req.body.moduleId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot create sessions for this module." });
    }
    const id = await createSession({
      moduleId: req.body.moduleId,
      title: req.body.title,
      sessionDate: req.body.sessionDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    return res.status(201).json({ sessionId: id });
  } catch (error) {
    return next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessModule(teacherId, Number(req.params.moduleId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot access sessions for this module." });
    }
    const sessions = await listSessionsByModule(req.params.moduleId);
    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
}

export async function generateQr(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessModule(teacherId, Number(req.body.moduleId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot generate QR for this module." });
    }
    const session = await getSession(req.body.moduleId, req.body.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const token = nanoid(20);
    const expiresAt = new Date(Date.now() + (req.body.expiresInMinutes ?? 10) * 60000);
    await updateSessionQr(session.id, { qrToken: token, qrExpiresAt: expiresAt });
    const qrData = await qrcode.toDataURL(token);
    return res.json({ token, expiresAt, qrData });
  } catch (error) {
    return next(error);
  }
}

export async function attendanceBySession(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessSession(teacherId, Number(req.params.sessionId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot access attendance for this session." });
    }
    const rows = await listAttendance(req.params.sessionId);
    return res.json({ attendance: rows });
  } catch (error) {
    return next(error);
  }
}

export async function exportAttendance(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessSession(teacherId, Number(req.params.sessionId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot export attendance for this session." });
    }
    const rows = await listAttendance(req.params.sessionId);
    const format = String(req.query.format ?? "csv").toLowerCase();
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=attendance-session-${req.params.sessionId}.pdf`
        );
        res.send(buffer);
      });

      doc.fontSize(18).text("Attendance Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Session ID: ${req.params.sessionId}`);
      doc.moveDown();
      rows.forEach((row, index) => {
        doc.text(`${index + 1}. ${row.full_name} (${row.email}) - ${row.marked_at}`);
      });
      doc.end();
      return;
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "full_name", title: "Full Name" },
        { id: "email", title: "Email" },
        { id: "marked_at", title: "Marked At" },
      ],
    });
    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-session-${req.params.sessionId}.csv`
    );
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
}

export async function feedbackBySession(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessSession(teacherId, Number(req.params.sessionId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot access feedback for this session." });
    }
    const rows = await listFeedbackBySession(req.params.sessionId);
    return res.json({ feedback: rows });
  } catch (error) {
    return next(error);
  }
}

export async function feedbackSummary(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const allowed = await canTeacherAccessModule(teacherId, Number(req.params.moduleId));
    if (!allowed) {
      return res.status(403).json({ message: "You cannot access feedback for this module." });
    }
    const summary = await feedbackSummaryByModule(req.params.moduleId);
    return res.json({ summary });
  } catch (error) {
    return next(error);
  }
}

export async function listProjects(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const projects = await listProjectsForTeacher(teacherId);
    return res.json({ projects });
  } catch (error) {
    return next(error);
  }
}

export async function projectOptions(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    if (!req.user.branchId) {
      return res.status(400).json({ message: "Teacher branch is missing." });
    }
    const options = await listProjectOptionsForTeacher(req.user.branchId, teacherId);
    return res.json(options);
  } catch (error) {
    return next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    if (!req.user.branchId) {
      return res.status(400).json({ message: "Teacher branch is missing." });
    }
    const projectId = await createProjectByTeacher({
      coordinatorTeacherId: teacherId,
      branchId: req.user.branchId,
      name: req.body.name,
      githubLink: req.body.githubLink ?? null,
      deadlineAt: req.body.deadlineAt ?? null,
      studentIds: req.body.studentIds ?? [],
      juryTeacherIds: req.body.juryTeacherIds ?? [],
    });
    return res.status(201).json({ projectId });
  } catch (error) {
    return next(error);
  }
}

export async function setDeadline(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const project = await getProjectMeta(req.body.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const isCoordinator = await isProjectCoordinator(req.body.projectId, teacherId);
    if (!isCoordinator) {
      return res.status(403).json({ message: "Only the coordinator can set project deadline." });
    }
    await setProjectDeadline(req.body.projectId, req.body.deadlineAt);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function addJury(req, res, next) {
  try {
    const actorTeacherId = await getTeacherIdOrRespond(req, res);
    if (!actorTeacherId) {
      return;
    }
    const project = await getProjectMeta(req.body.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const isCoordinator = await isProjectCoordinator(req.body.projectId, actorTeacherId);
    if (!isCoordinator) {
      return res.status(403).json({ message: "Only the coordinator can assign jury members." });
    }
    if (Number(req.body.teacherId) === Number(actorTeacherId)) {
      return res.status(400).json({ message: "Coordinator cannot assign themselves as jury." });
    }
    const eligible = await isTeacherEligibleAsJury(req.body.projectId, req.body.teacherId);
    if (!eligible) {
      return res.status(400).json({
        message: "Selected jury member must be an active teacher from the same branch as the project.",
      });
    }
    await addJuryMember(req.body.projectId, req.body.teacherId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function gradeProject(req, res, next) {
  try {
    const teacherId = await getTeacherIdOrRespond(req, res);
    if (!teacherId) {
      return;
    }
    const project = await getProjectMeta(req.body.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const allowed = await canTeacherGradeProject(req.body.projectId, teacherId);
    if (!allowed) {
      return res.status(403).json({ message: "Only the coordinator or jury members can grade this project." });
    }
    if (!project.report_path || !project.demo_video_path) {
      return res.status(400).json({ message: "Project must have both report and demo links before grading." });
    }
    await setProjectGrade(req.body.projectId, req.body.grade);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
