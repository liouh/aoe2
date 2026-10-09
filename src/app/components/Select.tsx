"use client";

import { useState, useRef, useEffect, Fragment } from "react";

export interface SelectOption<T> {
  id: T;
  label: string;
  color?: string;
  icon?: string;
  dividerAbove?: boolean;
  divider?: boolean;
  dividerLabel?: string;
}

interface SelectProps<T> {
  options: SelectOption<T>[];
  selectedId: T | T[];
  onSelect: (id: T) => void;
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
  multi?: boolean;
  multiLabel?: string;
  singleLabel?: string;
  placeholder?: string;
  closeOnSelect?: boolean;
  iconOnly?: boolean;
}

export function Select<T extends string | number | undefined>({
  options,
  selectedId,
  onSelect,
  align = "right",
  className = "",
  buttonClassName = "",
  multi = false,
  multiLabel = "items",
  singleLabel,
  placeholder = "Select...",
  closeOnSelect = !multi,
  iconOnly = false,
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

  const openSelect = () => {
    const currentIndex = options.findIndex((o) => isSelected(o.id));
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsOpen(true);
  };

  const closeSelect = () => {
    setHighlightedIndex(-1);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSelect();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openSelect();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onSelect(options[highlightedIndex].id);
          if (closeOnSelect) closeSelect();
        }
        break;
      case "Escape":
      case "Tab":
        closeSelect();
        break;
    }
  };

  const getButtonLabel = () => {
    if (!multi) return primaryOption?.label || placeholder;
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) {
      return `1 ${singleLabel || (multiLabel.endsWith("s") ? multiLabel.slice(0, -1) : multiLabel)}`;
    }
    return `${selectedOptions.length} ${multiLabel}`;
  };

  const hasAnyLeading = options.some((o) => o.color || o.icon);

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        title={primaryOption?.label}
        aria-label={primaryOption?.label || placeholder}
        className={`flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--panel)]/90 px-3 py-1.5 text-xs text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-strong)] cursor-pointer h-8 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] backdrop-blur-sm ${className.includes("w-") ? "w-full" : ""} ${buttonClassName}`}
        onClick={() => (isOpen ? closeSelect() : openSelect())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {!multi && (primaryOption?.color || primaryOption?.icon) && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center leading-none">
            {primaryOption.color ? (
              <span
                className={`${iconOnly ? "h-2.5 w-2.5" : "h-2 w-2"} rounded-full ring-1 ring-white`}
                style={{ background: primaryOption.color }}
              ></span>
            ) : (
              <span className={`${iconOnly ? "text-[13px]" : "text-[12px]"} leading-none select-none`}>{primaryOption.icon}</span>
            )}
          </span>
        )}
        {!iconOnly && (
          <span className="tabular-nums font-medium truncate flex-1 text-left min-w-0 max-w-[170px]">
            {getButtonLabel()}
          </span>
        )}
        <svg
          className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""} ${iconOnly ? "" : "ml-auto"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "left" ? "left-0" : "right-0"} z-50 mt-1 min-w-full w-max max-w-xs overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-strong)] shadow-xl animate-in fade-in zoom-in duration-100`}
          role="listbox"
        >
          {options.map((option, idx) => {
            const selected = isSelected(option.id);
            const highlighted = idx === highlightedIndex;
            return (
              <Fragment key={`${option.id}-${idx}`}>
                {(option.dividerAbove || option.divider) && idx > 0 && (
                  <div className="mb-1 border-t border-[color:var(--border-subtle)]" role="separator" />
                )}
                {option.dividerLabel && (
                  <div className={`px-3.5 ${idx === 0 ? "pt-2" : "pt-1.5"} pb-1 text-[10px] font-medium text-[color:var(--muted)] select-none`}>
                    {option.dividerLabel}
                  </div>
                )}
                <button
                  type="button"
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs transition cursor-pointer ${highlighted ? "bg-white/10" : ""}`}
                  onClick={() => {
                    onSelect(option.id);
                    if (closeOnSelect) closeSelect();
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
                  {hasAnyLeading && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center leading-none">
                      {option.color ? (
                        <span
                          className="h-2 w-2 rounded-full ring-1 ring-white"
                          style={{ background: option.color }}
                        ></span>
                      ) : option.icon ? (
                        <span className="text-[12px] leading-none select-none">{option.icon}</span>
                      ) : null}
                    </span>
                  )}
                  <span className="font-medium whitespace-nowrap text-[color:var(--foreground)]">
                    {option.label}
                  </span>
                  <svg
                    className={`h-3 w-3 text-[color:var(--accent)] shrink-0 ml-auto ${selected ? "" : "invisible"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
