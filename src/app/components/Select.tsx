"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption<T> {
  id: T;
  label: string;
  color?: string;
  icon?: string;
  isAi?: boolean;
}

interface SelectProps<T> {
  options: SelectOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  align?: "left" | "right";
  className?: string;
}

export function Select<T extends string | number | undefined>({
  options,
  selectedId,
  onSelect,
  align = "right",
  className = "",
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--panel)] px-3 py-1.5 text-xs text-[color:var(--foreground)] transition hover:border-white/20 hover:bg-white/5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.color && (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: selectedOption.color }}
          ></span>
        )}
        {selectedOption?.icon && (
          <span className="shrink-0">{selectedOption.icon}</span>
        )}
        <span className="font-medium truncate max-w-[200px]">
          {selectedOption?.label || "Select..."}
        </span>
        {selectedOption?.isAi && (
          <span className="inline-flex items-center rounded-md bg-white/5 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40 ring-1 ring-inset ring-white/10 shrink-0">
            AI
          </span>
        )}
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute ${align === "left" ? "left-0" : "right-0"} z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[color:var(--panel-strong)] shadow-xl animate-in fade-in zoom-in duration-100`}>
          <div className="max-h-80 overflow-y-auto">
            {options.map((option, idx) => (
              <button
                key={`${option.id}-${idx}`}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition hover:bg-white/10 cursor-pointer ${option.id === selectedId ? "bg-white/5" : ""
                  }`}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
              >
                {option.color && (
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: option.color }}
                  ></span>
                )}
                {option.icon && (
                  <span className="shrink-0">{option.icon}</span>
                )}
                <span className={`font-medium ${option.id === selectedId ? "text-[color:var(--accent)]" : "text-[color:var(--foreground)]"}`}>
                  {option.label}
                </span>
                {option.isAi && (
                  <span className="inline-flex items-center rounded-md bg-white/5 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40 ring-1 ring-inset ring-white/10 shrink-0">
                    AI
                  </span>
                )}
                {option.id === selectedId && (
                  <svg className="ml-auto h-3 w-3 text-[color:var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
