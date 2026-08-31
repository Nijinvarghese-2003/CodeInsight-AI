import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Brain,
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Clock,
  Sparkles,
  Search,
  Copy,
  Check,
  CheckCircle,
  Terminal,
  Cpu,
  Layers,
  AlertTriangle,
  Code2,
} from "lucide-react";

export default function SubmissionReview({ user }) {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeScore, setGradeScore] = useState(100);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeInspectorTab, setActiveInspectorTab] = useState("code"); // 'code' | 'ai' | 'plagiarism' | 'grade'

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  // Scroll to top when switching between submissions or entering inspector
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedSubmission?._id]);

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
      console.error("Failed to load submission review data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSubmission = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore(
      sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined
        ? sub.facultyGrade.score
        : sub.score
    );
    setGradeFeedback(sub.facultyGrade?.feedback || "");
    setActiveInspectorTab("code");
  };

  const handleOpenGradeModal = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore(
      sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined
        ? sub.facultyGrade.score
        : sub.score
    );
    setGradeFeedback(sub.facultyGrade?.feedback || "");
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setIsSavingGrade(true);
    try {
      const res = await api.gradeSubmission(selectedSubmission._id, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
      });

      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === selectedSubmission._id ? res.submission : s))
        );
        setSelectedSubmission(res.submission);
        setGradeSuccessMsg("Grade and feedback successfully recorded!");
        setTimeout(() => setGradeSuccessMsg(""), 4000);
        setGradeModalOpen(false);
      } else {
        alert(res.message || "Failed to submit grade");
      }
    } catch (err) {
      alert("Failed to submit grade");
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text || "");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isSubmissionLate = (sub) => {
    if (sub.isLate) return true;
    const deadline = assignment?.deadline || sub.assignment?.deadline;
    const submissionDate = sub.updatedAt || sub.createdAt;
    if (deadline && submissionDate) {
      return new Date(submissionDate) > new Date(deadline);
    }
    return false;
  };

  // Filtered submissions list
  const filteredSubmissions = submissions.filter((sub) => {
    const name = sub.student?.name?.toLowerCase() || "";
    const email = sub.student?.email?.toLowerCase() || "";
    const rollNo = sub.student?.rollNo?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(query) || email.includes(query) || rollNo.includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === "accepted") return sub.status === "Accepted";
    if (statusFilter === "failed") return sub.status !== "Accepted";
    if (statusFilter === "late") return isSubmissionLate(sub);
    if (statusFilter === "plagiarism") return sub.plagiarism?.flagged;
    if (statusFilter === "graded")
      return (
        sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined
      );
    if (statusFilter === "ungraded")
      return (
        sub.facultyGrade?.score === null || sub.facultyGrade?.score === undefined
      );

    return true;
  });

  // Current index for student navigation inside inspector
  const currentSubmissionIndex = selectedSubmission
    ? submissions.findIndex((s) => s._id === selectedSubmission._id)
    : -1;

  const handleNextStudent = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      handleInspectSubmission(submissions[currentSubmissionIndex + 1]);
    }
  };

  const handlePrevStudent = () => {
    if (currentSubmissionIndex > 0) {
      handleInspectSubmission(submissions[currentSubmissionIndex - 1]);
    }
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

  const backLink = user?.role === "admin" ? "/admin/dashboard" : "/faculty/dashboard";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: DETAILED SUBMISSION INSPECTOR PAGE SECTION            */}
      {/* ------------------------------------------------------------- */}
      {selectedSubmission ? (
        <div className="space-y-6 animate-fade-up">
          {/* Top Inspector Navigation Bar */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-[#090e1a] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:border-violet-500/40 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-violet-400" />
                <span>Back to Submissions Audit</span>
              </button>
              <div className="hidden sm:block h-5 w-[1px] bg-white/10"></div>
              <div className="text-xs text-slate-400 hidden sm:block">
                Assignment:{" "}
                <strong className="text-slate-200 font-mono">
                  {assignment?.courseCode || "LAB"} - {assignment?.title}
                </strong>
              </div>
            </div>

            {/* Previous / Next Student Navigator */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                disabled={currentSubmissionIndex <= 0}
                onClick={handlePrevStudent}
                className="px-3 py-1.5 rounded-xl bg-[#090e1a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Inspect Previous Student"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="text-[11px] font-mono font-bold text-slate-400 px-2">
                {currentSubmissionIndex + 1} / {submissions.length}
              </span>

              <button
                disabled={currentSubmissionIndex >= submissions.length - 1}
                onClick={handleNextStudent}
                className="px-3 py-1.5 rounded-xl bg-[#090e1a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Inspect Next Student"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Student Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <FileCode className="w-3.5 h-3.5" /> Detailed Submission Inspector
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <span>{selectedSubmission.student?.name}</span>
                  {isSubmissionLate(selectedSubmission) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400" /> LATE
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap font-medium">
                  <span>Roll No: <strong className="text-slate-200 font-mono">{selectedSubmission.student?.rollNo || "N/A"}</strong></span>
                  <span>&bull;</span>
                  <span>Email: <strong className="text-slate-200">{selectedSubmission.student?.email}</strong></span>
                  <span>&bull;</span>
                  <span>Language: <strong className="text-violet-400 uppercase font-mono">{selectedSubmission.submittedLanguage}</strong></span>
                  <span>&bull;</span>
                  <span>
                    Submitted on:{" "}
                    <strong className="text-slate-300">
                      {new Date(
                        selectedSubmission.updatedAt || selectedSubmission.createdAt
                      ).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleCopyCode(selectedSubmission.code)}
                  className="px-4 py-2.5 rounded-xl bg-[#090e1a] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenGradeModal(selectedSubmission)}
                  className="px-5 py-2.5 rounded-xl neu-btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {selectedSubmission.facultyGrade?.score !== null &&
                    selectedSubmission.facultyGrade?.score !== undefined
                      ? `Edit Grade (${selectedSubmission.facultyGrade.score}/${assignment?.maxPoints || 100})`
                      : "Grade Submission"}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Judge0 Result</span>
                <span
                  className={`font-mono font-extrabold text-xs mt-0.5 inline-block ${
                    selectedSubmission.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedSubmission.status} ({selectedSubmission.passedCount || 0}/
                  {selectedSubmission.totalCount || 0})
                </span>
              </div>

              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Automated Score</span>
                <span className="font-mono font-extrabold text-xs mt-0.5 text-cyan-400 block">
                  {selectedSubmission.score}%
                </span>
              </div>

              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">AI Quality</span>
                <span className="font-mono font-extrabold text-xs mt-0.5 text-amber-400 block">
                  {selectedSubmission.aiAnalysis?.qualityScore || 0}/100
                </span>
              </div>

              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Time / Space</span>
                <span className="font-mono font-bold text-xs mt-0.5 text-violet-300 block truncate">
                  {selectedSubmission.aiAnalysis?.timeComplexity || "O(1)"} / {selectedSubmission.aiAnalysis?.spaceComplexity || "O(1)"}
                </span>
              </div>

              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Plagiarism</span>
                <span
                  className={`font-mono font-extrabold text-xs mt-0.5 block ${
                    selectedSubmission.plagiarism?.flagged ? "text-rose-400 font-black" : "text-slate-300"
                  }`}
                >
                  {selectedSubmission.plagiarism?.similarityScore || 0}%
                  {selectedSubmission.plagiarism?.flagged && " ⚠️"}
                </span>
              </div>

              <div className="bg-[#050811] p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Evaluated Grade</span>
                <span className="font-mono font-extrabold text-xs mt-0.5 text-violet-400 block">
                  {selectedSubmission.facultyGrade?.score !== null &&
                  selectedSubmission.facultyGrade?.score !== undefined
                    ? `${selectedSubmission.facultyGrade.score} pts`
                    : "Ungraded"}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message Banner */}
          {gradeSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-up">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {gradeSuccessMsg}
            </div>
          )}

          {/* Plagiarism Alert Warning Banner if Flagged */}
          {selectedSubmission.plagiarism?.flagged && (
            <div className="p-5 rounded-3xl bg-rose-500/15 border border-rose-500/30 space-y-2 shadow-lg animate-fade-up">
              <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                High Code Similarity Warning ({selectedSubmission.plagiarism.similarityScore}% Matched)
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                This student's code shares AST token structure and syntax similarity with a submission by{" "}
                <strong className="underline decoration-rose-400 underline-offset-2">
                  {selectedSubmission.plagiarism.matchedStudentName || "another student"}
                </strong>
                . Inspect the matched peer snippet below before awarding credit.
              </p>
            </div>
          )}

          {/* Inspector Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveInspectorTab("code")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInspectorTab === "code"
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Source Code & Execution</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab("ai")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInspectorTab === "ai"
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Code Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab("plagiarism")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInspectorTab === "plagiarism"
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Plagiarism Analysis</span>
              {selectedSubmission.plagiarism?.flagged && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveInspectorTab("grade")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInspectorTab === "grade"
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Evaluation & Grading</span>
            </button>
          </div>

          {/* TAB 1: SOURCE CODE & TEST CASES */}
          {activeInspectorTab === "code" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
              {/* Code Viewer Panel (7 cols) */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Submitted Code ({selectedSubmission.submittedLanguage})
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedSubmission.code)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#050811] shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#090e1a] border-b border-white/5 text-[11px] text-slate-400 font-mono">
                    <span>File: solution.{selectedSubmission.submittedLanguage === "cpp" ? "cpp" : selectedSubmission.submittedLanguage === "python" ? "py" : selectedSubmission.submittedLanguage === "java" ? "java" : "c"}</span>
                    <span>{selectedSubmission.code?.split("\n").length || 0} lines</span>
                  </div>
                  <pre className="p-4 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-[520px]">
                    {selectedSubmission.code}
                  </pre>
                </div>
              </div>

              {/* Automated Execution & Test Cases Panel (5 cols) */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Judge0 Execution Results
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                      selectedSubmission.status === "Accepted"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {selectedSubmission.passedCount || 0}/{selectedSubmission.totalCount || 0} Passed
                  </span>
                </div>

                {selectedSubmission.testCaseResults && selectedSubmission.testCaseResults.length > 0 ? (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {selectedSubmission.testCaseResults.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          tc.passed
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-rose-500/5 border-rose-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            Test Case #{idx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              tc.passed
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {tc.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {tc.passed ? "Passed" : "Failed"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] font-mono">
                          {tc.input && (
                            <div className="bg-[#050811] p-2 rounded-xl text-slate-300 border border-white/5">
                              <span className="text-slate-500 block text-[10px]">Input:</span>
                              {tc.input}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#050811] p-2 rounded-xl text-slate-300 border border-white/5">
                              <span className="text-slate-500 block text-[10px]">Expected:</span>
                              {tc.expectedOutput || "N/A"}
                            </div>
                            <div className="bg-[#050811] p-2 rounded-xl text-slate-300 border border-white/5">
                              <span className="text-slate-500 block text-[10px]">Actual:</span>
                              <span className={tc.passed ? "text-emerald-400" : "text-rose-400"}>
                                {tc.actualOutput || "Empty / Error"}
                              </span>
                            </div>
                          </div>
                          {tc.error && (
                            <div className="bg-rose-500/10 p-2 rounded-xl text-rose-300 border border-rose-500/30 text-[10px]">
                              <span className="font-bold block">Error Log:</span>
                              {tc.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-[#050811] rounded-2xl border border-white/5">
                    No individual test case traces recorded for this run. Automated Score: {selectedSubmission.score}%.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI CODE DIAGNOSTICS */}
          {activeInspectorTab === "ai" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl animate-fade-up">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Brain className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-base font-bold text-white">AI Diagnostics & Complexity Evaluation</h3>
                  <p className="text-xs text-slate-400">Automated structural, asymptotic, and code quality breakdown</p>
                </div>
              </div>

              {/* Complexity Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass p-5 rounded-2xl border border-cyan-500/20 bg-[#090e1a] text-center space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Time Complexity</span>
                  <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                    {selectedSubmission.aiAnalysis?.timeComplexity || "O(1)"}
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl border border-violet-500/20 bg-[#090e1a] text-center space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Space Complexity</span>
                  <div className="text-2xl font-extrabold text-violet-400 font-mono">
                    {selectedSubmission.aiAnalysis?.spaceComplexity || "O(1)"}
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl border border-amber-500/20 bg-[#090e1a] text-center space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Quality Score</span>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">
                    {selectedSubmission.aiAnalysis?.qualityScore || 0}/100
                  </div>
                </div>
              </div>

              {/* Summary Paragraph */}
              <div className="p-5 rounded-2xl bg-[#050811] border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Diagnostic Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSubmission.aiAnalysis?.summary ||
                    "Code parsed successfully. Solution matches structural expectations for the assigned task."}
                </p>
              </div>

              {/* Best Practices & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#050811] border border-emerald-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Best Practices Adhered To
                  </h4>
                  {selectedSubmission.aiAnalysis?.bestPractices &&
                  selectedSubmission.aiAnalysis.bestPractices.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedSubmission.aiAnalysis.bestPractices.map((bp, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">Clean indentation, appropriate syntax identifiers.</p>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#050811] border border-amber-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Optimization Recommendations
                  </h4>
                  {selectedSubmission.aiAnalysis?.improvements &&
                  selectedSubmission.aiAnalysis.improvements.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedSubmission.aiAnalysis.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">&bull;</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No major optimization warnings detected.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAGIARISM ANALYSIS */}
          {activeInspectorTab === "plagiarism" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl animate-fade-up">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">AST Plagiarism & Similarity Report</h3>
                    <p className="text-xs text-slate-400">Cross-student token stream matching & anti-cheat diagnostics</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    selectedSubmission.plagiarism?.flagged
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {selectedSubmission.plagiarism?.similarityScore || 0}% Similarity
                </span>
              </div>

              {selectedSubmission.plagiarism?.flagged ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
                    High code similarity was detected with a submission by{" "}
                    <strong className="text-rose-100 underline">
                      {selectedSubmission.plagiarism.matchedStudentName || "Peer Student"}
                    </strong>
                    .
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-violet-400" />
                        Current Student: {selectedSubmission.student?.name}
                      </h4>
                      <pre className="bg-[#050811] p-4 rounded-2xl text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-96 shadow-inner">
                        {selectedSubmission.code}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        Matched Peer: {selectedSubmission.plagiarism.matchedStudentName || "Matched Submission"}
                      </h4>
                      <pre className="bg-[#050811] p-4 rounded-2xl text-rose-200 font-mono text-xs overflow-x-auto leading-relaxed border border-rose-500/30 max-h-96 shadow-inner">
                        {selectedSubmission.plagiarism.matchedCodeSnippet ||
                          "// Matched token snippet shared AST structure with peer submission."}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-300 space-y-3 bg-[#050811] rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Significant Code Similarity Detected</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    This submission passed the AST token similarity check with a similarity score of{" "}
                    <strong className="font-mono text-emerald-400">{selectedSubmission.plagiarism?.similarityScore || 0}%</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVALUATION & GRADING */}
          {activeInspectorTab === "grade" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl animate-fade-up">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Faculty Evaluation & Score Record</h3>
                    <p className="text-xs text-slate-400">Award final credit and write targeted feedback for {selectedSubmission.student?.name}</p>
                  </div>
                </div>
              </div>

              <div className="max-w-2xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Final Score (Out of {assignment?.maxPoints || 100} points)
                  </label>
                  <input
                    type="number"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
                    placeholder="Enter score..."
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automated Judge0 execution score: <span className="font-mono text-cyan-400">{selectedSubmission.score}%</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Evaluator Feedback & Constructive Comments
                  </label>
                  <textarea
                    rows={4}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, notes on edge cases, code quality, or recommendations..."
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={isSavingGrade}
                    onClick={handleSaveGrade}
                    className="px-6 py-2.5 rounded-xl neu-btn-primary text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingGrade ? (
                      <span>Saving Evaluation...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Grade & Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: SUBMISSIONS AUDIT MATRIX (TABLE VIEW)                 */
        /* ------------------------------------------------------------- */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div>
              <Link
                to={backLink}
                className="text-xs text-violet-400 font-bold hover:underline flex items-center gap-1 mb-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#090e1a] text-violet-300 font-mono text-xs font-bold border border-violet-500/20 shadow-inner">
                  {assignment?.courseCode || "LAB"}
                </span>
                <h1 className="text-xl font-bold text-white">{assignment?.title}</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Course: {assignment?.courseName} &bull; Required Language:{" "}
                <strong className="font-mono text-violet-400 uppercase">
                  {assignment?.requiredLanguage}
                </strong>
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

          {/* Submissions Table Panel */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" /> Student Submissions Audit Matrix
              </h2>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by student or roll..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-[#090e1a] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 w-48 sm:w-56 font-mono"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#090e1a] border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
                >
                  <option value="all">All Submissions</option>
                  <option value="accepted">Status: Accepted</option>
                  <option value="failed">Status: Errors / Failed</option>
                  <option value="late">Late Submissions</option>
                  <option value="plagiarism">Plagiarism Flagged</option>
                  <option value="graded">Graded</option>
                  <option value="ungraded">Ungraded</option>
                </select>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                {submissions.length === 0
                  ? "No students have submitted solutions for this lab assignment yet."
                  : "No submissions matched your search and filter criteria."}
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
                    {filteredSubmissions.map((sub) => {
                      const late = isSubmissionLate(sub);

                      return (
                        <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{sub.student?.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Roll: {sub.student?.rollNo || "N/A"} &bull; {sub.student?.email}
                            </div>
                            {late && (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-rose-400" /> LATE
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                                sub.status === "Accepted"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {sub.status === "Accepted" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {sub.status} ({sub.passedCount}/{sub.totalCount})
                            </span>
                          </td>

                          <td className="p-4 font-mono">
                            <div className="text-cyan-300 font-bold">
                              {sub.aiAnalysis?.timeComplexity || "O(1)"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Space: {sub.aiAnalysis?.spaceComplexity || "O(1)"}
                            </div>
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
                            {sub.facultyGrade?.score !== null &&
                            sub.facultyGrade?.score !== undefined ? (
                              <span className="font-bold text-violet-300">
                                {sub.facultyGrade.score} pts
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">Ungraded</span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleInspectSubmission(sub)}
                              className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold mr-2 cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              Inspect Code
                            </button>
                            <button
                              onClick={() => handleOpenGradeModal(sub)}
                              className="px-3 py-1.5 rounded-xl neu-btn-primary text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            >
                              <Award className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Grade Modal */}
      {gradeModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-4 shadow-2xl animate-fade-up">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-400" />
              Grade Submission: {selectedSubmission.student?.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Score (Out of {assignment?.maxPoints || 100})
              </label>
              <input
                type="number"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Faculty / Admin Feedback
              </label>
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
                disabled={isSavingGrade}
                onClick={handleSaveGrade}
                className="px-5 py-2.5 rounded-xl neu-btn-primary text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSavingGrade ? "Saving..." : "Save Grade & Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
