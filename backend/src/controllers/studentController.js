import { findUserById } from "../services/users.js";
import { listStudentModules, getStudentIdByUser } from "../services/students.js";
import { listSessionsForStudent, findSessionByQrToken, listUpcomingSessionsForStudent } from "../services/sessions.js";
import { markAttendance, listAttendanceForStudent, attendanceRateByModule } from "../services/attendance.js";
import { upsertFeedback, countFeedbackByStudent, listRecentFeedbackByStudent } from "../services/feedback.js";
import { upsertProject } from "../services/pfe.js";

export async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function getModules(req, res, next) {
  try {
    const modules = await listStudentModules(req.user.id);
    return res.json({ modules });
  } catch (error) {
    return next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await listSessionsForStudent(req.user.id);
    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
}

export async function scanAttendance(req, res, next) {
  try {
    const { qrToken } = req.body;
    const session = await findSessionByQrToken(qrToken);
    if (!session) {
      return res.status(404).json({ message: "Invalid QR token" });
    }
    if (session.qr_expires_at && new Date(session.qr_expires_at) < new Date()) {
      return res.status(400).json({ message: "QR code expired" });
    }
    const studentId = await getStudentIdByUser(req.user.id);
    if (!studentId) {
      return res.status(400).json({ message: "Student profile missing" });
    }
    await markAttendance({ sessionId: session.id, studentId });
    return res.status(201).json({ message: "Attendance marked" });
  } catch (error) {
    return next(error);
  }
}

export async function submitFeedback(req, res, next) {
  try {
    const { sessionId, understandingScore, question } = req.body;
    const studentId = await getStudentIdByUser(req.user.id);
    if (!studentId) {
      return res.status(400).json({ message: "Student profile missing" });
    }
    await upsertFeedback({
      sessionId,
      studentId,
      understandingScore,
      question: question ?? null,
    });
    return res.status(201).json({ message: "Feedback saved" });
  } catch (error) {
    return next(error);
  }
}

export async function submitProject(req, res, next) {
  try {
    const studentId = await getStudentIdByUser(req.user.id);
    if (!studentId) {
      return res.status(400).json({ message: "Student profile missing" });
    }
    const reportFile = req.files?.report?.[0] ?? null;
    const demoFile = req.files?.demo?.[0] ?? null;

    const id = await upsertProject({
      branchId: req.user.branchId,
      studentId,
      name: req.body.name,
      members: req.body.members ?? null,
      supervisor: req.body.supervisor ?? null,
      githubLink: req.body.githubLink ?? null,
      reportPath: reportFile ? `/uploads/${reportFile.filename}` : null,
      demoVideoPath: demoFile ? `/uploads/${demoFile.filename}` : null,
    });

    return res.status(201).json({ projectId: id });
  } catch (error) {
    return next(error);
  }
}

export async function getOverview(req, res, next) {
  try {
    const modules = await listStudentModules(req.user.id);
    const sessions = await listSessionsForStudent(req.user.id);
    const attendanceRates = await attendanceRateByModule(req.user.id);
    const feedbackCount = await countFeedbackByStudent(req.user.id);
    const recentFeedback = await listRecentFeedbackByStudent(req.user.id, 5);
    const upcoming = await listUpcomingSessionsForStudent(req.user.id, 5);

    const totalSessions = sessions.length;
    const totalPresent = attendanceRates.reduce((sum, row) => sum + Number(row.present_count || 0), 0);
    const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

    return res.json({
      stats: {
        modules: modules.length,
        sessions: totalSessions,
        attendanceRate,
        feedbackCount,
      },
      attendanceByModule: attendanceRates,
      upcomingSessions: upcoming,
      recentFeedback,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAttendanceHistory(req, res, next) {
  try {
    const history = await listAttendanceForStudent(req.user.id);
    return res.json({ history });
  } catch (error) {
    return next(error);
  }
}
