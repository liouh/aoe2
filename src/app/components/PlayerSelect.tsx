"use client";

import { useState, useRef, useEffect } from "react";
import { type PlayerSummary } from "@/lib/replay";

interface PlayerSelectProps {
  players: PlayerSummary[];
  selectedPlayerId: number;
  onSelect: (playerId: number) => void;
  classifyColor: (playerId?: number) => string;
}

export function PlayerSelect({
  players,
  selectedPlayerId,
  onSelect,
  classifyColor,
}: PlayerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

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
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--panel)] px-3 py-1.5 text-xs text-[color:var(--foreground)] transition hover:border-white/20 hover:bg-white/5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: classifyColor(selectedPlayer?.id) }}
        ></span>
        <span className="font-medium truncate max-w-[100px]">
          {selectedPlayer?.name || "Select Player"}
        </span>
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
        <div className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[color:var(--panel-strong)] shadow-xl animate-in fade-in zoom-in duration-100">
          <div className="max-h-60 overflow-y-auto">
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition hover:bg-white/10 cursor-pointer ${
                  player.id === selectedPlayerId ? "bg-white/5" : ""
                }`}
                onClick={() => {
                  onSelect(player.id);
                  setIsOpen(false);
                }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: classifyColor(player.id) }}
                ></span>
                <span className={`font-medium ${player.id === selectedPlayerId ? "text-[color:var(--accent)]" : "text-[color:var(--foreground)]"}`}>
                  {player.name}
                </span>
                {player.id === selectedPlayerId && (
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
