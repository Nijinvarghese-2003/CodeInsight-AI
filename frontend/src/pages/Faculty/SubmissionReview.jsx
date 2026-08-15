import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Users,
  ShieldAlert,
  Brain,
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  FileCode,
  Clock,
  Sparkles,
} from "lucide-react";

export default function SubmissionReview() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeScore, setGradeScore] = useState(100);
  const [gradeFeedback, setGradeFeedback] = useState("");

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        api.getAssignmentById(assignmentId),
        api.getAssignmentSubmissions(assignmentId),
      ]);

      if (assRes.success) setAssignment(assRes.assignment);
      if (subRes.success) setSubmissions(subRes.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.facultyGrade?.score !== null ? sub.facultyGrade?.score : sub.score);
    setGradeFeedback(sub.facultyGrade?.feedback || "");
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await api.gradeSubmission(selectedSubmission._id, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
      });

      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === selectedSubmission._id ? res.submission : s))
        );
        setGradeModalOpen(false);
      }
    } catch (err) {
      alert("Failed to submit grade");
    }
  };

  const isSubmissionLate = (sub) => {
    if (sub.isLate) return true;
    const deadline = assignment?.deadline || sub.assignment?.deadline;
    if (deadline && sub.createdAt) {
      return new Date(sub.createdAt) > new Date(deadline);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/faculty/dashboard" className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
              {assignment?.courseCode}
            </span>
            <h1 className="text-xl font-bold text-white">{assignment?.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Course: {assignment?.courseName} &bull; Required Language: <strong className="font-mono text-purple-400 uppercase">{assignment?.requiredLanguage}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="glass px-3.5 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-slate-400">Total Submissions</div>
            <div className="text-lg font-bold text-white font-mono">{submissions.length}</div>
          </div>
          <div className="glass px-3.5 py-2 rounded-xl border border-amber-500/20 text-center">
            <div className="text-amber-400 font-semibold">Late Submissions</div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {submissions.filter(isSubmissionLate).length}
            </div>
          </div>
          <div className="glass px-3.5 py-2 rounded-xl border border-rose-500/20 text-center">
            <div className="text-rose-400 font-semibold">Plagiarism Flags</div>
            <div className="text-lg font-bold text-rose-300 font-mono">
              {submissions.filter((s) => s.plagiarism?.flagged).length}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Student Submissions Audit Matrix
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No students have submitted solutions for this lab assignment yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Judge0 Status</th>
                  <th className="p-4">AI Complexity</th>
                  <th className="p-4">AI Quality</th>
                  <th className="p-4">Plagiarism Score</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((sub) => {
                  const late = isSubmissionLate(sub);

                  return (
                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{sub.student?.name}</div>
                        <div className="text-[11px] text-slate-400">Roll: {sub.student?.rollNo || "N/A"} &bull; {sub.student?.email}</div>
                        {late && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-rose-400" /> LATE SUBMISSION
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                          sub.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {sub.status === "Accepted" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {sub.status} ({sub.passedCount}/{sub.totalCount})
                        </span>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="text-teal-300 font-bold">{sub.aiAnalysis?.timeComplexity || "O(1)"}</div>
                        <div className="text-[10px] text-slate-400">Space: {sub.aiAnalysis?.spaceComplexity || "O(1)"}</div>
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-300">
                        {sub.aiAnalysis?.qualityScore || 0}/100
                      </td>

                      <td className="p-4">
                        {sub.plagiarism?.flagged ? (
                          <span className="px-2.5 py-1 rounded-full text-rose-300 bg-rose-500/20 border border-rose-500/40 font-bold flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            {sub.plagiarism.similarityScore}% Match!
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">
                            {sub.plagiarism?.similarityScore || 0}%
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined ? (
                          <span className="font-semibold text-purple-300">{sub.facultyGrade.score} pts</span>
                        ) : (
                          <span className="text-slate-500 font-medium">Ungraded</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold mr-2 cursor-pointer"
                        >
                          Inspect Code
                        </button>
                        <button
                          onClick={() => handleOpenGradeModal(sub)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold cursor-pointer"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Inspector & Plagiarism Side-by-Side Drawer / Modal */}
      {selectedSubmission && !gradeModalOpen && (
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Detailed Submission Inspector: {selectedSubmission.student?.name}
              </h3>
              <p className="text-xs text-slate-400">
                Submitted in <strong className="font-mono text-purple-400 uppercase">{selectedSubmission.submittedLanguage}</strong> on {new Date(selectedSubmission.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Inspector &times;
            </button>
          </div>

          {/* Plagiarism Alert Banner if Flagged */}
          {selectedSubmission.plagiarism?.flagged && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                High Code Similarity Warning ({selectedSubmission.plagiarism.similarityScore}% Matched)
              </div>
              <p className="text-xs text-rose-200">
                This student's code shares significant AST token similarity with prior submission by <strong>{selectedSubmission.plagiarism.matchedStudentName}</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Code */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" /> Student Submitted Code ({selectedSubmission.student?.name})
              </h4>
              <pre className="bg-slate-950 p-4 rounded-xl text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-96">
                {selectedSubmission.code}
              </pre>
            </div>

            {/* AI Report & Matched Code */}
            <div className="space-y-4">
              <div className="glass p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> AI Diagnostics & Complexity
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Time</span>
                    <span className="font-mono font-bold text-teal-400">{selectedSubmission.aiAnalysis?.timeComplexity}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Space</span>
                    <span className="font-mono font-bold text-indigo-400">{selectedSubmission.aiAnalysis?.spaceComplexity}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Quality</span>
                    <span className="font-mono font-bold text-amber-400">{selectedSubmission.aiAnalysis?.qualityScore}/100</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2">{selectedSubmission.aiAnalysis?.summary}</p>
              </div>

              {selectedSubmission.plagiarism?.matchedCodeSnippet && (
                <div>
                  <h4 className="text-xs font-bold text-rose-400 mb-2">
                    Matched Peer Snippet ({selectedSubmission.plagiarism.matchedStudentName})
                  </h4>
                  <pre className="bg-slate-950 p-4 rounded-xl text-rose-200 font-mono text-xs overflow-x-auto border border-rose-500/20 max-h-48">
                    {selectedSubmission.plagiarism.matchedCodeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradeModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">
              Grade Submission: {selectedSubmission.student?.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Score (Out of {assignment?.maxPoints})</label>
              <input
                type="number"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty Feedback</label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrade}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold"
              >
                Save Grade & Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
