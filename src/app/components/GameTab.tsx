"use client";

import { useMemo, useState } from "react";
import { TiltCard } from "./TiltCard";
import { Toggle } from "./Toggle";
import { AiBadge } from "./AiBadge";
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

  const matchFormat = useMemo(() => {
    if (!players || players.length === 0) return "";

    const teamSlots = new Map<number, Set<number>>();
    const unteamedSlots = new Set<number>();

    players.forEach((p) => {
      const slot = p.slotId ?? p.id;
      if (p.teamId !== undefined && p.teamId > 0) {
        let slots = teamSlots.get(p.teamId);
        if (!slots) {
          slots = new Set();
          teamSlots.set(p.teamId, slots);
        }
        slots.add(slot);
      } else {
        unteamedSlots.add(slot);
      }
    });

    const sortedTeams = Array.from(teamSlots.entries()).sort((a, b) => a[0] - b[0]);
    const sizes = sortedTeams.map(([_, slots]) => slots.size);

    unteamedSlots.forEach(() => {
      sizes.push(1);
    });

    const totalSlots = sizes.reduce((a, b) => a + b, 0);

    if (sizes.length <= 1) {
      return `${totalSlots}`;
    }

    return sizes.join(" vs ");
  }, [players]);

  return (
    <div className="flex flex-col gap-6">
      <section className="panel rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <h2 className="headline text-2xl font-semibold">Players</h2>
          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
            {matchFormat || players.length}
          </span>
          {matchInfo && (matchInfo.difficultyName || matchInfo.difficultyId !== undefined) && players.some((p) => p.ai) && (
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
              {matchInfo.difficultyName || `Difficulty ${matchInfo.difficultyId}`} AI
            </span>
          )}
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
                      {player.ai && <AiBadge />}
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

      <section className="panel flex flex-col gap-4 rounded-3xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="headline text-2xl font-semibold">In-game chat</h2>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
              {filteredChat.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Toggle
              label="System"
              checked={chatShowSystem}
              onChange={setChatShowSystem}
            />
            <Toggle
              label="Chat"
              checked={chatShowChat}
              onChange={setChatShowChat}
            />
            {hasAi && isTeamGame && (
              <Toggle
                label="AI team chat"
                checked={chatShowAiTeamChat}
                onChange={setChatShowAiTeamChat}
              />
            )}
          </div>
        </div>

        {chatEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No in-game chat messages recorded in this replay.
          </div>
        ) : filteredChat.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No messages match the selected filters.
          </div>
        ) : (
          <div className="bg-[#1c1610] rounded-2xl px-4 pt-4 pb-2 border border-white/5">
            <div className="space-y-1">
              {filteredChat.map((item) => {
                const timeLabel = item.time === 0 ? "Lobby" : formatClock(item.time);
                const pColor = item.playerId ? getPlayerColor(item.playerId) : undefined;
                const senderTeamId = item.teamId ?? (item.playerId ? players.find((p) => p.id === item.playerId)?.teamId : undefined);

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSeek?.(item.time);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      title={`Jump to ${timeLabel}`}
                      className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-mono font-medium transition cursor-pointer select-none bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10"
                    >
                      {timeLabel}
                    </button>

                    <div className="flex flex-1 flex-col min-w-0">
                      {!item.isSystem && (
                        <div className="flex flex-wrap items-center gap-2">
                          {item.playerName && (
                            <span className="flex items-center gap-1.5 font-semibold text-sm leading-tight text-white/30">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white"
                                style={{ background: pColor || "#FFFFFF" }}
                              />
                              <span>{item.playerName}</span>
                            </span>
                          )}

                          {item.scope === "team" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                              <span className="text-emerald-300/70 font-normal">to</span>
                              <span>Team {senderTeamId !== undefined ? senderTeamId : ""}</span>
                            </span>
                          )}

                          {item.scope === "direct" && item.recipientName && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-inset ring-purple-400/30">
                              <span className="text-purple-300/70 font-normal">to</span>
                              {item.recipientPlayerId !== undefined && (
                                <span
                                  className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white"
                                  style={{ background: getPlayerColor(item.recipientPlayerId) }}
                                />
                              )}
                              <span>{item.recipientName}</span>
                            </span>
                          )}

                          {item.tauntNumber && (
                            <span className="inline-flex items-center rounded-md bg-blue-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-inset ring-blue-400/30">
                              Taunt {item.tauntNumber}
                            </span>
                          )}
                        </div>
                      )}

                      <p className={`text-sm break-words ${item.isSystem ? "italic text-white/30 py-0.5" : "mt-0.5 text-white/90"}`}>
                        {item.isSystem && pColor && (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white mr-2 align-middle -translate-y-[1px]"
                            style={{ background: pColor }}
                          />
                        )}
                        {item.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
            {matchInfo.filename && (
              <div className="flex flex-col gap-1 md:col-span-full border-t border-white/5 pt-2">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Filename</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {matchInfo.filename}
                </span>
              </div>
            )}
            {matchInfo.sourceUrl && (
              <div className="flex flex-col gap-1 md:col-span-full border-t border-white/5 pt-2">
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Source URL</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {matchInfo.sourceUrl}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
