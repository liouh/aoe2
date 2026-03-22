"use client";

import { parse_rec, parse_rec_summary } from "../aoe2rec-js/aoe2rec_js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimeline,
  determineDuration,
  extractPlayerStats,
  extractMatchInfo,
  summarizePlayers,
  type MatchInfo,
  type TimelineEvent,
} from "@/lib/replayProcessor";
import { SAMPLE_REPLAYS } from "@/lib/sampleReplays";
import { Minimap } from "./components/Minimap";
import { GameTab } from "./components/GameTab";
import { StatsTab } from "./components/StatsTab";
import { TimelineTab } from "./components/TimelineTab";
import JSZip from "jszip";

const PLAYER_COLORS = [
  "#3252FF",
  "#FF0000",
  "#00FF00",
  "#FFFF00",
  "#00FFFF",
  "#B030B0",
  "#707070",
  "#FF9100",
];
const PLAYER_OUTLINES = [
  "#ffffff", // 1 blue
  "#ffffff", // 2 red
  "#000000", // 3 green
  "#000000", // 4 yellow
  "#000000", // 5 cyan
  "#ffffff", // 6 purple
  "#ffffff", // 7 grey
  "#000000", // 8 orange
];

const KEYBOARD_STEP_SECONDS = 30;
const KEYBOARD_STEP_SHIFT_SECONDS = 120;
// Playback speed = 1000 / PLAYBACK_INTERVAL_MS * PLAYBACK_STEP_SECONDS
// 1000 / 66 * 4 = 60x speed
const PLAYBACK_STEP_SECONDS = 4;
const PLAYBACK_INTERVAL_MS = 66;

