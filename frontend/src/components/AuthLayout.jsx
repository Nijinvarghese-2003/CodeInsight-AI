import { Link } from "react-router-dom";
import { Code2, ShieldCheck, Cpu, Sparkles } from "lucide-react";

export default function AuthLayout({ mode = "login", activeRole = "student", children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-base-900">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-xl shadow-teal-500/20">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CodeInsight <span className="text-teal-400 font-mono">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated Code Evaluation, Judge0 Test Execution & AI Complexity Analysis
          </p>
        </div>

        {/* Card Form */}
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          <div className="flex border-b border-white/10 mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center pb-3 text-sm font-semibold border-b-2 transition-colors ${
                mode === "login"
                  ? "border-teal-400 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`flex-1 text-center pb-3 text-sm font-semibold border-b-2 transition-colors ${
                mode === "signup"
                  ? "border-teal-400 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Register Account
            </Link>
          </div>

          {children}
        </div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-teal-400" /> Judge0 Execution
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Complexity Report
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Plagiarism Detection
          </span>
        </div>
      </div>
    </div>
  );
}
