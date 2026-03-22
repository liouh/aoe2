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
import { Select, type SelectOption } from "./components/Select";
import { GameTab } from "./components/GameTab";
import { StatsTab, isEconomic } from "./components/StatsTab";
import { TimelineTab } from "./components/TimelineTab";
import { TERRAIN_MINIMAP_COLORS } from "@/lib/terrainPalette";
import { getBuildingFootprint } from "@/lib/buildingFootprints";
import { getBuildingName } from "@/lib/entityNames";

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

const MINIMAP_ZOOM_FACTOR = 1.5;
const MINIMAP_MAX_ZOOM = 5;
const MINIMAP_MOBILE_MAX_ZOOM = 11;
const MINIMAP_ICON_MIN_SIZE = 20;
const MINIMAP_ICON_SCALE_FACTOR = 3;
const MINIMAP_ICON_BORDER = 16;
const MINIMAP_HOVER_OUTLINE = 2;
const MINIMAP_UNIT_ALPHA = 1;
const MINIMAP_UNIT_BORDER = 1;
const MINIMAP_UNIT_CIRCLE_RADIUS = 4;
const MINIMAP_UNIT_FADE_SECONDS = 50;
const MINIMAP_ELEVATION_STEP = 3;

const KEYBOARD_STEP_SECONDS = 30;
const KEYBOARD_STEP_SHIFT_SECONDS = 120;
// Playback speed = 1000 / PLAYBACK_INTERVAL_MS * PLAYBACK_STEP_SECONDS
// 1000 / 66 * 4 = 60x speed
const PLAYBACK_STEP_SECONDS = 4;
const PLAYBACK_INTERVAL_MS = 66;

const LOADING_STEPS = [
  "Loading replay...",
  "Loading timeline...",
  "Loading viewer..."
];

const formatClock = (seconds: number) => {
  const total = Math.max(seconds, 0);
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
}


