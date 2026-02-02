import { useState } from 'react';
import { MessageSquare, TrendingUp, Search, Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sessionsData = [
  { id: 1, module: 'Web Development', session: 5, date: '2025-12-28', avgScore: 7.8, questions: 12 },
  { id: 2, module: 'Mobile Apps', session: 3, date: '2025-12-27', avgScore: 6.5, questions: 8 },
  { id: 3, module: 'Web Development', session: 4, date: '2025-12-26', avgScore: 8.2, questions: 15 },
  { id: 4, module: 'Database Systems', session: 6, date: '2025-12-25', avgScore: 7.1, questions: 10 },
];

const understandingTrend = [
  { session: 'S1', score: 7.5 },
  { session: 'S2', score: 6.8 },
  { session: 'S3', score: 8.2 },
  { session: 'S4', score: 7.1 },
  { session: 'S5', score: 8.5 },
  { session: 'S6', score: 7.8 },
];

const scoreDistribution = [
  { range: '1-3', count: 2 },
  { range: '4-6', count: 8 },
  { range: '7-9', count: 35 },
];

const studentQuestions = [
  { id: 1, student: 'Ahmed B.', question: 'Can you explain the difference between REST and GraphQL APIs?', session: 'S5', module: 'Web Dev' },
  { id: 2, student: 'Fatima Z.', question: 'How do we handle authentication in React applications?', session: 'S5', module: 'Web Dev' },
  { id: 3, student: 'Mohamed A.', question: 'What are the best practices for state management?', session: 'S5', module: 'Web Dev' },
  { id: 4, student: 'Sara E.', question: 'Could you provide more examples of hooks usage?', session: 'S4', module: 'Web Dev' },
  { id: 5, student: 'Youssef I.', question: 'How to optimize React application performance?', session: 'S4', module: 'Web Dev' },
];

export function SessionFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  const filteredSessions = sessionsData.filter(session => {
    const matchesSearch = session.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || session.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
          <option value="all">All Modules</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile Apps">Mobile Apps</option>
          <option value="Database Systems">Database Systems</option>
        </select>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Understanding Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Understanding Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={understandingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="session" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 9]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
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

      {/* Session Feedback Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{session.module}</h3>
                <p className="text-sm text-gray-600">Session {session.session} • {session.date}</p>
              </div>
              <div className="flex items-center gap-1 bg-indigo-100 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span className="font-semibold text-indigo-600">{session.avgScore}/9</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Average Understanding</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{ width: `${(session.avgScore / 9) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{session.avgScore}/9</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Questions Submitted</span>
                </div>
                <span className="font-semibold text-gray-900">{session.questions}</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestionsModal(true)}
              className="w-full mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              View Questions
            </button>
          </div>
        ))}
      </div>

      {/* Questions Modal */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Questions</h2>
            
            <div className="space-y-4">
              {studentQuestions.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-indigo-600">
                          {item.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.student}</p>
                        <p className="text-sm text-gray-600">{item.module} - {item.session}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 pl-13">{item.question}</p>
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
