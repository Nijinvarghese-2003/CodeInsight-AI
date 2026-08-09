import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Hash,
  Layers,
  BookMarked,
  Building2,
  Briefcase,
  IdCard,
  Loader2,
  BookOpen,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import InputField from "../../components/InputField";
import RoleSelector from "../../components/RoleSelector";
import { api } from "../../services/api";

const INITIAL_STATE = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "student",
  phone: "",

  // Department & Course (Created by Admin)
  department: "",
  course: "",

  // Student fields
  studentId: "",
  rollNo: "",
  semester: "",
  batch: "",

  // Faculty fields
  employeeId: "",
  designation: "",
};

export default function Signup({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pendingNotice, setPendingNotice] = useState(null);

  // Departments & Courses fetched from Admin setup
  const [departments, setDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const res = await api.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleDepartmentChange = async (deptId) => {
    setForm((prev) => ({ ...prev, department: deptId, course: "" }));
    if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));

    if (!deptId) {
      setAvailableCourses([]);
      return;
    }

    try {
      const coursesRes = await api.getCourses(deptId);
      if (coursesRes.success) {
        setAvailableCourses(coursesRes.courses || []);
      }
    } catch (err) {
      console.error("Failed to load courses for department", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";

    if (!form.department) next.department = "Department selection is required";

    if (form.role === "student") {
      if (!form.course) next.course = "Course selection is required";
      if (!form.rollNo.trim() && !form.studentId.trim()) {
        next.rollNo = "Student ID or Roll number is required for pre-verification";
      }
    }

    if (form.role === "faculty") {
      if (!form.employeeId.trim()) {
        next.employeeId = "Faculty / Employee ID is required for pre-verification";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    setPendingNotice(null);

    const { confirmPassword, ...payload } = form;

    try {
      const data = await api.signup(payload);
      if (!data.success) throw new Error(data.message || "Registration failed");

      if (data.pendingApproval) {
        setPendingNotice(
          data.message ||
            "Registration details verified! Your account is now pending Admin approval and lab subject assignment."
        );
        return;
      }

      if (onLoginSuccess && data.token && data.user) {
        onLoginSuccess(data.user, data.token);
        if (data.user.role === "student") navigate("/student/dashboard");
        else if (data.user.role === "faculty") navigate("/faculty/dashboard");
        else if (data.user.role === "admin") navigate("/admin/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingNotice) {
    return (
      <AuthLayout mode="signup" activeRole="faculty">
        <div className="space-y-6 text-center animate-fade-up py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Clock className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Registration Submitted</h2>
            <p className="text-xs text-purple-300 font-medium mt-1">Pending Admin Approval & Lab Subject Assignment</p>
          </div>

          <div className="glass p-4 rounded-xl border border-purple-500/30 text-xs text-slate-300 leading-relaxed text-left space-y-2">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Pre-Verification Passed:</strong> Your Faculty ID and Official Email match campus records.</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Admin Approval Required:</strong> An administrator will assign your teaching lab subjects and activate your account shortly.</span>
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-400 transition-colors shadow-lg cursor-pointer"
          >
            Go to Login Page
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="signup" activeRole={form.role}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <RoleSelector value={form.role} onChange={handleRoleChange} />

        <InputField
          label="Full name"
          icon={User}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Official Email (Pre-verified)"
            icon={Mail}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@campus.edu"
            error={errors.email}
            required
          />
          <InputField
            label="Phone"
            icon={Phone}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            error={errors.password}
            required
          />
          <InputField
            label="Confirm password"
            icon={Lock}
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
          />
        </div>

        {/* DEPARTMENT DROPDOWN (Added by Admin) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-400" /> Select Department *
          </label>
          <div className="relative">
            <select
              name="department"
              value={form.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              required
              disabled={loadingDepts}
              className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs bg-slate-900 focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
            >
              <option value="">
                {loadingDepts ? "Loading departments..." : "-- Choose Department (Admin Added) --"}
              </option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {errors.department && <p className="text-[11px] text-rose-400">{errors.department}</p>}
          {!loadingDepts && departments.length === 0 && (
            <p className="text-[11px] text-amber-400">
              ⚠️ No departments added yet. Please ask an Administrator to add departments in the Admin Panel.
            </p>
          )}
        </div>

        {/* STUDENT ROLE FIELDS */}
        {form.role === "student" && (
          <div className="animate-fade-up space-y-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-role-student flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Student Verification & Program
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Student ID + Official Email will be verified against pre-approved campus records.
            </p>

            {/* COURSE DROPDOWN (Filtered by Selected Department) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Select Course / Program *
              </label>
              <div className="relative">
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  disabled={!form.department}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-input text-white text-xs bg-slate-900 focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="">
                    {form.department
                      ? availableCourses.length > 0
                        ? "-- Choose Course / Program --"
                        : "No courses found for this department"
                      : "-- Select Department First --"}
                  </option>
                  {availableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {errors.course && <p className="text-[11px] text-rose-400">{errors.course}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Student ID / Roll No *"
                icon={Hash}
                name="rollNo"
                value={form.rollNo}
                onChange={handleChange}
                placeholder="e.g. CS2026-001"
                error={errors.rollNo}
                required
              />
              <InputField
                label="Semester"
                icon={Layers}
                type="number"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="1–8"
              />
              <InputField
                label="Batch"
                icon={BookMarked}
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="2024–2028"
              />
            </div>
          </div>
        )}

        {/* FACULTY ROLE FIELDS */}
        {form.role === "faculty" && (
          <div className="animate-fade-up space-y-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-role-faculty flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Faculty Verification & Details
              </p>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Faculty ID + Official Email will be verified against campus records. <br />
              <strong className="text-purple-300">Lab subjects will be assigned by Administrator upon approval.</strong>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Faculty / Employee ID *"
                icon={IdCard}
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-101"
                error={errors.employeeId}
                required
              />
              <InputField
                label="Designation"
                icon={Briefcase}
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Assistant Professor"
              />
            </div>
          </div>
        )}

        {serverError && (
          <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="shadow-neu-raised-sm mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-role-student/90 to-role-faculty/90 py-3 text-sm font-semibold text-base-900 transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Verifying & Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}