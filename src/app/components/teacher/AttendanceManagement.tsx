import { useState } from 'react';
import { QrCode, Download, Calendar, Users, Search, CheckCircle, XCircle } from 'lucide-react';

const sessionsData = [
  { 
    id: 1, 
    module: 'Web Development', 
    session: 'Session 5', 
    date: '2025-12-28', 
    time: '09:00',
    total: 45,
    present: 42,
    absent: 3,
    rate: 93
  },
  { 
    id: 2, 
    module: 'Mobile Apps', 
    session: 'Session 3', 
    date: '2025-12-27', 
    time: '14:00',
    total: 38,
    present: 33,
    absent: 5,
    rate: 87
  },
  { 
    id: 3, 
    module: 'Web Development', 
    session: 'Session 4', 
    date: '2025-12-26', 
    time: '10:30',
    total: 45,
    present: 38,
    absent: 7,
    rate: 84
  },
];

const attendanceDetails = [
  { id: 1, name: 'Ahmed Benali', status: 'present', time: '09:02' },
  { id: 2, name: 'Fatima Zahra', status: 'present', time: '09:01' },
  { id: 3, name: 'Mohamed Alami', status: 'absent', time: '-' },
  { id: 4, name: 'Sara El Amrani', status: 'present', time: '09:05' },
  { id: 5, name: 'Youssef Idrissi', status: 'present', time: '09:03' },
  { id: 6, name: 'Amina Tazi', status: 'absent', time: '-' },
];

export function AttendanceManagement() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessionsData.filter(session =>
    session.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => setShowQRModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <QrCode className="w-5 h-5" />
          Generate QR Code
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Session Attendance Records</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-semibold text-gray-900">{session.module}</h4>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {session.session}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date} at {session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{session.total} students</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{session.present}</span>
                    </div>
                    <span className="text-sm text-gray-600">Present</span>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">{session.absent}</span>
                    </div>
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{session.rate}%</div>
                    <span className="text-sm text-gray-600">Rate</span>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedSession(session.id);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generate QR Code</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none">
                  <option>Web Development</option>
                  <option>Mobile Apps</option>
                  <option>Database Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Number</label>
                <input
                  type="number"
                  placeholder="e.g., 6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Duration (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 15"
                  defaultValue="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              {/* QR Code Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">QR Code will appear here</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Students can scan this QR code to mark their attendance. The code expires after the set duration.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Generate & Display
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Attendance Details</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Student Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Scan Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceDetails.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{student.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
