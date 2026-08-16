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
  Sparkles,
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
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin"></div>
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin absolute top-2 left-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-[#111827] via-[#1a1528] to-[#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Governance & Pre-Verification Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage Registered Users, Academic Departments & Courses, Faculty Approvals, and Pre-Approved Registration Directory.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 rounded-xl bg-[#090e1a] hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md transition-all"
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
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "users" && filterRole === "all"
                ? "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "border-white/10 hover:border-cyan-400/40 bg-[#111827]/80"
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">Total Users</div>
            <div className="text-lg font-extrabold text-white font-mono">{stats.totalUsers}</div>
          </button>

          <button
            onClick={() => {
              setAdminSection("users");
              setFilterRole("student");
            }}
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "users" && filterRole === "student"
                ? "border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "border-white/10 hover:border-cyan-400/40 bg-[#111827]/80"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">Students</div>
            <div className="text-lg font-extrabold text-white font-mono">{stats.studentsCount}</div>
          </button>

          <button
            onClick={() => {
              setAdminSection("users");
              setFilterRole("faculty");
            }}
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "users" && filterRole === "faculty"
                ? "border-violet-400/60 bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                : "border-white/10 hover:border-violet-400/40 bg-[#111827]/80"
            }`}
          >
            <UserCheck className="w-4 h-4 text-violet-400" />
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">Faculty</div>
            <div className="text-lg font-extrabold text-white font-mono">{stats.facultyCount}</div>
          </button>

          <button
            onClick={() => setAdminSection("faculty-approvals")}
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "faculty-approvals"
                ? "border-violet-400/60 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                : "border-violet-500/30 bg-violet-500/10 hover:border-violet-400/40"
            }`}
          >
            <Clock className="w-4 h-4 text-violet-300" />
            <div className="text-[10px] text-violet-300 font-bold uppercase mt-1.5">Pending Faculty</div>
            <div className="text-lg font-extrabold text-violet-200 font-mono">{stats.pendingFacultyCount || 0}</div>
          </button>

          <button
            onClick={() => setAdminSection("academic")}
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "academic"
                ? "border-amber-400/60 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/40"
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <div className="text-[10px] text-amber-300 font-bold uppercase mt-1.5">Departments</div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">{stats.departmentCount || 0}</div>
          </button>

          <button
            onClick={() => setAdminSection("preapproved")}
            className={`glass p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              adminSection === "preapproved"
                ? "border-cyan-400/60 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div className="text-[10px] text-cyan-300 font-bold uppercase mt-1.5">Pre-Approved</div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono">{stats.preApprovedCount || 0}</div>
          </button>

          <div className="glass p-4 rounded-2xl border border-white/10 bg-[#111827]/80">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">Assignments</div>
            <div className="text-lg font-extrabold text-white font-mono">{stats.totalAssignments}</div>
          </div>
        </div>
      )}

      {/* Main Mode Toggle Tabs */}
      <div className="flex bg-[#090e1a] p-1.5 rounded-2xl border border-white/10 shadow-inner overflow-x-auto space-x-2">
        <button
          onClick={() => setAdminSection("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            adminSection === "users"
              ? "neu-btn-primary shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> User Directory ({users.length})
        </button>

        <button
          onClick={() => setAdminSection("academic")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            adminSection === "academic"
              ? "neu-btn-primary shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" /> Academic Structure (Dept &rarr; Course &rarr; Labs)
        </button>

        <button
          onClick={() => setAdminSection("faculty-approvals")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            adminSection === "faculty-approvals"
              ? "neu-btn-primary shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Pending Faculty Approvals
          {stats?.pendingFacultyCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
              {stats.pendingFacultyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSection("preapproved")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            adminSection === "preapproved"
              ? "neu-btn-primary shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Pre-Approved Registration List
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY & ACCESS CONTROL */}
      {adminSection === "users" && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          {/* Controls Bar: Search & Department / Role Filter */}
          <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> Registered Accounts ({filteredUsers.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user, ID, Dept or Course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#090e1a] border border-white/10 text-white rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500/50 shadow-inner"
                />
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Dept:</span>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-[#090e1a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
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
                <span className="text-slate-400 font-semibold">Role:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-[#090e1a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none capitalize cursor-pointer"
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
              <thead className="bg-[#090e1a] text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="p-4">User & Official ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Department & Course</th>
                  <th className="p-4">Assigned Labs</th>
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
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                          {(u.studentId || u.employeeId || u.rollNo) && (
                            <div className="text-[10px] text-cyan-300 font-mono mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                              ID: {u.studentId || u.employeeId || u.rollNo}
                            </div>
                          )}
                        </td>

                        {/* Current Role */}
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-[#090e1a] border border-white/10 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold capitalize focus:outline-none cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 text-[11px] ${
                              u.status === "active"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : u.status === "pending"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
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
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="font-bold text-white">
                              {deptObj?.name || (typeof u.department === "string" ? u.department : "General")}
                            </span>
                            {deptObj?.code && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[#090e1a] text-cyan-300 font-mono text-[10px] border border-cyan-500/20">
                                {deptObj.code}
                              </span>
                            )}
                          </div>

                          {courseObj && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-violet-300 font-medium">
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
                                    className="px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 text-[10px] font-mono border border-violet-500/30 font-bold"
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
                              className="px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Manage Labs
                            </button>
                          )}
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleStatusToggle(u._id, u.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                u.status === "blocked"
                                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 bg-[#0c1020] w-full max-w-xl space-y-4 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" /> Assign Lab Subjects for {editingFaculty.name}
              </h3>
              <button
                onClick={() => setEditingFaculty(null)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Department:{" "}
              <strong className="text-violet-300 font-bold">
                {editingFaculty.department?.name || "General"}
              </strong>{" "}
              &bull; Select programming labs taught by this faculty member:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
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
                    className={`p-3 rounded-2xl text-left text-xs border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-violet-500/25 border-violet-400 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                        : "bg-[#090e1a] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{lab.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lab.code}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono uppercase font-bold border border-violet-500/30">
                      {lab.requiredLanguage}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingFaculty(null)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFacultyLabs}
                disabled={updatingLabs}
                className="px-5 py-2.5 rounded-xl neu-btn-primary text-white font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
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
