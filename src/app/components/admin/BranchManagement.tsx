import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Building2, Users, BookOpen, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { createBranch, deleteBranch, getBranches, updateBranch } from '../../lib/api';
import type { Branch } from '../../types';

interface BranchModuleInput {
  name: string;
  code: string;
}

export function BranchManagement() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [branchModules, setBranchModules] = useState<BranchModuleInput[]>([
    { name: '', code: '' },
  ]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredBranches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return branches;
    }
    return branches.filter((branch) =>
      [branch.name, branch.code].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [branches, searchTerm]);

  const load = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getBranches(token);
      setBranches(data.branches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
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

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', code: '' });
    setBranchModules([{ name: '', code: '' }]);
    setShowModal(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setFormData({ name: branch.name, code: branch.code });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Name and code are required.');
      return;
    }
    setError('');
    try {
      if (editingId) {
        await updateBranch(token, editingId, formData);
        setBranches((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...formData } : b)));
      } else {
        const modules = branchModules
          .map((module) => ({ name: module.name.trim(), code: module.code.trim() }))
          .filter((module) => module.name && module.code);
        const result = await createBranch(token, { ...formData, modules });
        setBranches((prev) => [...prev, { id: result.id, ...formData }]);
      }
      setShowModal(false);
      setFormData({ name: '', code: '' });
      setBranchModules([{ name: '', code: '' }]);
      setEditingId(null);
      window.dispatchEvent(new CustomEvent('admin-data-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save branch');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      return;
    }
    setError('');
    try {
      await deleteBranch(token, id);
      setBranches((prev) => prev.filter((branch) => branch.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete branch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches..."
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
          Add Branch
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading branches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-600">{branch.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(branch)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-semibold text-gray-900">{branch.student_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Modules</span>
                  </div>
                  <span className="font-semibold text-gray-900">{branch.module_count ?? 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">ID: {branch.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingId ? 'Edit Branch' : 'Add New Branch'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., DUT Informatique"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., DUT-INFO"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              {!editingId && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Modules for this branch</label>
                    <button
                      type="button"
                      onClick={() => setBranchModules((prev) => [...prev, { name: '', code: '' }])}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      + Add module
                    </button>
                  </div>
                  <div className="space-y-3">
                    {branchModules.map((module, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2">
                        <input
                          type="text"
                          value={module.name}
                          onChange={(e) =>
                            setBranchModules((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, name: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Module name"
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                        />
                        <input
                          type="text"
                          value={module.code}
                          onChange={(e) =>
                            setBranchModules((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, code: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Code"
                          className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setBranchModules((prev) =>
                              prev.length === 1
                                ? [{ name: '', code: '' }]
                                : prev.filter((_, i) => i !== index)
                            )
                          }
                          className="col-span-1 px-2 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Students imported/assigned to this branch are auto-enrolled in its modules.
                  </p>
                </div>
              )}
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
                {editingId ? 'Save Changes' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
