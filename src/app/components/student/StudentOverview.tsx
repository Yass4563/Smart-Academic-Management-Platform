import { useEffect, useState } from 'react';
import { BookOpen, Calendar, TrendingUp, MessageSquare, Megaphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../lib/auth';
import { getAnnouncements, getStudentOverview } from '../../lib/api';

export function StudentOverview() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [data, announcementData] = await Promise.all([
          getStudentOverview(token),
          getAnnouncements(token),
        ]);
        setOverview(data);
        setAnnouncements(announcementData.announcements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview');
      }
    };
    load();
  }, [token]);

  const statsData = [
    { label: 'Enrolled Modules', value: overview?.stats?.modules ?? 0, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Total Sessions', value: overview?.stats?.sessions ?? 0, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Avg. Attendance', value: `${overview?.stats?.attendanceRate ?? 0}%`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Feedback Submitted', value: overview?.stats?.feedbackCount ?? 0, icon: MessageSquare, color: 'bg-orange-500' },
  ];

  const attendanceData = (overview?.attendanceByModule || []).map((row: any) => {
    const rate = row.total_sessions ? Math.round((row.present_count / row.total_sessions) * 100) : 0;
    return { module: row.module_name, rate };
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {(overview?.upcomingSessions || []).map((session: any) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.module_name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span>{session.session_date} at {session.start_time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{session.title}</p>
                  </div>
                </div>
              </div>
            ))}
            {overview?.upcomingSessions?.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No upcoming sessions.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">My Understanding Scores</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {(overview?.recentFeedback || []).map((feedback: any) => (
              <div key={feedback.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{feedback.module_name}</h4>
                    <p className="text-sm text-gray-600">{feedback.title} • {feedback.session_date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">My Score</p>
                    <p className="text-2xl font-bold text-indigo-600">{feedback.understanding_score}/9</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Question</p>
                    <p className="text-sm text-gray-900 line-clamp-2">{feedback.question || 'No question'}</p>
                  </div>
                </div>
              </div>
            ))}
            {overview?.recentFeedback?.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No feedback submitted yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Announcements</h3>
          <Megaphone className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-6">
              <p className="font-semibold text-gray-900">{announcement.title}</p>
              <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(announcement.created_at).toLocaleString()}</p>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No announcements yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
