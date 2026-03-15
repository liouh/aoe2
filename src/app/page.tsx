"use client";

import { parse_rec, parse_rec_summary } from "aoe2rec-js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimeline,
  determineDuration,
  extractMapSize,
  extractPlayerStats,
  extractMatchInfo,
  formatClock,
  summarizePlayers,
  type MatchInfo,
  type TimelineEvent,
} from "@/lib/replay";
import { TERRAIN_MINIMAP_COLORS } from "@/lib/terrainPalette";
import { getBuildingFootprint, getBuildingName } from "@/lib/buildingFootprints";
import { getUnitName } from "@/lib/unitTechMappings";
import { getCivName } from "@/lib/civMappings";
import { getGameTypeName, getMapSizeName, getMapName } from "@/lib/gameMappings";

const PLAYER_COLORS = [
  "#2e6bdc",
  "#d64545",
  "#2f8f3a",
  "#f2c94c",
  "#3bc9c9",
  "#7b3dbf",
  "#8a8d91",
  "#f2994a",
];

const classifyColor = (playerId?: number) => {
  if (!playerId || playerId < 1) return "#6b5b4d";
  return PLAYER_COLORS[(playerId - 1) % PLAYER_COLORS.length];
};

const formatOptional = (value?: number) =>
  value === undefined || Number.isNaN(value) ? "—" : value.toString();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const UNIT_FADE_SECONDS = 60;

