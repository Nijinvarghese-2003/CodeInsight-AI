import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, remember }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid email or password");

      // e.g. store token / redirect based on role returned by the API
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login" activeRole="student">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          label="Password"
          icon={Lock}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-base-800 accent-role-student"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-slate-400 hover:text-slate-200">
            Forgot password?
          </Link>
        </div>

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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}