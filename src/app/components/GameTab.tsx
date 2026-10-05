"use client";

import { useMemo, useState } from "react";
import { TiltCard } from "./TiltCard";
import { Toggle } from "./Toggle";
import { PlayerHeader } from "./PlayerHeader";
import { APMChart } from "./APMChart";
import { getCivName } from "@/lib/civMappings";
import { getGameTypeName, getMapName, getMapSizeName, getVictoryTypeName } from "@/lib/gameMappings";
import { type MatchInfo, type ChatEvent, detectAgeAdvance } from "@/lib/replayProcessor";
import { DEBUG } from "@/lib/debug";

const AGE_ROMAN: Record<string, string> = {
  Dark: "I",
  Feudal: "II",
  Castle: "III",
  Imperial: "IV",
};

interface GameTabProps {
  players: any[];
  timelineStats: any[];
  matchInfo: MatchInfo | null;
  chatEvents?: ChatEvent[];
  getPlayerColor: (playerId?: number) => string;
  getPlayerOutline: (playerId?: number) => string;
  selectedTime: number;
  formatClock: (seconds: number) => string;
  onSeek?: (seconds: number) => void;
}

export function GameTab({
  players,
  timelineStats,
  matchInfo,
  chatEvents = [],
  getPlayerColor,
  getPlayerOutline,
  selectedTime,
  formatClock,
  onSeek,
}: GameTabProps) {
  const allPlayersWon = useMemo(() => players.length > 0 && players.every((p) => p.won), [players]);
  const formatNum = (value: number) => new Intl.NumberFormat().format(value);

  const [chatShowSystem, setChatShowSystem] = useState(true);
  const [chatShowChat, setChatShowChat] = useState(true);
  const [chatShowAiTeamChat, setChatShowAiTeamChat] = useState(false);
  const [chatShowLobby, setChatShowLobby] = useState(false);
  const [showAiApm, setShowAiApm] = useState(true);

  const statsByPlayerId = useMemo(() => {
    const map = new Map<number, any>();
    timelineStats.forEach((s) => map.set(s.playerId, s));
    return map;
  }, [timelineStats]);

  const hasAi = useMemo(() => players.some((p) => p.ai), [players]);
  const chartPlayers = useMemo(() => {
    const seen = new Set<number>();
    return players.filter(player => {
      if (!showAiApm && player.ai) return false;
      if (seen.has(player.id)) return false;
      seen.add(player.id);
      return true;
    });
  }, [players, showAiApm]);

  const chartData = useMemo(() => {
    return chartPlayers.map((player) => ({
      playerId: player.id,
      history: statsByPlayerId.get(player.id)?.apmHistory || [],
    }));
  }, [chartPlayers, statsByPlayerId]);

  const chartAgeTimings = useMemo(() => {
    return chartPlayers
      .map((player) => ({
        playerId: player.id,
        timings: statsByPlayerId.get(player.id)?.ageTimings ?? {},
        textColor: getPlayerOutline(player.id),
      }))
      .filter((player) => Object.keys(player.timings).length > 0);
  }, [chartPlayers, statsByPlayerId, getPlayerOutline]);
  const hasLobbyChat = useMemo(() => (chatEvents ?? []).some((item) => item.time === 0), [chatEvents]);

  const hasAiTeamChat = useMemo(() => {
    return (chatEvents ?? []).some((item) => {
      if (!DEBUG && item.time === 0) return false;
      return !item.isSystem && item.isAi && item.scope !== "all";
    });
  }, [chatEvents]);

  const filteredChat = useMemo(() => {
    return (chatEvents ?? []).filter((item) => {
      if (item.time === 0) {
        if (!DEBUG || !chatShowLobby) return false;
      }
      if (item.isSystem) return chatShowSystem;
      if (item.isAi && item.scope !== "all") return chatShowAiTeamChat;
      return chatShowChat;
    });
  }, [chatEvents, chatShowSystem, chatShowChat, chatShowAiTeamChat, chatShowLobby]);

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

    if (sizes.every((s) => s === 1) && sizes.length > 2) {
      return `${sizes.length} player FFA`;
    }

    return sizes.join(" vs ");
  }, [players]);

  const hasRmRatingInfo = useMemo(() => {
    return players.some(
      (p) => !p.ai && (p.elo !== undefined || p.rank !== undefined)
    );
  }, [players]);

  const hasTeamRatingInfo = useMemo(() => {
    return players.some(
      (p) => !p.ai && (p.teamElo !== undefined || p.teamRank !== undefined)
    );
  }, [players]);

  const showTeamLabels = useMemo(() => {
    const counts = new Map<number, number>();
    players.forEach((p) => {
      if (p.teamId !== undefined && p.teamId > 0) {
        counts.set(p.teamId, (counts.get(p.teamId) || 0) + 1);
      }
    });
    return Array.from(counts.values()).some((count) => count > 1);
  }, [players]);

  return (
    <div className="flex flex-col gap-4">
      <section className="tab-section flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="headline text-2xl font-semibold">Players</h2>
          <span className="inline-flex items-center rounded-full bg-[color:var(--badge-bg)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] ring-1 ring-inset ring-[color:var(--border-subtle)]">
            {matchFormat || players.length}
          </span>
          {matchInfo && (matchInfo.difficultyName || matchInfo.difficultyId !== undefined) && players.some((p) => p.ai) && (
            <span className="inline-flex items-center rounded-full bg-[color:var(--badge-bg)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] ring-1 ring-inset ring-[color:var(--border-subtle)]">
              {matchInfo.difficultyName || `Difficulty ${matchInfo.difficultyId}`} AI
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {players.map((player, index) => {
            const stats = statsByPlayerId.get(player.id);
            const showRatingInfo = (hasRmRatingInfo || hasTeamRatingInfo) && !player.ai;
            return (
              <TiltCard
                key={`${player.id}-${index}`}
                className="panel-strong p-4 flex flex-col gap-5 player-card-3d-base"
              >
                <PlayerHeader
                  name={player.name}
                  color={getPlayerColor(player.id)}
                  outlineColor={getPlayerOutline(player.id)}
                  ai={player.ai}
                  won={player.won && !allPlayersWon}
                  civ={getCivName(player.civId)}
                  team={showTeamLabels ? player.teamId : undefined}
                />
                <div className="space-y-4 text-sm flex-1 flex flex-col">
                  {showRatingInfo && (
                    <div>
                      <div className="-mx-4 px-4 flex items-center justify-between border-b border-[color:var(--divider)] pb-1 mb-2">
                        <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Player rating</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {hasRmRatingInfo && (
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs text-[color:var(--muted)] shrink-0" title="Random Map 1v1">RM 1v1</span>
                            <span className="text-xs tabular-nums bg-[color:var(--badge-bg)] px-1.5 py-0.5 rounded text-[color:var(--muted)] inline-flex items-center">
                              <span className="text-[color:var(--foreground)]">
                                {player.elo !== undefined ? player.elo : "—"}
                              </span>
                              {player.rank !== undefined && player.rank > 0 ? (
                                <span className="pl-1.5">(#{player.rank})</span>
                              ) : (
                                ""
                              )}
                            </span>
                          </div>
                        )}
                        {hasTeamRatingInfo && (
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs text-[color:var(--muted)] shrink-0" title="Team Random Map">Team RM</span>
                            <span className="text-xs tabular-nums bg-[color:var(--badge-bg)] px-1.5 py-0.5 rounded text-[color:var(--muted)] inline-flex items-center">
                              <span className="text-[color:var(--foreground)]">
                                {player.teamElo !== undefined ? player.teamElo : "—"}
                              </span>
                              {player.teamRank !== undefined && player.teamRank > 0 ? (
                                <span className="pl-1.5">(#{player.teamRank})</span>
                              ) : (
                                ""
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="-mx-4 px-4 flex items-center justify-between border-b border-[color:var(--divider)] pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--accent)]">Effective APM</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs text-[color:var(--muted)] shrink-0" title="Average APM">Average APM</span>
                        <span className="text-xs tabular-nums bg-[color:var(--badge-bg)] px-1.5 py-0.5 rounded text-[color:var(--muted)] inline-flex items-center">
                          <span className="text-[color:var(--foreground)]">
                            {stats?.apm !== undefined ? formatNum(stats.apm) : "—"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs text-[color:var(--muted)] shrink-0" title="Peak APM">Peak APM</span>
                        <span className="text-xs tabular-nums bg-[color:var(--badge-bg)] px-1.5 py-0.5 rounded text-[color:var(--muted)] inline-flex items-center">
                          <span className="text-[color:var(--foreground)]">
                            {stats?.peakApm !== undefined ? formatNum(stats.peakApm) : "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="-mx-4 px-4 flex items-center justify-between border-b border-[color:var(--divider)] pb-1 mb-2">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--color-eco)]">Age up time</span>
                    </div>
                    {stats?.ageTimings && Object.keys(stats.ageTimings).length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {Object.entries(stats.ageTimings).map(([age, time]) => (
                          <div key={age} className="flex items-center justify-between gap-1.5 group/age">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-[color:var(--muted)] shrink-0">{age}</span>
                              {time === (fastestAges as any)[age] && (
                                <span title="Fastest" className="text-[10px] select-none">🥇</span>
                              )}
                            </div>
                            <span className="text-xs tabular-nums bg-[color:var(--badge-bg)] px-1.5 py-0.5 rounded text-[color:var(--muted)] inline-flex items-center">
                              <span className="text-[color:var(--foreground)]">
                                {formatClock(time as number)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[color:var(--muted)]">—</p>
                    )}
                  </div>
                  {((player.handicap && player.handicap !== 100) || !!stats?.autoscoutUsage || !!stats?.opening) && (
                    <div className="flex flex-wrap gap-2">
                      {!!stats?.opening && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                          {stats.opening} opening
                        </span>
                      )}
                      {player.handicap && player.handicap !== 100 && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                          {player.handicap}% handicap
                        </span>
                      )}
                      {!!stats?.autoscoutUsage && (
                        <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                          Auto scout
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

      <section className="tab-section flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="headline text-2xl font-semibold">Actions per minute</h2>
          {hasAi && (
            <Toggle
              label="Graph AI APM"
              checked={showAiApm}
              onChange={setShowAiApm}
            />
          )}
        </div>

        <APMChart
          data={chartData}
          players={chartPlayers}
          getPlayerColor={getPlayerColor}
          selectedTime={selectedTime}
          ageTimings={chartAgeTimings}
          isLogScale={showAiApm && hasAi}
        />
      </section>

      <section className="tab-section flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="headline text-2xl font-semibold">Game chat</h2>
            <span className="inline-flex items-center rounded-full bg-[color:var(--badge-bg)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] ring-1 ring-inset ring-[color:var(--border-subtle)]">
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
            {hasAiTeamChat && (
              <Toggle
                label="AI team chat"
                checked={chatShowAiTeamChat}
                onChange={setChatShowAiTeamChat}
              />
            )}
            {DEBUG && hasLobbyChat && (
              <Toggle
                label="Lobby"
                checked={chatShowLobby}
                onChange={setChatShowLobby}
              />
            )}
          </div>
        </div>

        {chatEvents.length === 0 ? (
          <div className="border border-dashed border-[color:var(--border-subtle)] p-8 text-center text-sm text-[color:var(--muted)]">
            No in-game chat messages recorded in this replay.
          </div>
        ) : filteredChat.length === 0 ? (
          <div className="border border-dashed border-[color:var(--border-subtle)] p-8 text-center text-sm text-[color:var(--muted)]">
            No messages match the selected filters.
          </div>
        ) : (
          <div className="bg-[color:var(--panel)] px-4 py-3 border border-[color:var(--divider)]">
            <div className="space-y-1">
              {filteredChat.map((item) => {
                const timeLabel = item.time === 0 ? "Lobby" : formatClock(item.time);
                const pColor = item.playerId ? getPlayerColor(item.playerId) : undefined;
                const pOutline = item.playerId ? getPlayerOutline(item.playerId) : undefined;
                const senderTeamId = item.teamId ?? (item.playerId ? players.find((p) => p.id === item.playerId)?.teamId : undefined);
                const detectedAge = item.isSystem ? detectAgeAdvance(item.rawMessage, item.message, item.playerName) : null;
                const ageRoman = detectedAge ? AGE_ROMAN[detectedAge] : null;
                const isResign = item.isSystem && ((item.raw as any)?.type === "Resign" || /\bresigned\b/i.test(item.message) || /\bresigned\b/i.test(item.rawMessage ?? ""));
                const isCheat = item.isSystem && ((item.raw as any)?.type === "Cheat" || /\bused a cheat\b/i.test(item.message) || /\bused a cheat\b/i.test(item.rawMessage ?? ""));

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
                      className="w-11 shrink-0 rounded-md px-2 h-6 inline-flex items-center justify-center text-center text-[11px] font-mono tabular-nums transition cursor-pointer select-none bg-[color:var(--btn-subtle-bg)] text-[color:var(--foreground)]/70 hover:bg-[color:var(--btn-subtle-bg-hover)] hover:text-[color:var(--foreground)] border border-[color:var(--border-subtle)]"
                    >
                      {timeLabel}
                    </button>

                    <div className="flex flex-1 flex-col min-w-0">
                      {!item.isSystem && (
                        <div className="flex flex-wrap items-center gap-1 min-h-6">
                          {item.playerName && (
                            <span className="flex items-center gap-1.5 text-sm leading-tight text-[color:var(--muted)]">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white"
                                style={{ background: pColor || "#FFFFFF" }}
                              />
                              <span>{item.playerName}</span>
                            </span>
                          )}

                          {item.scope === "team" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                              <span className="font-normal opacity-70">to</span>
                              <span className="text-[color:var(--accent)]">Team {senderTeamId !== undefined ? senderTeamId : ""}</span>
                            </span>
                          )}

                          {item.scope === "direct" && item.recipientName && (
                            <span className="inline-flex items-center text-[10px] text-[color:var(--foreground)]/60">
                              <span className="font-normal">to</span>
                              {item.recipientPlayerId !== undefined && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full shrink-0 ring-1 ring-white/80 ml-1.5"
                                  style={{ background: getPlayerColor(item.recipientPlayerId) }}
                                />
                              )}
                              <span className="ml-1">{item.recipientName}</span>
                            </span>
                          )}

                        </div>
                      )}

                      <p className={`text-sm break-words ${item.isSystem ? "text-[color:var(--muted)] min-h-6 py-0.5 leading-5" : "mt-0.5 text-[color:var(--foreground)]"}`}>
                        {item.isSystem && (
                          ageRoman ? (
                            <span
                              className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-sm font-serif font-black text-[10px] leading-none mr-2 select-none ring-1 ring-white shadow-sm align-middle -translate-y-px"
                              style={{
                                backgroundColor: pColor || getPlayerColor(0),
                                color: pOutline || getPlayerOutline(0),
                              }}
                              title={`${detectedAge} Age`}
                            >
                              <span className="translate-y-[0.5px]">{ageRoman}</span>
                            </span>
                          ) : pColor ? (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white mr-2 align-middle -translate-y-px"
                              style={{ background: pColor }}
                            />
                          ) : null
                        )}
                        <span>{item.message}</span>
                        {isCheat && <span className="ml-1.5">👾</span>}
                        {isResign && <span className="ml-1.5">💀</span>}
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
        <section className="tab-section flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="headline text-2xl font-semibold">Game info</h2>
            {matchInfo.timestamp !== undefined && (
              <span
                className="inline-flex items-center rounded-full bg-[color:var(--badge-bg)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] ring-1 ring-inset ring-[color:var(--border-subtle)]"
                title={new Date(matchInfo.timestamp * 1000).toISOString()}
              >
                {new Date(matchInfo.timestamp * 1000).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className="bg-[color:var(--panel)] p-4 border border-[color:var(--divider)]">
            <div className="grid gap-4 md:grid-cols-3">
              {matchInfo?.gameTypeId !== undefined && (
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
                    {matchInfo.customMapName ?? getMapName(matchInfo.mapTypeId) ?? `Map ${matchInfo.mapTypeId}`}
                  </span>
                  {matchInfo.customMapPackName && (
                    <span className="text-xs text-[color:var(--muted)]">{matchInfo.customMapPackName}</span>
                  )}
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
              {(matchInfo.filename || matchInfo.sourceUrl) && (
                <div className="flex flex-col gap-3 md:col-span-full -mx-4 px-4 border-t border-white/5 pt-4">
                  {matchInfo.filename && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Filename</span>
                      <span className="font-semibold text-[color:var(--foreground)]">
                        {matchInfo.filename}
                      </span>
                    </div>
                  )}
                  {matchInfo.sourceUrl && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Source URL</span>
                      <span className="font-semibold text-[color:var(--foreground)]">
                        {matchInfo.sourceUrl}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
