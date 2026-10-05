interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <div className="relative rounded-full focus-within:ring-2 focus-within:ring-[color:var(--focus-ring)] focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-8 h-5 rounded-full transition-colors ${
            checked ? "bg-[color:var(--accent)]" : "bg-[color:var(--toggle-track)]"
          }`}
        />
        <div
          className={`absolute left-1 top-1 bg-[#ffffff] shadow-sm w-3 h-3 rounded-full transition-transform ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] group-hover:text-[color:var(--foreground)] transition-colors">
        {label}
      </span>
    </label>
  );
}
