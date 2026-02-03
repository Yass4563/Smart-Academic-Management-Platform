import { useEffect, useMemo, useState } from 'react';
import { Mail, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getStudentModules, getStudentOverview, getStudentProfile } from '../../lib/api';

export function StudentProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [profileData, moduleData, overviewData] = await Promise.all([
          getStudentProfile(token),
          getStudentModules(token),
          getStudentOverview(token),
        ]);
        setProfile(profileData.user || null);
        setModules(moduleData.modules || []);
        setOverview(overviewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    };
    load();
  }, [token]);

  const initials = useMemo(() => {
    const name = profile?.full_name || user?.fullName || user?.email || 'ST';
    return name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase();
  }, [profile, user]);

  const avgUnderstanding = useMemo(() => {
    if (!modules.length) return 0;
    const scores = modules.map((m) => Number(m.avg_score || 0));
    const total = scores.reduce((sum, v) => sum + v, 0);
    return scores.length ? (total / scores.length) : 0;
  }, [modules]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <span className="text-3xl font-bold">{initials}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile?.full_name || user?.fullName}</h2>
            <p className="text-gray-600 mb-4">Student ID: {profile?.id ?? '-'}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Branch ID {profile?.branch_id ?? user?.branchId ?? '-'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {profile?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile?.email || user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Academic Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">Enrolled Modules</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{modules.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Attendance Rate</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{overview?.stats?.attendanceRate ?? 0}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Avg Understanding</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{avgUnderstanding.toFixed(1)}/9</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Enrolled Modules</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{module.name}</h4>
                    <p className="text-sm text-gray-600">{module.code}</p>
                    <p className="text-sm text-gray-500 mt-1">Avg score: {module.avg_score ? Number(module.avg_score).toFixed(1) : '0.0'}/9</p>
                  </div>
                </div>
              </div>
            ))}
            {modules.length === 0 && (
              <div className="text-sm text-gray-500">No modules assigned yet.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
