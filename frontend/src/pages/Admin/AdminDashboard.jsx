import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  Shield,
  Users,
  BookOpen,
  Layers,
  CheckCircle,
  Ban,
  RefreshCw,
  Building2,
  UserCheck,
  ShieldCheck,
  Code2,
  Clock,
  Edit2,
  X,
  Search,
  GraduationCap,
} from "lucide-react";
import AcademicManager from "./AcademicManager";
import PreApprovedManager from "./PreApprovedManager";
import FacultyApprovalManager from "./FacultyApprovalManager";

export default function AdminDashboard() {
  const [adminSection, setAdminSection] = useState("users"); // 'users' | 'academic' | 'preapproved' | 'faculty-approvals'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Faculty Lab Edit Modal State
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [allLabs, setAllLabs] = useState([]);
  const [selectedLabsForEdit, setSelectedLabsForEdit] = useState([]);
  const [updatingLabs, setUpdatingLabs] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, labsRes, deptRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(),
        api.getLabSubjects(),
        api.getDepartments(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (labsRes.success) setAllLabs(labsRes.labSubjects || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    try {
      const res = await api.toggleUserStatus(userId, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const openFacultyLabsModal = (facultyUser) => {
    setEditingFaculty(facultyUser);
    const existingLabIds = facultyUser.teachingLabs
      ? facultyUser.teachingLabs.map((l) => l._id || l)
      : [];
    setSelectedLabsForEdit(existingLabIds);
  };

  const handleSaveFacultyLabs = async () => {
    if (!editingFaculty) return;
    setUpdatingLabs(true);
    try {
      const res = await api.updateFacultyLabs(editingFaculty._id, selectedLabsForEdit);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editingFaculty._id ? res.faculty : u))
        );
        setEditingFaculty(null);
      } else {
        alert(res.message || "Failed to update assigned lab subjects");
      }
    } catch (err) {
      alert("Error updating lab subjects");
    } finally {
      setUpdatingLabs(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    
    // Check department matching
    const userDeptId = u.department?._id || u.department;
    const matchesDept = filterDept === "all" || userDeptId === filterDept;

    // Check search matching across name, email, studentId/rollNo/employeeId, department name/code, course name/code
    const searchLower = searchTerm.toLowerCase().trim();
    const deptName = u.department?.name || "";
    const deptCode = u.department?.code || "";
    const courseName = u.course?.name || "";
    const courseCode = u.course?.code || "";
    const officialId = u.studentId || u.employeeId || u.rollNo || "";

    const matchesSearch =
      !searchLower ||
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      officialId.toLowerCase().includes(searchLower) ||
      deptName.toLowerCase().includes(searchLower) ||
      deptCode.toLowerCase().includes(searchLower) ||
      courseName.toLowerCase().includes(searchLower) ||
      courseCode.toLowerCase().includes(searchLower);

    return matchesRole && matchesDept && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-amber-900/20 via-purple-900/20 to-indigo-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-4 h-4 text-amber-400" /> System Governance & Administration
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Registration Pre-Verification & Admin Approval Hub
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage Registered Users, Academic Departments & Courses, Faculty Approvals, and Pre-Approved Registration Directory.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* Interactive Overview Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => {
              setAdminSection("users");
              setFilterRole("all");
            }}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-teal-400/50 ${
              adminSection === "users" && filterRole === "all"
                ? "border-teal-400 bg-teal-500/10"
                : "border-white/10"
            }`}
          >
            <Users className="w-4 h-4 text-teal-400" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Total Users</div>
            <div className="text-lg font-bold text-white font-mono">{stats.totalUsers}</div>
          </button>

          <button
            onClick={() => {
              setAdminSection("users");
              setFilterRole("student");
            }}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-emerald-400/50 ${
              adminSection === "users" && filterRole === "student"
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-white/10"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Students</div>
            <div className="text-lg font-bold text-white font-mono">{stats.studentsCount}</div>
          </button>

          <button
            onClick={() => {
              setAdminSection("users");
              setFilterRole("faculty");
            }}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-purple-400/50 ${
              adminSection === "users" && filterRole === "faculty"
                ? "border-purple-400 bg-purple-500/10"
                : "border-white/10"
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Faculty</div>
            <div className="text-lg font-bold text-white font-mono">{stats.facultyCount}</div>
          </button>

          <button
            onClick={() => setAdminSection("faculty-approvals")}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-purple-400/50 ${
              adminSection === "faculty-approvals"
                ? "border-purple-400 bg-purple-500/20"
                : "border-purple-500/30 bg-purple-500/10"
            }`}
          >
            <Clock className="w-4 h-4 text-purple-300" />
            <div className="text-[10px] text-purple-300 font-semibold uppercase mt-1">Pending Faculty</div>
            <div className="text-lg font-bold text-purple-200 font-mono">{stats.pendingFacultyCount || 0}</div>
          </button>

          <button
            onClick={() => setAdminSection("academic")}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-amber-400/50 ${
              adminSection === "academic"
                ? "border-amber-400 bg-amber-500/20"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <div className="text-[10px] text-amber-300 font-semibold uppercase mt-1">Departments</div>
            <div className="text-lg font-bold text-amber-300 font-mono">{stats.departmentCount || 0}</div>
          </button>

          <button
            onClick={() => setAdminSection("preapproved")}
            className={`glass p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-emerald-400/50 ${
              adminSection === "preapproved"
                ? "border-emerald-400 bg-emerald-500/20"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-[10px] text-emerald-300 font-semibold uppercase mt-1">Pre-Approved List</div>
            <div className="text-lg font-bold text-emerald-300 font-mono">{stats.preApprovedCount || 0}</div>
          </button>

          <div className="glass p-3.5 rounded-xl border border-white/10 space-y-1">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Assignments</div>
            <div className="text-lg font-bold text-white font-mono">{stats.totalAssignments}</div>
          </div>
        </div>
      )}

      {/* Main Mode Toggle Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto space-x-6">
        <button
          onClick={() => setAdminSection("users")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
            adminSection === "users"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> User Access Directory ({users.length})
        </button>

        <button
          onClick={() => setAdminSection("academic")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
            adminSection === "academic"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" /> Academic Structure (Dept &rarr; Course &rarr; Labs)
        </button>

        <button
          onClick={() => setAdminSection("faculty-approvals")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap relative ${
            adminSection === "faculty-approvals"
              ? "border-purple-400 text-purple-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Pending Faculty Approvals
          {stats?.pendingFacultyCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-mono">
              {stats.pendingFacultyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSection("preapproved")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
            adminSection === "preapproved"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Pre-Approved Registration List
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY & ACCESS CONTROL */}
      {adminSection === "users" && (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden space-y-4">
          {/* Controls Bar: Search & Department / Role Filter */}
          <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Registered Accounts Directory ({filteredUsers.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user, ID, Dept or Course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none"
                />
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Dept:</span>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">All Depts</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Role:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none capitalize"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="p-4">User & Official ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status & Approval</th>
                  <th className="p-4">Department & Course / Program</th>
                  <th className="p-4">Assigned Teaching Labs</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const deptObj = typeof u.department === "object" ? u.department : null;
                    const courseObj = typeof u.course === "object" ? u.course : null;

                    return (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        {/* User & Official ID */}
                        <td className="p-4">
                          <div className="font-semibold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                          {(u.studentId || u.employeeId || u.rollNo) && (
                            <div className="text-[10px] text-amber-300 font-mono mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              ID: {u.studentId || u.employeeId || u.rollNo}
                            </div>
                          )}
                        </td>

                        {/* Current Role */}
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize focus:outline-none cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                              u.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : u.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {u.status === "active" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : u.status === "pending" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <Ban className="w-3 h-3" />
                            )}
                            {u.status}
                          </span>
                        </td>

                        {/* Department & Course */}
                        <td className="p-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-semibold text-white">
                              {deptObj?.name || (typeof u.department === "string" ? u.department : "General / System Admin")}
                            </span>
                            {deptObj?.code && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] border border-amber-500/20">
                                {deptObj.code}
                              </span>
                            )}
                          </div>

                          {courseObj && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-300">
                              <BookOpen className="w-3 h-3 shrink-0" />
                              <span>{courseObj.name}</span>
                              <span className="font-mono text-[10px] text-slate-400">({courseObj.code})</span>
                            </div>
                          )}

                          {(u.semester || u.batch) && (
                            <div className="mt-1 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                              {u.semester && <span>Sem: {u.semester}</span>}
                              {u.batch && <span>Batch: {u.batch}</span>}
                            </div>
                          )}
                        </td>

                        {/* Assigned Teaching Labs */}
                        <td className="p-4 text-slate-300">
                          {u.role === "faculty" ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {u.teachingLabs && u.teachingLabs.length > 0 ? (
                                u.teachingLabs.map((lab) => (
                                  <span
                                    key={lab._id || lab}
                                    className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30"
                                  >
                                    {lab.name || lab.code}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-rose-400 italic">No assigned labs</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">N/A (Student)</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {u.role === "faculty" && (
                            <button
                              onClick={() => openFacultyLabsModal(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Manage Labs
                            </button>
                          )}
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleStatusToggle(u._id, u.status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                u.status === "blocked"
                                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                              }`}
                            >
                              {u.status === "blocked" ? "Unblock" : "Block"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC STRUCTURE MANAGER */}
      {adminSection === "academic" && <AcademicManager />}

      {/* TAB 3: PENDING FACULTY APPROVALS & LAB ASSIGNMENTS */}
      {adminSection === "faculty-approvals" && <FacultyApprovalManager />}

      {/* TAB 4: PRE-APPROVED REGISTRATION LIST */}
      {adminSection === "preapproved" && <PreApprovedManager />}

      {/* FACULTY LAB EDIT MODAL */}
      {editingFaculty && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-purple-500/30 bg-slate-950 w-full max-w-xl space-y-4 animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" /> Assign Lab Subjects for {editingFaculty.name}
              </h3>
              <button
                onClick={() => setEditingFaculty(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Department:{" "}
              <strong className="text-purple-300">
                {editingFaculty.department?.name || "General"}
              </strong>{" "}
              &bull; Select programming labs taught by this faculty member:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {allLabs.map((lab) => {
                const isSelected = selectedLabsForEdit.includes(lab._id);
                return (
                  <button
                    type="button"
                    key={lab._id}
                    onClick={() => {
                      setSelectedLabsForEdit((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== lab._id)
                          : [...prev, lab._id]
                      );
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/30 border-purple-500 text-purple-200 font-bold"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div>{lab.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{lab.code}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase font-bold">
                      {lab.requiredLanguage}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setEditingFaculty(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFacultyLabs}
                disabled={updatingLabs}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
              >
                {updatingLabs ? "Saving..." : "Save Lab Assignments"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
