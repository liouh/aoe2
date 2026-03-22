"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Select } from "./Select";
import { isEconomic } from "./StatsTab";
import { getUnitName, getBuildingName } from "@/lib/entityNames";
import { getTechName } from "@/lib/techMappings";
import { type TimelineEvent, type PlayerSummary, type PlayerStats } from "@/lib/replayProcessor";

const TIMELINE_MARKER_INTERVAL = 300;
const TIMELINE_PX_PER_SECOND = 2;
const TIMELINE_CONSOLIDATION_WINDOW_SECONDS = 5;

function consolidateEvents(events: TimelineEvent[], windowSeconds: number = TIMELINE_CONSOLIDATION_WINDOW_SECONDS) {
  if (events.length === 0) return [];

  const consolidated: (TimelineEvent & {
    count: number;
    isMilitary?: boolean;
    items: Map<string, number>;
    label?: string;
  })[] = [];

  const activeGroups = new Map<string, any>();

  for (const event of events) {
    const identity = event.category;
    const current = activeGroups.get(identity);

    const amount = typeof event.raw?.amount === "number" && event.raw.amount > 0
      ? event.raw.amount
      : 1;

    let itemLabel = "Unknown Event";
    if (event.category === "build") {
      itemLabel = getBuildingName(event.buildingTypeId);
    } else if (event.category === "train") {
      itemLabel = getUnitName(event.unitTypeId);
    } else if (event.category === "research") {
      itemLabel = getTechName(event.techId);
    }

    const isMil = event.category === "train" && !isEconomic(itemLabel);

    if (current && event.time - current.time <= windowSeconds) {
      current.count += amount;
      current.items.set(itemLabel, (current.items.get(itemLabel) || 0) + amount);
      if (isMil) current.isMilitary = true;
    } else {
      const newGroup = {
        ...event,
        count: amount,
        isMilitary: isMil,
        items: new Map([[itemLabel, amount]])
      };
      consolidated.push(newGroup);
      activeGroups.set(identity, newGroup);
    }
  }

  for (const group of consolidated) {
    const parts = Array.from(group.items.entries()).map(([name, count]) =>
      (count > 1 && group.category !== "research") ? `${name} x${count}` : name
    );
    group.label = parts.join(" + ");
  }

  return consolidated.sort((a, b) => a.time - b.time);
}

interface TimelineTabProps {
  players: PlayerSummary[];
  events: TimelineEvent[];
  duration: number;
  timelineStats: PlayerStats[];
  selectedTime: number;
  getPlayerColor: (playerId?: number) => string;
  formatClock: (seconds: number) => string;
  pendingJump?: boolean;
  onJumpComplete?: () => void;
}

