import { BookOpen, Calendar, TrendingUp, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { label: 'Enrolled Modules', value: '6', icon: BookOpen, color: 'bg-purple-500' },
  { label: 'Sessions This Week', value: '12', icon: Calendar, color: 'bg-blue-500' },
  { label: 'Avg. Attendance', value: '92%', icon: TrendingUp, color: 'bg-green-500' },
  { label: 'Questions Asked', value: '24', icon: MessageSquare, color: 'bg-orange-500' },
];

const attendanceData = [
  { module: 'Web Dev', rate: 95 },
  { module: 'Database', rate: 88 },
  { module: 'Mobile', rate: 92 },
  { module: 'Networks', rate: 90 },
  { module: 'Algorithms', rate: 94 },
];

const upcomingSessions = [
  { id: 1, module: 'Web Development', date: '2026-01-03', time: '09:00', room: 'Lab A1', teacher: 'Dr. Hassan' },
  { id: 2, module: 'Mobile Apps', date: '2026-01-03', time: '14:00', room: 'Lab B2', teacher: 'Dr. Youssef' },
  { id: 3, module: 'Database Systems', date: '2026-01-04', time: '10:30', room: 'Lab A2', teacher: 'Dr. Amina' },
];

const recentFeedback = [
  { id: 1, module: 'Web Development', session: 5, myScore: 8, avgScore: 7.5, date: '2025-12-28' },
  { id: 2, module: 'Mobile Apps', session: 3, myScore: 7, avgScore: 6.5, date: '2025-12-27' },
  { id: 3, module: 'Database Systems', session: 6, myScore: 9, avgScore: 7.1, date: '2025-12-26' },
];

export function StudentOverview() {
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

      {/* Attendance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">My Attendance by Module</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="module" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="rate" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.module}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.date} at {session.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {session.teacher} • Room {session.room}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">My Understanding Scores</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentFeedback.map((feedback) => (
              <div key={feedback.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{feedback.module}</h4>
                    <p className="text-sm text-gray-600">Session {feedback.session} • {feedback.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">My Score</p>
                    <p className="text-2xl font-bold text-indigo-600">{feedback.myScore}/9</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Class Avg</p>
                    <p className="text-2xl font-bold text-gray-900">{feedback.avgScore}/9</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
