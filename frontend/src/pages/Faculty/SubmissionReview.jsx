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
  Search,
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
    setGradeScore(sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined ? sub.facultyGrade.score : sub.score);
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
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin"></div>
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin absolute top-2 left-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div>
          <Link to="/faculty/dashboard" className="text-xs text-violet-400 font-bold hover:underline flex items-center gap-1 mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#090e1a] text-violet-300 font-mono text-xs font-bold border border-violet-500/20 shadow-inner">
              {assignment?.courseCode || "LAB"}
            </span>
            <h1 className="text-xl font-bold text-white">{assignment?.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Course: {assignment?.courseName} &bull; Required Language: <strong className="font-mono text-violet-400 uppercase">{assignment?.requiredLanguage}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="glass px-4 py-2.5 rounded-2xl border border-white/10 text-center bg-[#090e1a]">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Submissions</div>
            <div className="text-lg font-extrabold text-white font-mono">{submissions.length}</div>
          </div>
          <div className="glass px-4 py-2.5 rounded-2xl border border-amber-500/20 text-center bg-[#090e1a]">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Late Submissions</div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">
              {submissions.filter(isSubmissionLate).length}
            </div>
          </div>
          <div className="glass px-4 py-2.5 rounded-2xl border border-rose-500/20 text-center bg-[#090e1a]">
            <div className="text-[10px] text-rose-400 uppercase font-bold">Plagiarism Flags</div>
            <div className="text-lg font-extrabold text-rose-300 font-mono">
              {submissions.filter((s) => s.plagiarism?.flagged).length}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" /> Student Submissions Audit Matrix
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students have submitted solutions for this lab assignment yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090e1a] text-slate-400 uppercase font-mono border-b border-white/10">
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
                        <div className="font-bold text-white">{sub.student?.name}</div>
                        <div className="text-[11px] text-slate-400">Roll: {sub.student?.rollNo || "N/A"} &bull; {sub.student?.email}</div>
                        {late && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-rose-400" /> LATE
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          sub.status === "Accepted"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}>
                          {sub.status === "Accepted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.status} ({sub.passedCount}/{sub.totalCount})
                        </span>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="text-cyan-300 font-bold">{sub.aiAnalysis?.timeComplexity || "O(1)"}</div>
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
                          <span className="font-bold text-violet-300">{sub.facultyGrade.score} pts</span>
                        ) : (
                          <span className="text-slate-500 font-medium">Ungraded</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-xl bg-[#090e1a] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold mr-2 cursor-pointer transition-colors"
                        >
                          Inspect Code
                        </button>
                        <button
                          onClick={() => handleOpenGradeModal(sub)}
                          className="px-3 py-1.5 rounded-xl neu-btn-primary text-white text-xs font-bold cursor-pointer"
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-fade-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Detailed Submission Inspector: {selectedSubmission.student?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted in <strong className="font-mono text-violet-400 uppercase">{selectedSubmission.submittedLanguage}</strong> on {new Date(selectedSubmission.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              Close Inspector &times;
            </button>
          </div>

          {/* Plagiarism Alert Banner if Flagged */}
          {selectedSubmission.plagiarism?.flagged && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                High Code Similarity Warning ({selectedSubmission.plagiarism.similarityScore}% Matched)
              </div>
              <p className="text-xs text-rose-200">
                This student's code shares AST token similarity with a submission by <strong>{selectedSubmission.plagiarism.matchedStudentName}</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Code */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-violet-400" /> Student Code ({selectedSubmission.student?.name})
              </h4>
              <pre className="bg-[#050811] p-4 rounded-2xl text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-96 shadow-inner">
                {selectedSubmission.code}
              </pre>
            </div>

            {/* AI Report & Matched Code */}
            <div className="space-y-4">
              <div className="glass p-5 rounded-2xl border border-white/10 space-y-3 bg-[#090e1a]">
                <h4 className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> AI Diagnostics & Complexity
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#050811] p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-bold">Time</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedSubmission.aiAnalysis?.timeComplexity}</span>
                  </div>
                  <div className="bg-[#050811] p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-bold">Space</span>
                    <span className="font-mono font-bold text-violet-400">{selectedSubmission.aiAnalysis?.spaceComplexity}</span>
                  </div>
                  <div className="bg-[#050811] p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-bold">Quality</span>
                    <span className="font-mono font-bold text-amber-400">{selectedSubmission.aiAnalysis?.qualityScore}/100</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedSubmission.aiAnalysis?.summary}</p>
              </div>

              {selectedSubmission.plagiarism?.matchedCodeSnippet && (
                <div>
                  <h4 className="text-xs font-bold text-rose-400 mb-2">
                    Matched Peer Snippet ({selectedSubmission.plagiarism.matchedStudentName})
                  </h4>
                  <pre className="bg-[#050811] p-4 rounded-2xl text-rose-200 font-mono text-xs overflow-x-auto border border-rose-500/20 max-h-48 shadow-inner">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-4 shadow-2xl animate-fade-up">
            <h3 className="text-base font-bold text-white">
              Grade Submission: {selectedSubmission.student?.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Score (Out of {assignment?.maxPoints})</label>
              <input
                type="number"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Faculty Feedback</label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setGradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrade}
                className="px-5 py-2.5 rounded-xl neu-btn-primary text-white text-xs font-bold shadow-md cursor-pointer"
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
