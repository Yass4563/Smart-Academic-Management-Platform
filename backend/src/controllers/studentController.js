import { findUserById } from "../services/users.js";
import { listStudentModules, getStudentIdByUser, isStudentEnrolledInModule } from "../services/students.js";
import { listSessionsForStudent, findSessionByQrToken, getSessionById, listUpcomingSessionsForStudent } from "../services/sessions.js";
import { markAttendance, listAttendanceForStudent, attendanceRateByModule } from "../services/attendance.js";
import { upsertFeedback, countFeedbackByStudent, listRecentFeedbackByStudent } from "../services/feedback.js";
import { getAssignedProjectForStudent, submitProjectLinks } from "../services/pfe.js";

function isGoogleDriveLink(value) {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(String(value));
    return (
      url.hostname === "drive.google.com" ||
      url.hostname.endsWith(".drive.google.com") ||
      url.hostname === "docs.google.com" ||
      url.hostname.endsWith(".docs.google.com")
    );
  } catch {
    return false;
  }
}

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
    const enrolled = await isStudentEnrolledInModule(studentId, session.module_id);
    if (!enrolled) {
      return res.status(403).json({ message: "You are not enrolled in this session module." });
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
    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const enrolled = await isStudentEnrolledInModule(studentId, session.module_id);
    if (!enrolled) {
      return res.status(403).json({ message: "You are not enrolled in this session module." });
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

    const assignedProject = await getAssignedProjectForStudent(studentId);
    if (!assignedProject) {
      return res.status(403).json({ message: "You are not assigned to a PFE project." });
    }

    const reportLink = String(req.body.reportLink ?? "").trim();
    const demoVideoLink = String(req.body.demoVideoLink ?? "").trim();
    if (!isGoogleDriveLink(reportLink) || !isGoogleDriveLink(demoVideoLink)) {
      return res.status(400).json({ message: "Report and demo must be valid Google Drive links." });
    }

    const submitted = await submitProjectLinks({
      projectId: assignedProject.id,
      studentId,
      githubLink: req.body.githubLink ?? null,
      reportLink,
      demoVideoLink,
    });
    if (!submitted) {
      return res.status(403).json({ message: "You are not assigned to this project." });
    }

    return res.status(201).json({ projectId: assignedProject.id });
  } catch (error) {
    return next(error);
  }
}

export async function getMyProject(req, res, next) {
  try {
    const studentId = await getStudentIdByUser(req.user.id);
    if (!studentId) {
      return res.status(400).json({ message: "Student profile missing" });
    }
    const project = await getAssignedProjectForStudent(studentId);
    return res.json({ project });
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
