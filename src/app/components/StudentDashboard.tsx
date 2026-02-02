import { useMemo, useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  FolderOpen, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { StudentOverview } from './student/StudentOverview';
import { MyModulesStudent } from './student/MyModulesStudent';
import { ScanAttendance } from './student/ScanAttendance';
import { ProjectSubmission } from './student/ProjectSubmission';
import { StudentProfile } from './student/StudentProfile';
import type { User as AppUser } from '../types';

interface StudentDashboardProps {
  onLogout: () => void;
  user: AppUser | null;
}

export function StudentDashboard({ onLogout, user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'attendance' | 'project' | 'profile'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'My Modules', icon: BookOpen },
    { id: 'attendance', label: 'Scan QR', icon: QrCode },
    { id: 'project', label: 'PFE Project', icon: FolderOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email || 'Student';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && <span className="font-semibold text-gray-900">Student Portal</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-gray-600">{user?.branchId ? `Branch ID: ${user.branchId}` : 'My Branch'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.fullName || 'Student User'}</p>
              <p className="text-sm text-gray-600">{user?.email || ''}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && <StudentOverview />}
          {activeTab === 'modules' && <MyModulesStudent />}
          {activeTab === 'attendance' && <ScanAttendance />}
          {activeTab === 'project' && <ProjectSubmission />}
          {activeTab === 'profile' && <StudentProfile />}
        </div>
      </main>
    </div>
  );
}
