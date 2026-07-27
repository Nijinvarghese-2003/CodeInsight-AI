import { useState } from "react";
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
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import RoleSelector from "../components/RoleSelector";

const INITIAL_STATE = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    phone: "",
    // student
    studentId: "",
    rollNo: "",
    semester: "",
    batch: "",
    department: "",
    // faculty
    employeeId: "",
    designation: "",
};

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_STATE);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleRoleChange = (role) => setForm((prev) => ({ ...prev, role }));

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Name is required";
        if (!form.email.trim()) next.email = "Email is required";
        if (form.password.length < 6) next.password = "Password must be at least 6 characters";
        if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";

        if (form.role === "student") {
            if (!form.rollNo.trim()) next.rollNo = "Roll number is required";
            if (!form.department.trim()) next.department = "Department is required";
        }
        if (form.role === "faculty") {
            if (!form.employeeId.trim()) next.employeeId = "Employee ID is required";
            if (!form.department.trim()) next.department = "Department is required";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError("");

        // Build only the fields relevant to the selected role
        const { confirmPassword, studentId, rollNo, semester, batch, employeeId, designation, ...common } = form;
        const payload = {
            ...common,
            ...(form.role === "student" && { studentId, rollNo, semester: semester || null, batch }),
            ...(form.role === "faculty" && { employeeId, designation }),
        };

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");
            navigate("/login");
        } catch (err) {
            setServerError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                    placeholder="Ada Lovelace"
                    error={errors.name}
                    required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                        label="Email"
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

                {/* Role-conditional fields */}
                {form.role === "student" && (
                    <div className="animate-fade-up space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-role-student">
                            Student details
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label="Roll number"
                                icon={Hash}
                                name="rollNo"
                                value={form.rollNo}
                                onChange={handleChange}
                                placeholder="CS21B045"
                                error={errors.rollNo}
                                required
                            />
                            <InputField
                                label="Student ID"
                                icon={IdCard}
                                name="studentId"
                                value={form.studentId}
                                onChange={handleChange}
                                placeholder="Optional"
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
                        <InputField
                            label="Department"
                            icon={Building2}
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="Computer Science"
                            error={errors.department}
                            required
                        />
                    </div>
                )}

                {form.role === "faculty" && (
                    <div className="animate-fade-up space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-role-faculty">
                            Faculty details
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label="Employee ID"
                                icon={IdCard}
                                name="employeeId"
                                value={form.employeeId}
                                onChange={handleChange}
                                placeholder="EMP-1042"
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
                        <InputField
                            label="Department"
                            icon={Building2}
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="Electronics & Comm."
                            error={errors.department}
                            required
                        />
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
                    className="shadow-neu-raised-sm mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-role-student/90 to-role-faculty/90 py-3 text-sm font-semibold text-base-900 transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>
        </AuthLayout>
    );
}