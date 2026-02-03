import { useEffect, useMemo, useState } from 'react';
import { Users, BookOpen, Building2, GraduationCap, TrendingUp, Megaphone } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../lib/auth';
import { createAnnouncement, getAdminOverview, getAnnouncements } from '../../lib/api';

export function Overview() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [data, announcementData] = await Promise.all([
          getAdminOverview(token),
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
    { label: 'Total Students', value: overview?.stats?.totalStudents ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Teachers', value: overview?.stats?.activeTeachers ?? 0, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Modules', value: overview?.stats?.modules ?? 0, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Branches', value: overview?.stats?.branches ?? 0, icon: Building2, color: 'bg-orange-500' },
  ];

  const attendanceData = useMemo(() => {
    const list = overview?.attendanceTrends || [];
    return [...list].reverse().map((item: any) => ({
      month: item.month,
      attendance: item.total,
    }));
  }, [overview]);

  const moduleEnrollmentData = overview?.moduleEnrollment || [];
  const recentActivities = overview?.recentActivity || [];

  const handleAnnouncement = async () => {
    if (!token) return;
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setError('Announcement title and message are required.');
      return;
    }
    setError('');
    try {
      await createAnnouncement(token, announcementForm);
      const refreshed = await getAnnouncements(token);
      setAnnouncements(refreshed.announcements || []);
      setAnnouncementForm({ title: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  };

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
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-500">Updated live</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity: any, idx: number) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">New {activity.role.toLowerCase()} created</p>
                    <p className="text-sm text-gray-600">{activity.label}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No recent activity.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Announcements</h3>
            <Megaphone className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Announcement title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <textarea
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                placeholder="Announcement message"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAnnouncement}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Publish Announcement
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="text-sm text-gray-500">No announcements yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
