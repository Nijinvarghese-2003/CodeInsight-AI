import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

  const [assignment, setAssignment] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("tests"); // 'tests' | 'ai'
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getAssignmentById(assignmentId);
      if (res.success && res.assignment) {
        setAssignment(res.assignment);
        const lang = res.assignment.requiredLanguage?.toLowerCase() || "javascript";
        setCode(STARTER_TEMPLATES[lang] || STARTER_TEMPLATES.javascript);
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center glass rounded-2xl border border-white/10 my-12">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Assignment Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">{errorMsg || "The requested lab assignment does not exist."}</p>
        <Link to="/student/dashboard" className="inline-block mt-4 text-teal-400 hover:underline text-sm font-semibold">
          &larr; Back to Student Dashboard
        </Link>
      </div>
    );
  }

  const reqLangUpper = (assignment.requiredLanguage || "").toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-2xl border border-white/10">
        <div>
          <Link to="/student/dashboard" className="text-xs text-teal-400 font-semibold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Labs
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
              {assignment.courseCode}
            </span>
            <h1 className="text-xl font-bold text-white">{assignment.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{assignment.courseName} &bull; Faculty: {assignment.createdBy?.name}</p>
        </div>

        {/* LOCKED LANGUAGE BADGE */}
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-indigo-300 text-xs font-semibold">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>Locked Language: <strong className="font-mono text-white tracking-wider">{reqLangUpper}</strong></span>
        </div>
      </div>

      {/* Main Split Grid: Left = Description & Editor, Right = Judge0 Output & AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Description & Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Assignment Description Card */}
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-400" /> Lab Instructions
            </h2>
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {assignment.description}
            </div>
            {assignment.instructions && (
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                <span className="font-semibold text-teal-400 block mb-1">Special Guidelines:</span>
                {assignment.instructions}
              </div>
            )}
          </div>

          {/* Interactive Code Editor */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            {/* Editor Toolbar */}
            <div className="bg-slate-900/80 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-mono font-semibold text-slate-300">
                  solution.{assignment.requiredLanguage}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
                  {reqLangUpper} LOCKED
                </span>
              </div>

              <button
                onClick={handleResetCode}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Code Textarea Area */}
            <div className="relative bg-slate-950/90 font-mono text-sm">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={16}
                className="w-full bg-transparent p-4 text-slate-100 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed"
                placeholder={`Write your ${reqLangUpper} code solution here...`}
              />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-900/50 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {code.split("\n").length} lines &bull; {code.length} chars
              </div>

              <button
                onClick={handleSubmitCode}
                disabled={submitting || !code.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Executing & Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Run & Submit Solution
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Execution Output & AI Code Quality / Complexity (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 space-x-4">
            <button
              onClick={() => setActiveTab("tests")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === "tests"
                  ? "border-teal-400 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" /> Judge0 Execution Results
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === "ai"
                  ? "border-indigo-400 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-4 h-4 text-indigo-400" /> AI Code Analysis
            </button>
          </div>

          {/* TAB 1: JUDGE0 TEST CASES & EXECUTION */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              {!latestSubmission ? (
                <div className="glass p-8 rounded-2xl border border-white/10 text-center space-y-2">
                  <Play className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-300">No Execution Results Yet</h3>
                  <p className="text-xs text-slate-400">
                    Click <strong>"Run & Submit Solution"</strong> to evaluate your {reqLangUpper} code against test cases.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      latestSubmission.status === "Accepted"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {latestSubmission.status === "Accepted" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400" />
                      )}
                      <div>
                        <div className="text-sm font-bold">{latestSubmission.status}</div>
                        <div className="text-xs opacity-80">
                          Passed {latestSubmission.passedCount} / {latestSubmission.totalCount} Test Cases
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-sm font-bold">
                      {latestSubmission.score}% Score
                    </div>
                  </div>

                  {/* Individual Test Cases List */}
                  <div className="space-y-3">
                    {latestSubmission.testCaseResults?.map((tc, idx) => (
                      <div
                        key={idx}
                        className="glass p-4 rounded-xl border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">
                            Test Case #{idx + 1}
                          </span>
                          {tc.passed ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold text-[10px]">
                              FAILED
                            </span>
                          )}
                        </div>

                        {tc.input && (
                          <div className="text-xs">
                            <span className="text-slate-400">Input:</span>
                            <pre className="bg-slate-950 p-2 rounded text-slate-200 mt-1 font-mono">{tc.input}</pre>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Expected:</span>
                            <pre className="bg-slate-950 p-2 rounded text-emerald-400 mt-1 font-mono">{tc.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400">Actual Output:</span>
                            <pre className={`bg-slate-950 p-2 rounded mt-1 font-mono ${tc.passed ? "text-emerald-400" : "text-rose-400"}`}>
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
                <div className="glass p-8 rounded-2xl border border-white/10 text-center space-y-2">
                  <Brain className="w-10 h-10 text-indigo-500/60 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-300">AI Report Available After Submission</h3>
                  <p className="text-xs text-slate-400">
                    Submit your code to view full Time Complexity ($O(N)$, $O(N^2)$), Space Complexity, Code Quality Score, and Refactoring suggestions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass p-3.5 rounded-xl border border-white/10 text-center space-y-1">
                      <Clock className="w-4 h-4 text-teal-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Comp.</div>
                      <div className="text-xs font-bold font-mono text-teal-300">
                        {latestSubmission.aiAnalysis.timeComplexity}
                      </div>
                    </div>

                    <div className="glass p-3.5 rounded-xl border border-white/10 text-center space-y-1">
                      <Cpu className="w-4 h-4 text-indigo-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Space Comp.</div>
                      <div className="text-xs font-bold font-mono text-indigo-300">
                        {latestSubmission.aiAnalysis.spaceComplexity}
                      </div>
                    </div>

                    <div className="glass p-3.5 rounded-xl border border-white/10 text-center space-y-1">
                      <Sparkles className="w-4 h-4 text-amber-400 mx-auto" />
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Quality Score</div>
                      <div className="text-xs font-bold font-mono text-amber-300">
                        {latestSubmission.aiAnalysis.qualityScore}/100
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="glass p-4 rounded-xl border border-white/10 space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">AI Code Summary</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {latestSubmission.aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Best Practices */}
                  {latestSubmission.aiAnalysis.bestPractices?.length > 0 && (
                    <div className="glass p-4 rounded-xl border border-white/10 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Best Practices Adhered
                      </h4>
                      <ul className="space-y-1.5">
                        {latestSubmission.aiAnalysis.bestPractices.map((bp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">&bull;</span> {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Improvements */}
                  {latestSubmission.aiAnalysis.improvements?.length > 0 && (
                    <div className="glass p-4 rounded-xl border border-white/10 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Actionable Improvements
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
