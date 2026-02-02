import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

const attendanceHistory = [
  { id: 1, module: 'Web Development', session: 5, date: '2025-12-28', time: '09:02', status: 'present' },
  { id: 2, module: 'Mobile Apps', session: 3, date: '2025-12-27', time: '14:01', status: 'present' },
  { id: 3, module: 'Database Systems', session: 6, date: '2025-12-26', time: '10:35', status: 'present' },
  { id: 4, module: 'Computer Networks', session: 4, date: '2025-12-25', time: '-', status: 'absent' },
  { id: 5, module: 'Algorithms', session: 7, date: '2025-12-24', time: '11:03', status: 'present' },
];

export function ScanAttendance() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const handleScan = () => {
    // Simulate scanning
    setTimeout(() => {
      setScanResult('success');
      setTimeout(() => {
        setShowScanner(false);
        setScanResult(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Scan QR Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mark Your Attendance</h2>
            <p className="text-indigo-100 mb-6">Scan the QR code displayed by your teacher to mark your attendance</p>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <QrCode className="w-20 h-20 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900">
            {attendanceHistory.filter(a => a.status === 'present').length + attendanceHistory.filter(a => a.status === 'absent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Present</p>
          <p className="text-2xl font-bold text-green-600">
            {attendanceHistory.filter(a => a.status === 'present').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.round((attendanceHistory.filter(a => a.status === 'present').length / attendanceHistory.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {attendanceHistory.map((record) => (
            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.status === 'present' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{record.module}</h4>
                    <p className="text-sm text-gray-600">Session {record.session}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{record.date}</span>
                  </div>
                  {record.time !== '-' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Scanned at {record.time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {scanResult === null && (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Scan QR Code</h2>
                
                <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-600">Point camera at QR code</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Make sure the QR code is within the frame and well-lit
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowScanner(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScan}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Simulate Scan
                  </button>
                </div>
              </>
            )}

            {scanResult === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Attendance Marked!</h3>
                <p className="text-gray-600">Your attendance has been recorded successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
