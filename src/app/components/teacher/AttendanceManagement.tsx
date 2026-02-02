import { useEffect, useMemo, useState } from 'react';
import { QrCode, Download, Calendar, Users, Search, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { exportAttendance, generateQr, getAttendance, getModuleSessions, getTeacherModules } from '../../lib/api';

export function AttendanceManagement() {
  const { token } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrModuleId, setQrModuleId] = useState<string>('');
  const [qrSessionId, setQrSessionId] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState('10');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await getTeacherModules(token);
        setModules(data.modules || []);
        const sessionLists = await Promise.all(
          (data.modules || []).map((module: any) => getModuleSessions(token, module.id))
        );
        const flattened = sessionLists.flatMap((list: any, idx: number) =>
          (list.sessions || []).map((session: any) => ({
            ...session,
            moduleName: data.modules[idx].name,
            moduleId: data.modules[idx].id,
          }))
        );
        setSessions(flattened);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      }
    };
    load();
  }, [token]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session =>
      session.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);

  const handleGenerateQr = async () => {
    if (!token || !qrModuleId || !qrSessionId) {
      setError('Select module and session.');
      return;
    }
    setError('');
    try {
      const result = await generateQr(token, {
        moduleId: Number(qrModuleId),
        sessionId: Number(qrSessionId),
        expiresInMinutes: Number(expiresIn) || 10,
      });
      setQrData(result.qrData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR');
    }
  };

  const openDetails = async (session: any) => {
    if (!token) return;
    setSelectedSession(session);
    setShowDetailsModal(true);
    try {
      const data = await getAttendance(token, session.id);
      setAttendance(data.attendance || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    }
  };

  const downloadExport = async (format: 'csv' | 'pdf') => {
    if (!token || !selectedSession) return;
    try {
      const blob = await exportAttendance(token, selectedSession.id, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-session-${selectedSession.id}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  };

  return (
    <div className="space-y-6">
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
          onClick={() => {
            setShowQRModal(true);
            setQrData(null);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <QrCode className="w-5 h-5" />
          Generate QR Code
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

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
                    <h4 className="font-semibold text-gray-900">{session.moduleName}</h4>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {session.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.session_date} at {session.start_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>- students</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">-</span>
                    </div>
                    <span className="text-sm text-gray-600">Present</span>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">-</span>
                    </div>
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openDetails(session)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        downloadExport('csv');
                      }}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generate QR Code</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
                <select
                  value={qrModuleId}
                  onChange={(e) => setQrModuleId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Select module</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>{module.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <select
                  value={qrSessionId}
                  onChange={(e) => setQrSessionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="">Select session</option>
                  {sessions.filter((session) => String(session.moduleId) === qrModuleId).map((session) => (
                    <option key={session.id} value={session.id}>{session.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Duration (minutes)</label>
                <input
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
                {qrData ? (
                  <img src={qrData} alt="QR" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                )}
                <p className="text-sm text-gray-600">QR Code will appear here</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQr}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Generate & Display
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Attendance Details</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Student Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Scan Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{student.full_name}</td>
                      <td className="px-4 py-3 text-gray-600">{student.email}</td>
                      <td className="px-4 py-3 text-gray-600">{student.marked_at}</td>
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
              <button
                onClick={() => downloadExport('csv')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
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
