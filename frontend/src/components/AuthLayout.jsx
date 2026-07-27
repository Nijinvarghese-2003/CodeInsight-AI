import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Fingerprint } from "lucide-react";

const ROLE_GLOW = {
  student: "#2dd4bf",
  faculty: "#a78bfa",
  admin: "#fbbf24",
};

/**
 * Split-screen shell used by both Login and Signup.
 * Left panel: signature "campus ID card" element, tilts gently on mouse move
 *   and glows in the active role's color.
 * Right panel: glass card that wraps whatever form is passed as children.
 */
export default function AuthLayout({ mode, activeRole = "student", children }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const glow = ROLE_GLOW[activeRole] ?? ROLE_GLOW.student;

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-base-900 px-4 py-10">
      <div className="grain" />

      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/5 bg-base-850/60 shadow-2xl shadow-black/60 lg:flex-row">
        {/* Left: branding / signature element */}
        <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-base-850 p-10 lg:flex">
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-[90px] transition-colors duration-700 animate-glow"
            style={{ backgroundColor: glow, opacity: 0.35 }}
          />

          <div className="relative flex items-center gap-2 text-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-800 shadow-neu-raised-sm">
              <Fingerprint size={18} strokeWidth={1.75} style={{ color: glow }} />
            </div>
            <span className="font-display text-sm font-semibold tracking-wide">CampusOS</span>
          </div>

          {/* Signature element: floating neumorphic ID card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="relative mx-auto my-10 flex h-56 w-72 items-center justify-center [perspective:1000px]"
          >
            <div
              className="animate-float h-full w-full rounded-2xl bg-base-800 p-5 shadow-neu-raised transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                "--tilt": "-4deg",
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-2 w-16 rounded-full bg-white/10" />
                    <div className="mt-2 h-1.5 w-10 rounded-full bg-white/5" />
                  </div>
                  <div
                    className="h-9 w-9 rounded-full shadow-neu-pressed-sm"
                    style={{ backgroundColor: `${glow}22`, border: `1px solid ${glow}55` }}
                  />
                </div>

                <div className="h-14 w-full rounded-lg shadow-neu-pressed-sm bg-base-850" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-24 rounded-full bg-white/10" />
                    <div className="h-1.5 w-16 rounded-full bg-white/5" />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-medium capitalize"
                    style={{ color: glow, backgroundColor: `${glow}18` }}
                  >
                    {activeRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="font-display text-xl font-semibold leading-snug text-slate-100">
              One identity.
              <br />
              Every corner of campus.
            </p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Students, faculty and admins sign in through the same door — your role decides
              what's behind it.
            </p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="glass scroll-thin w-full overflow-y-auto p-8 sm:p-10 lg:max-h-[640px] lg:w-[58%]">
          <div className="mx-auto max-w-sm animate-fade-up">
            <h1 className="font-display text-2xl font-semibold text-slate-100">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {mode === "signup"
                ? "Register with your campus details to get started."
                : "Sign in to continue to your dashboard."}
            </p>

            <div className="mt-7">{children}</div>

            <p className="mt-7 text-center text-sm text-slate-500">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-slate-200 hover:underline">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link to="/signup" className="font-medium text-slate-200 hover:underline">
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
