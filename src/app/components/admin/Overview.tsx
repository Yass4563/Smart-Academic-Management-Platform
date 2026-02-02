import { Users, BookOpen, Building2, GraduationCap, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statsData = [
  { label: 'Total Students', value: '1,248', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { label: 'Active Teachers', value: '87', change: '+5%', icon: GraduationCap, color: 'bg-green-500' },
  { label: 'Modules', value: '124', change: '+8%', icon: BookOpen, color: 'bg-purple-500' },
  { label: 'Branches', value: '6', change: '0%', icon: Building2, color: 'bg-orange-500' },
];

const attendanceData = [
  { month: 'Jan', attendance: 85 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 82 },
  { month: 'Apr', attendance: 90 },
  { month: 'May', attendance: 87 },
  { month: 'Jun', attendance: 92 },
];

const moduleEnrollmentData = [
  { name: 'Web Development', students: 245 },
  { name: 'Data Science', students: 198 },
  { name: 'Mobile Apps', students: 176 },
  { name: 'Cloud Computing', students: 154 },
  { name: 'AI & ML', students: 203 },
];

const recentActivities = [
  { id: 1, action: 'New student batch imported', branch: 'DUT Info', time: '2 hours ago' },
  { id: 2, action: 'Module "Advanced React" created', teacher: 'Dr. Smith', time: '5 hours ago' },
  { id: 3, action: 'Teacher assigned to module', module: 'Database Systems', time: '1 day ago' },
  { id: 4, action: 'Branch "DUT Telecom" updated', admin: 'Admin', time: '2 days ago' },
];

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module Enrollment */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Top Modules by Enrollment</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moduleEnrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="students" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {'branch' in activity && activity.branch}
                    {'teacher' in activity && activity.teacher}
                    {'module' in activity && activity.module}
                    {'admin' in activity && activity.admin}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
