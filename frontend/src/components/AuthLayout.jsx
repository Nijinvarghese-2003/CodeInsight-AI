import { Link } from "react-router-dom";
import { Code2, ShieldCheck, Cpu, Sparkles } from "lucide-react";

export default function AuthLayout({ mode = "login", activeRole = "student", children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#070b14]">
      {/* Ambient background light orbs */}
      <div className="glow-orb-violet -top-32 -left-32 opacity-70"></div>
      <div className="glow-orb-cyan -bottom-32 -right-32 opacity-70"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)] border border-white/20">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CodeInsight
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-mono text-sm font-bold shadow-md">
                AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              Automated Code Evaluation, Judge0 Execution & AI Complexity Analytics
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle top edge specular highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"></div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#0a0f1d] p-1 rounded-2xl border border-white/5 shadow-inner mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                mode === "login"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                mode === "signup"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register Account
            </Link>
          </div>

          {children}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 border border-cyan-500/20 text-slate-300 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Judge0 Execution
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 border border-violet-500/20 text-slate-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Complexity
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 border border-amber-500/20 text-slate-300 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Pre-Verification
          </span>
        </div>
      </div>
    </div>
  );
}
