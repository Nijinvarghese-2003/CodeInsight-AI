import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Building2, BookOpen, Code2, Plus, Trash2, Layers, CheckCircle, Lock, Sparkles } from "lucide-react";

export default function AcademicManager() {
  const [activeTab, setActiveTab] = useState("depts"); // 'depts' | 'courses' | 'labs' | 'hierarchy'
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [labs, setLabs] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "" });
  const [courseForm, setCourseForm] = useState({ name: "", code: "", departmentId: "", durationYears: 4 });
  const [labForm, setLabForm] = useState({ name: "", code: "", courseId: "", requiredLanguage: "c", description: "" });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      const [deptRes, courseRes, labRes, treeRes] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
        api.getLabSubjects(),
        api.getAcademicHierarchy(),
      ]);

      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (courseRes.success) setCourses(courseRes.courses || []);
      if (labRes.success) setLabs(labRes.labSubjects || []);
      if (treeRes.success) setHierarchy(treeRes.hierarchy || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await api.createDepartment(deptForm);
      if (res.success) {
        setSuccessMsg(`Department '${res.department.name}' created!`);
        setDeptForm({ name: "", code: "", description: "" });
        fetchAcademicData();
      } else {
        setErrorMsg(res.message || "Failed to create department");
      }
    } catch (err) {
      setErrorMsg("Server error");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Deleting this department will delete all associated courses and programming labs. Proceed?")) return;
    try {
      const res = await api.deleteDepartment(id);
      if (res.success) fetchAcademicData();
    } catch (err) { alert("Failed to delete department"); }
  };

  // Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code || !courseForm.departmentId) return;
    setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await api.createCourse(courseForm);
      if (res.success) {
        setSuccessMsg(`Course '${res.course.name}' added!`);
        setCourseForm({ name: "", code: "", departmentId: "", durationYears: 4 });
        fetchAcademicData();
      } else {
        setErrorMsg(res.message || "Failed to create course");
      }
    } catch (err) { setErrorMsg("Server error"); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Deleting this course will delete all associated programming labs. Proceed?")) return;
    try {
      const res = await api.deleteCourse(id);
      if (res.success) fetchAcademicData();
    } catch (err) { alert("Failed to delete course"); }
  };

  // Create Lab Subject
  const handleCreateLabSubject = async (e) => {
    e.preventDefault();
    if (!labForm.name || !labForm.code || !labForm.courseId || !labForm.requiredLanguage) return;
    setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await api.createLabSubject(labForm);
      if (res.success) {
        setSuccessMsg(`Programming Lab '${res.labSubject.name}' added!`);
        setLabForm({ name: "", code: "", courseId: "", requiredLanguage: "c", description: "" });
        fetchAcademicData();
      } else {
        setErrorMsg(res.message || "Failed to create lab subject");
      }
    } catch (err) { setErrorMsg("Server error"); }
  };

  const handleDeleteLabSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this programming lab?")) return;
    try {
      const res = await api.deleteLabSubject(id);
      if (res.success) fetchAcademicData();
    } catch (err) { alert("Failed to delete lab subject"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("depts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "depts"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" /> 1. Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "courses"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> 2. Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("labs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "labs"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-violet-400" /> 3. Labs ({labs.length})
        </button>

        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "hierarchy"
              ? "bg-gradient-to-r from-violet-600/30 to-cyan-600/30 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Full Tree View
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === "depts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateDepartment} className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Add New Department
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department Name *</label>
              <input
                type="text"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department Code *</label>
              <input
                type="text"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                placeholder="e.g. CSE"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                placeholder="e.g. School of Computing & AI"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl neu-btn-primary font-bold text-xs shadow-md cursor-pointer">
              + Save Department
            </button>
          </form>

          <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 bg-[#090e1a] border-b border-white/10 font-bold text-xs text-white flex items-center justify-between">
              <span>Existing Departments</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                {departments.length} Total
              </span>
            </div>

            {departments.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No Departments Found</p>
                <p className="text-[11px] text-slate-400">
                  Use the form to add your institution's academic departments.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {departments.map((d) => (
                  <div key={d._id} className="p-4 flex items-start justify-between hover:bg-white/5 text-xs transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{d.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#090e1a] text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
                          {d.code}
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{d.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(d._id)}
                      className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateCourse} className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Add Course / Program
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Department *</label>
              <select
                value={courseForm.departmentId}
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs bg-[#090e1a] focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course / Program Name *</label>
              <input
                type="text"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                placeholder="e.g. B.Tech Computer Science"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Code *</label>
              <input
                type="text"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                placeholder="e.g. BTECH-CSE"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl neu-btn-primary font-bold text-xs shadow-md cursor-pointer">
              + Save Course / Program
            </button>
          </form>

          <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 bg-[#090e1a] border-b border-white/10 font-bold text-xs text-white">Existing Courses</div>
            <div className="divide-y divide-white/5">
              {courses.map((c) => (
                <div key={c._id} className="p-4 flex items-center justify-between hover:bg-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-[#090e1a] text-cyan-300 font-mono text-[10px] border border-cyan-500/20">{c.code}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Department: {c.department?.name || "N/A"}</div>
                  </div>
                  <button onClick={() => handleDeleteCourse(c._id)} className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROGRAMMING LABS */}
      {activeTab === "labs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateLabSubject} className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" /> Add Programming Lab Subject
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Course / Program *</label>
              <select
                value={labForm.courseId}
                onChange={(e) => setLabForm({ ...labForm, courseId: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs bg-[#090e1a] focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code}) - Dept: {c.department?.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lab Subject Name *</label>
              <input
                type="text"
                value={labForm.name}
                onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
                placeholder="e.g. C Programming Lab"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lab Code *</label>
              <input
                type="text"
                value={labForm.code}
                onChange={(e) => setLabForm({ ...labForm, code: e.target.value })}
                placeholder="e.g. CS101"
                required
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-violet-400" /> Locked Programming Language *
              </label>
              <select
                value={labForm.requiredLanguage}
                onChange={(e) => setLabForm({ ...labForm, requiredLanguage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl neu-input text-white text-xs bg-[#090e1a] font-mono uppercase focus:outline-none cursor-pointer"
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl neu-btn-primary font-bold text-xs shadow-md cursor-pointer">
              + Save Programming Lab
            </button>
          </form>

          <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 bg-[#090e1a] border-b border-white/10 font-bold text-xs text-white">Existing Programming Labs</div>
            <div className="divide-y divide-white/5">
              {labs.map((l) => (
                <div key={l._id} className="p-4 flex items-center justify-between hover:bg-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{l.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-[#090e1a] text-slate-300 font-mono text-[10px] border border-white/10">{l.code}</span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono text-[10px] uppercase font-bold">
                      {l.requiredLanguage}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Course: {l.course?.name || "N/A"} &bull; Dept: {l.department?.name || "N/A"}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteLabSubject(l._id)} className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HIERARCHY TREE VIEW */}
      {activeTab === "hierarchy" && (
        <div className="space-y-4">
          {hierarchy.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-400 text-xs rounded-3xl border border-white/10">
              No academic hierarchy nodes defined yet. Start by adding Departments, Courses, and Labs.
            </div>
          ) : (
            hierarchy.map((dept) => (
              <div key={dept._id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3.5 shadow-md">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#090e1a] text-cyan-300 font-mono text-xs font-bold border border-cyan-500/20">{dept.code}</span>
                </div>

                <div className="pl-6 space-y-3 border-l-2 border-white/10 ml-2">
                  {dept.courses?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No courses in this department.</p>
                  ) : (
                    dept.courses.map((course) => (
                      <div key={course._id} className="bg-[#090e1a] p-4 rounded-2xl border border-white/5 space-y-2.5 shadow-inner">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-xs font-bold text-slate-200">{course.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#050811] text-slate-400 font-mono text-[10px]">{course.code}</span>
                        </div>

                        <div className="pl-5 space-y-2">
                          {course.labs?.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">No programming labs configured for this course.</p>
                          ) : (
                            course.labs.map((lab) => (
                              <div key={lab._id} className="text-xs flex items-center justify-between text-slate-300 bg-[#050811] px-3.5 py-2 rounded-xl border border-white/5">
                                <span className="flex items-center gap-2">
                                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="font-bold text-white">{lab.name}</span>
                                  <span className="font-mono text-[10px] text-slate-400">({lab.code})</span>
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-mono text-[10px] font-bold uppercase border border-violet-500/30">
                                  Locked: {lab.requiredLanguage}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
