import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { BookOpen, Clock, Code, ArrowRight, CheckCircle2, AlertCircle, Building2, Lock, Sparkles, Terminal } from "lucide-react";

export default function StudentDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        api.getAssignments(),
        api.getMySubmissions(),
      ]);

      if (assRes.success) setAssignments(assRes.assignments || []);
      if (subRes.success) setSubmissions(subRes.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const sub = submissions.find(
      (s) => s.assignment?._id === assignmentId || s.assignment === assignmentId
    );
    return sub || null;
  };

  const getLanguageBadge = (lang) => {
    const langUpper = (lang || "").toUpperCase();
    const colors = {
      C: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      CPP: "bg-violet-500/10 text-violet-400 border-violet-500/30",
      JAVA: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      PYTHON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      JAVASCRIPT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border flex items-center gap-1.5 shadow-sm ${colors[langUpper] || "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"}`}>
        <Lock className="w-3 h-3" /> {langUpper}
      </span>
    );
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Enrolled Course Info */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-[#111827] via-[#0e1626] to-[#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* Ambient glow accent inside banner */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" /> Student Lab Environment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.name || "Student"}</span> 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Solve programming labs restricted to your course, run automated Judge0 test suites, and obtain real-time AI complexity analytics.
          </p>
        </div>

        {/* ENROLLED COURSE BADGE */}
        <div className="glass p-5 rounded-2xl border border-cyan-500/30 text-right space-y-1.5 shrink-0 bg-[#090e1a]/90 relative z-10 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider flex items-center gap-1.5 justify-end">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Enrolled Curriculum
          </div>
          <div className="text-sm font-extrabold text-white">
            {user?.course?.name || "General Program"}
          </div>
          <div className="text-xs text-cyan-400 font-mono font-semibold">
            Dept: {user?.department?.name || user?.department || "General"} {user?.course?.code ? `(${user.course.code})` : ""}
          </div>
        </div>
      </div>

      {/* Lab Assignments Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" /> My Course Programming Labs
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
              {assignments.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Filtered for: <strong className="text-cyan-300 font-semibold">{user?.course?.name || "All Enrolled Courses"}</strong>
          </span>
        </div>

        {assignments.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-white/10 space-y-3 shadow-lg">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center">
              <Code className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-white">No Labs Posted for Your Course Yet</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Your faculty has not published any programming lab assignments for <strong>{user?.course?.name || "your course"}</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const sub = getSubmissionStatus(assignment._id);
              const isPastDeadline = new Date(assignment.deadline) < new Date();

              return (
                <div
                  key={assignment._id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover group relative overflow-hidden"
                >
                  {/* Subtle top edge glow on card hover */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-400/50 to-transparent transition-all duration-300"></div>

                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#090e1a] text-slate-300 text-xs font-mono font-bold border border-white/10 shadow-inner">
                        {assignment.courseCode || assignment.course?.code || "LAB"}
                      </span>
                      {getLanguageBadge(assignment.requiredLanguage)}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{assignment.courseName || assignment.course?.name}</p>
                    </div>

                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-normal">
                      {assignment.description}
                    </p>

                    <div className="pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-cyan-300 font-mono">
                        {assignment.maxPoints} pts
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    {sub ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submitted ({sub.score}%)</span>
                      </div>
                    ) : isPastDeadline ? (
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Deadline Passed</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Pending
                      </span>
                    )}

                    <Link
                      to={`/student/workspace/${assignment._id}`}
                      state={sub ? { submission: sub } : undefined}
                      className="px-4 py-2 rounded-xl text-xs font-bold neu-btn-primary flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {sub ? "View / Solve" : "Solve Lab"} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
