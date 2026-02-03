import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users, Clock, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { createModule, deleteModule, getBranches, getModules, updateModule } from '../../lib/api';
import type { Branch, Module } from '../../types';

interface ModuleFormData {
  name: string;
  code: string;
  branchId: string;
}

export function ModuleManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ModuleFormData>({
    name: '',
    code: '',
    branchId: '',
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [modulesData, branchesData] = await Promise.all([
        getModules(token),
        getBranches(token),
      ]);
      const normalizedModules = (modulesData.modules || []).map((module: any) => ({
        id: module.id,
        name: module.name,
        code: module.code,
        branchId: module.branch_id ?? module.branchId,
        branchName: module.branch_name ?? module.branchName ?? null,
        studentCount: module.student_count ?? module.studentCount ?? 0,
        teacherName: module.teacher_name ?? module.teacherName ?? null,
      }));
      setModules(normalizedModules);
      setBranches(branchesData.branches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('admin-data-updated', refresh as EventListener);
    return () => window.removeEventListener('admin-data-updated', refresh as EventListener);
  }, [token]);

  const filteredModules = useMemo(() => {
    return modules.filter(module =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.branchName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modules, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', branchId: '' });
    setShowModal(true);
  };

  const openEdit = (module: Module) => {
    setEditingId(module.id);
    setFormData({ name: module.name, code: module.code, branchId: String(module.branchId) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }
    if (!formData.name.trim() || !formData.code.trim() || !formData.branchId) {
      setError('Name, code, and branch are required.');
      return;
    }
    setError('');
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        branchId: Number(formData.branchId),
      };
      if (editingId) {
        await updateModule(token, editingId, payload);
        setModules((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...payload, branchName: branches.find(b => b.id === payload.branchId)?.name } : m)));
      } else {
        const result = await createModule(token, payload);
        const branchName = branches.find((b) => b.id === payload.branchId)?.name ?? null;
        setModules((prev) => [...prev, { id: result.id, ...payload, branchName }]);
      }
      setShowModal(false);
      setFormData({ name: '', code: '', branchId: '' });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save module');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      return;
    }
    setError('');
    try {
      await deleteModule(token, id);
      setModules((prev) => prev.filter((module) => module.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Module
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredModules.map((module) => (
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
                      {module.branchName || `Branch ${module.branchId}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(module)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Teacher</span>
                <span className="font-medium text-gray-900">{module.teacherName || 'Unassigned'}</span>
              </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Students</span>
                  </div>
                <span className="font-semibold text-gray-900">{module.studentCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Sessions</span>
                  </div>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{editingId ? 'Edit Module' : 'Add New Module'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Development"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., WEB-301"
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
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? 'Save Changes' : 'Create Module'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
