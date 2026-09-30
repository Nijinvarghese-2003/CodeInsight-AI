import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  BookOpen,
  Users,
  Layers,
  Trash2,
  ArrowRight,
  Plus,
  Sparkles,
  GraduationCap,
  Calendar,
  Clock,
  Edit3,
  X,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  Lock,
} from "lucide-react";

const toDatetimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDeadline = (dateString) => {
  if (!dateString) return "No deadline set";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isDeadlinePassed = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export default function FacultyDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    courseCode: "",
    courseName: "",
    requiredLanguage: "c",
    description: "",
    instructions: "",
    functionName: "solution",
    returnType: "int",
    parameters: "int n",
    deadline: "",
    maxPoints: 100,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (editingAssignment) {
      document.body.classList.add("modal-open-hide-header");
    } else {
      document.body.classList.remove("modal-open-hide-header");
    }
    return () => {
      document.body.classList.remove("modal-open-hide-header");
    };
  }, [editingAssignment]);

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

  const handleOpenEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      title: assignment.title || "",
      courseCode: assignment.courseCode || "",
      courseName: assignment.courseName || "",
      requiredLanguage: assignment.requiredLanguage || "c",
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      functionName: assignment.functionName || "solution",
      returnType: assignment.returnType || "int",
      parameters: assignment.parameters || "int n",
      deadline: toDatetimeLocal(assignment.deadline),
      maxPoints: assignment.maxPoints !== undefined ? assignment.maxPoints : 100,
    });
    setEditError("");
    setEditSuccess("");
  };

  const handleCloseEditModal = () => {
    setEditingAssignment(null);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extendDeadline = (daysToAdd) => {
    let baseDate = editFormData.deadline ? new Date(editFormData.deadline) : new Date();
    if (isNaN(baseDate.getTime()) || baseDate < new Date()) {
      baseDate = new Date();
    }
    const newDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    setEditFormData((prev) => ({
      ...prev,
      deadline: toDatetimeLocal(newDate.toISOString()),
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.deadline || !editFormData.description) {
      setEditError("Please fill in title, description, and deadline.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await api.updateAssignment(editingAssignment._id, {
        ...editFormData,
      });

      if (res.success && res.assignment) {
        setEditSuccess("Assignment updated successfully!");
        setAssignments((prev) =>
          prev.map((a) => (a._id === editingAssignment._id ? { ...a, ...res.assignment } : a))
        );
        setTimeout(() => {
          handleCloseEditModal();
        }, 900);
      } else {
        setEditError(res.message || "Failed to update assignment");
      }
    } catch (err) {
      setEditError(err.message || "Network error while updating");
    } finally {
      setSavingEdit(false);
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
            Manage course assignments, adjust submission deadlines, audit student lab submissions, and inspect AI automated evaluations.
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
            {assignments.map((assignment) => {
              const passed = isDeadlinePassed(assignment.deadline);
              return (
                <div
                  key={assignment._id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover group relative overflow-hidden"
                >
                  {/* Top glow hover edge */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/0 group-hover:via-violet-400/50 to-transparent transition-all duration-300"></div>

                  <div className="space-y-3.5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2">
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

                    {assignment.functionName && (
                      <div className="text-[11px] font-mono text-violet-300/90 bg-[#050811] px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-slate-400">Target fn:</span>
                        <strong className="text-violet-300">
                          {assignment.functionName}({assignment.parameters || ""}) &rarr; {assignment.returnType || "int"}
                        </strong>
                      </div>
                    )}

                    {/* Deadline Badge */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        passed
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                          : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate text-[11px] font-medium">
                          {formatDeadline(assignment.deadline)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          passed
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {passed ? "Passed" : "Active"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
                      <span>Test Cases: <strong className="text-white font-mono">{assignment.testCases?.length || 0}</strong></span>
                      <span>Max Points: <strong className="text-violet-300 font-mono">{assignment.maxPoints}</strong></span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(assignment)}
                        className="px-3 py-2 rounded-xl text-violet-300 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        title="Edit Assignment & Deadline"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/faculty/submissions/${assignment._id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold neu-btn-primary flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/20 p-6 sm:p-8 space-y-6 overflow-y-auto relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#14122b] to-[#090e1a]">
            {/* Close Button */}
            <button
              onClick={handleCloseEditModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 z-10"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 border-b border-white/10 pb-4 pr-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-wider">
                <Edit3 className="w-3 h-3" /> Quick Edit Mode
              </div>
              <h2 className="text-xl font-bold text-white">Edit Assignment Details & Deadline</h2>
              <p className="text-xs text-slate-400">
                Update the assignment title, problem description, deadline extension, and parameters.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Title & Course Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assignment Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={editFormData.courseCode}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Course Name & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    value={editFormData.courseName}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet-400" /> Locked Language
                  </label>
                  <select
                    name="requiredLanguage"
                    value={editFormData.requiredLanguage}
                    onChange={handleEditInputChange}
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs font-mono focus:outline-none bg-[#090e1a] cursor-pointer"
                  >
                    <option value="c">C (GCC)</option>
                    <option value="cpp">C++ (G++)</option>
                    <option value="java">Java (JDK)</option>
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                  </select>
                </div>
              </div>

              {/* Submission Deadline & Extension Box */}
              <div className="p-4 rounded-2xl bg-[#050811] border border-violet-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" /> Submission Deadline *
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Quick Extend:</span>
                    <button
                      type="button"
                      onClick={() => extendDeadline(1)}
                      className="px-2 py-0.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold cursor-pointer"
                    >
                      +1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => extendDeadline(3)}
                      className="px-2 py-0.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => extendDeadline(7)}
                      className="px-2 py-0.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold cursor-pointer"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={editFormData.deadline}
                      onChange={handleEditInputChange}
                      onClick={(e) => {
                        try {
                          e.target.showPicker();
                        } catch (err) {}
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-violet-500/40 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer shadow-inner"
                    />
                  </div>
                  <div>
                    {editFormData.deadline ? (
                      <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-200 text-xs">
                        <div className="text-[10px] text-violet-300 font-bold uppercase">Effective Deadline</div>
                        <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{formatDeadline(editFormData.deadline)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Select a valid deadline date and time.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Function Signature & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Function Name</label>
                  <input
                    type="text"
                    name="functionName"
                    value={editFormData.functionName}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Return Type</label>
                  <input
                    type="text"
                    name="returnType"
                    value={editFormData.returnType}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Points</label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={editFormData.maxPoints}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assignment Description *</label>
                <textarea
                  name="description"
                  rows={3}
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Instructions</label>
                <textarea
                  name="instructions"
                  rows={2}
                  value={editFormData.instructions}
                  onChange={handleEditInputChange}
                  placeholder="Optional guidelines, edge-cases or notes for students..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Status messages */}
              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <Link
                  to={`/faculty/edit-assignment/${editingAssignment._id}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Editor (Test cases & Template)</span>
                </Link>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2.5 rounded-xl neu-btn-primary text-white text-xs font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
