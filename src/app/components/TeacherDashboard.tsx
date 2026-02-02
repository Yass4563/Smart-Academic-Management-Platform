import { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  MessageSquare, 
  FolderOpen, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { TeacherOverview } from './teacher/TeacherOverview';
import { MyModules } from './teacher/MyModules';
import { AttendanceManagement } from './teacher/AttendanceManagement';
import { SessionFeedback } from './teacher/SessionFeedback';
import { ProjectManagement } from './teacher/ProjectManagement';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'attendance' | 'feedback' | 'projects'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'My Modules', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: QrCode },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'projects', label: 'PFE Projects', icon: FolderOpen },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && <span className="font-semibold text-gray-900">Teacher Panel</span>}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-gray-600">Manage courses and track student progress</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-gray-900">Dr. Hassan Alaoui</p>
              <p className="text-sm text-gray-600">hassan.alaoui@dut.ma</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              HA
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && <TeacherOverview />}
          {activeTab === 'modules' && <MyModules />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'feedback' && <SessionFeedback />}
          {activeTab === 'projects' && <ProjectManagement />}
        </div>
      </main>
    </div>
  );
}