export default function Home() {
  const [replay, setReplay] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [duration, setDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [leftPlayerId, setLeftPlayerId] = useState<number | null>(null);
  const [rightPlayerId, setRightPlayerId] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const lastKeyTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const players = useMemo(
    () => summarizePlayers(summary, replay),
    [summary, replay]
  );

  useEffect(() => {
    if (!players.length) {
      if (leftPlayerId !== null) setLeftPlayerId(null);
      if (rightPlayerId !== null) setRightPlayerId(null);
      return;
    }
    const ids = new Set(players.map((player) => player.id));
    const fallbackLeft = players[0]?.id ?? null;
    let nextLeft =
      leftPlayerId !== null && ids.has(leftPlayerId) ? leftPlayerId : fallbackLeft;
    let nextRight =
      rightPlayerId !== null && ids.has(rightPlayerId)
        ? rightPlayerId
        : players[1]?.id ?? nextLeft;
    if (players.length > 1 && nextLeft !== null && nextRight === nextLeft) {
      nextRight =
        players.find((player) => player.id !== nextLeft)?.id ?? nextRight;
    }
    if (nextLeft !== leftPlayerId) setLeftPlayerId(nextLeft);
    if (nextRight !== rightPlayerId) setRightPlayerId(nextRight);
  }, [leftPlayerId, players, rightPlayerId]);

  const timelineStats = useMemo(
    () => extractPlayerStats(events, duration, replay, players),
    [events, duration, replay, players]
  );

  const mapInfo = useMemo(
    () => replay?.zheader?.map_info ?? null,
    [replay]
  );

  const clampPan = (pan: { x: number; y: number }) => {
    const container = mapContainerRef.current;
    if (!container) return pan;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return pan;
    const sizeX = mapInfo?.size_x ?? mapSize;
    const sizeY = mapInfo?.size_y ?? mapSize;
    const mapSpan = Math.max(sizeX, sizeY);
    const padBottom = 8;
    const padTop = 4;
    const widthScale = (rect.width - 2) / mapSpan;
    const heightScale = (rect.height - padBottom - padTop) / (mapSpan * 0.5);
    const scaleBoost = 1.08;
    const isoScale = Math.max(
      1,
      Math.min(widthScale, heightScale) * scaleBoost * mapZoom
    );
    const diamondWidth = mapSpan * isoScale;
    const diamondHeight = mapSpan * isoScale * 0.5;
    const panLimitX = (diamondWidth - rect.width) / 2;
    const minPanX = Math.min(-panLimitX, panLimitX);
    const maxPanX = Math.max(-panLimitX, panLimitX);
    const baseOriginY = (rect.height - padBottom - diamondHeight) / 2 + padTop;
    const boundTop = -baseOriginY;
    const boundBottom = rect.height - diamondHeight - baseOriginY;
    const minPanY = Math.min(boundTop, boundBottom);
    const maxPanY = Math.max(boundTop, boundBottom);
    return {
      x: clamp(pan.x, minPanX, maxPanX),
      y: clamp(pan.y, minPanY, maxPanY),
    };
  };

  const mapSize = useMemo(() => {
    const base = extractMapSize(replay, summary);
    if (mapInfo?.size_x && mapInfo?.size_y) {
      return Math.max(mapInfo.size_x, mapInfo.size_y);
    }
    const coordMax = events.reduce((max, event) => {
      if (event.x === undefined || event.y === undefined) return max;
      return Math.max(max, event.x, event.y);
    }, 0);
    return coordMax > 0 ? Math.max(base, coordMax * 1.05) : base;
  }, [events, mapInfo, replay, summary]);

  const buildEventsForMap = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "build" &&
          event.x !== undefined &&
          event.y !== undefined
      ),
    [events]
  );


  const buildEventsTimeline = useMemo(
    () => events.filter((event) => event.category === "build"),
    [events]
  );

  const moveEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "move" &&
          event.x !== undefined &&
          event.y !== undefined
      ),
    [events]
  );

  const trainEvents = useMemo(
    () => events.filter((event) => event.category === "train"),
    [events]
  );


  const timelineHeight = useMemo(() => {
    const pxPerSecond = 4;
    return Math.max(520, duration * pxPerSecond);
  }, [duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const bounds = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = bounds.width * dpr;
    canvas.height = bounds.height * dpr;
    context.scale(dpr, dpr);

    context.clearRect(0, 0, bounds.width, bounds.height);

    const sizeX = mapInfo?.size_x ?? mapSize;
    const sizeY = mapInfo?.size_y ?? mapSize;
    const mapSpan = Math.max(sizeX, sizeY);
    const padBottom = 0;
    const padTop = 0;
    const widthScale = (bounds.width - 2) / mapSpan;
    const heightScale = (bounds.height - padBottom - padTop) / (mapSpan * 0.5);
    const scaleBoost = 1;
    const isoScale = Math.max(
      1,
      Math.min(widthScale, heightScale) * scaleBoost * mapZoom
    );
    const isoOriginX = bounds.width * 0.5 + mapPan.x;
    const diamondHeight = mapSpan * isoScale * 0.5;
    const isoOriginY =
      (bounds.height - padBottom - diamondHeight) / 2 + padTop + mapPan.y;

    const toCanvas = (x: number, y: number) => {
      const rx = y;
      const ry = sizeX - x;
      const isoX = (rx - ry) * isoScale * 0.5 + isoOriginX;
      const isoY = (rx + ry) * isoScale * 0.25 + isoOriginY;
      return { x: isoX, y: isoY };
    };

    const panelColor =
      getComputedStyle(canvas).getPropertyValue("--panel")?.trim() ||
      "#f1e5d4";
    context.fillStyle = panelColor;
    context.fillRect(0, 0, bounds.width, bounds.height);

    const tiles = mapInfo?.tiles;
    if (tiles && sizeX && sizeY && tiles.length >= sizeX * sizeY) {
      for (let y = 0; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          const tile = tiles[y * sizeX + x] as { terrain_type?: number };
          const terrainType = tile?.terrain_type ?? 14;
          const color = TERRAIN_MINIMAP_COLORS[terrainType] ?? "#cbb892";

          const x0 = x;
          const y0 = y;
          const x1 = x + 1;
          const y1 = y + 1;

          const p1 = toCanvas(x0, y0);
          const p2 = toCanvas(x1, y0);
          const p3 = toCanvas(x1, y1);
          const p4 = toCanvas(x0, y1);

          context.fillStyle = color;
          context.beginPath();
          context.moveTo(p1.x, p1.y);
          context.lineTo(p2.x, p2.y);
          context.lineTo(p3.x, p3.y);
          context.lineTo(p4.x, p4.y);
          context.closePath();
          context.fill();
        }
      }
    }

    context.strokeStyle = "rgba(28, 22, 16, 0.2)";
    context.lineWidth = 1;
    context.beginPath();
    const top = toCanvas(0, 0);
    const right = toCanvas(sizeX, 0);
    const bottom = toCanvas(sizeX, sizeY);
    const left = toCanvas(0, sizeY);
    context.moveTo(top.x, top.y);
    context.lineTo(right.x, right.y);
    context.lineTo(bottom.x, bottom.y);
    context.lineTo(left.x, left.y);
    context.closePath();
    context.stroke();

    const currentUnitsMap = new Map<string | number, TimelineEvent>();
    moveEvents.forEach((event) => {
      if (event.time > selectedTime) return;
      if (event.unitId === undefined) return;
      const existing = currentUnitsMap.get(event.unitId);
      if (!existing || existing.time < event.time) {
        currentUnitsMap.set(event.unitId, event);
      }
    });

    const drawTile = (
      tileX: number,
      tileY: number,
      color: string
    ) => {
      const p1 = toCanvas(tileX, tileY);
      const p2 = toCanvas(tileX + 1, tileY);
      const p3 = toCanvas(tileX + 1, tileY + 1);
      const p4 = toCanvas(tileX, tileY + 1);
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.lineTo(p4.x, p4.y);
      context.closePath();
      context.fill();
    };

    const townCenterPath = new Path2D(
      "M35,80 V50 H10 V80 H25 V68 H35 V80 H65 V68 H75 V80 H90 V50 H65 V38 L50,23 L35,38 V50"
    );
    const castlePath = new Path2D(
      "M25,85 H75 V40 L85,40 V15 H70 V25 H60 V15 H40 V25 H30 V15 H15 V40 L25,40 Z"
    );

    const isTownCenter = (buildingTypeId?: number) =>
      buildingTypeId === 109 || buildingTypeId === 621;
    const isCastle = (buildingTypeId?: number) => buildingTypeId === 82;
    const iconBuildings: TimelineEvent[] = [];

    const destroyedTiles = new Set<string>();
    const targetPositions = new Map<number, { x: number; y: number }>();
    const tileToAnchor = new Map<string, string>();
    const anchorToFootprint = new Map<string, { w: number; h: number }>();
    const anchorToEvent = new Map<string, TimelineEvent>();

    for (const event of events) {
      if (event.time > selectedTime) break;
      if (event.targetId && event.x !== undefined && event.y !== undefined) {
        targetPositions.set(event.targetId, { x: event.x, y: event.y });
      }
      if (event.category === "build" && event.x !== undefined && event.y !== undefined) {
        const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
        const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
        const footprint = getBuildingFootprint(event.buildingTypeId);
        const baseX = Math.max(0, anchorX - Math.floor((footprint.w - 1) / 2));
        const baseY = Math.max(0, anchorY - Math.floor((footprint.h - 1) / 2));
        const anchorKey = `${baseX},${baseY}`;
        anchorToFootprint.set(anchorKey, footprint);
        anchorToEvent.set(anchorKey, event);
        for (let dx = 0; dx < footprint.w; dx += 1) {
          for (let dy = 0; dy < footprint.h; dy += 1) {
            const tileX = baseX + dx;
            const tileY = baseY + dy;
            if (tileX >= sizeX || tileY >= sizeY) continue;
            const tileKey = `${tileX},${tileY}`;
            tileToAnchor.set(tileKey, anchorKey);
            destroyedTiles.delete(tileKey);
          }
        }
      }
      if (event.type === "Delete" && event.targetId) {
        const pos = targetPositions.get(event.targetId);
        if (pos) {
          const tileX = Math.max(0, Math.min(sizeX - 1, Math.floor(pos.x)));
          const tileY = Math.max(0, Math.min(sizeY - 1, Math.floor(pos.y)));
          const tileKey = `${tileX},${tileY}`;
          const anchorKey = tileToAnchor.get(tileKey) ?? tileKey;
          const footprint = anchorToFootprint.get(anchorKey) ?? { w: 1, h: 1 };
          const [ax, ay] = anchorKey.split(",").map(Number);
          for (let dx = 0; dx < footprint.w; dx += 1) {
            for (let dy = 0; dy < footprint.h; dy += 1) {
              const key = `${ax + dx},${ay + dy}`;
              destroyedTiles.add(key);
            }
          }
        }
      }
    }

    const drawBuilding = (event: TimelineEvent) => {
      if (event.x === undefined || event.y === undefined) return;
      if (event.x < 0 || event.y < 0 || event.x > sizeX || event.y > sizeY) return;
      const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
      const footprint = getBuildingFootprint(event.buildingTypeId);
      const baseX = Math.max(0, anchorX - Math.floor((footprint.w - 1) / 2));
      const baseY = Math.max(0, anchorY - Math.floor((footprint.h - 1) / 2));
      const anchorKey = `${baseX},${baseY}`;
      for (let dx = 0; dx < footprint.w; dx += 1) {
        for (let dy = 0; dy < footprint.h; dy += 1) {
          const tileX = baseX + dx;
          const tileY = baseY + dy;
          const tileKey = `${tileX},${tileY}`;
          if (destroyedTiles.has(tileKey)) return;
        }
      }
      for (let dx = 0; dx < footprint.w; dx += 1) {
        for (let dy = 0; dy < footprint.h; dy += 1) {
          const tileX = baseX + dx;
          const tileY = baseY + dy;
          if (tileX >= sizeX || tileY >= sizeY) continue;
          drawTile(tileX, tileY, classifyColor(event.playerId));
        }
      }

      if (isTownCenter(event.buildingTypeId) || isCastle(event.buildingTypeId)) {
        iconBuildings.push(event);
      }
    };

    if (showBuildings) {
      anchorToEvent.forEach((event) => drawBuilding(event));
      iconBuildings.forEach((event) => {
        if (event.x === undefined || event.y === undefined) return;
        const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
        const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
        const footprint = getBuildingFootprint(event.buildingTypeId);
        const baseX = Math.max(0, anchorX - Math.floor((footprint.w - 1) / 2));
        const baseY = Math.max(0, anchorY - Math.floor((footprint.h - 1) / 2));
        const centerTileX = baseX + footprint.w / 2;
        const centerTileY = baseY + footprint.h / 2;
        const center = toCanvas(centerTileX, centerTileY);
        const iconSize = Math.max(12, isoScale * 3);
        const iconPath = isCastle(event.buildingTypeId) ? castlePath : townCenterPath;
        context.save();
        context.translate(center.x - iconSize / 2, center.y - iconSize * 0.8);
        context.scale(iconSize / 100, iconSize / 100);
        context.fillStyle = classifyColor(event.playerId);
        context.lineWidth = 6;
        context.lineJoin = "round";
        context.strokeStyle = "#ffffff";
        context.stroke(iconPath);
        context.fill(iconPath);
        context.restore();
      });
    }

    if (showUnits) {
      currentUnitsMap.forEach((event) => {
        if (event.x === undefined || event.y === undefined) return;
        const age = selectedTime - event.time;
        if (age < 0 || age > UNIT_FADE_SECONDS) return;
        const pos = toCanvas(event.x, event.y);
        const alpha = clamp(1 - age / UNIT_FADE_SECONDS, 0.15, 1);
        context.globalAlpha = alpha;
        context.beginPath();
        context.fillStyle = classifyColor(event.playerId);
        context.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });
    }

  }, [
    buildEventsForMap,
    events,
    mapInfo,
    mapSize,
    replay,
    mapPan,
    mapZoom,
    selectedTime,
    showBuildings,
    showUnits,
    summary,
    moveEvents,
    trainEvents,
  ]);

  const handleFile = (file: File) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const parsed = parse_rec(buffer);
        const parsedSummary = parse_rec_summary(buffer);
        if (typeof window !== "undefined") {
          (window as any).__aoe2rec = parsed;
          (window as any).__aoe2summary = parsedSummary;
        }
        const timeline = buildTimeline(parsed);
        const gameDuration = determineDuration(parsedSummary, timeline);
        const extractedInfo = extractMatchInfo(parsedSummary);

        setReplay(parsed);
        setSummary(parsedSummary);
        setMatchInfo(extractedInfo);
        setEvents(timeline);
        setDuration(gameDuration);
        setSelectedTime(0);
      } catch (err) {
        setError("We could not parse that replay. Try another file.");
      } finally {
        setLoading(false);
      }
    });
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const loadDefault = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("default.aoe2record");
        if (!response.ok) return; // Silent fail if no default exists
        const buffer = await response.arrayBuffer();
        const parsed = parse_rec(buffer);
        const parsedSummary = parse_rec_summary(buffer);
        if (typeof window !== "undefined") {
          (window as any).__aoe2rec = parsed;
          (window as any).__aoe2summary = parsedSummary;
        }
        const timeline = buildTimeline(parsed);
        const gameDuration = determineDuration(parsedSummary, timeline);
        const extractedInfo = extractMatchInfo(parsedSummary);

        setReplay(parsed);
        setSummary(parsedSummary);
        setMatchInfo(extractedInfo);
        setEvents(timeline);
        setDuration(gameDuration);
        setSelectedTime(0);
      } catch (err) {
        console.error("Could not load default file", err);
      } finally {
        setLoading(false);
      }
    };
    loadDefault();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if ((event.target as HTMLElement)?.tagName === "INPUT") return;
      const now = performance.now();
      if (now - lastKeyTimeRef.current < 16) return;
      lastKeyTimeRef.current = now;
      const step = event.shiftKey ? 60 : 15;
      setSelectedTime((prev) => {
        const next =
          event.key === "ArrowRight" ? prev + step : prev - step;
        return clamp(next, 0, Math.max(duration, 1));
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duration]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="gradient-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Age of Empires 2
              </p>
              <h1 className="headline text-4xl font-semibold text-[color:var(--foreground)] md:text-5xl">
                Replay Viewer
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--muted)] md:text-lg">
                Upload a replay to see the minimap progression and analyze build orders.
              </p>
            </div>
            <label className="panel flex cursor-pointer flex-col gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-[color:var(--foreground)]">
              <span>Upload .aoe2record or .mgz</span>
              <input
                type="file"
                accept=".aoe2record,.mgz"
                className="text-xs text-[color:var(--muted)]"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  handleFile(file);
                }}
              />
            </label>
          </div>
          {error && (
            <div className="panel-strong rounded-2xl px-4 py-3 text-sm text-[color:var(--accent)]">
              {error}
            </div>
          )}
        </header>

        {replay && (
          <main className="flex flex-col gap-6">
            <section className="panel flex flex-col gap-6 rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="headline text-2xl">Minimap</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
                  <div className="rounded-full bg-[color:var(--panel-strong)] px-3 py-1 font-mono tabular-nums">
                    Time: {formatClock(selectedTime)}
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-transparent bg-[color:var(--panel)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--muted)] hover:bg-[color:var(--panel-strong)]"
                    onClick={() => {
                      setMapZoom(1);
                      setMapPan({ x: 0, y: 0 });
                    }}
                  >
                    Reset view
                  </button>
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={showBuildings}
                      onChange={(event) => setShowBuildings(event.target.checked)}
                    />
                    Buildings
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={showUnits}
                      onChange={(event) => setShowUnits(event.target.checked)}
                    />
                    Unit movements
                  </label>
                </div>
              </div>
              <div
                className="relative w-full aspect-[2/1] min-h-[480px]"
                ref={mapContainerRef}
                style={{
                  touchAction: "none",
                  cursor: mapZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                }}
                onPointerDown={(event) => {
                  if (mapZoom <= 1) return;
                  event.preventDefault();
                  isDraggingRef.current = true;
                  setIsDragging(true);
                  lastPointerRef.current = { x: event.clientX, y: event.clientY };
                  (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (mapZoom <= 1) return;
                  if (!isDraggingRef.current || !lastPointerRef.current) return;
                  const dx = event.clientX - lastPointerRef.current.x;
                  const dy = event.clientY - lastPointerRef.current.y;
                  lastPointerRef.current = { x: event.clientX, y: event.clientY };
                  setMapPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
                }}
                onPointerUp={(event) => {
                  isDraggingRef.current = false;
                  lastPointerRef.current = null;
                  setIsDragging(false);
                  (event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId);
                }}
                onPointerLeave={() => {
                  isDraggingRef.current = false;
                  lastPointerRef.current = null;
                  setIsDragging(false);
                }}
                onWheel={(event) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const cursorX = event.clientX - rect.left;
                  const cursorY = event.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const zoomDelta = -event.deltaY * 0.0015;
                  setMapZoom((prev) => {
                    const next = clamp(prev * (1 + zoomDelta), 1, 2.5);
                    if (next <= 1) {
                      setMapPan({ x: 0, y: 0 });
                      return next;
                    }
                    const scaleChange = next / prev;
                    setMapPan((pan) =>
                      clampPan({
                        x: pan.x + (1 - scaleChange) * (cursorX - centerX - pan.x),
                        y: pan.y + (1 - scaleChange) * (cursorY - centerY - pan.y),
                      })
                    );
                    return next;
                  });
                }}
              >
                <canvas ref={canvasRef} className="h-full w-full" />
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                value={selectedTime}
                className="w-full accent-[color:var(--accent)]"
                onChange={(event) => setSelectedTime(Number(event.target.value))}
              />
            </section>

            {replay && (
              <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="panel flex flex-col gap-6 rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="headline text-2xl">Timeline</h2>
                    <div className="text-xs text-[color:var(--muted)]">
                      Duration: {formatClock(duration)}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[leftPlayerId, rightPlayerId]
                      .filter((id): id is number => typeof id === "number")
                      .map((playerId, index) => {
                        const player = players.find((item) => item.id === playerId);
                        if (!player) return null;
                        const playerBuilds = buildEventsTimeline.filter(
                          (event) => event.playerId === player?.id
                        );
                        const playerTrains = trainEvents.filter(
                          (event) => event.playerId === player?.id
                        );
                        return (
                          <div key={`${player.id}-${index}`} className="panel-strong rounded-2xl p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ background: classifyColor(player.id) }}
                                ></span>
                                <p className="text-sm font-semibold">{player.name}</p>
                              </div>
                              <select
                                className="rounded-full border border-transparent bg-[color:var(--panel)] px-2 py-1 text-xs text-[color:var(--muted)]"
                                value={player.id}
                                onChange={(event) => {
                                  const value = Number(event.target.value);
                                  if (index === 0) {
                                    setLeftPlayerId(value);
                                    if (value === rightPlayerId && players.length > 1) {
                                      const alternative =
                                        players.find((option) => option.id !== value)?.id ??
                                        rightPlayerId;
                                      setRightPlayerId(alternative);
                                    }
                                  }
                                  if (index === 1) {
                                    setRightPlayerId(value);
                                    if (value === leftPlayerId && players.length > 1) {
                                      const alternative =
                                        players.find((option) => option.id !== value)?.id ??
                                        leftPlayerId;
                                      setLeftPlayerId(alternative);
                                    }
                                  }
                                }}
                              >
                                {players.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div
                              className="relative mt-3 w-full min-h-[520px]"
                              style={{ height: timelineHeight }}
                            >
                              <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-[color:var(--panel)]"></div>
                              {showBuildings &&
                                playerBuilds.map((event) => {
                                  const buildingName =
                                    getBuildingName(event.buildingTypeId) ?? event.label;
                                  return (
                                    <div
                                      key={event.id}
                                      className="absolute left-1/2 flex -translate-x-full items-center justify-end"
                                      style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }}
                                      title={`${buildingName} @ ${formatClock(event.time)}`}
                                    >
                                      <span className="text-[10px] text-[color:var(--muted)] pr-3">
                                        {formatClock(event.time)} · {buildingName}
                                      </span>
                                      <span className="absolute right-0 translate-x-1/2 text-[8px]">⚫</span>
                                    </div>
                                  );
                                })}
                              {showUnits &&
                                playerTrains.map((event) => (
                                  <div
                                    key={event.id}
                                    className="absolute left-1/2 flex items-center"
                                    style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }}
                                    title={`${getUnitName(event.unitTypeId) ?? event.label} @ ${formatClock(event.time)}`}
                                  >
                                    <span className="absolute left-0 -translate-x-1/2 text-[8px]">⚫</span>
                                    <span className="text-[10px] text-[color:var(--muted)] pl-3">
                                      {formatClock(event.time)} · {getUnitName(event.unitTypeId) ?? event.label}
                                    </span>
                                  </div>
                                ))}
                              <div
                                className="absolute left-0 h-[2px] w-full bg-[color:var(--foreground)]"
                                style={{ top: `${(selectedTime / Math.max(duration, 1)) * 100}%` }}
                              />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
                              <span className="rounded-full bg-[color:var(--panel)] px-2 py-1">
                                Build events: {playerBuilds.length}
                              </span>
                              <span className="rounded-full bg-[color:var(--panel)] px-2 py-1">
                                Unit creation events: {playerTrains.length}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <aside className="flex flex-col gap-6">
                  <section className="panel rounded-3xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="headline text-2xl">Player Stats</h2>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {players.map((player, index) => {
                        const stats = timelineStats.find(
                          (item) => item.playerId === player.id
                        );
                        return (
                          <div
                            key={player.id}
                            className="panel-strong rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="headline text-lg">{player.name}</h3>
                                <p className="text-xs text-[color:var(--muted)]">
                                  {getCivName(player.civId) ?? ("Civ " + (player.civId ?? "—"))} • Team {player.teamId ?? "—"}
                                </p>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ background: classifyColor(player.id) }}
                              ></span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-[color:var(--muted)]">APM</p>
                                <p className="text-lg font-semibold">{formatOptional(stats?.apm)}</p>
                              </div>
                              <div>
                                {stats?.ageTimings ? (
                                  <div className="space-y-1 text-m text-[color:var(--muted)]">
                                    {Object.entries(stats.ageTimings).map(([age, time]) => (
                                      <div key={age}>
                                        {age} {formatClock(time)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm">—</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {matchInfo && (
                    <section className="panel flex flex-col gap-4 rounded-3xl p-6">
                      <h2 className="headline text-2xl">Match Info</h2>
                      <div className="flex flex-col gap-3">
                        {matchInfo.gameTypeId !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[color:var(--muted)]">Game Mode</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getGameTypeName(matchInfo.gameTypeId) ?? `Type ${matchInfo.gameTypeId}`}
                            </span>
                          </div>
                        )}
                        {matchInfo.mapTypeId !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[color:var(--muted)]">Map Name</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getMapName(matchInfo.mapTypeId) ?? `Map ${matchInfo.mapTypeId}`}
                            </span>
                          </div>
                        )}
                        {matchInfo.mapSizeId !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[color:var(--muted)]">Map Size</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getMapSizeName(matchInfo.mapSizeId) ?? matchInfo.mapSizeId}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </aside>
              </section>
            )}
          </main>
        )}

        {!replay && !loading && (
          <div className="panel rounded-3xl p-6 text-sm text-[color:var(--muted)]">
            Upload a replay to populate the timeline. Parsing happens entirely in the browser using
            the WASM-based aoe2rec-js library.
          </div>
        )}
        {loading && (
          <div className="panel rounded-3xl p-6 text-sm text-[color:var(--muted)]">
            Parsing replay, stand by...
          </div>
        )}
      </div>
    </div>
  );
}