export default function Home() {
  const [minimapViewMode, setMinimapViewMode] = useState<"both" | "buildings" | "moves">("both");
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [pendingJump, setPendingJump] = useState(false);

  const resetGameState = () => {
    setIsPlaying(false);
    setSelectedTime(0);
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    setHoveredEntity(null);
    setSelectedPlayerIds([]);
    setMinimapViewMode("both");
    setActiveTab("game");
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const mapInfo = useMemo(() => replay?.zheader?.map_info ?? null, [replay]);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

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
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainCacheKeyRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const lastKeyTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
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
    sizeX: 120,
    sizeY: 120,
  });

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

  const minimapPlayers: SelectOption<number | undefined>[] = useMemo(() => {
    return [
      { id: undefined, label: "All players", color: "var(--foreground)" },
      ...players.map(p => ({ id: p.id, label: p.name, color: getPlayerColor(p.id), isAi: p.ai }))
    ];
  }, [players, getPlayerColor]);

  const minimapViewOptions: SelectOption<"both" | "buildings" | "moves">[] = [
    { id: "both", label: "All data" },
    { id: "buildings", label: "Only buildings" },
    { id: "moves", label: "Only unit movements" },
  ];

  const showBuildings = minimapViewMode === "both" || minimapViewMode === "buildings";
  const showUnits = minimapViewMode === "both" || minimapViewMode === "moves";


  const handleZoom = (targetX: number, targetY: number, zoomFactor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    setMapZoom((prev) => {
      const maxZoom = isMobile ? MINIMAP_MOBILE_MAX_ZOOM : MINIMAP_MAX_ZOOM;
      const next = clamp(prev * zoomFactor, 1, maxZoom);
      if (next === prev) return prev;

      const mapSpan = Math.max(mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120, mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120);
      const wScale = (rect.width - 2) / mapSpan;
      const hScale = rect.height / (mapSpan * 0.5);
      const baseScale = Math.min(wScale, hScale);

      const prevIsoScale = Math.max(1, baseScale * prev);
      const nextIsoScale = Math.max(1, baseScale * next);

      // 1. Where is the diamond origin right now?
      const prevOriginX = rect.width * 0.5 + mapPan.x;
      const prevDiamondHeight = mapSpan * prevIsoScale * 0.5;
      const prevOriginY = (rect.height - prevDiamondHeight) / 2 + mapPan.y;

      // 2. What are the isometric coordinates (rx, ry) under the target point?
      const relX = targetX - prevOriginX;
      const relY = targetY - prevOriginY;
      const rx = relX / prevIsoScale + (2 * relY) / prevIsoScale;
      const ry = (2 * relY) / prevIsoScale - relX / prevIsoScale;

      // 3. Where would those SAME coordinates land at the NEXT scale if pan was 0?
      const nextDiamondHeight = mapSpan * nextIsoScale * 0.5;
      const nextOriginY_noPan = (rect.height - nextDiamondHeight) / 2;
      const nextOriginX_noPan = rect.width * 0.5;

      const nextIsoX_noPan = (rx - ry) * nextIsoScale * 0.5 + nextOriginX_noPan;
      const nextIsoY_noPan = (rx + ry) * nextIsoScale * 0.25 + nextOriginY_noPan;

      // 4. The new pan is the offset needed to put that point back under the target point
      setMapPan(() =>
        clampPan(
          {
            x: targetX - nextIsoX_noPan,
            y: targetY - nextIsoY_noPan,
          },
          next
        )
      );

      return next;
    });
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



  const jumpToTimeline = () => {
    setIsPlaying(false);
    setActiveTab("timeline");
    setPendingJump(true);
  };

  const clampPan = (pan: { x: number; y: number }, zoom?: number) => {
    const container = mapContainerRef.current;
    if (!container) return pan;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return pan;

    const z = zoom ?? mapZoom;
    const sizeX = mapInfo?.size_x;
    const sizeY = mapInfo?.size_y;
    const mapSpan = Math.max(sizeX, sizeY);

    const widthScale = (rect.width - 2) / mapSpan;
    const heightScale = rect.height / (mapSpan * 0.5);
    const isoScale = Math.max(1, Math.min(widthScale, heightScale) * z);

    const diamondWidth = mapSpan * isoScale;
    const diamondHeight = mapSpan * isoScale * 0.5;

    let minPanX, maxPanX;
    if (diamondWidth <= rect.width) {
      minPanX = 0;
      maxPanX = 0;
    } else {
      const limitX = (diamondWidth - rect.width) / 2;
      minPanX = -limitX;
      maxPanX = limitX;
    }

    let minPanY, maxPanY;
    const containerEffectiveHeight = rect.height;
    if (diamondHeight <= containerEffectiveHeight) {
      minPanY = 0;
      maxPanY = 0;
    } else {
      const baseOriginY = (rect.height - diamondHeight) / 2;
      const boundTop = -baseOriginY;
      const boundBottom = rect.height - diamondHeight - baseOriginY;
      minPanY = Math.min(boundTop, boundBottom);
      maxPanY = Math.max(boundTop, boundBottom);
    }

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

  const moveEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "move" &&
          event.x !== undefined &&
          event.y !== undefined &&
          (selectedPlayerIds.length === 0 || (event.playerId !== undefined && selectedPlayerIds.includes(event.playerId)))
      ),
    [events, selectedPlayerIds]
  );



  // The core minimap rendering effect: draws terrain, buildings, and units on canvas
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

    const sizeX = mapInfo?.size_x;
    const sizeY = mapInfo?.size_y;
    const mapSpan = Math.max(sizeX, sizeY);
    const widthScale = (bounds.width - 2) / mapSpan;
    const heightScale = bounds.height / (mapSpan * 0.5);
    const isoScale = Math.max(
      1,
      Math.min(widthScale, heightScale) * mapZoom
    );
    const isoOriginX = bounds.width * 0.5 + mapPan.x;
    const diamondHeight = mapSpan * isoScale * 0.5;
    const isoOriginY =
      (bounds.height - diamondHeight) / 2 + mapPan.y;

    const toCanvas = (x: number, y: number) => {
      const rx = y;
      const ry = sizeX - x;
      const isoX = (rx - ry) * isoScale * 0.5 + isoOriginX;
      const isoY = (rx + ry) * isoScale * 0.25 + isoOriginY;
      return { x: isoX, y: isoY };
    };

    const terrainCacheKey = `${sizeX},${sizeY},${isoScale},${isoOriginX},${isoOriginY},${mapInfo?.tiles?.length},${summary?.duration ?? 0},${events.length}`;

    if (terrainCacheKeyRef.current !== terrainCacheKey || !terrainCanvasRef.current) {
      if (!terrainCanvasRef.current) {
        terrainCanvasRef.current = document.createElement("canvas");
      }
      const terrainCanvas = terrainCanvasRef.current;
      terrainCanvas.width = canvas.width;
      terrainCanvas.height = canvas.height;
      const terrainContext = terrainCanvas.getContext("2d");
      if (terrainContext) {
        terrainContext.scale(dpr, dpr);
        const panelColor =
          getComputedStyle(canvas).getPropertyValue("background-color")?.trim() ||
          "#1c1610";
        terrainContext.fillStyle = panelColor;
        terrainContext.fillRect(0, 0, bounds.width, bounds.height);

        const tiles = mapInfo?.tiles;
        if (tiles && sizeX && sizeY && tiles.length >= sizeX * sizeY) {
          for (let y = 0; y < sizeY; y += 1) {
            for (let x = 0; x < sizeX; x += 1) {
              const tile = tiles[y * sizeX + x] as { terrain_type?: number; elevation?: number };
              const terrainType = tile?.terrain_type ?? 14;
              let color = TERRAIN_MINIMAP_COLORS[terrainType] ?? "#cbb892";

              if (tile?.elevation !== undefined) {
                // Apply shading: +MINIMAP_ELEVATION_STEP% for each level of elevation
                color = shadeColor(color, tile.elevation * MINIMAP_ELEVATION_STEP);
              }

              const p1 = toCanvas(x, y);
              const p2 = toCanvas(x + 1, y);
              const p3 = toCanvas(x + 1, y + 1);
              const p4 = toCanvas(x, y + 1);
              terrainContext.fillStyle = color;
              terrainContext.beginPath();
              terrainContext.moveTo(p1.x, p1.y);
              terrainContext.lineTo(p2.x, p2.y);
              terrainContext.lineTo(p3.x, p3.y);
              terrainContext.lineTo(p4.x, p4.y);
              terrainContext.closePath();
              terrainContext.fill();
            }
          }
        }
        terrainContext.strokeStyle = "rgba(28, 22, 16, 0.2)";
        terrainContext.lineWidth = 1;
        terrainContext.beginPath();
        const top = toCanvas(0, 0);
        const right = toCanvas(sizeX, 0);
        const bottom = toCanvas(sizeX, sizeY);
        const left = toCanvas(0, sizeY);
        terrainContext.moveTo(top.x, top.y);
        terrainContext.lineTo(right.x, right.y);
        terrainContext.lineTo(bottom.x, bottom.y);
        terrainContext.lineTo(left.x, left.y);
        terrainContext.closePath();
        terrainContext.stroke();
      }
      terrainCacheKeyRef.current = terrainCacheKey;
    }

    if (terrainCanvasRef.current) {
      context.drawImage(terrainCanvasRef.current, 0, 0, bounds.width, bounds.height);
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
    const tileToAnchor = new Map<string, string>();
    const anchorToFootprint = new Map<string, { w: number; h: number }>();
    const anchorToEvent = new Map<string, TimelineEvent>();

    for (const event of events) {
      if (event.time > selectedTime) break;
      if (event.category === "build" && event.x !== undefined && event.y !== undefined) {
        const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
        const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
        const footprint = getBuildingFootprint(event.buildingTypeId);
        const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
        const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
        const anchorKey = `${baseX},${baseY}`;

        anchorToFootprint.set(anchorKey, footprint);
        anchorToEvent.set(anchorKey, event);
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
    }

    const drawBuilding = (event: TimelineEvent) => {
      if (event.x === undefined || event.y === undefined) return;
      if (event.x < 0 || event.y < 0 || event.x > sizeX || event.y > sizeY) return;
      const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
      const footprint = getBuildingFootprint(event.buildingTypeId);
      const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
      const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
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
          drawTile(tileX, tileY, getPlayerColor(event.playerId));
        }
      }

      if (isTownCenter(event.buildingTypeId) || isCastle(event.buildingTypeId)) {
        iconBuildings.push(event);
      }
    };

    if (showBuildings) {
      anchorToEvent.forEach((event) => {
        if (selectedPlayerIds.length === 0 || (event.playerId !== undefined && selectedPlayerIds.includes(event.playerId))) {
          drawBuilding(event);
        }
      });
      iconBuildings.forEach((event) => {
        if (selectedPlayerIds.length > 0 && (event.playerId === undefined || !selectedPlayerIds.includes(event.playerId))) {
          return;
        }
        if (event.x === undefined || event.y === undefined) return;
        const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
        const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
        const footprint = getBuildingFootprint(event.buildingTypeId);
        const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
        const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
        const centerTileX = baseX + footprint.w / 2;
        const centerTileY = baseY + footprint.h / 2;
        const center = toCanvas(centerTileX, centerTileY);
        const iconSize = Math.max(MINIMAP_ICON_MIN_SIZE, isoScale * MINIMAP_ICON_SCALE_FACTOR);
        const iconPath = isCastle(event.buildingTypeId) ? castlePath : townCenterPath;
        context.save();
        context.translate(center.x - iconSize / 2, center.y - iconSize * 0.8);
        context.scale(iconSize / 100, iconSize / 100);
        context.fillStyle = getPlayerColor(event.playerId);
        context.lineWidth = MINIMAP_ICON_BORDER;
        context.lineJoin = "round";
        context.strokeStyle = getPlayerOutline(event.playerId);
        context.stroke(iconPath);
        context.fill(iconPath);
        context.restore();
      });
    }

    if (showUnits) {
      for (let i = moveEvents.length - 1; i >= 0; i--) {
        const event = moveEvents[i];
        if (event.time > selectedTime) continue;
        const age = selectedTime - event.time;
        if (age > MINIMAP_UNIT_FADE_SECONDS) break;

        if (event.x === undefined || event.y === undefined) continue;

        const alpha = Math.max(0, MINIMAP_UNIT_ALPHA * (1 - age / MINIMAP_UNIT_FADE_SECONDS));
        const pos = toCanvas(event.x, event.y);
        context.globalAlpha = alpha;
        context.beginPath();
        context.fillStyle = getPlayerColor(event.playerId);
        context.arc(pos.x, pos.y, MINIMAP_UNIT_CIRCLE_RADIUS, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = MINIMAP_UNIT_BORDER;
        context.strokeStyle = getPlayerOutline(event.playerId);
        context.stroke();
      }
      context.globalAlpha = 1;
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
        context.lineWidth = MINIMAP_HOVER_OUTLINE;
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
    replay,
    mapPan,
    mapZoom,
    selectedTime,
    showBuildings,
    showUnits,
    summary,
    moveEvents,
    hoveredEntity,
    selectedPlayerIds,
  ]);

  const loadReplayData = async (buffer: ArrayBuffer, filename?: string) => {
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
      const extractedInfo = extractMatchInfo(parsed, filename);

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
    // Unload previous file first
    setReplay(null);
    setSummary(null);
    setMatchInfo(null);
    setEvents([]);
    setDuration(0);
    resetGameState();

    const reader = new FileReader();
    reader.addEventListener("loadend", async () => {
      const buffer = reader.result as ArrayBuffer;
      await loadReplayData(buffer, file.name);
    });
    reader.readAsArrayBuffer(file);
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="headline text-2xl font-semibold text-[color:var(--foreground)] lg:text-4xl">
                <span className="text-[color:var(--muted)] font-black">AoE2</span> Replay Viewer
              </h1>
              <p className="max-w-2xl text-xs text-[color:var(--muted)] lg:text-lg">
                Upload a replay for minimap playback, key stats, and build timelines.
              </p>
            </div>
            <label
              className="flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-5 lg:py-3 rounded-2xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-within:ring-1 focus-within:ring-white"
              onClick={() => setIsPlaying(false)}
            >
              <span className="text-xl lg:text-2xl">📁</span>
              <span className="lg:inline">Open .aoe2record replay file</span>
              <input
                type="file"
                accept=".aoe2record,.mgz"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  handleFile(file);
                }}
              />
            </label>
          </div>
        </header>

        <main className="flex flex-col gap-6">
          <section className="panel-dark flex flex-col gap-4 rounded-3xl p-6">
            <div
              className="relative w-full aspect-[2/1] pt-11 md:pt-0"
              ref={mapContainerRef}
              style={{
                touchAction: "none",
                cursor: mapZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              onPointerDown={(event) => {
                const now = performance.now();
                const rect = event.currentTarget.getBoundingClientRect();
                const cursorX = event.clientX - rect.left;
                const cursorY = event.clientY - rect.top;

                if (lastTapRef.current && now - lastTapRef.current.time < 300) {
                  const dx = cursorX - lastTapRef.current.x;
                  const dy = cursorY - lastTapRef.current.y;
                  if (Math.hypot(dx, dy) < 30) {
                    handleZoom(cursorX, cursorY, MINIMAP_ZOOM_FACTOR);
                    lastTapRef.current = null;
                    event.preventDefault();
                    return;
                  }
                }
                lastTapRef.current = { time: now, x: cursorX, y: cursorY };

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
                      name: getBuildingName(building.buildingTypeId),
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
            >
              {!loading && !error && (
                <div
                  className="absolute left-0 md:left-2 top-0 md:top-2 z-20 flex items-center gap-2"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onPointerMove={(e) => {
                    e.stopPropagation();
                    setHoveredEntity(null);
                  }}
                >
                  <Select
                    options={minimapPlayers}
                    selectedId={selectedPlayerIds}
                    onSelect={(id) => {
                      if (id === undefined) {
                        setSelectedPlayerIds([]);
                      } else {
                        setSelectedPlayerIds(prev =>
                          prev.includes(id as number)
                            ? prev.filter(p => p !== id)
                            : [...prev, id as number]
                        );
                      }
                    }}
                    multi
                    align="left"
                  />
                  <Select
                    options={minimapViewOptions}
                    selectedId={minimapViewMode}
                    onSelect={setMinimapViewMode}
                    align="left"
                  />
                </div>
              )}
              {!loading && !error && (
                <div
                  className="absolute left-1 md:left-2 bottom-2 z-10 flex flex-col gap-2 w-9"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onPointerMove={(e) => {
                    e.stopPropagation();
                    setHoveredEntity(null);
                  }}
                >
                  <button
                    type="button"
                    className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom(1);
                      setMapPan({ x: 0, y: 0 });
                      setSelectedPlayerIds([]);
                      setMinimapViewMode("both");
                    }}
                    title="Reset view"
                  >
                    ⛶
                  </button>
                  <div className="pointer-events-auto w-full font-semibold text-xl text-white select-none flex flex-col">
                    <button
                      type="button"
                      className="flex h-9 items-center justify-center rounded-t-xl transition bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm shadow-lg cursor-pointer outline-none"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        handleZoom(rect.width / 2, rect.height / 2, MINIMAP_ZOOM_FACTOR);
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="flex h-9 items-center justify-center rounded-b-xl transition bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm shadow-lg cursor-pointer outline-none"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        handleZoom(rect.width / 2, rect.height / 2, 1 / MINIMAP_ZOOM_FACTOR);
                      }}
                    >
                      -
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToTimeline();
                    }}
                    title="Jump to timeline position"
                  >
                    ▾
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="h-full w-full rounded-2xl" />

              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl">
                  <div className="w-full max-w-md px-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between text-sm font-semibold tracking-wide">
                      <span className="text-[color:var(--accent)] uppercase">
                        {LOADING_STEPS[loadingStep]}
                      </span>
                      <span className="tabular-nums text-[color:var(--muted-foreground)]">
                        {Math.round(((loadingStep + 1) / LOADING_STEPS.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[color:var(--accent)] to-amber-400"
                        style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl">
                  <div className="w-full max-w-lg px-10 flex flex-col items-center gap-4 text-center">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--accent)]">
                        Error loading replay
                      </h3>
                      <p className="text-base font-medium text-[color:var(--foreground)] opacity-90">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hoveredEntity && (
                <div
                  className="pointer-events-none fixed z-50 rounded-lg border border-[color:var(--panel-strong)] bg-[color:var(--panel)] p-2 text-xs shadow-xl animate-in fade-in zoom-in duration-100"
                  style={{
                    left: tooltipPos.x + 10,
                    top: tooltipPos.y - 60,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {hoveredEntity.playerId !== undefined && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: getPlayerColor(hoveredEntity.playerId) }}
                      ></span>
                    )}
                    <span className="font-bold text-[color:var(--foreground)]">{hoveredEntity.name}</span>
                  </div>
                  <div className="mt-0.5 font-medium text-[color:var(--foreground)] opacity-80">
                    {hoveredEntity.playerId !== undefined && (
                      <>{players.find((p) => p.id === hoveredEntity.playerId)?.name}</>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 px-0.5 md:px-1.5">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/30 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => {
                  if (selectedTime >= duration) {
                    setSelectedTime(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(!isPlaying);
                  }
                }}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="3" y="2" width="4" height="12" />
                    <rect x="9" y="2" width="4" height="12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 2v12l10-6z" />
                  </svg>
                )}
              </button>
              <div className="flex-1 relative h-10 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 1)}
                  value={selectedTime}
                  className="w-full accent-[color:var(--accent)] cursor-pointer outline-none"
                  tabIndex={-1}
                  onChange={(event) => setSelectedTime(Number(event.target.value))}
                />
                <div className="absolute bottom-0 left-0 text-[10px] font-medium tabular-nums text-[color:var(--muted-foreground)] pointer-events-none translate-y-1.5">
                  {formatClock(selectedTime)} / {formatClock(duration)}
                </div>
              </div>
            </div>
          </section>

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
