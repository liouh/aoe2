"use client";

import { useState, useMemo } from "react";
import { APMChart } from "./APMChart";
import { TiltCard } from "./TiltCard";
import { getCivName } from "@/lib/civMappings";
import { getUnitName } from "@/lib/entityNames";
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
  selectedTime: number;
}

export function StatsTab({
  players,
  timelineStats,
  events,
  getPlayerColor,
  selectedTime,
}: StatsTabProps) {
  const [showAiApm, setShowAiApm] = useState(true);
  const formatNum = (n: number) => new Intl.NumberFormat().format(n);

  const unitStats = useMemo(() => {
    const statsMap = new Map<number, Map<number, { name: string; count: number }>>();
    const trainEvents = events.filter((e) => e.category === "train");

    trainEvents.forEach((event) => {
      if (event.playerId === undefined || event.unitTypeId === undefined) return;
      const amount = typeof (event.raw as any)?.amount === "number" && (event.raw as any).amount > 0
        ? (event.raw as any).amount
        : 1;
      let playerMap = statsMap.get(event.playerId);
      if (!playerMap) {
        playerMap = new Map();
        statsMap.set(event.playerId, playerMap);
      }

      const existing = playerMap.get(event.unitTypeId);
      if (existing) {
        existing.count += amount;
      } else {
        playerMap.set(event.unitTypeId, {
          name: getUnitName(event.unitTypeId),
          count: amount,
        });
      }
    });

    const result = new Map<number, { military: { name: string; count: number }[], economic: { name: string; count: number }[] }>();
    statsMap.forEach((playerMap, playerId) => {
      const allUnits = Array.from(playerMap.values());
      const economic = allUnits
        .filter((u) => isEconomic(u.name))
        .sort((a, b) => b.count - a.count);
      const military = allUnits
        .filter((u) => !isEconomic(u.name))
        .sort((a, b) => b.count - a.count);
      result.set(playerId, { military, economic });
    });
    return result;
  }, [events]);

  return (
    <div className="flex flex-col gap-6">
      <section className="panel rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Actions per minute</h2>
          {players.some(p => p.ai) && (
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={showAiApm}
                  onChange={(e) => setShowAiApm(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${showAiApm ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showAiApm ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">Graph AI APM</span>
            </label>
          )}
        </div>

        <APMChart
          data={players
            .filter(p => showAiApm || !p.ai)
            .map(p => ({
              playerId: p.id,
              history: timelineStats.find(s => s.playerId === p.id)?.apmHistory || []
            }))}
          players={players.filter(p => showAiApm || !p.ai)}
          getPlayerColor={getPlayerColor}
          selectedTime={selectedTime}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = timelineStats.find((s) => s.playerId === player.id);
            return (
              <TiltCard key={`${player.id}-${index}`} className="panel-strong p-4 flex flex-col gap-4 player-card-3d-base">
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
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-xs text-[color:var(--muted)]">Avg APM</p>
                    <p className="text-xl tabular-nums font-medium">{stats?.apm !== undefined ? formatNum(stats.apm) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--muted)]">Peak APM</p>
                    <p className="text-xl tabular-nums font-medium">{stats?.peakApm !== undefined ? formatNum(stats.peakApm) : "—"}</p>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Unit production</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = unitStats.get(player.id) || { military: [], economic: [] };
            const milCount = stats.military.reduce((acc, u) => acc + u.count, 0);
            const ecoCount = stats.economic.reduce((acc, u) => acc + u.count, 0);

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
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>

                <div className="space-y-4">
                  {/* Military Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--accent)]">Military</span>
                      <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{milCount}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-h-[20px]">
                      {stats.military.length > 0 ? (
                        stats.military.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                            <span className="tabular-nums shrink-0 font-medium">{u.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-white/20 italic">No military trained</p>
                      )}
                    </div>
                  </div>

                  {/* Economic Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-green-400/70">Economic</span>
                      <span className="text-xs tabular-nums bg-white/5 px-1.5 py-0.5 rounded text-white/50">{ecoCount}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-h-[20px]">
                      {stats.economic.length > 0 ? (
                        stats.economic.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                            <span className="tabular-nums shrink-0 font-medium">{u.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-white/20 italic">No eco units trained</p>
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
          <h2 className="headline text-2xl font-semibold">Market usage</h2>
        </div>
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
                    className="h-3 w-3 rounded-full shrink-0"
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
    </div>
  );
}
