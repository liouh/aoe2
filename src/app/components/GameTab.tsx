"use client";

import { useMemo } from "react";
import { TiltCard } from "./TiltCard";
import { getCivName } from "@/lib/civMappings";
import { getGameTypeName, getMapName, getMapSizeName, getVictoryTypeName } from "@/lib/gameMappings";
import { type MatchInfo } from "@/lib/replayProcessor";

interface GameTabProps {
  players: any[];
  timelineStats: any[];
  matchInfo: MatchInfo | null;
  getPlayerColor: (playerId?: number) => string;
  formatClock: (seconds: number) => string;
}

export function GameTab({
  players,
  timelineStats,
  matchInfo,
  getPlayerColor,
  formatClock,
}: GameTabProps) {
  const allPlayersWon = useMemo(() => players.length > 0 && players.every((p) => p.won), [players]);

  const fastestAges = useMemo(() => {
    const ageMap: Record<string, number> = {};
    timelineStats.forEach((s) => {
      if (s.ageTimings) {
        Object.entries(s.ageTimings).forEach(([age, time]) => {
          if (time !== undefined && (ageMap[age] === undefined || (time as number) < ageMap[age])) {
            ageMap[age] = time as number;
          }
        });
      }
    });
    return ageMap;
  }, [timelineStats]);

  return (
    <div className="flex flex-col gap-6">
      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Players</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = timelineStats.find(
              (item) => item.playerId === player.id
            );
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
                      {player.won && !allPlayersWon && <sup>👑</sup>}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{getCivName(player.civId)}</span>
                      <span>•</span>
                      <span>Team {player.teamId}</span>
                    </div>
                  </div>
                  <span
                    className="ml-2 h-3 w-3 rounded-full shrink-0"
                    style={{ background: getPlayerColor(player.id) }}
                  ></span>
                </div>
                <div className="flex flex-col gap-4 text-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-white/30">Age up time</span>
                    </div>
                    {stats?.ageTimings && Object.keys(stats.ageTimings).length > 0 ? (
                      <div className="space-y-1.5">
                        {Object.entries(stats.ageTimings).map(([age, time]) => (
                          <div key={age} className="flex justify-between items-center group/age">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[color:var(--muted)]">{age}</span>
                              {time === (fastestAges as any)[age] && (
                                <span title="Fastest" className="text-[10px] select-none">🥇</span>
                              )}
                            </div>
                            <span className="text-white tabular-nums pl-2 font-medium">{formatClock(time as number)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/20 italic">—</p>
                    )}
                  </div>
                  {((player.handicap && player.handicap !== 100) || !!stats?.autoscoutUsage) && (
                    <div className="mt-auto pt-2 flex flex-wrap gap-2">
                      {player.handicap && player.handicap !== 100 && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                          {player.handicap}% handicap
                        </span>
                      )}
                      {!!stats?.autoscoutUsage && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                          Auto scouted
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {matchInfo && (
        <section className="panel flex flex-col gap-4 rounded-3xl p-6">
          <h2 className="headline text-2xl font-semibold">Game info</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {matchInfo.filename && (
              <div className="flex flex-col gap-1 md:col-span-full border-b border-white/5 pb-2">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Filename</span>
                <span className="font-semibold text-[color:var(--foreground)] truncate" title={matchInfo.filename}>
                  {matchInfo.filename}
                </span>
              </div>
            )}
            {matchInfo.gameTypeId !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Game mode</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {getGameTypeName(matchInfo.gameTypeId) ?? `Type ${matchInfo.gameTypeId}`}
                </span>
              </div>
            )}
            {matchInfo.mapTypeId !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Map name</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {getMapName(matchInfo.mapTypeId) ?? `Map ${matchInfo.mapTypeId}`}
                </span>
              </div>
            )}
            {matchInfo.mapSizeId !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Map size</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {getMapSizeName(matchInfo.mapSizeId) ?? matchInfo.mapSizeId}
                </span>
              </div>
            )}
            {matchInfo.populationLimit !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Population limit</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {matchInfo.populationLimit}
                </span>
              </div>
            )}
            {matchInfo.victoryTypeId !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Victory</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {getVictoryTypeName(matchInfo.victoryTypeId) ?? `Type ${matchInfo.victoryTypeId}`}
                </span>
              </div>
            )}
            {matchInfo.cheats !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Cheats used</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {matchInfo.cheats ? "Yes" : "No"}
                </span>
              </div>
            )}
            {(matchInfo.difficultyName || matchInfo.difficultyId !== undefined) && players.some(p => p.ai) && (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">AI difficulty</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {matchInfo.difficultyName || `Difficulty ${matchInfo.difficultyId}`}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
