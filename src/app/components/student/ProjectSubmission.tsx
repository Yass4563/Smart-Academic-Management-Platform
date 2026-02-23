import { useEffect, useMemo, useState } from "react";
import { Award, Calendar, CheckCircle, FileText, Users, Video } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { getMyPfeProject, submitPfe } from "../../lib/api";

function isGoogleDriveLink(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.hostname === "drive.google.com" ||
      parsed.hostname.endsWith(".drive.google.com") ||
      parsed.hostname === "docs.google.com" ||
      parsed.hostname.endsWith(".docs.google.com")
    );
  } catch {
    return false;
  }
}

export function ProjectSubmission() {
  const { token } = useAuth();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reportLink, setReportLink] = useState("");
  const [demoVideoLink, setDemoVideoLink] = useState("");
  const [githubLink, setGithubLink] = useState("");

  const loadProject = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getMyPfeProject(token);
      const nextProject = data.project ?? null;
      setProject(nextProject);
      setReportLink(nextProject?.report_path ?? "");
      setDemoVideoLink(nextProject?.demo_video_path ?? "");
      setGithubLink(nextProject?.github_link ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [token]);

  const assignedStudentsText = useMemo(() => {
    const students = project?.assigned_students ?? [];
    if (!students.length) {
      return "No assigned students";
    }
    return students.map((student: any) => student.name).join(", ");
  }, [project]);

  const handleSubmit = async () => {
    if (!token || !project) {
      return;
    }
    if (!isGoogleDriveLink(reportLink) || !isGoogleDriveLink(demoVideoLink)) {
      setError("Report and demo links must be Google Drive URLs.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitPfe(token, {
        reportLink: reportLink.trim(),
        demoVideoLink: demoVideoLink.trim(),
        githubLink: githubLink.trim() || undefined,
      });
      setSuccess("Submission saved successfully.");
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">No Project Assigned</h3>
        <p className="text-yellow-800">
          You can access this section only after a coordinator assigns you to a PFE project.
        </p>
      </div>
    );
  }

  const isSubmitted = Boolean(project.report_path) && Boolean(project.demo_video_path);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{project.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4" />
            <span>Team: {assignedStudentsText}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-4 h-4" />
            <span>Coordinator: {project.coordinator_name || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {project.deadline_at || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-4 h-4" />
            <span>Grade: {project.grade ?? "Pending"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h3 className="text-xl font-semibold text-gray-900">Submission (Google Drive Links Only)</h3>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Report Link (Google Drive)
          </label>
          <input
            type="url"
            value={reportLink}
            onChange={(e) => setReportLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Video className="w-4 h-4 inline mr-1" />
            Demo Video Link (Google Drive)
          </label>
          <input
            type="url"
            value={demoVideoLink}
            onChange={(e) => setDemoVideoLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Repository (Optional)</label>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : isSubmitted ? "Update Submission" : "Submit Project"}
        </button>
      </div>
    </div>
  );
}
