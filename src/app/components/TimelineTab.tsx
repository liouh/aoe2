"use client";

import { useState, useMemo } from "react";
import { Select, type SelectOption } from "./Select";
import { Toggle } from "./Toggle";
import { PlayerHeader } from "./PlayerHeader";
import { getCivName } from "@/lib/civMappings";
import { getUnitName, getBuildingName, isEconomic } from "@/lib/entityMappings";
import { getTechName } from "@/lib/techMappings";
import { type TimelineEvent, type TimelineEventCategory, type PlayerSummary, type PlayerStats } from "@/lib/replayProcessor";
import {
  PRESET_BUILD_ORDERS,
  findPresetById,
} from "@/lib/presetBuildOrders";

const EARLY_MARKER_INTERVAL = 60;
const EARLY_MARKER_COUNT = 20;
const TIMELINE_MARKER_INTERVAL = 300;
const TIMELINE_PX_PER_SECOND = 2;
const TIMELINE_CONSOLIDATION_WINDOW_SECONDS = 6;

function consolidateEvents(events: TimelineEvent[], windowSeconds: number = TIMELINE_CONSOLIDATION_WINDOW_SECONDS) {
  if (events.length === 0) return [];

  const consolidated: (TimelineEvent & {
    count: number;
    hasMilitary?: boolean;
    hasMarket?: boolean;
    items: Map<string, { count: number; category: TimelineEventCategory }>;
    label?: string;
  })[] = [];

  const activeGroups = new Map<string, (typeof consolidated)[number]>();

  for (const event of events) {
    const identity =
      event.category === "market" || event.category === "research"
        ? "tech-market"
        : event.category;
    const current = activeGroups.get(identity);

    const amount = typeof event.raw?.amount === "number" && event.raw.amount > 0
      ? event.raw.amount
      : 1;

    let itemLabel = (event.raw?.label as string) || event.type || "Unknown Event";
    if (event.category === "build" && event.buildingTypeId !== undefined) {
      itemLabel = getBuildingName(event.buildingTypeId);
    } else if (event.category === "train" && event.unitTypeId !== undefined) {
      itemLabel = getUnitName(event.unitTypeId);
    } else if (event.category === "research" && event.techId !== undefined) {
      itemLabel = getTechName(event.techId);
    } else if (event.category === "market") {
      if (event.raw?.label && typeof event.raw.label === "string") {
        itemLabel = event.raw.label;
      } else {
        const resourceMap: Record<number, string> = {
          0: "Food",
          1: "Wood",
          2: "Stone",
        };
        const resourceId = typeof event.raw?.resourceId === "number" ? event.raw.resourceId : undefined;
        const resourceName = resourceId !== undefined ? (resourceMap[resourceId] ?? `Resource ${resourceId}`) : "Resource";
        const actionName =
          event.type?.toLowerCase() === "buy"
            ? "Buy"
            : event.type?.toLowerCase() === "sell"
              ? "Sell"
              : (event.type || "Market");
        itemLabel = `${actionName} ${resourceName}`;
      }
    }

    const isMil = event.category === "train" && !isEconomic(itemLabel);

    if (current && event.time - current.time <= windowSeconds) {
      current.count += amount;
      const existing = current.items.get(itemLabel);
      if (existing) {
        existing.count += amount;
      } else {
        current.items.set(itemLabel, { count: amount, category: event.category });
      }
      if (isMil) current.hasMilitary = true;
      if (event.category === "market") current.hasMarket = true;
    } else {
      const newGroup = {
        ...event,
        count: amount,
        hasMilitary: isMil,
        hasMarket: event.category === "market",
        items: new Map([[itemLabel, { count: amount, category: event.category }]]),
      };
      consolidated.push(newGroup);
      activeGroups.set(identity, newGroup);
    }
  }

  for (const group of consolidated) {
    const parts = Array.from(group.items.entries()).map(([name, item]) => {
      if (item.category === "market") {
        // If the preset label already has an amount (e.g. "Sell 100 Wood"), use it as is
        if (/\d+/.test(name)) {
          return item.count > 1 ? `${name} x${item.count}` : name;
        }
        const spaceIdx = name.indexOf(" ");
        const totalAmount = item.count >= 100 ? item.count : item.count * 100;
        if (spaceIdx !== -1) {
          const action = name.slice(0, spaceIdx);
          const resource = name.slice(spaceIdx + 1);
          return `${action} ${totalAmount} ${resource}`;
        }
        return `${name} ${totalAmount}`;
      }
      return (item.count > 1 && item.category !== "research") ? `${name} x${item.count}` : name;
    });
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
  const defaultLeft = useMemo(() => {
    if (players.length > 0) return `player-${players[0].id}`;
    return null;
  }, [players]);

  const defaultRight = useMemo(() => {
    if (players.length > 1) return `player-${players[1].id}`;
    if (PRESET_BUILD_ORDERS.length > 0) return PRESET_BUILD_ORDERS[0].id;
    return null;
  }, [players]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [timelineShowBuildings, setTimelineShowBuildings] = useState(true);
  const [timelineShowUnits, setTimelineShowUnits] = useState(true);
  const [timelineShowResearch, setTimelineShowResearch] = useState(true);

  // Validate or fall back to default if selection is not explicitly set or no longer valid
  const leftSelection = useMemo(() => {
    if (selectedLeft) {
      if (selectedLeft.startsWith("preset-")) {
        if (findPresetById(selectedLeft)) return selectedLeft;
      } else {
        const pId = Number(selectedLeft.replace("player-", ""));
        if (players.some((p) => p.id === pId)) return selectedLeft;
      }
    }
    return defaultLeft;
  }, [selectedLeft, defaultLeft, players]);

  const rightSelection = useMemo(() => {
    if (selectedRight) {
      if (selectedRight.startsWith("preset-")) {
        if (findPresetById(selectedRight)) return selectedRight;
      } else {
        const pId = Number(selectedRight.replace("player-", ""));
        if (players.some((p) => p.id === pId)) return selectedRight;
      }
    }
    return defaultRight;
  }, [selectedRight, defaultRight, players]);

  // Unified select options: players from replay + preset build orders
  const selectOptions: SelectOption<string>[] = useMemo(() => {
    const playerOptions: SelectOption<string>[] = players.map((p) => ({
      id: `player-${p.id}`,
      label: p.name,
      color: getPlayerColor(p.id),
    }));

    const presetOptions: SelectOption<string>[] = PRESET_BUILD_ORDERS.map((preset) => ({
      id: preset.id,
      label: preset.name,
      icon: "📋",
    }));

    return [...playerOptions, ...presetOptions];
  }, [players, getPlayerColor]);

  // Compute maximum timestamp for currently selected presets and duration so timeline scales seamlessly
  const timelineDuration = useMemo(() => {
    let maxTime = duration;
    const selectedPresetIds = [leftSelection, rightSelection].filter(
      (id): id is string => typeof id === "string" && id.startsWith("preset-")
    );

    for (const presetId of selectedPresetIds) {
      const preset = findPresetById(presetId);
      if (preset && preset.maxTime > maxTime) {
        maxTime = preset.maxTime;
      }
    }
    return maxTime;
  }, [duration, leftSelection, rightSelection]);

  const timelineHeight = useMemo(() => timelineDuration * TIMELINE_PX_PER_SECOND, [timelineDuration]);

  const timelineMarkers = useMemo(() => {
    const markers: number[] = [];
    const earlyDurationSeconds = EARLY_MARKER_INTERVAL * EARLY_MARKER_COUNT;
    const earlyLimit = Math.min(timelineDuration, earlyDurationSeconds);

    for (let t = EARLY_MARKER_INTERVAL; t <= earlyLimit; t += EARLY_MARKER_INTERVAL) {
      markers.push(t);
    }

    const startLater =
      Math.floor(earlyDurationSeconds / TIMELINE_MARKER_INTERVAL) * TIMELINE_MARKER_INTERVAL +
      TIMELINE_MARKER_INTERVAL;
    for (let t = startLater; t <= timelineDuration; t += TIMELINE_MARKER_INTERVAL) {
      markers.push(t);
    }

    return markers;
  }, [timelineDuration]);

  // Memoize event filtering and consolidation for both columns
  const columnData = useMemo(() => {
    const filterAndConsolidate = (pe: TimelineEvent[]) => ({
      research: consolidateEvents(pe.filter((e) => (e.category === "research" || e.category === "market") && timelineShowResearch)),
      builds: consolidateEvents(pe.filter((e) => e.category === "build" && timelineShowBuildings && !e.raw?.isInitial)),
      trains: consolidateEvents(pe.filter((e) => e.category === "train" && timelineShowUnits && !e.raw?.isInitial)),
    });

    const getData = (selectionId: string | null) => {
      if (!selectionId) return null;

      // Preset Build Order
      if (selectionId.startsWith("preset-")) {
        const preset = findPresetById(selectionId);
        if (!preset) return null;

        return {
          name: preset.name,
          color: undefined,
          civ: preset.civ,
          ageTimings: preset.ageTimings,
          ...filterAndConsolidate(preset.events),
        };
      }

      // Replay Player
      const playerId = Number(selectionId.replace("player-", ""));
      const player = players.find((p) => p.id === playerId);
      if (!player) return null;

      const pe = events.filter((e) => e.playerId === playerId);
      const stats = timelineStats.find((s) => s.playerId === playerId);

      return {
        name: player.name,
        color: getPlayerColor(player.id),
        civ: getCivName(player.civId),
        ageTimings: stats?.ageTimings ?? {},
        ...filterAndConsolidate(pe),
      };
    };

    return [getData(leftSelection), getData(rightSelection)];
  }, [
    events,
    players,
    leftSelection,
    rightSelection,
    timelineStats,
    getPlayerColor,
    timelineShowResearch,
    timelineShowBuildings,
    timelineShowUnits,
  ]);

  const renderColumn = (selectionId: string | null, index: number) => {
    if (!selectionId) return null;
    const col = columnData[index];
    if (!col) return null;

    const { research, builds, trains, name, color, civ, ageTimings } = col;

    const renderRow = (
      event: TimelineEvent & { label?: string; hasMilitary?: boolean; hasMarket?: boolean },
      zIndex: string,
      lineWidthClass: string,
      icon: React.ReactNode
    ) => {
      const tooltip = `${event.label} @ ${formatClock(event.time)}`;
      return (
        <div
          key={event.id}
          className={`group absolute left-8 right-1 -translate-y-1/2 flex items-center hover:z-30 pointer-events-none ${zIndex}`}
          style={{ top: `${(event.time / Math.max(timelineDuration, 1)) * 100}%` }}
          title={tooltip}
        >
          <span
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] transition-transform group-hover:scale-200 select-none pointer-events-auto"
            title={tooltip}
          >
            {icon}
          </span>
          <div className={`h-[1px] bg-white/10 shrink-0 ${lineWidthClass}`} />
          <span
            className="truncate min-w-0 px-1.5 py-0.5 rounded text-[10px] text-[color:var(--muted)] pointer-events-auto transition-colors border border-transparent group-hover:bg-[color:var(--panel-strong)] group-hover:border-[color:var(--border-subtle)] group-hover:text-[color:var(--foreground)]"
            title={tooltip}
          >
            {event.label}
          </span>
        </div>
      );
    };

    return (
      <div key={`column-${index}`} className={`bg-[color:var(--panel)] border border-white/5 ${index === 1 ? 'hidden md:block' : ''}`}>
        <div className="sticky top-0 z-30 p-4 bg-[color:var(--panel)]/80 backdrop-blur-sm border-b border-white/10">
          <PlayerHeader
            name={name}
            color={color}
            civ={civ}
            action={
              <Select
                options={selectOptions}
                selectedId={selectionId}
                onSelect={(value) => {
                  if (index === 0) {
                    setSelectedLeft(value);
                    if (value === rightSelection && selectOptions.length > 1) {
                      const alternate = selectOptions.find((o) => o.id !== value)?.id ?? value;
                      setSelectedRight(alternate);
                    }
                  } else {
                    setSelectedRight(value);
                    if (value === leftSelection && selectOptions.length > 1) {
                      const alternate = selectOptions.find((o) => o.id !== value)?.id ?? value;
                      setSelectedLeft(alternate);
                    }
                  }
                }}
              />
            }
          />
        </div>
        <div className="pt-4">
          <div
            className="relative w-full"
            style={{ height: timelineHeight }}
          >
            {timelineMarkers.map((markerTime) => (
              <div
                key={`marker-${markerTime}`}
                className="absolute left-0 w-full border-t border-dotted border-white/10 pointer-events-none"
                style={{ top: `${(markerTime / Math.max(timelineDuration, 1)) * 100}%` }}
              >
                <span className="absolute left-[3px] text-[10px] tabular-nums text-[color:var(--muted-foreground)] opacity-30">
                  {markerTime / 60 + "'"}
                </span>
              </div>
            ))}
            <div className="absolute left-8 top-0 h-full w-[2px] bg-white/10 pointer-events-none"></div>

            {research.map((event) => renderRow(event, "z-23", "w-4", event.hasMarket ? "⚖️" : "🧪"))}
            {builds.map((event) => renderRow(event, "z-22", "w-[25%]", "🏛️"))}
            {trains.map((event) => renderRow(event, "z-21", "w-[50%]", event.hasMilitary ? "🫡" : "😐"))}

            {/* Age Up Markers */}
            {Object.entries(ageTimings).map(([ageName, time]) => {
              const ageNumeral = ageName === "Feudal" ? "II" : ageName === "Castle" ? "III" : ageName === "Imperial" ? "IV" : "";
              if (!ageNumeral) return null;
              return (
                <div
                  key={`age-${selectionId}-${ageName}`}
                  className="absolute left-0 w-full flex items-center -translate-y-1/2 pointer-events-none z-10"
                  style={{ top: `${(time / Math.max(timelineDuration, 1)) * 100}%` }}
                >
                  <div className="absolute left-0 top-1/2 w-full border-t border-dashed border-[color:var(--accent)]" />
                  <div
                    className="relative -translate-x-full bg-[color:var(--accent)] text-[color:var(--panel)] w-6 h-6 flex items-center justify-center rounded-sm font-serif font-black text-xs shadow-sm ring-2 ring-[color:var(--panel)] pointer-events-auto"
                    title={`${ageName} Age reached @ ${formatClock(time)}`}
                  >
                    {ageNumeral}
                  </div>
                </div>
              );
            })}

            <div
              className="absolute left-0 w-full pointer-events-none z-20"
              style={{ top: `${(selectedTime / Math.max(timelineDuration, 1)) * 100}%` }}
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
              label="Tech + Market"
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
          {renderColumn(leftSelection, 0)}
          {(players.length > 1 || PRESET_BUILD_ORDERS.length > 0) && renderColumn(rightSelection, 1)}
        </div>
      </div>
    </section>
  );
}
