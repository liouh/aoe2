"use client";

import { useMemo, useState } from "react";
import { TiltCard } from "./TiltCard";
import { getCivName } from "@/lib/civMappings";
import { getGameTypeName, getMapName, getMapSizeName, getVictoryTypeName } from "@/lib/gameMappings";
import { type MatchInfo, type ChatEvent } from "@/lib/replayProcessor";

interface GameTabProps {
  players: any[];
  timelineStats: any[];
  matchInfo: MatchInfo | null;
  chatEvents?: ChatEvent[];
  getPlayerColor: (playerId?: number) => string;
  formatClock: (seconds: number) => string;
  onSeek?: (seconds: number) => void;
}

export function GameTab({
  players,
  timelineStats,
  matchInfo,
  chatEvents = [],
  getPlayerColor,
  formatClock,
  onSeek,
}: GameTabProps) {
  const allPlayersWon = useMemo(() => players.length > 0 && players.every((p) => p.won), [players]);

  const [chatShowSystem, setChatShowSystem] = useState(true);
  const [chatShowChat, setChatShowChat] = useState(true);
  const [chatShowAiTeamChat, setChatShowAiTeamChat] = useState(false);

  const hasAi = useMemo(() => players.some((p) => p.ai), [players]);
  const isTeamGame = useMemo(() => {
    if (players.length > 2) return true;
    const teamCounts = new Map<number, number>();
    players.forEach((p) => {
      if (p.teamId !== undefined && p.teamId > 0) {
        teamCounts.set(p.teamId, (teamCounts.get(p.teamId) || 0) + 1);
      }
    });
    return Array.from(teamCounts.values()).some((count) => count > 1);
  }, [players]);

  const filteredChat = useMemo(() => {
    return chatEvents.filter((item) => {
      if (item.time === 0) return false;
      if (item.isSystem) return chatShowSystem;
      if (isTeamGame && item.isAi && item.scope !== "all") return chatShowAiTeamChat;
      return chatShowChat;
    });
  }, [chatEvents, chatShowSystem, chatShowChat, chatShowAiTeamChat, isTeamGame]);

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
                    className="ml-2 h-3 w-3 rounded-full shrink-0 ring-1 ring-white"
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
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Cheats enabled</span>
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
            {matchInfo.filename && (
              <div className="flex flex-col gap-1 md:col-span-full border-t border-white/5 pt-2">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Filename</span>
                <span className="font-semibold text-[color:var(--foreground)] truncate" title={matchInfo.filename}>
                  {matchInfo.filename}
                </span>
              </div>
            )}
            {matchInfo.sourceUrl && (
              <div className="flex flex-col gap-1 md:col-span-full border-t border-white/5 pt-2">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Source URL</span>
                <span className="font-semibold text-[color:var(--foreground)] truncate" title={matchInfo.sourceUrl}>
                  {matchInfo.sourceUrl}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="panel flex flex-col gap-4 rounded-3xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="headline text-2xl font-semibold">In-game chat</h2>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
              {filteredChat.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={chatShowSystem}
                  onChange={(e) => setChatShowSystem(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${chatShowSystem ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`} />
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${chatShowSystem ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
                System
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={chatShowChat}
                  onChange={(e) => setChatShowChat(e.target.checked)}
                />
                <div className={`block w-8 h-5 rounded-full transition-colors ${chatShowChat ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`} />
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${chatShowChat ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
                Chat
              </span>
            </label>

            {hasAi && isTeamGame && (
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className="relative rounded-full focus-within:ring-1 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--panel)]">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={chatShowAiTeamChat}
                    onChange={(e) => setChatShowAiTeamChat(e.target.checked)}
                  />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${chatShowAiTeamChat ? 'bg-[color:var(--accent)]' : 'bg-white/10'}`} />
                  <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${chatShowAiTeamChat ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
                  AI team chat
                </span>
              </label>
            )}
          </div>
        </div>

        {chatEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No in-game chat messages recorded in this replay.
          </div>
        ) : filteredChat.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No messages match the selected filter.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChat.map((item) => {
              const timeLabel = formatClock(item.time);
              const pColor = item.playerId ? getPlayerColor(item.playerId) : undefined;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 ${
                    item.isSystem
                      ? "bg-white/[0.02] text-white/60"
                      : "bg-white/[0.05]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSeek?.(item.time)}
                    title={`Jump to ${timeLabel}`}
                    className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-mono font-medium transition cursor-pointer select-none bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10"
                  >
                    {timeLabel}
                  </button>

                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.playerName ? (
                        <span className="flex items-center gap-1.5 font-semibold text-sm leading-tight text-white">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white"
                            style={{ background: pColor || "#FFFFFF" }}
                          />
                          <span className="truncate">{item.playerName}</span>
                          {item.isAi && (
                            <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 font-normal text-[10px] tracking-widest text-white/40 ring-1 ring-inset ring-white/10">
                              AI
                            </span>
                          )}
                        </span>
                      ) : item.isSystem ? (
                        <span className="inline-flex items-center rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-inset ring-amber-400/20">
                          System
                        </span>
                      ) : null}

                      {isTeamGame && item.scope === "all" && !item.isSystem && (
                        <span className="inline-flex items-center rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                          All
                        </span>
                      )}

                      {item.tauntNumber && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-inset ring-blue-400/30">
                          Taunt {item.tauntNumber}
                        </span>
                      )}
                    </div>

                    <p className={`mt-0.5 text-sm break-words ${item.isSystem ? "italic text-white/60" : "text-white/90"}`}>
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
