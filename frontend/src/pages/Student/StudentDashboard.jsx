import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { BookOpen, Calendar, Clock, Code, ArrowRight, CheckCircle2, AlertCircle, Building2, Lock } from "lucide-react";

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
      C: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      CPP: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      JAVA: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      PYTHON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      JAVASCRIPT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1 ${colors[langUpper] || "bg-teal-500/10 text-teal-400 border-teal-500/20"}`}>
        <Lock className="w-3 h-3" /> Locked: {langUpper}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Enrolled Course Info */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-teal-900/20 to-indigo-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl space-y-1">
          <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
            Student Programming Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.name || "Student"}! 👋
          </h1>
          <p className="text-slate-300 text-sm">
            Access your course-restricted programming labs, run code against automated Judge0 test suites, and receive instant AI analysis.
          </p>
        </div>

        {/* ENROLLED COURSE BADGE */}
        <div className="glass p-4 rounded-xl border border-teal-500/30 text-right space-y-1 shrink-0 bg-teal-500/5">
          <div className="text-[10px] text-teal-300 uppercase font-semibold flex items-center gap-1 justify-end">
            <Building2 className="w-3.5 h-3.5" /> Enrolled Curriculum Program
          </div>
          <div className="text-sm font-bold text-white">
            {user?.course?.name || "General Program"}
          </div>
          <div className="text-xs text-teal-400 font-mono">
            Dept: {user?.department?.name || user?.department || "General"} {user?.course?.code ? `(${user.course.code})` : ""}
          </div>
        </div>
      </div>

      {/* Lab Assignments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" /> My Course Programming Labs ({assignments.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing labs for: <strong className="text-teal-300">{user?.course?.name || "All Courses"}</strong>
          </span>
        </div>

        {assignments.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-white/10 space-y-2">
            <Code className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No Labs Posted for Your Course Yet</h3>
            <p className="text-slate-400 text-sm">
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
                  className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-teal-500/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
                        {assignment.courseCode || assignment.course?.code || "LAB"}
                      </span>
                      {getLanguageBadge(assignment.requiredLanguage)}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{assignment.courseName || assignment.course?.name}</p>
                    </div>

                    <p className="text-slate-300 text-sm line-clamp-2">
                      {assignment.description}
                    </p>

                    <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-slate-300">
                        {assignment.maxPoints} pts
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    {sub ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Submitted ({sub.status} - {sub.score}%)
                      </div>
                    ) : isPastDeadline ? (
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4" /> Deadline Passed
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium">Pending Submission</span>
                    )}

                    <Link
                      to={`/student/workspace/${assignment._id}`}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors flex items-center gap-1 shadow-lg shadow-teal-500/20"
                    >
                      {sub ? "View / Re-submit" : "Solve Lab"} <ArrowRight className="w-3.5 h-3.5" />
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
