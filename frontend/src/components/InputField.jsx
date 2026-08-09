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
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-teal-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
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
          className={`w-full py-2.5 rounded-xl neu-input text-white text-xs focus:outline-none transition-colors ${
            Icon ? "pl-9 pr-3.5" : "px-3.5"
          } ${error ? "border-rose-500/50" : ""}`}
        />
      </div>
      {error && <p className="text-[11px] text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
}
