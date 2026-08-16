import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { BookOpen, Users, Layers, Trash2, ArrowRight, Plus, Sparkles, GraduationCap } from "lucide-react";

export default function FacultyDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.getAssignments();
      if (res.success) setAssignments(res.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await api.deleteAssignment(id);
      if (res.success) {
        setAssignments((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert("Failed to delete assignment");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Faculty Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-[#111827] via-[#14122b] to-[#111827] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Faculty Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Course Labs & Assignment Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Audit student lab submissions, view automated Judge0 execution results, and inspect AI code quality & plagiarism reports for your assigned courses.
          </p>
        </div>

        <Link
          to="/faculty/create-assignment"
          className="px-5 py-3 rounded-xl neu-btn-primary font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg cursor-pointer transition-transform active:scale-95 z-10"
        >
          <Plus className="w-4 h-4" /> Create New Assignment
        </Link>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-violet-400" /> Managed Course Assignments
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-mono font-bold border border-violet-500/20">
              {assignments.length}
            </span>
          </h2>
          <Link
            to="/faculty/create-assignment"
            className="px-3.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Assignment
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-white/10 space-y-4 shadow-lg">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-slate-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Assignments Available</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                No programming lab assignments found for your assigned subjects. Click below to create your first assignment.
              </p>
            </div>
            <Link
              to="/faculty/create-assignment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl neu-btn-primary text-xs font-bold shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create First Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover group relative overflow-hidden"
              >
                {/* Top glow hover edge */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 group-hover:via-violet-400/50 to-transparent transition-all duration-300"></div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#090e1a] text-slate-300 font-mono text-xs font-bold border border-white/10 shadow-inner">
                      {assignment.courseCode || "LAB"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 uppercase">
                      LOCKED: {assignment.requiredLanguage}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{assignment.courseName}</p>
                  </div>

                  <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-normal">
                    {assignment.description}
                  </p>

                  <div className="pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                    <span>Test Cases: <strong className="text-white font-mono">{assignment.testCases?.length || 0}</strong></span>
                    <span>Max Points: <strong className="text-violet-300 font-mono">{assignment.maxPoints}</strong></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/faculty/submissions/${assignment._id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold neu-btn-primary flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Audit Submissions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
