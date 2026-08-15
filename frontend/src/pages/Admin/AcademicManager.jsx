import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Building2, BookOpen, Code2, Plus, Trash2, Layers, CheckCircle, Lock } from "lucide-react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("depts")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "depts"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> 1. Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "courses"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 2. Courses / Programs ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("labs")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "labs"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> 3. Programming Labs ({labs.length})
        </button>

        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "hierarchy"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Full Academic Tree View
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === "depts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateDepartment} className="lg:col-span-5 glass p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> Add New Department
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Department Name *</label>
              <input
                type="text"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Department Code *</label>
              <input
                type="text"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                placeholder="e.g. CSE"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                placeholder="e.g. School of Computing & AI"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              + Save Department
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 font-bold text-xs text-white flex items-center justify-between">
              <span>Existing Departments</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                {departments.length} Total
              </span>
            </div>

            {departments.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Departments Found</p>
                <p className="text-xs text-slate-500">
                  Use the form on the left to add your institution's academic departments.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {departments.map((d) => (
                  <div key={d._id} className="p-4 flex items-start justify-between hover:bg-white/5 text-xs transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{d.name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] font-semibold border border-amber-500/20">
                          {d.code}
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{d.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(d._id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
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
          <form onSubmit={handleCreateCourse} className="lg:col-span-5 glass p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> Add Course / Program
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Select Department *</label>
              <select
                value={courseForm.departmentId}
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs bg-slate-900 focus:outline-none"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Course / Program Name *</label>
              <input
                type="text"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                placeholder="e.g. B.Tech Computer Science"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Course Code *</label>
              <input
                type="text"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                placeholder="e.g. BTECH-CSE"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              + Save Course / Program
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 font-bold text-xs text-white">Existing Courses</div>
            <div className="divide-y divide-white/5">
              {courses.map((c) => (
                <div key={c._id} className="p-4 flex items-center justify-between hover:bg-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{c.code}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Department: {c.department?.name || "N/A"}</div>
                  </div>
                  <button onClick={() => handleDeleteCourse(c._id)} className="text-slate-400 hover:text-rose-400 p-1">
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
          <form onSubmit={handleCreateLabSubject} className="lg:col-span-5 glass p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> Add Programming Lab Subject
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Select Course / Program *</label>
              <select
                value={labForm.courseId}
                onChange={(e) => setLabForm({ ...labForm, courseId: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs bg-slate-900 focus:outline-none"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code}) - Dept: {c.department?.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Lab Subject Name *</label>
              <input
                type="text"
                value={labForm.name}
                onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
                placeholder="e.g. C Programming Lab"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Lab Code *</label>
              <input
                type="text"
                value={labForm.code}
                onChange={(e) => setLabForm({ ...labForm, code: e.target.value })}
                placeholder="e.g. CS101"
                required
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Locked Programming Language *
              </label>
              <select
                value={labForm.requiredLanguage}
                onChange={(e) => setLabForm({ ...labForm, requiredLanguage: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl neu-input text-white text-xs bg-slate-900 font-mono uppercase focus:outline-none"
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              + Save Programming Lab
            </button>
          </form>

          <div className="lg:col-span-7 glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 font-bold text-xs text-white">Existing Programming Labs</div>
            <div className="divide-y divide-white/5">
              {labs.map((l) => (
                <div key={l._id} className="p-4 flex items-center justify-between hover:bg-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white">{l.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{l.code}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] uppercase font-bold">
                      {l.requiredLanguage}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Course: {l.course?.name || "N/A"} &bull; Dept: {l.department?.name || "N/A"}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteLabSubject(l._id)} className="text-slate-400 hover:text-rose-400 p-1">
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
            <div className="glass p-8 text-center text-slate-400 text-xs">
              No academic hierarchy nodes defined yet. Start by adding Departments, Courses, and Labs.
            </div>
          ) : (
            hierarchy.map((dept) => (
              <div key={dept._id} className="glass p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-semibold">{dept.code}</span>
                </div>

                <div className="pl-6 space-y-3 border-l-2 border-white/10 ml-2">
                  {dept.courses?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No courses in this department.</p>
                  ) : (
                    dept.courses.map((course) => (
                      <div key={course._id} className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-xs font-semibold text-slate-200">{course.name}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">{course.code}</span>
                        </div>

                        <div className="pl-5 space-y-1.5">
                          {course.labs?.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic">No programming labs configured for this course.</p>
                          ) : (
                            course.labs.map((lab) => (
                              <div key={lab._id} className="text-xs flex items-center justify-between text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/5">
                                <span className="flex items-center gap-2">
                                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="font-medium text-white">{lab.name}</span>
                                  <span className="font-mono text-[10px] text-slate-400">({lab.code})</span>
                                </span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-500/20">
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
