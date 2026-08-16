import { GraduationCap, BookOpen, Shield } from "lucide-react";

export default function RoleSelector({ value = "student", onChange }) {
  const roles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "cyan" },
    { id: "faculty", label: "Faculty", icon: BookOpen, color: "violet" },
    { id: "admin", label: "Admin", icon: Shield, color: "amber" },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300">
        Select Account Role <span className="text-cyan-400 font-bold">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? r.id === "student"
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : r.id === "faculty"
                    ? "bg-violet-500/15 text-violet-300 border-violet-400/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    : "bg-amber-500/15 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-[#090e1a]/80 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
