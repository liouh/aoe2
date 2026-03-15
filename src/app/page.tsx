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

const UNIT_FADE_SECONDS = 200;
const MAX_ZOOM = 5;

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

  const mapInfo = useMemo(() => replay?.zheader?.map_info ?? null, [replay]);

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

  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<{
    name: string;
    playerId?: number;
    type: "unit" | "building";
    anchorKey?: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainCacheKeyRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const lastKeyTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const entityLookupRef = useRef<{
    tileToAnchor: Map<string, string>;
    buildings: Map<string, TimelineEvent>;
    isoScale: number;
    isoOriginX: number;
    isoOriginY: number;
    sizeX: number;
    sizeY: number;
  }>({
    tileToAnchor: new Map(),
    buildings: new Map(),
    isoScale: 1,
    isoOriginX: 0,
    isoOriginY: 0,
    sizeX: mapSize,
    sizeY: mapSize,
  });

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
    const pxPerSecond = 3;
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

    const terrainCacheKey = `${sizeX},${sizeY},${isoScale},${isoOriginX},${isoOriginY},${mapInfo?.tiles?.length}`;

    if (terrainCacheKeyRef.current !== terrainCacheKey || !offscreenCanvasRef.current) {
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement("canvas");
      }
      const offCanvas = offscreenCanvasRef.current;
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const offContext = offCanvas.getContext("2d");
      if (offContext) {
        offContext.scale(dpr, dpr);
        const panelColor =
          getComputedStyle(canvas).getPropertyValue("--panel")?.trim() ||
          "#f1e5d4";
        offContext.fillStyle = panelColor;
        offContext.fillRect(0, 0, bounds.width, bounds.height);

        const tiles = mapInfo?.tiles;
        if (tiles && sizeX && sizeY && tiles.length >= sizeX * sizeY) {
          for (let y = 0; y < sizeY; y += 1) {
            for (let x = 0; x < sizeX; x += 1) {
              const tile = tiles[y * sizeX + x] as { terrain_type?: number };
              const terrainType = tile?.terrain_type ?? 14;
              const color = TERRAIN_MINIMAP_COLORS[terrainType] ?? "#cbb892";
              const p1 = toCanvas(x, y);
              const p2 = toCanvas(x + 1, y);
              const p3 = toCanvas(x + 1, y + 1);
              const p4 = toCanvas(x, y + 1);
              offContext.fillStyle = color;
              offContext.beginPath();
              offContext.moveTo(p1.x, p1.y);
              offContext.lineTo(p2.x, p2.y);
              offContext.lineTo(p3.x, p3.y);
              offContext.lineTo(p4.x, p4.y);
              offContext.closePath();
              offContext.fill();
            }
          }
        }
        offContext.strokeStyle = "rgba(28, 22, 16, 0.2)";
        offContext.lineWidth = 1;
        offContext.beginPath();
        const top = toCanvas(0, 0);
        const right = toCanvas(sizeX, 0);
        const bottom = toCanvas(sizeX, sizeY);
        const left = toCanvas(0, sizeY);
        offContext.moveTo(top.x, top.y);
        offContext.lineTo(right.x, right.y);
        offContext.lineTo(bottom.x, bottom.y);
        offContext.lineTo(left.x, left.y);
        offContext.closePath();
        offContext.stroke();
      }
      terrainCacheKeyRef.current = terrainCacheKey;
    }

    if (offscreenCanvasRef.current) {
      context.drawImage(offscreenCanvasRef.current, 0, 0, bounds.width, bounds.height);
    }

    const currentUnitsMap = new Map<string | number, TimelineEvent>();
    for (const event of moveEvents) {
      if (event.time > selectedTime) break;
      if (event.unitId === undefined) continue;
      const existing = currentUnitsMap.get(event.unitId);
      if (!existing || existing.time < event.time) {
        currentUnitsMap.set(event.unitId, event);
      }
    }


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
    const buildingIdToAnchor = new Map<number, string>();
    const tileToAnchor = new Map<string, string>();
    const anchorToFootprint = new Map<string, { w: number; h: number }>();
    const anchorToEvent = new Map<string, TimelineEvent>();

    const markAnchorDestroyed = (anchorKey: string) => {
      const footprint = anchorToFootprint.get(anchorKey) ?? { w: 1, h: 1 };
      const [ax, ay] = anchorKey.split(",").map(Number);
      for (let dx = 0; dx < footprint.w; dx += 1) {
        for (let dy = 0; dy < footprint.h; dy += 1) {
          destroyedTiles.add(`${ax + dx},${ay + dy}`);
        }
      }
      anchorToEvent.delete(anchorKey);
    };

    for (const event of events) {
      if (event.time > selectedTime) break;
      if (event.targetId && event.x !== undefined && event.y !== undefined) {
        targetPositions.set(event.targetId, { x: event.x, y: event.y });
      }
      if (event.category === "build" && event.x !== undefined && event.y !== undefined) {
        const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
        const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
        const footprint = getBuildingFootprint(event.buildingTypeId);
        const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
        const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
        const anchorKey = `${baseX},${baseY}`;
        anchorToFootprint.set(anchorKey, footprint);
        anchorToEvent.set(anchorKey, event);
        if (typeof event.buildingId === "number" && event.buildingId > 0) {
          buildingIdToAnchor.set(event.buildingId, anchorKey);
        }
        // Remove any old buildings whose tiles overlap with this new building
        const displacedAnchors = new Set<string>();
        for (let dx = 0; dx < footprint.w; dx += 1) {
          for (let dy = 0; dy < footprint.h; dy += 1) {
            const tileX = baseX + dx;
            const tileY = baseY + dy;
            if (tileX >= sizeX || tileY >= sizeY) continue;
            const tileKey = `${tileX},${tileY}`;
            const oldAnchor = tileToAnchor.get(tileKey);
            if (oldAnchor && oldAnchor !== anchorKey) {
              displacedAnchors.add(oldAnchor);
            }
            tileToAnchor.set(tileKey, anchorKey);
            destroyedTiles.delete(tileKey);
          }
        }
        for (const oldAnchor of displacedAnchors) {
          anchorToEvent.delete(oldAnchor);
        }
      }
      if (event.type === "Delete" && event.targetId) {
        // Try direct lookup via buildingId → anchorKey first
        const directAnchor = buildingIdToAnchor.get(event.targetId);
        if (directAnchor) {
          markAnchorDestroyed(directAnchor);
        } else {
          // Fall back to position-based lookup
          const pos = targetPositions.get(event.targetId);
          if (pos) {
            const tileX = Math.max(0, Math.min(sizeX - 1, Math.floor(pos.x)));
            const tileY = Math.max(0, Math.min(sizeY - 1, Math.floor(pos.y)));
            const tileKey = `${tileX},${tileY}`;
            const anchorKey = tileToAnchor.get(tileKey) ?? tileKey;
            markAnchorDestroyed(anchorKey);
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
      const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
      const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
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
        const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
        const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
        const centerTileX = baseX + footprint.w / 2;
        const centerTileY = baseY + footprint.h / 2;
        const center = toCanvas(centerTileX, centerTileY);
        const iconSize = Math.max(12, isoScale * 3);
        const iconPath = isCastle(event.buildingTypeId) ? castlePath : townCenterPath;
        context.save();
        context.translate(center.x - iconSize / 2, center.y - iconSize * 0.8);
        context.scale(iconSize / 100, iconSize / 100);
        context.fillStyle = classifyColor(event.playerId);
        context.lineWidth = 10;
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
        context.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "#ffffff";
        context.stroke();
        context.globalAlpha = 1;
      });
    }

    if (showBuildings && hoveredEntity?.type === "building" && hoveredEntity.anchorKey) {
      const anchorKey = hoveredEntity.anchorKey;
      const footprint = anchorToFootprint.get(anchorKey);
      if (footprint) {
        const [ax, ay] = anchorKey.split(",").map(Number);
        const p1 = toCanvas(ax, ay);
        const p2 = toCanvas(ax + footprint.w, ay);
        const p3 = toCanvas(ax + footprint.w, ay + footprint.h);
        const p4 = toCanvas(ax, ay + footprint.h);

        context.save();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.shadowBlur = 4;
        context.shadowColor = "rgba(0,0,0,0.5)";
        context.beginPath();
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
        context.lineTo(p3.x, p3.y);
        context.lineTo(p4.x, p4.y);
        context.closePath();
        context.stroke();
        context.restore();
      }
    }

    entityLookupRef.current = {
      tileToAnchor: tileToAnchor,
      buildings: anchorToEvent,
      isoScale,
      isoOriginX,
      isoOriginY,
      sizeX,
      sizeY,
    };
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
    hoveredEntity,
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
      const target = event.target as HTMLElement;
      if (target?.tagName === "INPUT" && (target as HTMLInputElement).type !== "range") return;

      if (target?.tagName === "INPUT" && (target as HTMLInputElement).type === "range") {
        event.preventDefault();
      }

      const now = performance.now();
      if (now - lastKeyTimeRef.current < 16) return;
      lastKeyTimeRef.current = now;
      const step = event.shiftKey ? 120 : 30;
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
                Age of Empires II
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
                if (mapZoom > 1 && isDraggingRef.current && lastPointerRef.current) {
                  const dx = event.clientX - lastPointerRef.current.x;
                  const dy = event.clientY - lastPointerRef.current.y;
                  lastPointerRef.current = { x: event.clientX, y: event.clientY };
                  setMapPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
                }

                // Hover handling
                const canvas = canvasRef.current;
                if (canvas) {
                  const rect = canvas.getBoundingClientRect();
                  const mouseX = event.clientX - rect.left;
                  const mouseY = event.clientY - rect.top;
                  const {
                    tileToAnchor,
                    buildings,
                    isoScale,
                    isoOriginX,
                    isoOriginY,
                    sizeX,
                  } = entityLookupRef.current;

                  const relX = mouseX - isoOriginX;
                  const relY = mouseY - isoOriginY;

                  const rx = relX / isoScale + (2 * relY) / isoScale;
                  const ry = (2 * relY) / isoScale - relX / isoScale;

                  const gameY = rx;
                  const gameX = sizeX - ry;

                  const tx = Math.floor(gameX);
                  const ty = Math.floor(gameY);
                  const tileKey = `${tx},${ty}`;

                  const anchorKey = tileToAnchor.get(tileKey);
                  const building = anchorKey ? buildings.get(anchorKey) : null;
                  if (building) {
                    setHoveredEntity({
                      name:
                        getBuildingName(building.buildingTypeId) ??
                        "Unknown Building",
                      playerId: building.playerId,
                      type: "building",
                      anchorKey,
                    });
                    setTooltipPos({ x: event.clientX, y: event.clientY });
                  } else {
                    setHoveredEntity(null);
                  }
                }
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
                setHoveredEntity(null);
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
                  const next = clamp(prev * (1 + zoomDelta), 1, MAX_ZOOM);
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
              {/* Map Floating Controls */}
              <div
                className="absolute right-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-auto w-full overflow-hidden rounded-xl bg-[color:var(--panel)] shadow-lg border border-[color:var(--panel-strong)] font-semibold text-xl text-[color:var(--foreground)] select-none">
                  <button
                    type="button"
                    className="py-1 w-full transition hover:bg-[color:var(--panel-strong)] border-b border-[color:var(--panel-strong)] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom((prev) => {
                        const next = clamp(prev * 1.25, 1, MAX_ZOOM);
                        const scaleChange = next / prev;
                        setMapPan((pan) => clampPan({ x: pan.x * scaleChange, y: pan.y * scaleChange }));
                        return next;
                      });
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="py-1 w-full transition hover:bg-[color:var(--panel-strong)] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom((prev) => {
                        const next = clamp(prev * 0.8, 1, MAX_ZOOM);
                        if (next <= 1) {
                          setMapPan({ x: 0, y: 0 });
                          return next;
                        }
                        const scaleChange = next / prev;
                        setMapPan((pan) => clampPan({ x: pan.x * scaleChange, y: pan.y * scaleChange }));
                        return next;
                      });
                    }}
                  >
                    -
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 px-2 py-1 pointer-events-auto w-full rounded-xl border border-[color:var(--panel-strong)] bg-[color:var(--panel)] text-xl font-semibold text-[color:var(--foreground)] shadow-lg transition hover:border-[color:var(--muted)] hover:bg-[color:var(--panel-strong)] select-none cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapZoom(1);
                    setMapPan({ x: 0, y: 0 });
                  }}
                  title="Reset view"
                >
                  ↺
                </button>
              </div>
              <canvas ref={canvasRef} className="h-full w-full rounded-2xl" />

              {hoveredEntity && (
                <div
                  className="pointer-events-none fixed z-50 rounded-lg border border-[color:var(--panel-strong)] bg-[color:var(--panel)] p-2 text-xs shadow-xl animate-in fade-in zoom-in duration-100"
                  style={{
                    left: tooltipPos.x + 12,
                    top: tooltipPos.y + 12,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {hoveredEntity.playerId !== undefined && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: classifyColor(hoveredEntity.playerId) }}
                      ></span>
                    )}
                    <span className="font-bold">{hoveredEntity.name}</span>
                  </div>
                  <div className="mt-0.5 text-[color:var(--muted)]">
                    {hoveredEntity.playerId !== undefined && (
                      <>{players.find((p) => p.id === hoveredEntity.playerId)?.name}</>
                    )}
                  </div>
                </div>
              )}
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
                            {playerBuilds.map((event) => {
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
                            {playerTrains.map((event) => (
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
                          <div className="flex items-top justify-between">
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
      </div>
    </div>
  );
}