const formatClock = (seconds: number) => {
  const total = Math.max(seconds, 0);
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [replay, setReplay] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [duration, setDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const selectedTimeRef = useRef(selectedTime);
  useEffect(() => {
    selectedTimeRef.current = selectedTime;
  }, [selectedTime]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"game" | "stats" | "timeline">("game");
  const [pendingJump, setPendingJump] = useState(false);
  const [replayUrl, setReplayUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const unloadReplay = () => {
    setReplay(null);
    setSummary(null);
    setMatchInfo(null);
    setEvents([]);
    setDuration(0);
    resetGameState();
  };

  const resetGameState = () => {
    setIsPlaying(false);
    setSelectedTime(0);
    setActiveTab("game");
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const lastKeyTimeRef = useRef(0);

  const players = useMemo(
    () => summarizePlayers(summary, replay),
    [replay, summary]
  );

  const playerIdToColorId = useMemo(() => {
    const map = new Map<number, number>();
    players.forEach((p) => {
      if (p.id !== undefined && p.colorId !== undefined) {
        map.set(p.id, p.colorId);
      }
    });
    return map;
  }, [players]);

  const getPlayerColor = (playerId?: number) => {
    if (playerId === undefined) return "#000000";
    const colorId = playerIdToColorId.get(playerId);
    if (colorId === undefined || colorId < 0) return "#000000";
    return PLAYER_COLORS[(colorId) % PLAYER_COLORS.length];
  };

  const getPlayerOutline = (playerId?: number) => {
    if (playerId === undefined) return "#ffffff";
    const colorId = playerIdToColorId.get(playerId);
    if (colorId === undefined || colorId < 0) return "#ffffff";
    return PLAYER_OUTLINES[(colorId) % PLAYER_OUTLINES.length];
  };

  // Sync player selection when player data changes or is loaded
  const timelineStats = useMemo(
    () => extractPlayerStats(events, duration, players),
    [events, duration, players]
  );

  // Manage the playback timer: increments selectedTime when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return prev;
        }
        return Math.min(prev + PLAYBACK_STEP_SECONDS, duration);
      });
    }, PLAYBACK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const loadReplayData = async (buffer: ArrayBuffer, filename?: string, sourceUrl?: string) => {
    setLoading(true);
    setError(null);
    setLoadingStep(0);
    try {
      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 50));

      const parsed = parse_rec(buffer);
      const parsedSummary = parse_rec_summary(buffer);
      if (typeof window !== "undefined") {
        (window as any).__aoe2rec = parsed;
        (window as any).__aoe2summary = parsedSummary;
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      const timeline = buildTimeline(parsed, parsedSummary);
      const gameDuration = determineDuration(parsedSummary, timeline);
      const extractedInfo = extractMatchInfo(parsed, filename, sourceUrl);

      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 50));

      setReplay(parsed);
      setSummary(parsedSummary);
      setMatchInfo(extractedInfo);
      setEvents(timeline);
      setDuration(gameDuration);

      resetGameState();
    } catch (err) {
      setError(filename || "Try another file");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    unloadReplay();

    const reader = new FileReader();
    reader.addEventListener("loadend", async () => {
      const buffer = reader.result as ArrayBuffer;
      await loadReplayData(buffer, file.name);
    });
    reader.readAsArrayBuffer(file);
  };

  const handleUrlLoad = async () => {
    if (!replayUrl) return;

    setShowUrlInput(false);
    unloadReplay();

    const lowerUrl = replayUrl.toLowerCase();
    const isAllowed =
      lowerUrl.includes("api.ageofempires.com") ||
      lowerUrl.includes("aoe.ms");

    if (!isAllowed) {
      setError("Only https://api.ageofempires.com/ and https://aoe.ms/ links are supported.");
      return;
    }

    let targetUrl = replayUrl;
    if (replayUrl.includes("aoe.ms/replay")) {
      try {
        const url = new URL(replayUrl);
        const gameId = url.searchParams.get("gameId");
        const profileId = url.searchParams.get("profileId");
        if (gameId && profileId) {
          targetUrl = `https://api.ageofempires.com/api/GameStats/AgeII/GetMatchReplay/?matchId=${gameId}&profileId=${profileId}`;
        }
      } catch (e) {
        // Fallback to original URL if parsing fails
      }
    }

    setLoading(true);
    setError(null);
    setLoadingStep(0);
    let replayUrlOrName = replayUrl;

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      let buffer = await response.arrayBuffer();

      // If it looks like a ZIP file (starts with PK), unzip it
      const uint8 = new Uint8Array(buffer.slice(0, 4));
      if (uint8[0] === 0x50 && uint8[1] === 0x4b && uint8[2] === 0x03 && uint8[3] === 0x04) {
        const zip = await JSZip.loadAsync(buffer);
        const recordFile = Object.values(zip.files).find(f =>
          f.name.endsWith(".aoe2record")
        );
        if (recordFile) {
          replayUrlOrName = recordFile.name;
          buffer = await recordFile.async("arraybuffer");
        }
      }

      await loadReplayData(buffer, replayUrlOrName, replayUrl);
    } catch (err: any) {
      setError(`${err.message}: ${replayUrlOrName}`);
    } finally {
      setLoading(false);
    }
  };

  // Load a random sample replay on initial component mount
  useEffect(() => {
    const loadDefault = async () => {
      const randomFile = SAMPLE_REPLAYS[Math.floor(Math.random() * SAMPLE_REPLAYS.length)];
      const response = await fetch(randomFile);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const buffer = await response.arrayBuffer();
      await loadReplayData(buffer);
    };
    loadDefault();
  }, []);

  // Global keyboard listener for seeking (Left/Right arrows) and play/pause (Space)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.code !== "Space") return;
      const target = event.target as HTMLElement;

      if (event.code === "Space") {
        if (
          (target?.tagName === "INPUT" && (target as HTMLInputElement).type !== "range") ||
          target?.tagName === "TEXTAREA" ||
          target?.tagName === "BUTTON" ||
          target?.tagName === "SELECT" ||
          target?.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        if (selectedTimeRef.current >= duration) {
          setSelectedTime(0);
          setIsPlaying(true);
        } else {
          setIsPlaying((prev) => !prev);
        }
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (
          (target?.tagName === "INPUT" && (target as HTMLInputElement).type !== "range") ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable
        ) {
          return;
        }
      }

      const now = performance.now();
      if (now - lastKeyTimeRef.current < 16) return;
      lastKeyTimeRef.current = now;
      const step = event.shiftKey ? KEYBOARD_STEP_SHIFT_SECONDS : KEYBOARD_STEP_SECONDS;
      requestAnimationFrame(() => {
        setSelectedTime((prev) => {
          const next =
            event.key === "ArrowRight" ? prev + step : prev - step;
          return clamp(next, 0, Math.max(duration, 1));
        });
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duration]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-stretch justify-between gap-4">
            <div className="space-y-1">
              <h1 className="headline text-2xl font-semibold text-[color:var(--foreground)] lg:text-4xl">
                <span className="text-[color:var(--muted)] font-black">AoE2</span> Replay Viewer
              </h1>
              <p className="max-w-2xl text-sm text-[color:var(--muted)] lg:text-lg mb-3">
                In-browser minimap playback + key stats + build timelines
              </p>
            </div>
            <div className="flex flex-row gap-2">
              {!showUrlInput ? (
                <>
                  <label
                    className="flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-2xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-within:ring-1 focus-within:ring-white transition-all"
                    onClick={() => setIsPlaying(false)}
                  >
                    <span className="text-xl lg:text-2xl">📁</span>
                    <span className="lg:inline">Open .aoe2record file</span>
                    <input
                      id="replay-file-input"
                      name="replay-file"
                      type="file"
                      accept=".aoe2record"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        handleFile(file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-2xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus:ring-1 focus:ring-white transition-all"
                    onClick={() => {
                      setIsPlaying(false);
                      setShowUrlInput(true);
                      setReplayUrl("");
                    }}
                  >
                    <span className="text-xl lg:text-2xl">🔗</span>
                    <span className="lg:inline">Load replay from URL</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-row items-center gap-2 w-full ml-auto self-stretch">
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      autoFocus
                      id="replay-url-input"
                      name="replay-url"
                      type="url"
                      placeholder="Paste replay URL..."
                      className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[color:var(--accent)] transition-colors h-10 lg:h-12"
                      value={replayUrl}
                      onChange={(e) => setReplayUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUrlLoad();
                        }
                        if (e.key === "Escape") {
                          setShowUrlInput(false);
                        }
                      }}
                    />
                    <button
                      className="px-4 py-2 rounded-xl bg-[color:var(--accent)] text-xs lg:text-sm font-bold text-white shadow-lg lg:hover:shadow-[color:var(--accent)]/20 transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
                      onClick={handleUrlLoad}
                    >
                      Load
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 text-xs lg:text-sm font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
                      onClick={() => setShowUrlInput(false)}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-col gap-6">
          <Minimap
            replay={replay}
            summary={summary}
            matchInfo={matchInfo}
            events={events}
            duration={duration}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            loading={loading}
            loadingStep={loadingStep}
            error={error}
            players={players}
            getPlayerColor={getPlayerColor}
            getPlayerOutline={getPlayerOutline}
            formatClock={formatClock}
            setActiveTab={setActiveTab}
            setPendingJump={setPendingJump}
          />

          {replay && (
            <div className="flex flex-col gap-6">
              <div className="flex border-b border-white/10">
                <button
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === "game"
                    ? "border-b-2 border-[color:var(--accent)] text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                  onClick={() => setActiveTab("game")}
                >
                  Game
                </button>
                <button
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === "stats"
                    ? "border-b-2 border-[color:var(--accent)] text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                  onClick={() => setActiveTab("stats")}
                >
                  Stats
                </button>
                <button
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === "timeline"
                    ? "border-b-2 border-[color:var(--accent)] text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                  onClick={() => setActiveTab("timeline")}
                >
                  Timeline
                </button>
              </div>

              {activeTab === "game" ? (
                <GameTab
                  players={players}
                  timelineStats={timelineStats}
                  matchInfo={matchInfo}
                  getPlayerColor={getPlayerColor}
                  formatClock={formatClock}
                />
              ) : activeTab === "stats" ? (
                <StatsTab
                  players={players}
                  timelineStats={timelineStats}
                  events={events}
                  getPlayerColor={getPlayerColor}
                  selectedTime={selectedTime}
                />
              ) : (
                <section className="w-full">
                  <TimelineTab
                    players={players}
                    events={events}
                    duration={duration}
                    timelineStats={timelineStats}
                    selectedTime={selectedTime}
                    getPlayerColor={getPlayerColor}
                    formatClock={formatClock}
                    pendingJump={pendingJump}
                    onJumpComplete={() => setPendingJump(false)}
                  />
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
