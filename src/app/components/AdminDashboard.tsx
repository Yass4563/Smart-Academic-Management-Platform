import { useMemo, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Building2, 
  LogOut, 
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { Overview } from './admin/Overview';
import { BranchManagement } from './admin/BranchManagement';
import { StudentManagement } from './admin/StudentManagement';
import { ModuleManagement } from './admin/ModuleManagement';
import { TeacherManagement } from './admin/TeacherManagement';
import type { User } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  user: User | null;
}

export function AdminDashboard({ onLogout, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'students' | 'modules' | 'teachers'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'teachers', label: 'Teachers', icon: UserPlus },
  ] as const;

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email || 'Admin';
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
          {sidebarOpen && <span className="font-semibold text-gray-900">Admin Panel</span>}
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
            <p className="text-sm text-gray-600">Manage your academic platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.fullName || 'Admin User'}</p>
              <p className="text-sm text-gray-600">{user?.email || ''}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'branches' && <BranchManagement />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'modules' && <ModuleManagement />}
          {activeTab === 'teachers' && <TeacherManagement />}
        </div>
      </main>
    </div>
  );
}
