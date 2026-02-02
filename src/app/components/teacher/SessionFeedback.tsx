import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Search, Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../lib/auth';
import { getFeedbackSummary, getSessionFeedback, getTeacherModules } from '../../lib/api';

export function SessionFeedback() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await getTeacherModules(token);
        setModules(data.modules || []);
        if (data.modules?.length) {
          setSelectedModule(String(data.modules[0].id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedModule) return;
    const load = async () => {
      try {
        const data = await getFeedbackSummary(token, Number(selectedModule));
        setSummary(data.summary || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
      }
    };
    load();
  }, [token, selectedModule]);

  const filteredSessions = useMemo(() => {
    return summary.filter((session) =>
      session.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [summary, searchTerm]);

  const trendData = summary.map((s: any, idx: number) => ({
    session: `S${idx + 1}`,
    score: Number(s.avg_score ?? 0),
  }));

  const scoreDistribution = [
    { range: '1-3', count: 0 },
    { range: '4-6', count: 0 },
    { range: '7-9', count: 0 },
  ];

  const openQuestions = async (sessionId: number) => {
    if (!token) return;
    try {
      const data = await getSessionFeedback(token, sessionId);
      setQuestions(data.feedback || []);
      setShowQuestionsModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>{module.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Understanding Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="session" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 9]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Score Distribution (Latest Session)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session: any) => (
          <div key={session.session_id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{session.title}</h3>
                <p className="text-sm text-gray-600">{session.session_date}</p>
              </div>
              <div className="flex items-center gap-1 bg-indigo-100 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span className="font-semibold text-indigo-600">{Number(session.avg_score ?? 0).toFixed(1)}/9</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Average Understanding</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{ width: `${(Number(session.avg_score ?? 0) / 9) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{Number(session.avg_score ?? 0).toFixed(1)}/9</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Responses</span>
                </div>
                <span className="font-semibold text-gray-900">{session.responses ?? 0}</span>
              </div>
            </div>

            <button
              onClick={() => openQuestions(session.session_id)}
              className="w-full mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              View Questions
            </button>
          </div>
        ))}
      </div>

      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Questions</h2>

            <div className="space-y-4">
              {questions.length === 0 && (
                <div className="text-sm text-gray-500">No questions submitted.</div>
              )}
              {questions.map((item: any) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-indigo-600">
                          {item.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.full_name}</p>
                        <p className="text-sm text-gray-600">{item.email}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3">{item.question || 'No question provided.'}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Export All Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
