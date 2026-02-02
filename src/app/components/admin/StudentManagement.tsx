import { useEffect, useMemo, useState } from 'react';
import { Upload, Download, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getBranches, getStudents, importStudents } from '../../lib/api';
import type { Branch, Student } from '../../types';

export function StudentManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importBranchId, setImportBranchId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [studentsData, branchesData] = await Promise.all([
          getStudents(token),
          getBranches(token),
        ]);
        setBranches(branchesData.branches || []);
        setStudents(
          (studentsData.students || []).map((student: any) => ({
            studentId: student.student_id,
            userId: student.user_id,
            fullName: student.full_name,
            email: student.email,
            branchId: student.branch_id,
            isActive: student.is_active,
            studentNumber: student.student_number,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch =
        selectedBranch === 'all' ||
        String(student.branchId ?? '') === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [students, searchTerm, selectedBranch]);

  const handleImport = async () => {
    if (!token || !importFile) {
      setError('Please select a file to import.');
      return;
    }
    setError('');
    try {
      const result = await importStudents(
        token,
        importFile,
        importBranchId ? Number(importBranchId) : null
      );
      setImportResult(`Imported ${result.count} rows.`);
      const studentsData = await getStudents(token);
      setStudents(
        (studentsData.students || []).map((student: any) => ({
          studentId: student.student_id,
          userId: student.user_id,
          fullName: student.full_name,
          email: student.email,
          branchId: student.branch_id,
          isActive: student.is_active,
          studentNumber: student.student_number,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import students');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={String(branch.id)}>{branch.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            Import Excel
          </button>

          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {students.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-orange-600">
            {students.filter(s => !s.isActive).length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading students...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Branch</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Student #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-indigo-600">
                            {student.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {branches.find(branch => branch.id === student.branchId)?.code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {student.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.studentNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Import Students from Excel</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                <select
                  value={importBranchId}
                  onChange={(e) => setImportBranchId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={String(branch.id)}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Excel file (.xlsx, .xls) with columns: Full Name, Email</p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {importFile && (
                <p className="text-sm text-gray-600">Selected file: {importFile.name}</p>
              )}

              {importResult && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  {importResult}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
