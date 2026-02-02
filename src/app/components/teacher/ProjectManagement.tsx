import { useEffect, useMemo, useState } from 'react';
import { FolderOpen, Users, Calendar, Github, FileText, Video, Award, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getProjects, gradeProject } from '../../lib/api';

export function ProjectManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [grade, setGrade] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await getProjects(token);
        setProjects(data.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      }
    };
    load();
  }, [token]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(project.members ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = project.grade !== null ? 'graded' : project.report_path ? 'submitted' : 'in-progress';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  const handleGrade = async () => {
    if (!token || !selectedProject) return;
    try {
      await gradeProject(token, { projectId: selectedProject, grade: Number(grade) });
      setProjects((prev) => prev.map((p) => (p.id === selectedProject ? { ...p, grade: Number(grade) } : p)));
      setShowGradeModal(false);
      setGrade('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="in-progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Submitted</p>
          <p className="text-2xl font-bold text-blue-600">
            {projects.filter(p => p.report_path).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Graded</p>
          <p className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.grade !== null).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const status = project.grade !== null ? 'graded' : project.report_path ? 'submitted' : 'in-progress';
          return (
            <div key={project.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Owner: {project.student_name}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'graded' ? 'bg-green-100 text-green-700' :
                  status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{project.members || 'No members listed'}</span>
                </div>

                {project.github_link && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Github className="w-4 h-4" />
                    <a href={project.github_link} className="text-indigo-600 hover:underline">
                      {project.github_link}
                    </a>
                  </div>
                )}

                {project.deadline_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {project.deadline_at}</span>
                  </div>
                )}

                {project.grade !== null && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Score: {project.grade}/20</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(project.id);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View Details
                </button>
                {status === 'submitted' && (
                  <button
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowGradeModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Grade Project
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showDetailsModal && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{currentProject.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                <div className="flex flex-wrap gap-2">
                  {(currentProject.members || '').split(',').map((member: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {member.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                <p className="text-gray-900">{currentProject.supervisor || '-'}</p>
              </div>

              {currentProject.github_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Repository</label>
                  <a href={currentProject.github_link} className="text-indigo-600 hover:underline">
                    {currentProject.github_link}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Project Report</span>
                  </div>
                  <p className="text-sm text-gray-600">{currentProject.report_path || 'Not uploaded'}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Demo Video</span>
                  </div>
                  <p className="text-sm text-gray-600">{currentProject.demo_video_path || 'Not uploaded'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Grade Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Grade (0-20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Enter grade"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGradeModal(false);
                  setGrade('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGrade}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
