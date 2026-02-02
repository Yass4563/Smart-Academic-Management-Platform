import { useState } from 'react';
import { Plus, Search, Mail, BookOpen, Calendar } from 'lucide-react';

const teachersData = [
  { id: 1, name: 'Dr. Hassan Alaoui', email: 'hassan.alaoui@dut.ma', modules: ['Web Development', 'Mobile Apps'], branch: 'DUT-INFO', status: 'active' },
  { id: 2, name: 'Dr. Amina Benjelloun', email: 'amina.benj@dut.ma', modules: ['Database Systems'], branch: 'DUT-INFO', status: 'active' },
  { id: 3, name: 'Dr. Karim El Idrissi', email: 'karim.idrissi@dut.ma', modules: ['Data Structures', 'Algorithms'], branch: 'DUT-INFO', status: 'active' },
  { id: 4, name: 'Dr. Fatima Tazi', email: 'fatima.tazi@dut.ma', modules: ['Network Security'], branch: 'DUT-TELECOM', status: 'active' },
  { id: 5, name: 'Dr. Youssef Chakir', email: 'youssef.chakir@dut.ma', modules: ['Cloud Computing'], branch: 'DUT-INFO', status: 'inactive' },
];

const availableModules = [
  'Web Development',
  'Database Systems',
  'Data Structures',
  'Algorithms',
  'Mobile Apps',
  'Network Security',
  'Cloud Computing',
  'Machine Learning',
  'Cybersecurity',
];

export function TeacherManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    specialization: '',
  });

  const filteredTeachers = teachersData.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Register Teacher
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <span className="text-xl font-semibold">
                  {teacher.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {teacher.branch}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                teacher.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {teacher.status}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Assigned Modules ({teacher.modules.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.modules.map((module, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedTeacher(teacher.id);
                  setShowAssignModal(true);
                }}
                className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                Assign Modules
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register New Teacher</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Select branch</option>
                  <option value="DUT-INFO">DUT Informatique</option>
                  <option value="DUT-TELECOM">DUT Télécommunications</option>
                  <option value="DUT-GC">DUT Génie Civil</option>
                  <option value="DUT-GE">DUT Génie Électrique</option>
                  <option value="DUT-GM">DUT Génie Mécanique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Computer Science, Networks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  A temporary password will be auto-generated and sent to the teacher's email address.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', email: '', branch: '', specialization: '' });
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modules Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Assign Modules</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Modules</label>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {availableModules.map((module) => (
                  <label key={module} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
                    <span className="text-gray-900">{module}</span>
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
                onClick={() => setShowAssignModal(false)}
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
