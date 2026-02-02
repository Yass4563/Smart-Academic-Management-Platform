import { useState } from 'react';
import { Upload, Github, FileText, Video, Users, Award, Calendar, CheckCircle } from 'lucide-react';

export function ProjectSubmission() {
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: 'E-Commerce Platform with AI',
    members: 'Ahmed Benali, Fatima Zahra, Mohamed Alami',
    supervisor: 'Dr. Hassan Alaoui',
    github: 'https://github.com/team1/ecommerce',
  });

  return (
    <div className="space-y-6">
      {/* Project Status Card */}
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
                  <span>Submitted: 2025-12-30</span>
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
              <p className="text-orange-700">Your PFE project must be submitted by <strong>January 15, 2026</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Project Submission Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">PFE Project Submission</h2>
        
        <div className="space-y-6">
          {/* Project Name */}
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

          {/* Team Members */}
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

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Supervisor</label>
            <select
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={projectSubmitted}
            >
              <option>Dr. Hassan Alaoui</option>
              <option>Dr. Amina Benjelloun</option>
              <option>Dr. Karim El Idrissi</option>
              <option>Dr. Fatima Tazi</option>
              <option>Dr. Youssef Chakir</option>
            </select>
          </div>

          {/* GitHub Link */}
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

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Report Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Project Report (PDF)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                projectSubmitted 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
              }`}>
                {projectSubmitted ? (
                  <div className="text-green-700">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">report_final.pdf</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload PDF</p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Demo Video (MP4)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                projectSubmitted 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
              }`}>
                {projectSubmitted ? (
                  <div className="text-green-700">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">demo_video.mp4</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload video</p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 100MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Submission Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Project name and team member names</li>
              <li>• Valid GitHub repository link with project source code</li>
              <li>• Complete project report in PDF format</li>
              <li>• Demo video showcasing your project (5-10 minutes)</li>
              <li>• All files must be uploaded before the deadline</li>
            </ul>
          </div>

          {/* Submit Button */}
          {!projectSubmitted && (
            <button
              onClick={() => setProjectSubmitted(true)}
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

      {/* Grading Info (if graded) */}
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
