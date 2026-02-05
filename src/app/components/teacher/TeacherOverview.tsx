import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Clock, Megaphone } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../lib/auth';
import { getAnnouncements, getFeedbackSummary, getModuleSessions, getTeacherModules } from '../../lib/api';

export function TeacherOverview() {
  const { token } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());

  const getDatePart = (sessionDate: string) =>
    sessionDate?.includes('T') ? sessionDate.slice(0, 10) : sessionDate;
  const getSessionDateTime = (sessionDate: string, time: string) => {
    const datePart = getDatePart(sessionDate);
    return new Date(`${datePart}T${time}`);
  };
  const isCompletedSession = (session: any) => {
    if (session.qr_expires_at) {
      return new Date(session.qr_expires_at) <= now;
    }
    return getSessionDateTime(session.session_date, session.end_time) < now;
  };
  const sortByStartAsc = (a: any, b: any) =>
    getSessionDateTime(a.session_date, a.start_time).getTime() -
    getSessionDateTime(b.session_date, b.start_time).getTime();

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [modulesData, announcementsData] = await Promise.all([
          getTeacherModules(token),
          getAnnouncements(token),
        ]);
        const moduleList = modulesData.modules || [];
        setModules(moduleList);
        setAnnouncements(announcementsData.announcements || []);

        const sessionLists = await Promise.all(
          moduleList.map((module: any) => getModuleSessions(token, module.id))
        );
        const flattened = sessionLists.flatMap((list: any, idx: number) =>
          (list.sessions || []).map((session: any) => ({
            ...session,
            moduleName: moduleList[idx].name,
          }))
        );
        setSessions(flattened);

        const feedbackLists = await Promise.all(
          moduleList.map((module: any) => getFeedbackSummary(token, module.id))
        );
        const feedbackFlattened = feedbackLists.flatMap((list: any, idx: number) =>
          (list.summary || []).map((row: any) => ({
            ...row,
            moduleName: moduleList[idx].name,
          }))
        );
        setFeedback(feedbackFlattened);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview');
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const moduleCount = modules.length;
    const totalStudents = modules.reduce((sum, module) => {
      const moduleSessions = sessions.filter((s) => s.moduleName === module.name);
      const total = moduleSessions[0]?.total_students ?? 0;
      return sum + Number(total || 0);
    }, 0);
    const weekLater = new Date(now);
    weekLater.setDate(now.getDate() + 7);
    const sessionsThisWeek = sessions.filter((s) => {
      const date = getSessionDateTime(s.session_date, s.start_time);
      return date >= now && date <= weekLater && !isCompletedSession(s);
    }).length;
    const attendanceRates = sessions
      .filter((s) => Number(s.total_students || 0) > 0)
      .map((s) => (Number(s.present_count || 0) / Number(s.total_students)) * 100);
    const avgAttendance = attendanceRates.length
      ? Math.round(attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length)
      : 0;
    return { moduleCount, totalStudents, sessionsThisWeek, avgAttendance };
  }, [modules, sessions, now]);

  const attendanceData = useMemo(() => {
    const completed = sessions.filter((s) => isCompletedSession(s)).sort(sortByStartAsc);
    const recent = completed.slice(-6);
    return recent.map((s, idx) => ({
      session: `S${idx + 1}`,
      rate: s.total_students ? Math.round((s.present_count / s.total_students) * 100) : 0,
    }));
  }, [sessions, now]);

  const understandingData = useMemo(() => {
    const completedFeedback = feedback
      .filter((s: any) => isCompletedSession(s) && Number(s.responses ?? 0) > 0)
      .sort(sortByStartAsc);
    const recent = completedFeedback.slice(-6);
    return recent.map((s: any, idx: number) => ({
      session: `S${idx + 1}`,
      avg: Number(s.avg_score ?? 0),
    }));
  }, [feedback, now]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => !isCompletedSession(s) && getSessionDateTime(s.session_date, s.start_time) >= now)
      .sort(
        (a, b) =>
          getSessionDateTime(a.session_date, a.start_time).getTime() -
          getSessionDateTime(b.session_date, b.start_time).getTime()
      )
      .slice(0, 5);
  }, [sessions, now]);

  const statsData = [
    { label: 'My Modules', value: stats.moduleCount, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: 'Sessions This Week', value: stats.sessionsThisWeek, icon: Calendar, color: 'bg-green-500' },
    { label: 'Avg. Attendance', value: `${stats.avgAttendance}%`, icon: TrendingUp, color: 'bg-orange-500' },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <h4 className="font-semibold text-gray-900">{session.moduleName}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getDatePart(session.session_date)} at {session.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{session.total_students ?? 0} students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {upcomingSessions.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No upcoming sessions.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Latest Announcements</h3>
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
            <div className="p-6 text-sm text-gray-500">No announcements.</div>
          )}
        </div>
      </div>
    </div>
  );
}
