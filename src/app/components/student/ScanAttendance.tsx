import { useEffect, useMemo, useState } from 'react';
import { QrCode, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getAttendanceHistory, scanAttendance } from '../../lib/api';

export function ScanAttendance() {
  const { token } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [qrToken, setQrToken] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await getAttendanceHistory(token);
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance');
      }
    };
    load();
  }, [token]);

  const stats = useMemo(() => {
    const total = history.length;
    const present = history.length;
    return { total, present, rate: total ? Math.round((present / total) * 100) : 0 };
  }, [history]);

  const handleScan = async () => {
    if (!token || !qrToken.trim()) {
      setError('Enter a QR token to scan.');
      return;
    }
    setError('');
    try {
      await scanAttendance(token, qrToken.trim());
      setScanResult('success');
      const refreshed = await getAttendanceHistory(token);
      setHistory(refreshed.history || []);
      setTimeout(() => {
        setShowScanner(false);
        setScanResult(null);
        setQrToken('');
      }, 1500);
    } catch (err) {
      setScanResult('error');
      setError(err instanceof Error ? err.message : 'Scan failed');
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {history.map((record) => (
            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{record.module_name}</h4>
                    <p className="text-sm text-gray-600">{record.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{record.session_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Scanned at {record.marked_at}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No attendance records yet.</div>
          )}
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {scanResult === null && (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Scan QR Code</h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="Paste QR token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
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
                    Submit Token
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

            {scanResult === 'error' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan Failed</h3>
                <p className="text-gray-600">{error || 'Try again'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
