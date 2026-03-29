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
  selectedId: T | T[];
  onSelect: (id: T) => void;
  align?: "left" | "right";
  className?: string;
  multi?: boolean;
  multiLabel?: string;
  placeholder?: string;
}

export function Select<T extends string | number | undefined>({
  options,
  selectedId,
  onSelect,
  align = "right",
  className = "",
  multi = false,
  multiLabel = "items",
  placeholder = "Select...",
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSelected = (id: T) => {
    if (multi && Array.isArray(selectedId)) {
      return selectedId.includes(id);
    }
    return selectedId === id;
  };

  const selectedOptions = options.filter((o) => isSelected(o.id));
  const primaryOption = multi ? selectedOptions[0] : options.find((o) => o.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex(o => isSelected(o.id));
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onSelect(options[highlightedIndex].id);
          if (!multi) setIsOpen(false);
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const getButtonLabel = () => {
    if (!multi) return primaryOption?.label || placeholder;
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    if (selectedOptions.length === options.length) return "All " + multiLabel;
    if (selectedOptions.length === options.length - 1 && options.some(o => o.id === undefined)) return "All " + multiLabel;
    return `${selectedOptions.length} ${multiLabel}`;
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-[color:var(--foreground)] transition hover:border-white/20 hover:bg-white/20 cursor-pointer h-8 outline-none focus-visible:ring-1 focus-visible:ring-white backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {!multi && primaryOption?.color && (
          <span
            className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white"
            style={{ background: primaryOption.color }}
          ></span>
        )}
        {!multi && primaryOption?.icon && (
          <span className="shrink-0">{primaryOption.icon}</span>
        )}
        <span className="font-medium truncate max-w-[130px]">
          {getButtonLabel()}
        </span>
        {!multi && primaryOption?.isAi && (
          <span className="inline-flex items-center rounded-md bg-white/5 px-1 py-0.5 text-[8px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10 shrink-0">
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
        <div
          className={`absolute ${align === "left" ? "left-0" : "right-0"} z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[color:var(--panel-strong)] shadow-xl animate-in fade-in zoom-in duration-100`}
          role="listbox"
        >
          <div className="max-h-80 overflow-y-auto">
            {options.map((option, idx) => {
              const selected = isSelected(option.id);
              const highlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${option.id}-${idx}`}
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition cursor-pointer ${selected ? "bg-white/20" : ""
                    } ${highlighted ? "bg-white/10" : ""}`}
                  onClick={() => {
                    onSelect(option.id);
                    if (!multi) setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  ref={(el) => {
                    if (highlighted && el) {
                      el.scrollIntoView({ block: "nearest" });
                    }
                  }}
                >
                  {option.color && (
                    <span
                      className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white"
                      style={{ background: option.color }}
                    ></span>
                  )}
                  {option.icon && (
                    <span className="shrink-0">{option.icon}</span>
                  )}
                  <span className={`font-medium ${selected ? "text-[color:var(--accent)]" : "text-[color:var(--foreground)]"}`}>
                    {option.label}
                  </span>
                  {option.isAi && (
                    <span className="inline-flex items-center rounded-md bg-white/5 px-1 py-0.5 text-[8px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10 shrink-0">
                      AI
                    </span>
                  )}
                  {selected && (
                    <svg className="ml-auto h-3 w-3 text-[color:var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