export function TimelineTab({
  players,
  events,
  duration,
  timelineStats,
  selectedTime,
  getPlayerColor,
  formatClock,
  pendingJump,
  onJumpComplete,
}: TimelineTabProps) {
  const [leftPlayerId, setLeftPlayerId] = useState<number | null>(null);
  const [rightPlayerId, setRightPlayerId] = useState<number | null>(null);
  const [timelineShowBuildings, setTimelineShowBuildings] = useState(true);
  const [timelineShowUnits, setTimelineShowUnits] = useState(true);
  const [timelineShowResearch, setTimelineShowResearch] = useState(true);

  const timelineRef = useRef<HTMLElement>(null);

  // Initialize player selections
  useEffect(() => {
    if (players.length > 0) {
      if (leftPlayerId === null) setLeftPlayerId(players[0].id);
      if (rightPlayerId === null) {
        const next = players.find((p) => p.id !== players[0].id)?.id ?? players[0].id;
        setRightPlayerId(next);
      }
    }
  }, [players, leftPlayerId, rightPlayerId]);

  // Handle scrolling (automatic tracking and pending jumps)
  useEffect(() => {
    if (pendingJump && timelineRef.current) {
      // Use double requestAnimationFrame to ensure the layout has stabilized after tab switch
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!timelineRef.current) return;
          const targetOffset = selectedTime * TIMELINE_PX_PER_SECOND;
          const containerTop = timelineRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: containerTop + targetOffset,
            behavior: "smooth",
          });
          onJumpComplete?.();
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [selectedTime, pendingJump, onJumpComplete]);

  const timelineHeight = useMemo(() => duration * TIMELINE_PX_PER_SECOND, [duration]);

  const renderColumn = (playerId: number | null, index: number) => {
    if (playerId === null) return null;
    const player = players.find((p) => p.id === playerId);
    if (!player) return null;

    const playerEvents = events.filter((e) => e.playerId === playerId);
    const research = playerEvents.filter((e) => e.category === "research" && timelineShowResearch);
    const builds = playerEvents.filter((e) => e.category === "build" && timelineShowBuildings && !e.raw?.isInitial);
    const trains = playerEvents.filter((e) => e.category === "train" && timelineShowUnits);

    return (
      <div key={`column-${index}`} className={`panel-strong rounded-2xl ${index === 1 ? 'hidden md:block' : ''}`}>
        <div className="sticky top-0 z-30 flex items-center justify-between gap-2 p-4 bg-[color:var(--panel-strong)]/50 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold leading-tight flex items-center gap-2">
                {player.name}
                {player.ai && (
                  <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 font-normal text-[10px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10">
                    AI
                  </span>
                )}
              </h3>
            </div>
          </div>
          <Select
            options={players.map(p => ({ id: p.id, label: p.name, color: getPlayerColor(p.id), isAi: p.ai }))}
            selectedId={playerId}
            onSelect={(value) => {
              if (index === 0) {
                setLeftPlayerId(value);
                if (value === rightPlayerId && players.length > 1) {
                  setRightPlayerId(players.find(p => p.id !== value)?.id ?? value);
                }
              } else {
                setRightPlayerId(value);
                if (value === leftPlayerId && players.length > 1) {
                  setLeftPlayerId(players.find(p => p.id !== value)?.id ?? value);
                }
              }
            }}
          />
        </div>
        <div
          className="relative w-full bg-[#1c1610] rounded-b-xl"
          style={{ height: timelineHeight }}
        >
          {Array.from({ length: Math.floor(duration / TIMELINE_MARKER_INTERVAL) + 1 }).map((_, i) => {
            const markerTime = i * TIMELINE_MARKER_INTERVAL;
            return (
              <div
                key={`marker-${markerTime}`}
                className="absolute left-0 w-full border-t border-[color:var(--panel)] pointer-events-none"
                style={{ top: `${(markerTime / Math.max(duration, 1)) * 100}%` }}
              >
                {i !== 0 && (
                  <span className="absolute left-[2px] text-[9px] font-medium tabular-nums text-[color:var(--muted-foreground)] opacity-30">
                    {markerTime / 60 + "'"}
                  </span>
                )}
              </div>
            );
          })}
          <div className="absolute left-8 top-0 h-full w-[2px] bg-[color:var(--panel)] pointer-events-none"></div>

          {consolidateEvents(research).map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-22 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🧪</span>
              <div className="h-[1px] w-4 bg-white/10" />
              <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
            </div>
          ))}

          {consolidateEvents(builds).map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-21 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🏛️</span>
              <div className="h-[1px] w-[6rem] bg-white/10" />
              <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
            </div>
          ))}

          {consolidateEvents(trains).map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-20 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">
                {event.isMilitary ? "🗡️" : "🙂"}
              </span>
              <div className="h-[1px] w-[12rem] bg-white/10" />
              <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
            </div>
          ))}

          {/* Age Up Markers */}
          {Object.entries(timelineStats.find((s) => s.playerId === player.id)?.ageTimings ?? {}).map(([ageName, time]) => {
            const ageNumeral = ageName === "Feudal" ? "II" : ageName === "Castle" ? "III" : ageName === "Imperial" ? "IV" : "";
            if (!ageNumeral) return null;
            return (
              <div
                key={`age-${player.id}-${ageName}`}
                className="absolute left-0 w-full flex items-center pointer-events-none z-10"
                style={{ top: `${(time / Math.max(duration, 1)) * 100}%` }}
              >
                <div className="absolute left-0 w-full border-t border-dotted border-[color:var(--accent)]" />
                <div
                  className="relative -translate-x-full bg-[color:var(--accent)] text-[color:var(--panel)] w-6 h-6 flex items-center justify-center rounded-sm font-serif font-black text-xs shadow-sm ring-2 ring-[color:var(--panel)] pointer-events-auto cursor-help"
                  title={`${ageName} Age reached @ ${formatClock(time)}`}
                >
                  {ageNumeral}
                </div>
              </div>
            );
          })}

          <div
            className="absolute left-0 h-[2px] w-full bg-[color:var(--foreground)] pointer-events-none"
            style={{ top: `${(selectedTime / Math.max(duration, 1)) * 100}%` }}
          >
            {index === 0 && (
              <div className="absolute left-0 -translate-y-1/2 -translate-x-full pl-2 z-10">
                <span className="rounded bg-[color:var(--foreground)] px-1 py-0.5 text-[11px] font-bold tabular-nums text-[color:var(--panel)] shadow-sm">
                  {formatClock(selectedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={timelineRef as any} className="w-full">
      <div className="panel flex flex-col gap-6 rounded-3xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="headline text-2xl font-semibold">Timeline</h2>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={timelineShowResearch}
                  onChange={(e) => setTimelineShowResearch(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${timelineShowResearch ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${timelineShowResearch ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">Research</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={timelineShowBuildings}
                  onChange={(e) => setTimelineShowBuildings(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${timelineShowBuildings ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${timelineShowBuildings ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">Buildings</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={timelineShowUnits}
                  onChange={(e) => setTimelineShowUnits(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${timelineShowUnits ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${timelineShowUnits ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">Units</span>
            </label>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {renderColumn(leftPlayerId, 0)}
          {renderColumn(rightPlayerId, 1)}
        </div>
      </div>
    </section>
  );
}
