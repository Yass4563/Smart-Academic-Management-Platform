import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Mail, BookOpen } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { assignTeacher, createTeacher, getBranches, getModules, getTeachers } from '../../lib/api';
import type { Branch, Module, Teacher } from '../../types';

interface TeacherFormData {
  fullName: string;
  email: string;
  branchId: string;
  title: string;
}

export function TeacherManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: '',
    email: '',
    branchId: '',
    title: '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [teachersData, branchesData, modulesData] = await Promise.all([
          getTeachers(token),
          getBranches(token),
          getModules(token),
        ]);
        setTeachers(
          (teachersData.teachers || []).map((teacher: any) => ({
            teacherId: teacher.teacher_id,
            userId: teacher.user_id,
            fullName: teacher.full_name,
            email: teacher.email,
            branchId: teacher.branch_id,
            isActive: teacher.is_active,
            title: teacher.title,
            modules: teacher.module_names
              ? String(teacher.module_names).split(",").map((m: string) => m.trim())
              : [],
          }))
        );
        setBranches(branchesData.branches || []);
        setModules(
          (modulesData.modules || []).map((module: any) => ({
            id: module.id,
            name: module.name,
            code: module.code,
            branchId: module.branch_id ?? module.branchId,
            branchName: module.branch_name ?? module.branchName ?? null,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const handleRegister = async () => {
    if (!token) {
      return;
    }
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setError('');
    try {
      const result = await createTeacher(token, {
        email: formData.email,
        fullName: formData.fullName,
        branchId: formData.branchId ? Number(formData.branchId) : null,
        title: formData.title || null,
      });
      setTempPassword(result.tempPassword);
      const refreshed = await getTeachers(token);
      setTeachers(
        (refreshed.teachers || []).map((teacher: any) => ({
          teacherId: teacher.teacher_id,
          userId: teacher.user_id,
          fullName: teacher.full_name,
          email: teacher.email,
          branchId: teacher.branch_id,
          isActive: teacher.is_active,
          title: teacher.title,
          modules: teacher.module_names
            ? String(teacher.module_names).split(",").map((m: string) => m.trim())
            : [],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register teacher');
    }
  };

  const handleAssign = async () => {
    if (!token || !selectedTeacher) {
      return;
    }
    if (selectedModules.length === 0) {
      setError('Select at least one module to assign.');
      return;
    }
    setError('');
    try {
      for (const moduleId of selectedModules) {
        await assignTeacher(token, { teacherId: selectedTeacher.teacherId, moduleId: Number(moduleId) });
      }
      const refreshed = await getTeachers(token);
      setTeachers(
        (refreshed.teachers || []).map((teacher: any) => ({
          teacherId: teacher.teacher_id,
          userId: teacher.user_id,
          fullName: teacher.full_name,
          email: teacher.email,
          branchId: teacher.branch_id,
          isActive: teacher.is_active,
          title: teacher.title,
          modules: teacher.module_names
            ? String(teacher.module_names).split(",").map((m: string) => m.trim())
            : [],
        }))
      );
      setShowAssignModal(false);
      setSelectedModules([]);
      setSelectedTeacher(null);
      window.dispatchEvent(new CustomEvent('admin-data-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign modules');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setTempPassword(null);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Register Teacher
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading teachers...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.teacherId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-xl font-semibold">
                    {teacher.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{teacher.fullName}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{teacher.email}</span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {branches.find(branch => branch.id === teacher.branchId)?.code || 'No branch'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {teacher.isActive ? 'active' : 'inactive'}
                </span>
              </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Assigned Modules</span>
              </div>
              {teacher.modules?.length ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.modules.map((module: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No modules assigned yet.</div>
              )}
            </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setSelectedModules([]);
                    setShowAssignModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  Assign Modules
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register New Teacher</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Dr. Ahmed Benali"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@dut.ma"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title / Specialization</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              {tempPassword && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-1">Temporary Password</p>
                  <p className="text-sm text-green-700">{tempPassword}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Assign Modules</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Modules</label>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {modules.map((module) => (
                  <label key={module.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules((prev) => [...prev, module.id]);
                        } else {
                          setSelectedModules((prev) => prev.filter((id) => id !== module.id));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-900">{module.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
