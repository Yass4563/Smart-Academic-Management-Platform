import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'admin' | 'teacher' | 'student'>('login');
  const [userRole, setUserRole] = useState<string>('');

  const handleLogin = (role: string) => {
    setUserRole(role);
    setCurrentView(role as 'admin' | 'teacher' | 'student');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserRole('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} />}
      {currentView === 'teacher' && <TeacherDashboard onLogout={handleLogout} />}
      {currentView === 'student' && <StudentDashboard onLogout={handleLogout} />}
    </div>
  );
}
