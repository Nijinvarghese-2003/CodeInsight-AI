import { Link, useLocation } from "react-router-dom";
import { Code2, LogOut, Shield, BookOpen, Layers, Plus, Sparkles } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Student
          </span>
        );
      case "faculty":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.15)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            Faculty
          </span>
        );
      case "admin":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.6)] transition-all duration-300 transform group-hover:scale-105 border border-white/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CodeInsight
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-mono text-xs font-extrabold shadow-sm">
                  AI
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Role Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#111827]/70 p-1 rounded-2xl border border-white/5 shadow-inner">
          {user?.role === "student" && (
            <>
              <Link
                to="/student/dashboard"
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  isActive("/student/dashboard")
                    ? "bg-violet-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-400" /> Lab Assignments
              </Link>
              <Link
                to="/student/submissions"
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  isActive("/student/submissions")
                    ? "bg-violet-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" /> My Submissions
              </Link>
            </>
          )}

          {user?.role === "faculty" && (
            <>
              <Link
                to="/faculty/dashboard"
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  isActive("/faculty/dashboard")
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4 text-violet-400" /> Course Assignments
              </Link>
              <Link
                to="/faculty/create-assignment"
                className="text-xs font-bold px-3.5 py-2 rounded-xl neu-btn-primary flex items-center gap-1.5 ml-1"
              >
                <Plus className="w-4 h-4" /> Create Assignment
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  isActive("/admin/dashboard")
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" /> Admin Console
              </Link>
            </>
          )}
        </nav>

        {/* User profile & logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white tracking-wide">{user?.name}</div>
              <div className="mt-0.5 flex justify-end">{getRoleBadge(user?.role)}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-[#111827] border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer shadow-md"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
