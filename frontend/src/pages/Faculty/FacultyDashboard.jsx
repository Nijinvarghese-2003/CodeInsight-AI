import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { BookOpen, Users, ShieldAlert, Layers, Trash2, ArrowRight } from "lucide-react";

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Faculty Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div>
          <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">
            Faculty Lab Console
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Course Labs & Assignment Manager
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Audit student lab submissions, view automated Judge0 execution results, and inspect AI code quality & plagiarism reports for your assigned courses.
          </p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Managed Course Assignments ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-white/10">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No Assignments Available</h3>
            <p className="text-slate-400 text-sm mt-1">
              No programming lab assignments found for your assigned subjects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-purple-500/30 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-700">
                      {assignment.courseCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                      LOCKED: {assignment.requiredLanguage}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{assignment.courseName}</p>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                    <span>Test Cases: {assignment.testCases?.length || 0}</span>
                    <span>Max Points: {assignment.maxPoints}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/faculty/submissions/${assignment._id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> Audit Submissions <ArrowRight className="w-3.5 h-3.5" />
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
