import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Users,
  Video,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import {
  addProjectJury,
  createProject,
  getProjectOptions,
  getProjects,
  gradeProject,
  setProjectDeadline,
} from "../../lib/api";

function getProjectStatus(project: any) {
  if (project.grade !== null && project.grade !== undefined) {
    return "graded";
  }
  if (project.report_path && project.demo_video_path) {
    return "submitted";
  }
  return "in-progress";
}

export function ProjectManagement() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [grade, setGrade] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedJuryTeacherId, setSelectedJuryTeacherId] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    githubLink: "",
    deadlineAt: "",
    studentIds: [] as number[],
    juryTeacherIds: [] as number[],
  });
  const [error, setError] = useState("");

  const loadData = async () => {
    if (!token) {
      return;
    }
    setError("");
    try {
      const [projectsData, optionsData] = await Promise.all([getProjects(token), getProjectOptions(token)]);
      setProjects(projectsData.projects || []);
      setAvailableStudents(optionsData.students || []);
      setAvailableTeachers(optionsData.teachers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const membersText = (project.assigned_students || [])
        .map((student: any) => student.name)
        .join(", ");
      const matchesSearch =
        !query ||
        [project.name, membersText, project.coordinator_name].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );
      const status = getProjectStatus(project);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const selectedProject = selectedProjectId
    ? projects.find((project) => Number(project.id) === selectedProjectId) ?? null
    : null;

  const handleCreateProject = async () => {
    if (!token) {
      return;
    }
    if (!createForm.name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (createForm.studentIds.length === 0) {
      setError("Select at least one student.");
      return;
    }
    setError("");
    try {
      await createProject(token, {
        name: createForm.name.trim(),
        studentIds: createForm.studentIds,
        juryTeacherIds: createForm.juryTeacherIds,
        githubLink: createForm.githubLink.trim() || null,
        deadlineAt: createForm.deadlineAt || null,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        githubLink: "",
        deadlineAt: "",
        studentIds: [],
        juryTeacherIds: [],
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const handleGrade = async () => {
    if (!token || !selectedProject) {
      return;
    }
    setError("");
    try {
      await gradeProject(token, { projectId: selectedProject.id, grade: Number(grade) });
      setShowGradeModal(false);
      setGrade("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grade project");
    }
  };

  const handleDeadline = async () => {
    if (!token || !selectedProject || !deadline) {
      return;
    }
    setError("");
    try {
      await setProjectDeadline(token, { projectId: selectedProject.id, deadlineAt: deadline });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set deadline");
    }
  };

  const handleAddJury = async () => {
    if (!token || !selectedProject || !selectedJuryTeacherId) {
      return;
    }
    setError("");
    try {
      await addProjectJury(token, {
        projectId: selectedProject.id,
        teacherId: Number(selectedJuryTeacherId),
      });
      setSelectedJuryTeacherId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add jury member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
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
            {projects.filter((project) => getProjectStatus(project) === "submitted").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Graded</p>
          <p className="text-2xl font-bold text-green-600">
            {projects.filter((project) => getProjectStatus(project) === "graded").length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const status = getProjectStatus(project);
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Coordinator: {project.coordinator_name || "-"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === "graded"
                      ? "bg-green-100 text-green-700"
                      : status === "submitted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {(project.assigned_students || []).map((student: any) => student.name).join(", ") ||
                      "No students"}
                  </span>
                </div>

                {project.deadline_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {project.deadline_at}</span>
                  </div>
                )}

                {project.grade !== null && project.grade !== undefined && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Score: {project.grade}/20</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setDeadline(project.deadline_at ? String(project.deadline_at).slice(0, 16) : "");
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View Details
                </button>
                {status === "submitted" && project.can_grade && (
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create PFE Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Link (Optional)</label>
                  <input
                    type="url"
                    value={createForm.githubLink}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, githubLink: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
                  <input
                    type="datetime-local"
                    value={createForm.deadlineAt}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, deadlineAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Students</label>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {availableStudents.map((student) => (
                    <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.studentIds.includes(Number(student.id))}
                        onChange={(e) => {
                          const id = Number(student.id);
                          setCreateForm((prev) => ({
                            ...prev,
                            studentIds: e.target.checked
                              ? [...prev.studentIds, id]
                              : prev.studentIds.filter((value) => value !== id),
                          }));
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-800">{student.full_name} ({student.email})</span>
                    </label>
                  ))}
                  {availableStudents.length === 0 && (
                    <p className="text-sm text-gray-500">No unassigned students available.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Jury Members</label>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {availableTeachers.map((teacher) => (
                    <label key={teacher.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.juryTeacherIds.includes(Number(teacher.id))}
                        onChange={(e) => {
                          const id = Number(teacher.id);
                          setCreateForm((prev) => ({
                            ...prev,
                            juryTeacherIds: e.target.checked
                              ? [...prev.juryTeacherIds, id]
                              : prev.juryTeacherIds.filter((value) => value !== id),
                          }));
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-800">{teacher.full_name} ({teacher.email})</span>
                    </label>
                  ))}
                  {availableTeachers.length === 0 && (
                    <p className="text-sm text-gray-500">No teachers available for jury assignment.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{selectedProject.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Students</label>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.assigned_students || []).map((student: any) => (
                    <span key={student.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {student.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jury Members</label>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.jury_members || []).map((teacher: any) => (
                    <span key={teacher.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {teacher.name}
                    </span>
                  ))}
                  {(selectedProject.jury_members || []).length === 0 && (
                    <p className="text-sm text-gray-600">No jury members assigned.</p>
                  )}
                </div>
              </div>

              {selectedProject.report_path && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Report Link</span>
                  </div>
                  <a
                    href={selectedProject.report_path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline break-all"
                  >
                    {selectedProject.report_path}
                  </a>
                </div>
              )}

              {selectedProject.demo_video_path && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Demo Link</span>
                  </div>
                  <a
                    href={selectedProject.demo_video_path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline break-all"
                  >
                    {selectedProject.demo_video_path}
                  </a>
                </div>
              )}

              {selectedProject.is_coordinator && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Set Deadline</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleDeadline}
                      className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Deadline
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Jury Member</label>
                    <select
                      value={selectedJuryTeacherId}
                      onChange={(e) => setSelectedJuryTeacherId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    >
                      <option value="">Select teacher</option>
                      {availableTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddJury}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Add Jury
                    </button>
                  </div>
                </div>
              )}
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

      {showGradeModal && selectedProject && (
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
                  setGrade("");
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
