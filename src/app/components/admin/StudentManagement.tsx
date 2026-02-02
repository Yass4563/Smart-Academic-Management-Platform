import { useState } from 'react';
import { Upload, Download, Search, Filter, Mail, UserCheck } from 'lucide-react';

const studentsData = [
  { id: 1, name: 'Ahmed Benali', email: 'ahmed.benali@student.dut.ma', branch: 'DUT-INFO', status: 'active', enrolled: '2023-09-15' },
  { id: 2, name: 'Fatima Zahra', email: 'fatima.zahra@student.dut.ma', branch: 'DUT-INFO', status: 'active', enrolled: '2023-09-15' },
  { id: 3, name: 'Mohamed Alami', email: 'mohamed.alami@student.dut.ma', branch: 'DUT-TELECOM', status: 'active', enrolled: '2023-09-20' },
  { id: 4, name: 'Sara El Amrani', email: 'sara.elamrani@student.dut.ma', branch: 'DUT-GC', status: 'inactive', enrolled: '2023-09-15' },
  { id: 5, name: 'Youssef Idrissi', email: 'youssef.idrissi@student.dut.ma', branch: 'DUT-INFO', status: 'active', enrolled: '2024-01-10' },
  { id: 6, name: 'Amina Tazi', email: 'amina.tazi@student.dut.ma', branch: 'DUT-GE', status: 'active', enrolled: '2023-09-15' },
  { id: 7, name: 'Karim Benjelloun', email: 'karim.benjelloun@student.dut.ma', branch: 'DUT-INFO', status: 'active', enrolled: '2023-09-18' },
  { id: 8, name: 'Nadia Chakir', email: 'nadia.chakir@student.dut.ma', branch: 'DUT-GM', status: 'active', enrolled: '2024-01-15' },
];

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
            <option value="DUT-INFO">DUT Informatique</option>
            <option value="DUT-TELECOM">DUT Télécommunications</option>
            <option value="DUT-GC">DUT Génie Civil</option>
            <option value="DUT-GE">DUT Génie Électrique</option>
            <option value="DUT-GM">DUT Génie Mécanique</option>
          </select>

          <button
            onClick={() => setShowImportModal(true)}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{studentsData.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {studentsData.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-orange-600">
            {studentsData.filter(s => s.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Branch</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Enrolled</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-indigo-600">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {student.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.enrolled}</td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Import Students from Excel</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none">
                  <option>DUT Informatique</option>
                  <option>DUT Télécommunications</option>
                  <option>DUT Génie Civil</option>
                  <option>DUT Génie Électrique</option>
                  <option>DUT Génie Mécanique</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Excel file (.xlsx, .xls) with columns: Full Name, Email</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Format Requirements:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Column A: Full Name</li>
                  <li>• Column B: Email</li>
                  <li>• Password will be auto-generated and sent via email</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
