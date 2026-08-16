import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
} from "lucide-react";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCodeId, setExpandedCodeId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getMySubmissions();
      if (res.success) setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeView = (id) => {
    setExpandedCodeId((prev) => (prev === id ? null : id));
  };

  const handleCopyCode = (id, codeText) => {
    navigator.clipboard.writeText(codeText || "");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin absolute top-2 left-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" /> My Lab Submissions
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review your submitted code, Judge0 execution logs, AI complexity reports, and faculty grades.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-white/10 shadow-lg space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center">
            <Layers className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-white">No Submissions Recorded</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            You have not submitted any lab solutions yet. Complete active lab assignments from your workspace.
          </p>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-2.5 rounded-xl text-xs font-bold neu-btn-primary shadow-md"
          >
            <span>Go to Active Labs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expandedCodeId === sub._id;
            const assignmentId = sub.assignment?._id || sub.assignment;

            return (
              <div
                key={sub._id}
                className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#090e1a] text-cyan-300 font-mono text-xs font-bold border border-cyan-500/20 shadow-inner">
                        {sub.assignment?.courseCode || "LAB"}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">{sub.assignment?.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                      <span>
                        Language: <span className="font-mono text-cyan-400 uppercase font-bold">{sub.submittedLanguage}</span> &bull; Submitted: {new Date(sub.createdAt).toLocaleString()}
                      </span>
                      {(sub.isLate || (sub.assignment?.deadline && new Date(sub.createdAt) > new Date(sub.assignment.deadline))) && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-400" /> Late Submission
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Score</div>
                      <div className="text-lg font-extrabold font-mono text-cyan-400">{sub.score}%</div>
                    </div>

                    {/* Toggle inline code view */}
                    <button
                      onClick={() => toggleCodeView(sub._id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                          : "neu-btn-glass text-slate-200"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isExpanded ? "Hide Code" : "View Code"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Open directly in Coding Workspace */}
                    <Link
                      to={`/student/workspace/${assignmentId}`}
                      state={{ submission: sub }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold neu-btn-primary flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Status and Analysis Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#090e1a] border border-white/5 shadow-inner">
                    <span className="text-[11px] text-slate-400 block font-medium">Judge0 Status</span>
                    <span className={`font-bold flex items-center gap-1 mt-1 ${sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                      {sub.status === "Accepted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} {sub.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090e1a] border border-white/5 shadow-inner">
                    <span className="text-[11px] text-slate-400 block font-medium">Time Complexity</span>
                    <span className="font-mono font-bold text-cyan-300 mt-1 block">
                      {sub.aiAnalysis?.timeComplexity || "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090e1a] border border-white/5 shadow-inner">
                    <span className="text-[11px] text-slate-400 block font-medium">AI Quality Score</span>
                    <span className="font-mono font-bold text-violet-300 mt-1 block">
                      {sub.aiAnalysis?.qualityScore || 0}/100
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090e1a] border border-white/5 shadow-inner">
                    <span className="text-[11px] text-slate-400 block font-medium">Faculty Grade</span>
                    <span className="font-bold text-amber-300 mt-1 block">
                      {sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined
                        ? `${sub.facultyGrade.score} pts`
                        : "Pending Grade"}
                    </span>
                  </div>
                </div>

                {/* INLINE SUBMITTED CODE PREVIEW */}
                {isExpanded && (
                  <div className="pt-2 animate-fade-up">
                    <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#050811] shadow-2xl">
                      <div className="bg-[#090e1a] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-mono font-semibold text-slate-300">
                            submitted_solution.{sub.submittedLanguage}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold uppercase border border-cyan-500/20">
                            {sub.submittedLanguage}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(sub._id, sub.code)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-[#111827] hover:bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedId === sub._id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <Link
                            to={`/student/workspace/${assignmentId}`}
                            state={{ submission: sub }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 flex items-center gap-1 transition-colors font-bold"
                          >
                            <span>Open Editor</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Monospace Code Body */}
                      <div className="p-4 overflow-x-auto max-h-96">
                        <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                          {sub.code || "// No code content available"}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {sub.facultyGrade?.feedback && (
                  <div className="bg-violet-500/10 border border-violet-500/20 p-3.5 rounded-2xl text-xs text-violet-200 shadow-sm">
                    <strong className="block text-violet-400 mb-1 font-bold">Faculty Feedback:</strong>
                    {sub.facultyGrade.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
