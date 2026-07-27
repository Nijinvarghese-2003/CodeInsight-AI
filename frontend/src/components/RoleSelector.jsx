import { GraduationCap, BookOpenCheck, ShieldCheck } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student", icon: GraduationCap, ring: "ring-role-student", text: "text-role-student" },
  { value: "faculty", label: "Faculty", icon: BookOpenCheck, ring: "ring-role-faculty", text: "text-role-faculty" },
  { value: "admin", label: "Admin", icon: ShieldCheck, ring: "ring-role-admin", text: "text-role-admin" },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-400">
        I am registering as
      </label>
      <div className="neu-pressed grid grid-cols-3 gap-1.5 rounded-xl bg-base-850 p-1.5">
        {ROLES.map(({ value: v, label, icon: Icon, ring, text }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? `shadow-neu-raised-sm bg-base-800 ring-1 ${ring} ${text}`
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
