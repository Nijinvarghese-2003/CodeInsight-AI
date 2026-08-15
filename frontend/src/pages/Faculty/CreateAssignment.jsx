import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Lock,
  Save,
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";

export default function CreateAssignment({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [availableLabs, setAvailableLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    courseName: "",
    requiredLanguage: "c",
    description: "",
    instructions: "",
    deadline: "",
    maxPoints: 100,
  });

  // Testcases with pure freeform multiline input & output support
  const [testCases, setTestCases] = useState([
    {
      input: "5",
      expectedOutput: "120",
      isHidden: false,
    },
    {
      input: "0",
      expectedOutput: "1",
      isHidden: false,
    },
  ]);

  useEffect(() => {
    fetchFacultyLabs();
  }, []);

  const fetchFacultyLabs = async () => {
    try {
      if (user?.teachingLabs && user.teachingLabs.length > 0) {
        setAvailableLabs(user.teachingLabs);
        const first = user.teachingLabs[0];
        if (first) {
          setSelectedLabId(first._id || "");
          setFormData((prev) => ({
            ...prev,
            courseCode: first.code || "",
            courseName: first.name || "",
            requiredLanguage: first.requiredLanguage || "c",
          }));
        }
      } else {
        const res = await api.getLabSubjects();
        if (res.success && res.labSubjects) {
          setAvailableLabs(res.labSubjects);
          if (res.labSubjects.length > 0) {
            const first = res.labSubjects[0];
            setSelectedLabId(first._id);
            setFormData((prev) => ({
              ...prev,
              courseCode: first.code,
              courseName: first.name,
              requiredLanguage: first.requiredLanguage || "c",
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch lab subjects", err);
    }
  };

  const handleLabSelect = (labId) => {
    setSelectedLabId(labId);
    const found = availableLabs.find((l) => l._id === labId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        courseCode: found.code || "",
        courseName: found.name || "",
        requiredLanguage: found.requiredLanguage || "c",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { input: "", expectedOutput: "", isHidden: false },
    ]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.courseCode || !formData.courseName || !formData.deadline || !formData.description) {
      setErrorMsg("Please complete all required assignment fields.");
      return;
    }

    if (testCases.length === 0) {
      setErrorMsg("Please add at least one test case.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const cleanedTestCases = testCases.map((tc) => ({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isHidden: tc.isHidden,
      }));

      const payload = {
        ...formData,
        labSubjectId: selectedLabId || undefined,
        testCases: cleanedTestCases,
      };

      const res = await api.createAssignment(payload);
      if (res.success) {
        navigate("/faculty/dashboard");
      } else {
        setErrorMsg(res.message || "Failed to create assignment");
      }
    } catch (err) {
      setErrorMsg(err.message || "Server communication error");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDeadlineDisplay = () => {
    if (!formData.deadline) return null;
    const d = new Date(formData.deadline);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/faculty/dashboard"
            className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Console
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Course Lab Assignment</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Specify course parameters, lock the programming language, set deadline, and add test cases with freeform inputs and outputs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Course & Assignment Info Card */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2">
            1. Course & Restricted Programming Language
          </h2>

          {availableLabs.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Select Lab Subject (Assigned to Faculty)
              </label>
              <select
                value={selectedLabId}
                onChange={(e) => handleLabSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs bg-slate-900 focus:outline-none cursor-pointer"
              >
                {availableLabs.map((lab) => (
                  <option key={lab._id} value={lab._id}>
                    {lab.name} ({lab.code}) — Language: {lab.requiredLanguage?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code *</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                required
                placeholder="e.g. CS101"
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                required
                placeholder="e.g. C Programming Lab"
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Strictly Locked Programming Language *
              </label>
              <select
                name="requiredLanguage"
                value={formData.requiredLanguage}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none bg-slate-900"
              >
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (G++)</option>
                <option value="java">Java (JDK)</option>
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Students will ONLY be allowed to write code in this selected language.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Factorial & Array Recursion Lab"
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* CALENDAR SUBMISSION DEADLINE PICKER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900 border border-purple-500/30 space-y-3">
            <div className="border-b border-white/10 pb-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Submission Deadline (Select Date & Time from Calendar) *
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    onClick={(e) => {
                      try {
                        e.target.showPicker();
                      } catch (err) {}
                    }}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-500/40 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Click to open calendar & time selector. Submissions after this deadline will be tagged as <strong>LATE</strong>.
                </span>
              </div>

              <div>
                {formData.deadline ? (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                    <div className="text-[10px] text-purple-300 font-semibold uppercase">Official Scheduled Deadline</div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{getFormattedDeadlineDisplay()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-500 text-xs italic">
                    No deadline selected yet. Click on date box to pick from calendar.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Score Points</label>
            <input
              type="number"
              name="maxPoints"
              value={formData.maxPoints}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the problem statement, inputs, outputs, and constraints..."
              className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* 2. Test Cases Builder Card (Pure Freeform Stdin & Stdout) */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> 2. Judge0 Test Suite Cases ({testCases.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Provide freeform standard input (stdin) and expected output (stdout) for each test case. Multiple lines/values are supported directly.
              </p>
            </div>

            <button
              type="button"
              onClick={addTestCase}
              className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-md flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test Case
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((tc, tcIdx) => (
              <div
                key={tcIdx}
                className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-3 relative hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                    Test Case #{tcIdx + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => handleTestCaseChange(tcIdx, "isHidden", e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Is Hidden Test Case</span>
                    </label>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(tcIdx)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete Test Case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* FREEFORM STANDARD INPUT (STDIN) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Freeform Standard Input (stdin)
                    </label>
                    <textarea
                      rows={4}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(tcIdx, "input", e.target.value)}
                      placeholder="Enter input data passed to standard input (multiple lines or space-separated values)..."
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  {/* FREEFORM EXPECTED OUTPUT (STDOUT) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Freeform Expected Output (stdout) *
                    </label>
                    <textarea
                      rows={4}
                      value={tc.expectedOutput}
                      onChange={(e) => handleTestCaseChange(tcIdx, "expectedOutput", e.target.value)}
                      required
                      placeholder="Enter exact expected output produced on standard output (multiple lines supported)..."
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Link
            to="/faculty/dashboard"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Publish Lab Assignment
          </button>
        </div>
      </form>
    </div>
  );
}
