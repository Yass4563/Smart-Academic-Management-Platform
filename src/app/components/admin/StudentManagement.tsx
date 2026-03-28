import { useEffect, useMemo, useState } from "react";
import { Upload, Search } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { getBranches, getStudents, importStudents } from "../../lib/api";
import type { Branch, Student } from "../../types";

export function StudentManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importBranchId, setImportBranchId] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importDetails, setImportDetails] = useState<any[]>([]);

  const normalizeStudents = (rows: any[]) =>
    rows.map((student: any) => ({
      studentId: student.student_id,
      userId: student.user_id,
      fullName: student.full_name,
      email: student.email,
      branchId: student.branch_id,
      branchName: student.branch_name ?? null,
      codeApogee: student.code_apogee ?? null,
    }));

  useEffect(() => {
    if (!token) {
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [studentsData, branchesData] = await Promise.all([
          getStudents(token),
          getBranches(token),
        ]);
        setBranches(branchesData.branches || []);
        setStudents(normalizeStudents(studentsData.students || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !query ||
        [student.fullName, student.email, student.codeApogee, student.branchName].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );
      const matchesBranch =
        selectedBranch === "all" || String(student.branchId ?? "") === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [students, searchTerm, selectedBranch]);

  const handleImport = async () => {
    if (!token || !importFile) {
      setError("Please select a file to import.");
      return;
    }
    setError("");
    try {
      const result = await importStudents(
        token,
        importFile,
        importBranchId ? Number(importBranchId) : null
      );
      setImportResult(`Imported ${result.count} rows.`);
      setImportDetails(result.results || []);
      const studentsData = await getStudents(token);
      setStudents(normalizeStudents(studentsData.students || []));
      window.dispatchEvent(new CustomEvent("admin-data-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import students");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            {branches.map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name}
              </option>
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
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading students...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Code Apogee</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Branch Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{student.codeApogee || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.branchName || branches.find((branch) => branch.id === student.branchId)?.name || "-"}
                    </td>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Branch (Optional)</label>
                <select
                  value={importBranchId}
                  onChange={(e) => setImportBranchId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Use branch column from file</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">
                  Excel columns: Full Name, Code Apogee, Email, Branch
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {importFile && <p className="text-sm text-gray-600">Selected file: {importFile.name}</p>}

              {importResult && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  {importResult}
                </div>
              )}
              {importDetails.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 text-sm text-gray-700 space-y-2">
                  {importDetails.map((row: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{row.email}</span>
                      <span className="font-mono">{row.password || row.status}</span>
                    </div>
                  ))}
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
