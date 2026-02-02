import { useState } from 'react';
import { Upload, Github, FileText, Video, Users, Award, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { submitPfe } from '../../lib/api';

export function ProjectSubmission() {
  const { token } = useAuth();
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    members: '',
    supervisor: '',
    github: '',
  });
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!token) return;
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }
    setError('');
    try {
      await submitPfe(token, {
        name: formData.name,
        members: formData.members,
        supervisor: formData.supervisor,
        githubLink: formData.github,
        report: reportFile,
        demo: demoFile,
      });
      setProjectSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  return (
    <div className="space-y-6">
      {projectSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Project Submitted Successfully!</h3>
              <p className="text-green-700 mb-4">Your PFE project has been submitted and is awaiting review by your supervisor and jury.</p>
              <div className="flex items-center gap-4 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date().toISOString().slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Status: Under Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">Submission Deadline</h3>
              <p className="text-orange-700">Please submit your PFE project before the deadline.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">PFE Project Submission</h2>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your project name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={projectSubmitted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Team Members
            </label>
            <input
              type="text"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              placeholder="Enter team member names (comma-separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={projectSubmitted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Supervisor</label>
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              placeholder="Supervisor name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={projectSubmitted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Github className="w-4 h-4 inline mr-1" />
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={projectSubmitted}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Project Report (PDF)
              </label>
              <label className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                projectSubmitted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
              }`}>
                {reportFile ? (
                  <div className="text-green-700">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{reportFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload PDF</p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                  disabled={projectSubmitted}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Demo Video (MP4)
              </label>
              <label className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                projectSubmitted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
              }`}>
                {demoFile ? (
                  <div className="text-green-700">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{demoFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload video</p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 100MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setDemoFile(e.target.files?.[0] ?? null)}
                  disabled={projectSubmitted}
                />
              </label>
            </div>
          </div>

          {!projectSubmitted && (
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Submit PFE Project
            </button>
          )}

          {projectSubmitted && (
            <button
              onClick={() => setProjectSubmitted(false)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Edit Submission
            </button>
          )}
        </div>
      </div>

      {projectSubmitted && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Evaluation Status</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Final Grade</p>
              <p className="text-gray-500">Awaiting evaluation</p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
