import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Plus, Trash2, ArrowLeft, Lock, Save, AlertCircle } from "lucide-react";

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    courseCode: "CS101",
    courseName: "C Programming Lab",
    requiredLanguage: "c",
    description: "",
    instructions: "",
    deadline: "",
    maxPoints: 100,
  });

  const [testCases, setTestCases] = useState([
    { input: "5\n", expectedOutput: "120", isHidden: false },
    { input: "0\n", expectedOutput: "1", isHidden: false },
  ]);

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
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
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
      const payload = {
        ...formData,
        testCases,
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/faculty/dashboard" className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Console
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Course Lab Assignment</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Specify course parameters, lock the programming language, and set evaluation test cases.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Course & Assignment Info Card */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2">
            1. Course & Restricted Programming Language
          </h2>

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
                placeholder="e.g. Factorial and Recursion Lab"
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Submission Deadline *</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
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

        {/* Test Cases Builder Card */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
              2. Judge0 Test Suite Cases ({testCases.length})
            </h2>

            <button
              type="button"
              onClick={addTestCase}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 hover:bg-purple-500/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test Case
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((tc, index) => (
              <div key={index} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Test Case #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Is Hidden Test Case</span>
                    </label>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Standard Input (stdin)</label>
                    <textarea
                      rows={2}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                      placeholder="Input data passed to program..."
                      className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Expected Output (stdout) *</label>
                    <textarea
                      rows={2}
                      value={tc.expectedOutput}
                      onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                      required
                      placeholder="Exact expected output..."
                      className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none resize-none"
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
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Publish Lab Assignment
          </button>
        </div>
      </form>
    </div>
  );
}
