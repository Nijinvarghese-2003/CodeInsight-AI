export default function InputField({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-cyan-400 font-bold">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-violet-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full py-2.5 rounded-xl neu-input text-white text-xs placeholder:text-slate-500 focus:outline-none transition-all duration-200 ${
            Icon ? "pl-10 pr-3.5" : "px-3.5"
          } ${error ? "border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : ""}`}
        />
      </div>
      {error && <p className="text-[11px] font-medium text-rose-400 mt-1 flex items-center gap-1">{error}</p>}
    </div>
  );
}
