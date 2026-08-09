import { useNavigate, Link } from "react-router-dom";
import { Code2, LogOut, User, Shield, BookOpen, Layers } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Student
          </span>
        );
      case "faculty":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Faculty
          </span>
        );
      case "admin":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-md bg-base-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <Link to="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              CodeInsight <span className="text-teal-400 font-mono text-sm font-semibold">AI</span>
            </Link>
          </div>
        </div>

        {/* Role Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user?.role === "student" && (
            <>
              <Link
                to="/student/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Lab Assignments
              </Link>
              <Link
                to="/student/submissions"
                className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" /> My Submissions
              </Link>
            </>
          )}

          {user?.role === "faculty" && (
            <>
              <Link
                to="/faculty/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Course Assignments
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            </>
          )}
        </nav>

        {/* User profile & logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
