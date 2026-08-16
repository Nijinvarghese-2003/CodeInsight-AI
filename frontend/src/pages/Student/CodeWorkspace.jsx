import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Code2,
  Play,
  Send,
  Lock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Brain,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  FileCode,
  Check,
} from "lucide-react";

const STARTER_TEMPLATES = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n        System.out.println("Hello, World!");\n    }\n}`,
  python: `# Write your Python solution here\ndef solve():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `// Write your JavaScript solution here\nfunction main() {\n    console.log("Hello, World!");\n}\n\nmain();`,
};

export default function CodeWorkspace({ user }) {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assignment, setAssignment] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("tests"); // 'tests' | 'ai'
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [isPreviousSubmissionLoaded, setIsPreviousSubmissionLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    try {
      const [res, subRes] = await Promise.all([
        api.getAssignmentById(assignmentId),
        api.getMySubmissions(),
      ]);

      if (res.success && res.assignment) {
        setAssignment(res.assignment);
        const lang = res.assignment.requiredLanguage?.toLowerCase() || "javascript";
        const starterCode = STARTER_TEMPLATES[lang] || STARTER_TEMPLATES.javascript;

        // Check if previous submission exists from router location state or API
        const stateSub = location.state?.submission;
        let existingSub = null;
        if (stateSub && (stateSub.assignment?._id === assignmentId || stateSub.assignment === assignmentId)) {
          existingSub = stateSub;
        } else if (subRes.success && subRes.submissions?.length > 0) {
          existingSub = subRes.submissions.find(
            (s) => s.assignment?._id === assignmentId || s.assignment === assignmentId
          );
        }

        if (existingSub && existingSub.code) {
          setCode(existingSub.code);
          setLatestSubmission(existingSub);
          setIsPreviousSubmissionLoaded(true);
        } else {
          setCode(starterCode);
          setIsPreviousSubmissionLoaded(false);
        }
      } else {
        setErrorMsg("Failed to load assignment");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResetCode = () => {
    if (!assignment) return;
    const lang = assignment.requiredLanguage?.toLowerCase() || "javascript";
    setCode(STARTER_TEMPLATES[lang] || STARTER_TEMPLATES.javascript);
    setIsPreviousSubmissionLoaded(false);
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await api.submitSolution({
        assignmentId,
        submittedLanguage: assignment.requiredLanguage,
        code,
      });

      if (res.success && res.submission) {
        setLatestSubmission(res.submission);
        setActiveTab("tests");
      } else {
        setErrorMsg(res.message || "Failed to submit assignment");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
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

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center glass rounded-3xl border border-white/10 my-12 shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Assignment Not Found</h2>
        <p className="text-slate-400 text-xs mt-1">{errorMsg || "The requested lab assignment does not exist."}</p>
        <Link to="/student/dashboard" className="inline-block mt-4 text-cyan-400 hover:underline text-xs font-bold">
          &larr; Back to Student Dashboard
        </Link>
      </div>
    );
  }

  const reqLangUpper = (assignment.requiredLanguage || "").toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <Link to="/student/dashboard" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Labs
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#090e1a] text-cyan-300 font-mono text-xs font-bold border border-cyan-500/20 shadow-inner">
              {assignment.courseCode || "LAB"}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-white">{assignment.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{assignment.courseName} &bull; Faculty: {assignment.createdBy?.name || "Course Instructor"}</p>
        </div>

        {/* LOCKED LANGUAGE BADGE */}
        <div className="flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 px-4 py-2.5 rounded-2xl text-violet-300 text-xs font-bold shadow-sm">
          <Lock className="w-4 h-4 text-violet-400" />
          <span>Locked Language: <strong className="font-mono text-white tracking-wider">{reqLangUpper}</strong></span>
        </div>
      </div>

      {/* LATE SUBMISSION WARNING BANNER */}
      {assignment.deadline && new Date() > new Date(assignment.deadline) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-bold animate-fade-up shadow-sm">
          <Clock className="w-4 h-4 text-rose-400 shrink-0" />
          <span>⚠️ Assignment Deadline Passed: The deadline for this lab was {new Date(assignment.deadline).toLocaleString()}. Your submission will be recorded and flagged as LATE.</span>
        </div>
      )}

      {/* Main Split Grid: Left = Description & Editor, Right = Judge0 Output & AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Description & Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Assignment Description Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" /> Lab Instructions
            </h2>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
              {assignment.description}
            </div>
            {assignment.instructions && (
              <div className="bg-[#090e1a] p-4 rounded-2xl border border-white/5 text-xs text-slate-300 shadow-inner">
                <span className="font-bold text-cyan-400 block mb-1">Special Guidelines:</span>
                {assignment.instructions}
              </div>
            )}
          </div>

          {/* Interactive Code Editor */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            {/* Editor Toolbar */}
            <div className="bg-[#090e1a] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  solution.{assignment.requiredLanguage}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                  {reqLangUpper} LOCKED
                </span>
                {isPreviousSubmissionLoaded && latestSubmission && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Loaded ({latestSubmission.score}%)
                  </span>
                )}
              </div>

              <button
                onClick={handleResetCode}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Code Textarea Area */}
            <div className="relative bg-[#050811] font-mono text-xs sm:text-sm">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={16}
                className="w-full bg-transparent p-5 text-slate-100 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed"
                placeholder={`Write your ${reqLangUpper} code solution here...`}
              />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-[#090e1a] border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                {code.split("\n").length} lines &bull; {code.length} chars
              </div>

              <button
                onClick={handleSubmitCode}
                disabled={submitting || !code.trim()}
                className="px-5 py-2.5 rounded-xl neu-btn-primary text-xs font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Executing & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run & Submit Solution</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Execution Output & AI Code Quality / Complexity (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex bg-[#090e1a] p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "tests"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" /> Judge0 Execution
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "ai"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-4 h-4 text-violet-400" /> AI Complexity
            </button>
          </div>

          {/* TAB 1: JUDGE0 TEST CASES & EXECUTION */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              {!latestSubmission ? (
                <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-2.5 shadow-md">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center">
                    <Play className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">No Execution Results Yet</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Click <strong>"Run & Submit Solution"</strong> to evaluate your {reqLangUpper} code against automated test cases.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between shadow-md ${
                      latestSubmission.status === "Accepted"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {latestSubmission.status === "Accepted" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400" />
                      )}
                      <div>
                        <div className="text-sm font-extrabold">{latestSubmission.status}</div>
                        <div className="text-xs opacity-90 font-medium">
                          Passed {latestSubmission.passedCount} / {latestSubmission.totalCount} Test Cases
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-base font-extrabold text-white">
                      {latestSubmission.score}% Score
                    </div>
                  </div>

                  {/* Individual Test Cases List */}
                  <div className="space-y-3">
                    {latestSubmission.testCaseResults?.map((tc, idx) => (
                      <div
                        key={idx}
                        className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">
                            Test Case #{idx + 1}
                          </span>
                          {tc.passed ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                              FAILED
                            </span>
                          )}
                        </div>

                        {tc.input && (
                          <div className="text-xs">
                            <span className="text-slate-400 font-semibold">Input:</span>
                            <pre className="bg-[#050811] p-2.5 rounded-xl text-slate-200 mt-1 font-mono border border-white/5">{tc.input}</pre>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold">Expected:</span>
                            <pre className="bg-[#050811] p-2.5 rounded-xl text-emerald-400 mt-1 font-mono border border-white/5">{tc.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">Actual:</span>
                            <pre className={`bg-[#050811] p-2.5 rounded-xl mt-1 font-mono border border-white/5 ${tc.passed ? "text-emerald-400" : "text-rose-400"}`}>
                              {tc.actualOutput || tc.error || "[No Output]"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI CODE QUALITY & COMPLEXITY ANALYSIS */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {!latestSubmission?.aiAnalysis ? (
                <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-2.5 shadow-md">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">AI Report Available After Submission</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Submit your code to view full Time Complexity (e.g. O(N)), Space Complexity, and Code Quality metrics.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="glass p-3 rounded-2xl border border-cyan-500/20 text-center space-y-1 bg-[#090e1a]">
                      <Clock className="w-4 h-4 text-cyan-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Time Comp.</div>
                      <div className="text-xs font-extrabold font-mono text-cyan-300">
                        {latestSubmission.aiAnalysis.timeComplexity}
                      </div>
                    </div>

                    <div className="glass p-3 rounded-2xl border border-violet-500/20 text-center space-y-1 bg-[#090e1a]">
                      <Cpu className="w-4 h-4 text-violet-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Space Comp.</div>
                      <div className="text-xs font-extrabold font-mono text-violet-300">
                        {latestSubmission.aiAnalysis.spaceComplexity}
                      </div>
                    </div>

                    <div className="glass p-3 rounded-2xl border border-amber-500/20 text-center space-y-1 bg-[#090e1a]">
                      <Sparkles className="w-4 h-4 text-amber-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Quality</div>
                      <div className="text-xs font-extrabold font-mono text-amber-300">
                        {latestSubmission.aiAnalysis.qualityScore}/100
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="glass p-4 rounded-2xl border border-white/10 space-y-1.5 bg-[#090e1a]">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Code Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {latestSubmission.aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Best Practices */}
                  {latestSubmission.aiAnalysis.bestPractices?.length > 0 && (
                    <div className="glass p-4 rounded-2xl border border-cyan-500/20 space-y-2 bg-[#090e1a]">
                      <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Best Practices
                      </h4>
                      <ul className="space-y-1.5">
                        {latestSubmission.aiAnalysis.bestPractices.map((bp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">&bull;</span> {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Improvements */}
                  {latestSubmission.aiAnalysis.improvements?.length > 0 && (
                    <div className="glass p-4 rounded-2xl border border-amber-500/20 space-y-2 bg-[#090e1a]">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Recommended Improvements
                      </h4>
                      <ul className="space-y-1.5">
                        {latestSubmission.aiAnalysis.improvements.map((imp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold">&rarr;</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
