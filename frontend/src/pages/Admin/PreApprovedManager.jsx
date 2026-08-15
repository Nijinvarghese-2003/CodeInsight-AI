import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { UserCheck, Plus, Trash2, Building2, BookOpen, Search, ShieldCheck } from "lucide-react";

export default function PreApprovedManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    role: "student",
    officialId: "",
    email: "",
    name: "",
    department: "",
    course: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getPreApprovedList();
      if (res.success) setList(res.preApprovedUsers || []);
    } catch (err) {
      console.error("Failed to load pre-approved list", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (courseRes.success) setCourses(courseRes.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.officialId.trim() || !formData.email.trim()) {
      setError("Official ID and Email are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.addPreApprovedUser(formData);
      if (res.success) {
        setList((prev) => [res.preApprovedUser, ...prev]);
        setShowAddForm(false);
        setFormData({
          role: "student",
          officialId: "",
          email: "",
          name: "",
          department: "",
          course: "",
        });
      } else {
        setError(res.message || "Failed to add record");
      }
    } catch (err) {
      setError("Error adding record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pre-approved record?")) return;
    try {
      const res = await api.deletePreApprovedUser(id);
      if (res.success) {
        setList((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  const filteredList = list.filter((item) => {
    const matchesRole = filterRole === "all" || item.role === filterRole;
    const matchesSearch =
      item.officialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Pre-Approved Registration Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-register authorized Student ID + Official Email and Faculty ID + Official Email for automatic registration verification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Approved User
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-fade-up">
          <h3 className="text-sm font-bold text-emerald-400">Add Pre-Approved Record</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {formData.role === "student" ? "Student ID / Roll No *" : "Faculty / Employee ID *"}
              </label>
              <input
                type="text"
                value={formData.officialId}
                onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
                placeholder={formData.role === "student" ? "e.g. CS2026-001" : "e.g. EMP-101"}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@campus.edu"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name (Optional)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department (Optional)</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="">-- Any / All Departments --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {formData.role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course (Optional)</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="">-- Any Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              {submitting ? "Saving..." : "Save Pre-Approved Record"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ID, Email or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-slate-400">Filter Role:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Student Only</option>
            <option value="faculty">Faculty Only</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading pre-approved records...</div>
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No Pre-Approved Records Found</p>
            <p className="text-xs text-slate-500">
              Click "Add Approved User" to populate approved student/faculty IDs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="p-4">Official ID</th>
                  <th className="p-4">Official Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Name / Department</th>
                  <th className="p-4">Registration Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredList.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {item.officialId}
                    </td>
                    <td className="p-4 text-white font-medium">
                      {item.email}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        item.role === "student"
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{item.name || "N/A"}</div>
                      {item.department && (
                        <div className="text-[10px] text-slate-400">
                          {item.department.name || item.department}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.isRegistered
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {item.isRegistered ? "Registered" : "Pending Registration"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
