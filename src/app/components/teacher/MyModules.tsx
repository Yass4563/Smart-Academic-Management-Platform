import { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getTeacherModules } from '../../lib/api';

export function MyModules() {
  const { token } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await getTeacherModules(token);
        setModules(data.modules || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      }
    };
    load();
  }, [token]);

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
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-sm text-gray-600">{module.code}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Branch {module.branch_id ?? module.branchId}
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
                <span className="font-semibold text-gray-900">-</span>
              </div>

              <div className="py-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Session Progress</span>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div className="py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Next Session</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">-</span>
                  <span className="text-gray-600">Room -</span>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              View Module Details
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">This Week's Schedule</h3>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-500">Schedule data will appear once sessions are created.</div>
        </div>
      </div>
    </div>
  );
}
