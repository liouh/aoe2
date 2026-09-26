"use client";

import { useMemo } from "react";
import { TiltCard } from "./TiltCard";
import { AiBadge } from "./AiBadge";
import { getCivName } from "@/lib/civMappings";
import { getBuildingName, getUnitName } from "@/lib/entityMappings";
import { type TimelineEvent } from "@/lib/replayProcessor";

export const isEconomic = (name: string) => {
  const lower = name.toLowerCase();
  return (
    lower.includes("villager") ||
    lower.includes("trade cart") ||
    lower.includes("trade cog") ||
    lower.includes("fishing ship") ||
    lower.includes("transport ship") ||
    lower.includes("mule cart")
  );
};

interface StatsTabProps {
  players: any[];
  timelineStats: any[];
  events: TimelineEvent[];
  getPlayerColor: (playerId?: number) => string;
}

export function StatsTab({
  players,
  timelineStats,
  events,
  getPlayerColor,
}: StatsTabProps) {
  const formatNum = (n: number) => new Intl.NumberFormat().format(n);

  const unitStats = useMemo(() => {
    const statsMap = new Map<number, Map<number, { name: string; count: number }>>();
    const startingStatsMap = new Map<number, Map<string, { name: string; count: number }>>();
    const trainEvents = events.filter((e) => e.category === "train");

    trainEvents.forEach((event) => {
      if (event.playerId === undefined || event.unitTypeId === undefined) return;
      const isStartingUnit = (event.raw as any)?.isInitial === true;
      const amount = typeof (event.raw as any)?.amount === "number" && (event.raw as any).amount > 0
        ? (event.raw as any).amount
        : 1;
      const name = getUnitName(event.unitTypeId);
      if (isStartingUnit) {
        let playerMap = startingStatsMap.get(event.playerId);
        if (!playerMap) {
          playerMap = new Map();
          startingStatsMap.set(event.playerId, playerMap);
        }
        const existing = playerMap.get(name);
        if (existing) existing.count += amount;
        else playerMap.set(name, { name, count: amount });
        return;
      }

      let playerMap = statsMap.get(event.playerId);
      if (!playerMap) {
        playerMap = new Map();
        statsMap.set(event.playerId, playerMap);
      }
      const existing = playerMap.get(event.unitTypeId);
      if (existing) existing.count += amount;
      else playerMap.set(event.unitTypeId, { name, count: amount });
    });

    const result = new Map<number, {
      military: { name: string; count: number }[];
      economic: { name: string; count: number }[];
      starting: { name: string; count: number }[];
    }>();
    const allPlayerIds = new Set([...statsMap.keys(), ...startingStatsMap.keys()]);
    allPlayerIds.forEach((playerId) => {
      const playerMap = statsMap.get(playerId) ?? new Map();
      const allUnits = Array.from(playerMap.values());
      const economic = allUnits
        .filter((u) => isEconomic(u.name))
        .sort((a, b) => b.count - a.count);
      const military = allUnits
        .filter((u) => !isEconomic(u.name))
        .sort((a, b) => b.count - a.count);
      const starting = Array.from(startingStatsMap.get(playerId)?.values() ?? [])
        .sort((a, b) => b.count - a.count);
      result.set(playerId, { military, economic, starting });
    });
    return result;
  }, [events]);

  const buildingStats = useMemo(() => {
    const statsMap = new Map<number, {
      built: Map<string, { name: string; count: number }>;
      starting: Map<string, { name: string; count: number }>;
    }>();

    events.forEach(event => {
      if (event.category !== "build" || event.playerId === undefined || event.buildingTypeId === undefined) return;

      const name = getBuildingName(event.buildingTypeId);
      if (name === "Unknown Building") return;

      let playerStats = statsMap.get(event.playerId);
      if (!playerStats) {
        playerStats = { built: new Map(), starting: new Map() };
        statsMap.set(event.playerId, playerStats);
      }

      const buildingMap = (event.raw as any)?.isInitial ? playerStats.starting : playerStats.built;
      const existing = buildingMap.get(name);
      if (existing) {
        existing.count += 1;
      } else {
        buildingMap.set(name, { name, count: 1 });
      }
    });

    const result = new Map<number, {
      built: { name: string; count: number }[];
      starting: { name: string; count: number }[];
    }>();
    statsMap.forEach((playerStats, playerId) => {
      result.set(playerId, {
        built: Array.from(playerStats.built.values()).sort((a, b) => b.count - a.count),
        starting: Array.from(playerStats.starting.values()).sort((a, b) => b.count - a.count),
      });
    });

    return result;
  }, [events]);

  const actionStats = useMemo(() => {
    const statsMap = new Map<number, Map<string, number>>();
    events.forEach(event => {
      if (event.playerId === undefined) return;
      if ((event.raw as any)?.isInitial) return;
      if (event.type.toLowerCase().includes("unknown")) return;

      let playerMap = statsMap.get(event.playerId);
      if (!playerMap) {
        playerMap = new Map();
        statsMap.set(event.playerId, playerMap);
      }

      const count = playerMap.get(event.type) || 0;
      playerMap.set(event.type, count + 1);
    });

    const result = new Map<number, { name: string, count: number }[]>();
    statsMap.forEach((playerMap, playerId) => {
      const actions = Array.from(playerMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      result.set(playerId, actions);
    });

    return result;
  }, [events]);

  return (
    <div className="flex flex-col gap-6">
      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Units</h2>
        </div>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Counts include cancelled units</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = unitStats.get(player.id) || { military: [], economic: [], starting: [] };
            const milCount = stats.military.reduce((acc, u) => acc + u.count, 0);
            const ecoCount = stats.economic.reduce((acc, u) => acc + u.count, 0);
            const startingCount = stats.starting.reduce((acc, u) => acc + u.count, 0);

            return (
              <TiltCard
                key={`${player.id}-${index}`}
                className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold leading-tight flex items-center gap-2">
                      {player.name}
                      {player.ai && (
                        <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 font-normal text-[10px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10">
                          AI
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{getCivName(player.civId)}</span>
                    </div>
                  </div>
                  <span
                    className="ml-2 h-3 w-3 rounded-full shrink-0 ring-1 ring-white"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>

                <div className="space-y-4">
                  {/* Starting Units Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-white/30">Starting units</span>
                      <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{startingCount}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-h-[20px]">
                      {stats.starting.length > 0 ? stats.starting.map((unit) => (
                        <div key={unit.name} className="flex items-center justify-between text-sm">
                          <span className="text-[color:var(--muted)] truncate pr-2">{unit.name}</span>
                          <span className="tabular-nums shrink-0">{unit.count}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-white/20 italic">—</p>
                      )}
                    </div>
                  </div>
                  {/* Military Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--accent)]">Trained military</span>
                      <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{milCount}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-h-[20px]">
                      {stats.military.length > 0 ? (
                        stats.military.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                            <span className="tabular-nums shrink-0">{u.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/20 italic">—</p>
                      )}
                    </div>
                  </div>

                  {/* Economic Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-green-400/70">Trained eco units</span>
                      <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{ecoCount}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-h-[20px]">
                      {stats.economic.length > 0 ? (
                        stats.economic.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                            <span className="tabular-nums shrink-0">{u.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/20 italic">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Buildings</h2>
        </div>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Counts include cancelled buildings</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = buildingStats.get(player.id) || { built: [], starting: [] };
            const buildingCount = stats.built.reduce((total, building) => total + building.count, 0);
            const startingBuildingCount = stats.starting.reduce((total, building) => total + building.count, 0);

            return (
              <TiltCard
                key={`${player.id}-${index}`}
                className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold leading-tight flex items-center gap-2">
                      {player.name}
                      {player.ai && (
                        <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 font-normal text-[10px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10">
                          AI
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{getCivName(player.civId)}</span>
                    </div>
                  </div>
                  <span
                    className="ml-2 h-3 w-3 rounded-full shrink-0 ring-1 ring-white"
                    style={{ background: getPlayerColor(player.id) }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-xs uppercase tracking-wider text-white/30">Starting buildings</span>
                    <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{formatNum(startingBuildingCount)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 min-h-[20px]">
                    {stats.starting.length > 0 ? stats.starting.map((building) => (
                      <div key={building.name} className="flex items-center justify-between text-sm">
                        <span className="text-[color:var(--muted)] truncate pr-2">{building.name}</span>
                        <span className="tabular-nums shrink-0">{formatNum(building.count)}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-white/20 italic">—</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-xs uppercase tracking-wider text-blue-400">Built in-game</span>
                    <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{formatNum(buildingCount)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 min-h-[20px]">
                    {stats.built.length > 0 ? stats.built.map((building) => (
                      <div key={building.name} className="flex items-center justify-between text-sm">
                        <span className="text-[color:var(--muted)] truncate pr-2">{building.name}</span>
                        <span className="tabular-nums shrink-0">{formatNum(building.count)}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-white/20 italic">—</p>
                    )}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Market usage</h2>
        </div>
        <p className="mt-1 text-xs text-[color:var(--muted)]">+ Bought / - Sold</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const usage = timelineStats.find((s) => s.playerId === player.id)?.marketUsage || {
              bought: { food: 0, wood: 0, stone: 0 },
              sold: { food: 0, wood: 0, stone: 0 }
            };

            return (
              <TiltCard
                key={`${player.id}-${index}`}
                className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
              >
                <div className="flex items-center justify-between">
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
                  <span
                    className="ml-2 h-3 w-3 rounded-full shrink-0 ring-1 ring-white"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>

                <div className="flex flex-col gap-2">
                  {(["wood", "food", "stone"] as const).map((res) => {
                    const bought = usage.bought[res];
                    const sold = usage.sold[res];
                    return (
                      <div key={res} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-xs uppercase tracking-wider text-white/30">{res}</span>
                        <span className="text-sm tabular-nums font-medium flex items-center gap-1">
                          <span className={bought > 0 ? "text-green-400/70" : "text-white/10"}>+{formatNum(bought)}</span>
                          <span className="text-white/5 mx-0.5">/</span>
                          <span className={sold > 0 ? "text-[color:var(--accent)]" : "text-white/10"}>-{formatNum(sold)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Action breakdown</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const actions = actionStats.get(player.id) || [];
            const totalActions = actions.reduce((acc, a) => acc + a.count, 0);

            return (
              <TiltCard
                key={`${player.id}-${index}`}
                className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
              >
                <div className="flex items-center justify-between">
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
                  <span
                    className="ml-2 h-3 w-3 rounded-full shrink-0 ring-1 ring-white"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-xs uppercase tracking-wider text-white/30">Total actions</span>
                    <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{formatNum(totalActions)}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 min-h-[20px]">
                    {actions.length > 0 ? (
                      actions.map((action, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-[color:var(--muted)] truncate pr-2">{action.name}</span>
                          <span className="tabular-nums shrink-0">{formatNum(action.count)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/20 italic">—</p>
                    )}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
