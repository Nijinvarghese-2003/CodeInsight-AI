import { GraduationCap, BookOpen, Shield } from "lucide-react";

export default function RoleSelector({ value = "student", onChange }) {
  const roles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "teal" },
    { id: "faculty", label: "Faculty", icon: BookOpen, color: "purple" },
    { id: "admin", label: "Admin", icon: Shield, color: "amber" },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300">Select Role *</label>
      <div className="grid grid-cols-3 gap-2">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                isSelected
                  ? r.id === "student"
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                    : r.id === "faculty"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20"
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
