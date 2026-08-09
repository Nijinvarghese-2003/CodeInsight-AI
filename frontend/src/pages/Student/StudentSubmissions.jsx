import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Layers, CheckCircle2, XCircle, Clock, Award, ArrowRight } from "lucide-react";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getMySubmissions();
      if (res.success) setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-400" /> My Lab Submissions
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Review past Judge0 test executions, AI complexity reports, and faculty grades.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-white/10">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Submissions Recorded</h3>
          <p className="text-slate-400 text-sm mt-1">
            You have not submitted any lab solutions yet.
          </p>
          <Link
            to="/student/dashboard"
            className="inline-block mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
          >
            Go to Active Labs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className="glass p-6 rounded-2xl border border-white/10 space-y-4 hover:border-teal-500/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-700">
                      {sub.assignment?.courseCode}
                    </span>
                    <h3 className="text-lg font-bold text-white">{sub.assignment?.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Language: <span className="font-mono text-teal-400 uppercase font-bold">{sub.submittedLanguage}</span> &bull; Submitted: {new Date(sub.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Score</div>
                    <div className="text-lg font-bold font-mono text-teal-400">{sub.score}%</div>
                  </div>

                  <Link
                    to={`/student/workspace/${sub.assignment?._id || sub.assignment}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                  >
                    View Code <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Status and Analysis Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Judge0 Status</span>
                  <span className={`font-semibold flex items-center gap-1 mt-0.5 ${sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                    {sub.status === "Accepted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} {sub.status}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Time Complexity</span>
                  <span className="font-mono font-bold text-teal-300 mt-0.5 block">
                    {sub.aiAnalysis?.timeComplexity || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">AI Quality Score</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">
                    {sub.aiAnalysis?.qualityScore || 0}/100
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Faculty Grade</span>
                  <span className="font-semibold text-purple-300 mt-0.5 block">
                    {sub.facultyGrade?.score !== null && sub.facultyGrade?.score !== undefined
                      ? `${sub.facultyGrade.score} pts`
                      : "Pending Grade"}
                  </span>
                </div>
              </div>

              {sub.facultyGrade?.feedback && (
                <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200">
                  <strong className="block text-purple-400 mb-0.5">Faculty Feedback:</strong>
                  {sub.facultyGrade.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
