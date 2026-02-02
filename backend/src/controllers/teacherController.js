import { nanoid } from "nanoid";
import qrcode from "qrcode";
import csvWriter from "csv-writer";
import PDFDocument from "pdfkit";
import { listTeacherModules, getTeacherIdByUser } from "../services/teachers.js";
import { createSession, listSessionsByModule, updateSessionQr, getSession } from "../services/sessions.js";
import { listAttendance } from "../services/attendance.js";
import { listFeedbackBySession, feedbackSummaryByModule } from "../services/feedback.js";
import { listProjectsByBranch, setProjectDeadline, addJuryMember, setProjectGrade } from "../services/pfe.js";

const { createObjectCsvStringifier } = csvWriter;

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
    const sessions = await listSessionsByModule(req.params.moduleId);
    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
}

export async function generateQr(req, res, next) {
  try {
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
    const rows = await listAttendance(req.params.sessionId);
    return res.json({ attendance: rows });
  } catch (error) {
    return next(error);
  }
}

export async function exportAttendance(req, res, next) {
  try {
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
    const rows = await listFeedbackBySession(req.params.sessionId);
    return res.json({ feedback: rows });
  } catch (error) {
    return next(error);
  }
}

export async function feedbackSummary(req, res, next) {
  try {
    const summary = await feedbackSummaryByModule(req.params.moduleId);
    return res.json({ summary });
  } catch (error) {
    return next(error);
  }
}

export async function listProjects(req, res, next) {
  try {
    const projects = await listProjectsByBranch(req.user.branchId);
    return res.json({ projects });
  } catch (error) {
    return next(error);
  }
}

export async function setDeadline(req, res, next) {
  try {
    await setProjectDeadline(req.body.projectId, req.body.deadlineAt);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function addJury(req, res, next) {
  try {
    const teacherId = await getTeacherIdByUser(req.user.id);
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher profile missing" });
    }
    await addJuryMember(req.body.projectId, teacherId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function gradeProject(req, res, next) {
  try {
    await setProjectGrade(req.body.projectId, req.body.grade);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
