import { useState } from 'react';
import { BookOpen, User, Calendar, MessageSquare, Star } from 'lucide-react';

const modulesData = [
  { 
    id: 1, 
    name: 'Web Development', 
    code: 'WEB-301', 
    teacher: 'Dr. Hassan Alaoui', 
    sessions: 24, 
    completed: 18,
    myAttendance: 17,
    avgScore: 7.8
  },
  { 
    id: 2, 
    name: 'Mobile Applications', 
    code: 'MOB-303', 
    teacher: 'Dr. Youssef Chakir', 
    sessions: 20, 
    completed: 14,
    myAttendance: 13,
    avgScore: 7.2
  },
  { 
    id: 3, 
    name: 'Database Systems', 
    code: 'DB-302', 
    teacher: 'Dr. Amina Benjelloun', 
    sessions: 22, 
    completed: 16,
    myAttendance: 15,
    avgScore: 8.5
  },
  { 
    id: 4, 
    name: 'Computer Networks', 
    code: 'NET-304', 
    teacher: 'Dr. Fatima Tazi', 
    sessions: 20, 
    completed: 14,
    myAttendance: 13,
    avgScore: 7.0
  },
  { 
    id: 5, 
    name: 'Algorithms', 
    code: 'ALG-201', 
    teacher: 'Dr. Karim El Idrissi', 
    sessions: 26, 
    completed: 20,
    myAttendance: 19,
    avgScore: 8.1
  },
];

export function MyModulesStudent() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [understanding, setUnderstanding] = useState(5);

  return (
    <div className="space-y-6">
      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modulesData.map((module) => (
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
                <span>{module.teacher}</span>
              </div>

              <div className="py-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Session Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {module.completed}/{module.sessions}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${(module.completed / module.sessions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">My Attendance</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{module.myAttendance}/{module.completed}</span>
                  <span className={`text-sm font-medium ${
                    (module.myAttendance / module.completed) >= 0.85 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    ({Math.round((module.myAttendance / module.completed) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Avg Understanding</span>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{module.avgScore}/9</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedModule(module.id);
                setShowFeedbackModal(true);
              }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Submit Feedback
            </button>
          </div>
        ))}
      </div>

      {/* Submit Feedback Modal */}
      {showFeedbackModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Session Feedback</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module: {modulesData.find(m => m.id === selectedModule)?.name}
                </label>
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
                onClick={() => {
                  setShowFeedbackModal(false);
                  setQuestion('');
                  setUnderstanding(5);
                }}
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
