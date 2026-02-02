import { BookOpen, Users, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { label: 'My Modules', value: '3', icon: BookOpen, color: 'bg-purple-500' },
  { label: 'Total Students', value: '142', icon: Users, color: 'bg-blue-500' },
  { label: 'Sessions This Week', value: '8', icon: Calendar, color: 'bg-green-500' },
  { label: 'Avg. Attendance', value: '87%', icon: TrendingUp, color: 'bg-orange-500' },
];

const attendanceData = [
  { session: 'S1', rate: 92 },
  { session: 'S2', rate: 88 },
  { session: 'S3', rate: 85 },
  { session: 'S4', rate: 90 },
  { session: 'S5', rate: 87 },
  { session: 'S6', rate: 93 },
];

const understandingData = [
  { session: 'Session 1', avg: 7.5 },
  { session: 'Session 2', avg: 6.8 },
  { session: 'Session 3', avg: 8.2 },
  { session: 'Session 4', avg: 7.1 },
  { session: 'Session 5', avg: 8.5 },
];

const upcomingSessions = [
  { id: 1, module: 'Web Development', date: '2026-01-03', time: '09:00', room: 'Lab A1', students: 45 },
  { id: 2, module: 'Mobile Apps', date: '2026-01-03', time: '14:00', room: 'Lab B2', students: 38 },
  { id: 3, module: 'Web Development', date: '2026-01-05', time: '10:30', room: 'Lab A1', students: 45 },
  { id: 4, module: 'Mobile Apps', date: '2026-01-06', time: '15:00', room: 'Lab B2', students: 38 },
];

export function TeacherOverview() {
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
        {/* Attendance Rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Attendance Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="session" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Understanding Scores */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Average Understanding Score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={understandingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="session" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" domain={[0, 9]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.module}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.date} at {session.time}</span>
                      </div>
                      <span>Room: {session.room}</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{session.students} students</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Generate QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
