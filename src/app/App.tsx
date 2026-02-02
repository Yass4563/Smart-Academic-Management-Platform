import { useMemo } from "react";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { useAuth } from "./lib/auth";

export default function App() {
  const { user, login, logout } = useAuth();

  const roleView = useMemo(() => {
    if (!user) {
      return "login";
    }
    if (user.role === "ADMIN") {
      return "admin";
    }
    if (user.role === "TEACHER") {
      return "teacher";
    }
    return "student";
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {roleView === "login" && <LoginPage onLogin={login} />}
      {roleView === "admin" && <AdminDashboard onLogout={logout} user={user} />}
      {roleView === "teacher" && <TeacherDashboard onLogout={logout} user={user} />}
      {roleView === "student" && <StudentDashboard onLogout={logout} user={user} />}
    </div>
  );
}
