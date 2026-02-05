import { useEffect, useMemo, useState } from 'react';
import { BookOpen, User, Calendar, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getStudentModules, getStudentSessions, submitFeedback } from '../../lib/api';

interface SessionItem {
  id: number;
  module_id: number;
  title: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  qr_expires_at?: string | null;
}

export function MyModulesStudent() {
  const { token } = useAuth();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [understanding, setUnderstanding] = useState(5);
  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [error, setError] = useState('');
  const now = new Date();
  const getDatePart = (sessionDate: string) =>
    sessionDate?.includes('T') ? sessionDate.slice(0, 10) : sessionDate;
  const getSessionDateTime = (sessionDate: string, time?: string) => {
    const datePart = getDatePart(sessionDate);
    return time ? new Date(`${datePart}T${time}`) : null;
  };
  const isCompletedSession = (session: SessionItem) => {
    if (session.qr_expires_at) {
      return new Date(session.qr_expires_at) <= now;
    }
    const end = getSessionDateTime(session.session_date, session.end_time);
    return end ? end < now : false;
  };
  const completedSessions = useMemo(
    () => sessions.filter((session) => isCompletedSession(session)),
    [sessions]
  );

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [modulesData, sessionsData] = await Promise.all([
          getStudentModules(token),
          getStudentSessions(token),
        ]);
        setModules(modulesData.modules || []);
        setSessions(sessionsData.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      }
    };
    load();
  }, [token]);

  const completedByModule = useMemo(() => {
    return completedSessions.reduce<Record<number, SessionItem[]>>((acc, session) => {
      const moduleId = session.module_id;
      if (!acc[moduleId]) acc[moduleId] = [];
      acc[moduleId].push(session);
      return acc;
    }, {});
  }, [completedSessions]);

  const handleSubmitFeedback = async () => {
    if (!token || !selectedSession) return;
    try {
      await submitFeedback(token, {
        sessionId: selectedSession,
        understandingScore: understanding,
        question: question || null,
      });
      setShowFeedbackModal(false);
      setQuestion('');
      setUnderstanding(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                <p className="text-sm text-gray-600">{module.code}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 pb-2 border-b border-gray-100">
                <User className="w-4 h-4" />
                <span>Assigned module</span>
              </div>

              <div className="py-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Sessions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {module.total_sessions ?? 0}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${Math.min((module.total_sessions ?? 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Attendance</span>
                <span className="font-semibold text-gray-900">
                  {module.present_count ?? 0}/{module.total_sessions ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Avg Understanding</span>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {module.avg_score ? Number(module.avg_score).toFixed(1) : '0.0'}/9
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedSession(completedByModule[module.id]?.[0]?.id ?? null);
                setShowFeedbackModal(true);
              }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Submit Feedback
            </button>
          </div>
        ))}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Session Feedback</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
                <select
                  value={selectedSession ?? ''}
                  onChange={(e) => setSelectedSession(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="" disabled>Select session</option>
                  {completedSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title} - {getDatePart(session.session_date)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Understanding Score (1-9)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={understanding}
                    onChange={(e) => setUnderstanding(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">{understanding}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Very Difficult</span>
                  <span>Just Right</span>
                  <span>Very Easy</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions (Optional)
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What questions do you have about this session?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Your feedback helps teachers understand how well you're following the course material.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setQuestion('');
                  setUnderstanding(5);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
