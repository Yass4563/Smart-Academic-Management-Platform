const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.message || payload?.errors?.[0]?.msg || "Request failed";
    throw new Error(message);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

async function requestForm(path: string, form: FormData, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.message || payload?.errors?.[0]?.msg || "Request failed";
    throw new Error(message);
  }
  return res.json();
}

export async function login(email: string, password: string) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string) {
  return request("/api/auth/me", {}, token);
}

export async function getBranches(token: string) {
  return request("/api/admin/branches", {}, token);
}

export async function createBranch(
  token: string,
  data: { name: string; code: string; modules?: Array<{ name: string; code: string }> }
) {
  return request(
    "/api/admin/branches",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function updateBranch(token: string, id: number, data: { name: string; code: string }) {
  return request(
    `/api/admin/branches/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function deleteBranch(token: string, id: number) {
  return request(`/api/admin/branches/${id}`, { method: "DELETE" }, token);
}

export async function getModules(token: string) {
  return request("/api/admin/modules", {}, token);
}

export async function createModule(
  token: string,
  data: { name: string; code: string; branchId: number }
) {
  return request(
    "/api/admin/modules",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function updateModule(
  token: string,
  id: number,
  data: { name: string; code: string; branchId: number }
) {
  return request(
    `/api/admin/modules/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function deleteModule(token: string, id: number) {
  return request(`/api/admin/modules/${id}`, { method: "DELETE" }, token);
}

export async function getTeachers(token: string) {
  return request("/api/admin/teachers", {}, token);
}

export async function createTeacher(
  token: string,
  data: { email: string; fullName: string; branchId?: number | null; title?: string | null }
) {
  return request(
    "/api/admin/teachers",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function assignTeacher(token: string, data: { teacherId: number; moduleId: number }) {
  return request(
    "/api/admin/assign-teacher",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function getStudents(token: string) {
  return request("/api/admin/students", {}, token);
}

export async function importStudents(
  token: string,
  file: File,
  branchId?: number | null
) {
  const form = new FormData();
  form.append("file", file);
  if (branchId) {
    form.append("branchId", String(branchId));
  }
  return requestForm("/api/admin/students/import", form, token);
}

export async function getAdminOverview(token: string) {
  return request("/api/admin/overview", {}, token);
}

export async function getStudentModules(token: string) {
  return request("/api/student/modules", {}, token);
}

export async function getStudentSessions(token: string) {
  return request("/api/student/sessions", {}, token);
}

export async function scanAttendance(token: string, qrToken: string) {
  return request(
    "/api/student/attendance/scan",
    {
      method: "POST",
      body: JSON.stringify({ qrToken }),
    },
    token
  );
}

export async function submitFeedback(
  token: string,
  data: { sessionId: number; understandingScore: number; question?: string | null }
) {
  return request(
    "/api/student/feedback",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function submitPfe(
  token: string,
  data: {
    reportLink: string;
    demoVideoLink: string;
    githubLink?: string;
  }
) {
  return request(
    "/api/student/pfe/submit",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function getMyPfeProject(token: string) {
  return request("/api/student/pfe/project", {}, token);
}

export async function getStudentOverview(token: string) {
  return request("/api/student/overview", {}, token);
}

export async function getAttendanceHistory(token: string) {
  return request("/api/student/attendance/history", {}, token);
}

export async function getStudentProfile(token: string) {
  return request("/api/student/profile", {}, token);
}

export async function getTeacherModules(token: string) {
  return request("/api/teacher/modules", {}, token);
}

export async function createSession(
  token: string,
  data: { moduleId: number; title: string; sessionDate: string; startTime: string; endTime: string }
) {
  return request(
    "/api/teacher/sessions",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function getModuleSessions(token: string, moduleId: number) {
  return request(`/api/teacher/modules/${moduleId}/sessions`, {}, token);
}

export async function generateQr(
  token: string,
  data: { moduleId: number; sessionId: number; expiresInMinutes?: number }
) {
  return request(
    "/api/teacher/qr",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function getAttendance(token: string, sessionId: number) {
  return request(`/api/teacher/sessions/${sessionId}/attendance`, {}, token);
}

export async function exportAttendance(token: string, sessionId: number, format: "csv" | "pdf") {
  const url = `${API_URL}/api/teacher/sessions/${sessionId}/attendance/export?format=${format}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to export attendance");
  }
  return res.blob();
}

export async function getFeedbackSummary(token: string, moduleId: number) {
  return request(`/api/teacher/modules/${moduleId}/feedback-summary`, {}, token);
}

export async function getSessionFeedback(token: string, sessionId: number) {
  return request(`/api/teacher/sessions/${sessionId}/feedback`, {}, token);
}

export async function getProjects(token: string) {
  return request("/api/teacher/projects", {}, token);
}

export async function getProjectOptions(token: string) {
  return request("/api/teacher/projects/options", {}, token);
}

export async function createProject(
  token: string,
  data: {
    name: string;
    studentIds: number[];
    juryTeacherIds?: number[];
    githubLink?: string | null;
    deadlineAt?: string | null;
  }
) {
  return request(
    "/api/teacher/projects",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function setProjectDeadline(
  token: string,
  data: { projectId: number; deadlineAt: string }
) {
  return request(
    "/api/teacher/projects/deadline",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function addProjectJury(
  token: string,
  data: { projectId: number; teacherId: number }
) {
  return request(
    "/api/teacher/projects/jury",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function gradeProject(
  token: string,
  data: { projectId: number; grade: number }
) {
  return request(
    "/api/teacher/projects/grade",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function getAnnouncements(token: string) {
  return request("/api/announcements", {}, token);
}

export async function createAnnouncement(
  token: string,
  data: { title: string; message: string }
) {
  return request(
    "/api/announcements",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}
