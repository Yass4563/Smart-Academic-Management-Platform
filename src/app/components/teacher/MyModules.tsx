import { BookOpen, Users, Calendar, Clock } from 'lucide-react';

const modulesData = [
  {
    id: 1,
    name: 'Web Development',
    code: 'WEB-301',
    branch: 'DUT-INFO',
    students: 45,
    totalSessions: 24,
    completedSessions: 18,
    nextSession: '2026-01-03 09:00',
    room: 'Lab A1'
  },
  {
    id: 2,
    name: 'Mobile Applications',
    code: 'MOB-303',
    branch: 'DUT-INFO',
    students: 38,
    totalSessions: 20,
    completedSessions: 14,
    nextSession: '2026-01-03 14:00',
    room: 'Lab B2'
  },
  {
    id: 3,
    name: 'Database Systems',
    code: 'DB-302',
    branch: 'DUT-INFO',
    students: 42,
    totalSessions: 22,
    completedSessions: 16,
    nextSession: '2026-01-04 10:30',
    room: 'Lab A2'
  },
];

export function MyModules() {
  return (
    <div className="space-y-6">
      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modulesData.map((module) => (
          <div key={module.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-sm text-gray-600">{module.code}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {module.branch}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Enrolled Students</span>
                </div>
                <span className="font-semibold text-gray-900">{module.students}</span>
              </div>

              <div className="py-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Session Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {module.completedSessions}/{module.totalSessions}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${(module.completedSessions / module.totalSessions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Next Session</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{module.nextSession}</span>
                  <span className="text-gray-600">Room {module.room}</span>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              View Module Details
            </button>
          </div>
        ))}
      </div>

      {/* Schedule Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">This Week's Schedule</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { day: 'Monday', sessions: [{ module: 'Web Development', time: '09:00-11:00', room: 'Lab A1' }] },
              { day: 'Tuesday', sessions: [{ module: 'Mobile Apps', time: '14:00-16:00', room: 'Lab B2' }] },
              { day: 'Wednesday', sessions: [{ module: 'Database Systems', time: '10:30-12:30', room: 'Lab A2' }] },
              { day: 'Thursday', sessions: [{ module: 'Web Development', time: '09:00-11:00', room: 'Lab A1' }] },
              { day: 'Friday', sessions: [{ module: 'Mobile Apps', time: '15:00-17:00', room: 'Lab B2' }] },
            ].map((day, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-24 flex-shrink-0">
                  <p className="font-medium text-gray-900">{day.day}</p>
                </div>
                <div className="flex-1 space-y-2">
                  {day.sessions.map((session, sidx) => (
                    <div key={sidx} className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{session.module}</p>
                        <p className="text-sm text-gray-600">Room {session.room}</p>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{session.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
