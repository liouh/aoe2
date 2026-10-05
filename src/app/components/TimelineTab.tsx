"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Select } from "./Select";
import { Toggle } from "./Toggle";
import { PlayerHeader } from "./PlayerHeader";
import { getCivName } from "@/lib/civMappings";
import { getUnitName, getBuildingName, isEconomic } from "@/lib/entityMappings";
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
}

export function TimelineTab({
  players,
  events,
  duration,
  timelineStats,
  selectedTime,
  getPlayerColor,
  formatClock,
}: TimelineTabProps) {
  const [leftPlayerId, setLeftPlayerId] = useState<number | null>(null);
  const [rightPlayerId, setRightPlayerId] = useState<number | null>(null);
  const [timelineShowBuildings, setTimelineShowBuildings] = useState(true);
  const [timelineShowUnits, setTimelineShowUnits] = useState(true);
  const [timelineShowResearch, setTimelineShowResearch] = useState(true);

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

  const timelineHeight = useMemo(() => duration * TIMELINE_PX_PER_SECOND, [duration]);

  // Memoize event filtering and consolidation for both columns
  const columnData = useMemo(() => {
    const getData = (playerId: number | null) => {
      if (playerId === null) return { research: [], builds: [], trains: [] };
      const pe = events.filter((e) => e.playerId === playerId);
      return {
        research: consolidateEvents(pe.filter((e) => e.category === "research" && timelineShowResearch)),
        builds: consolidateEvents(pe.filter((e) => e.category === "build" && timelineShowBuildings && !e.raw?.isInitial)),
        trains: consolidateEvents(pe.filter((e) => e.category === "train" && timelineShowUnits && !e.raw?.isInitial)),
      };
    };
    return [getData(leftPlayerId), getData(rightPlayerId)];
  }, [events, leftPlayerId, rightPlayerId, timelineShowResearch, timelineShowBuildings, timelineShowUnits]);

  const renderColumn = (playerId: number | null, index: number) => {
    if (playerId === null) return null;
    const player = players.find((p) => p.id === playerId);
    if (!player) return null;

    const { research, builds, trains } = columnData[index];

    return (
      <div key={`column-${index}`} className={`bg-[color:var(--panel)] border border-white/5 ${index === 1 ? 'hidden md:block' : ''}`}>
        <div className="sticky top-0 z-30 p-4 bg-[color:var(--panel)]/80 backdrop-blur-sm border-b border-white/10">
          <PlayerHeader
            name={player.name}
            color={getPlayerColor(player.id)}
            civ={getCivName(player.civId)}
            action={
              <Select
                options={players.map(p => ({ id: p.id, label: p.name, color: getPlayerColor(p.id) }))}
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
            }
          />
        </div>
        <div
          className="relative w-full"
          style={{ height: timelineHeight }}
        >
          {Array.from({ length: Math.floor(duration / TIMELINE_MARKER_INTERVAL) + 1 }).map((_, i) => {
            const markerTime = i * TIMELINE_MARKER_INTERVAL;
            return (
              <div
                key={`marker-${markerTime}`}
                className="absolute left-0 w-full border-t border-white/5 pointer-events-none"
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
          <div className="absolute left-8 top-0 h-full w-[2px] bg-white/10 pointer-events-none"></div>

          {research.map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-22 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🧪</span>
              <div className="h-[1px] w-4 bg-white/10" />
              <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
            </div>
          ))}

          {builds.map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-21 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🏛️</span>
              <div className="h-[1px] w-[6rem] bg-white/10" />
              <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
            </div>
          ))}

          {trains.map((event) => (
            <div key={event.id} className="group absolute left-8 flex items-center z-20 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
              <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">
                {event.isMilitary ? "⚔️" : "🙂"}
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
                className="absolute left-0 w-full flex items-center -translate-y-1/2 pointer-events-none z-10"
                style={{ top: `${(time / Math.max(duration, 1)) * 100}%` }}
              >
                <div className="absolute left-0 top-1/2 w-full border-t border-dotted border-[color:var(--accent)]" />
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
            className="absolute left-0 w-full pointer-events-none z-20"
            style={{ top: `${(selectedTime / Math.max(duration, 1)) * 100}%` }}
          >
            <div className="absolute left-0 top-0 w-full h-[2px] -translate-y-1/2 bg-[color:var(--foreground)]" />
            {index === 0 && (
              <div className="absolute left-0 top-0 -translate-y-1/2 -translate-x-full z-10 flex">
                <span className="inline-flex items-center justify-center rounded bg-[color:var(--foreground)] p-1 text-[11px] font-bold tabular-nums leading-none text-[color:var(--panel)] shadow-sm">
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
    <section className="w-full">
      <div className="tab-section flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="headline text-2xl font-semibold">Timeline</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Toggle
              label="Research"
              checked={timelineShowResearch}
              onChange={setTimelineShowResearch}
            />
            <Toggle
              label="Buildings"
              checked={timelineShowBuildings}
              onChange={setTimelineShowBuildings}
            />
            <Toggle
              label="Units"
              checked={timelineShowUnits}
              onChange={setTimelineShowUnits}
            />
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
