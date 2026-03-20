"use client";

import { parse_rec, parse_rec_summary } from "aoe2rec-js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimeline,
  determineDuration,
  extractMapSize,
  extractPlayerStats,
  extractMatchInfo,
  summarizePlayers,
  type MatchInfo,
  type TimelineEvent,
} from "@/lib/replay";
import { APMChart } from "./components/APMChart";
import { Select, type SelectOption } from "./components/Select";
import { TiltCard } from "./components/TiltCard";
import { TERRAIN_MINIMAP_COLORS } from "@/lib/terrainPalette";
import { getBuildingFootprint } from "@/lib/buildingFootprints";
import { getUnitName, getBuildingName } from "@/lib/entityNames";
import { getTechName } from "@/lib/techMappings";
import { getCivName } from "@/lib/civMappings";
import { getGameTypeName, getMapSizeName, getMapName } from "@/lib/gameMappings";

const SAMPLE_REPLAYS = [
  "hera-1v1.aoe2record",
  "hera-1v2.aoe2record",
  "hera-1v7.aoe2record",
];

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
const MINIMAP_UNIT_ALPHA = 0.8;
const MINIMAP_UNIT_CIRCLE_RADIUS = 4;
const MINIMAP_UNIT_BORDER = 2;
const MINIMAP_UNIT_FADE_SECONDS = 60;

const KEYBOARD_STEP_SECONDS = 30;
const KEYBOARD_STEP_SHIFT_SECONDS = 120;
// Playback speed = 1000 / PLAYBACK_INTERVAL_MS * PLAYBACK_STEP_SECONDS
// 1000 / 66 * 4 = 60x speed
const PLAYBACK_STEP_SECONDS = 4;
const PLAYBACK_INTERVAL_MS = 66;

const TIMELINE_MIN_HEIGHT = 600;
const TIMELINE_MARKER_INTERVAL = 300;
const TIMELINE_PX_PER_SECOND = 2;
const TIMELINE_CONSOLIDATION_WINDOW_SECONDS = 5;

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

const formatNum = (n: number) => new Intl.NumberFormat().format(n);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isEconomic = (name: string) => {
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

function consolidateEvents(events: TimelineEvent[], windowSeconds: number = TIMELINE_CONSOLIDATION_WINDOW_SECONDS) {
  if (events.length === 0) return [];

  const consolidated: (TimelineEvent & {
    count: number;
    isMilitary?: boolean;
    items: Map<string, number>;
    label?: string;
  })[] = [];

  const activeGroups = new Map<string, any>();

  for (const event of events) {
    const identity = event.category;
    const current = activeGroups.get(identity);

    const amount = typeof event.raw?.amount === "number" && event.raw.amount > 0
      ? event.raw.amount
      : 1;

    let itemLabel = "Unknown Event";
    if (event.category === "build") {
      itemLabel = getBuildingName(event.buildingTypeId);
    } else if (event.category === "train") {
      itemLabel = getUnitName(event.unitTypeId);
    } else if (event.category === "research") {
      itemLabel = getTechName(event.techId);
    }

    const isMil = event.category === "train" && !isEconomic(itemLabel);

    if (current && event.time - current.time <= windowSeconds) {
      current.count += amount;
      current.items.set(itemLabel, (current.items.get(itemLabel) || 0) + amount);
      if (isMil) current.isMilitary = true;
    } else {
      const newGroup = {
        ...event,
        count: amount,
        isMilitary: isMil,
        items: new Map([[itemLabel, amount]])
      };
      consolidated.push(newGroup);
      activeGroups.set(identity, newGroup);
    }
  }

  for (const group of consolidated) {
    const parts = Array.from(group.items.entries()).map(([name, count]) =>
      (count > 1 && group.category !== "research") ? `${name} x${count}` : name
    );
    group.label = parts.join(" + ");
  }

  return consolidated.sort((a, b) => a.time - b.time);
}

export default function Home() {
  const [replay, setReplay] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [duration, setDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [minimapViewMode, setMinimapViewMode] = useState<"both" | "buildings" | "moves">("both");
  const [leftPlayerId, setLeftPlayerId] = useState<number | null>(null);
  const [rightPlayerId, setRightPlayerId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineShowBuildings, setTimelineShowBuildings] = useState(true);
  const [timelineShowUnits, setTimelineShowUnits] = useState(true);
  const [timelineShowResearch, setTimelineShowResearch] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"game" | "stats" | "timeline">("game");
  const [minimapPlayerId, setMinimapPlayerId] = useState<number | undefined>(undefined);

  const mapInfo = useMemo(() => replay?.zheader?.map_info ?? null, [replay]);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

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
  const timelineRef = useRef<HTMLElement>(null);
  const terrainCacheKeyRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const lastKeyTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const pendingScrollRef = useRef(false);
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
    sizeX: mapSize,
    sizeY: mapSize,
  });

  const players = useMemo(
    () => summarizePlayers(summary),
    [summary]
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

  const classifyColor = (playerId?: number) => {
    if (playerId === undefined) return "#000000";
    const colorId = playerIdToColorId.get(playerId);
    if (colorId === undefined || colorId < 0) return "#000000";
    return PLAYER_COLORS[(colorId) % PLAYER_COLORS.length];
  };

  const classifyOutline = (playerId?: number) => {
    if (playerId === undefined) return "#ffffff";
    const colorId = playerIdToColorId.get(playerId);
    if (colorId === undefined || colorId < 0) return "#ffffff";
    return PLAYER_OUTLINES[(colorId) % PLAYER_OUTLINES.length];
  };

  const minimapPlayers: SelectOption<number | undefined>[] = useMemo(() => {
    return [
      { id: undefined, label: "All players", color: "var(--foreground)" },
      ...players.map(p => ({ id: p.id, label: p.name, color: classifyColor(p.id) }))
    ];
  }, [players, classifyColor]);

  const minimapViewOptions: SelectOption<"both" | "buildings" | "moves">[] = [
    { id: "both", label: "All data" },
    { id: "buildings", label: "Buildings" },
    { id: "moves", label: "Unit movements" },
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

      const mapSpan = Math.max(mapInfo?.size_x ?? mapSize, mapInfo?.size_y ?? mapSize);
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
    () => extractPlayerStats(events, duration, players),
    [events, duration, players]
  );

  const fastestAges = useMemo(() => {
    const fastest: Record<string, number> = {};
    timelineStats.forEach((stats) => {
      if (!stats.ageTimings) return;
      Object.entries(stats.ageTimings).forEach(([age, time]) => {
        if (fastest[age] === undefined || time < fastest[age]) {
          fastest[age] = time;
        }
      });
    });
    return fastest;
  }, [timelineStats]);

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

  // Automatic scrolling for the timeline view as time progresses
  useEffect(() => {
    if (activeTab === "timeline" && pendingScrollRef.current && timelineRef.current) {
      pendingScrollRef.current = false;
      const targetOffset = selectedTime * TIMELINE_PX_PER_SECOND;
      const containerTop =
        timelineRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: containerTop + targetOffset,
        behavior: "smooth",
      });
    }
  }, [activeTab, selectedTime]);

  const jumpToTimeline = () => {
    setIsPlaying(false);
    setActiveTab("timeline");
    if (!timelineRef.current) {
      pendingScrollRef.current = true;
      return;
    }
    const targetOffset = selectedTime * TIMELINE_PX_PER_SECOND;
    const containerTop =
      timelineRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: containerTop + targetOffset,
      behavior: "smooth",
    });
  };

  const clampPan = (pan: { x: number; y: number }, zoom?: number) => {
    const container = mapContainerRef.current;
    if (!container) return pan;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return pan;

    const z = zoom ?? mapZoom;
    const sizeX = mapInfo?.size_x ?? mapSize;
    const sizeY = mapInfo?.size_y ?? mapSize;
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

  const buildEvents = useMemo(
    () => events.filter((event) => event.category === "build" && timelineShowBuildings && !event.raw?.isInitial),
    [events, timelineShowBuildings]
  );

  const moveEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "move" &&
          event.x !== undefined &&
          event.y !== undefined &&
          (minimapPlayerId === undefined || event.playerId === minimapPlayerId)
      ),
    [events, minimapPlayerId]
  );

  const trainEvents = useMemo(
    () => events.filter((event) => event.category === "train" && timelineShowUnits),
    [events, timelineShowUnits]
  );

  const researchEvents = useMemo(
    () => events.filter((event) => event.category === "research" && timelineShowResearch),
    [events, timelineShowResearch]
  );

  const unitStats = useMemo(() => {
    const rawEvents = events.filter((e) => e.category === "train");
    const statsMap = new Map<number, Map<number, { name: string; count: number }>>();

    rawEvents.forEach((event) => {
      if (event.playerId === undefined || event.unitTypeId === undefined) return;

      const amount = typeof event.raw?.amount === "number" && event.raw.amount > 0
        ? event.raw.amount
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


  const timelineHeight = useMemo(() => {
    return Math.max(TIMELINE_MIN_HEIGHT, duration * TIMELINE_PX_PER_SECOND);
  }, [duration]);

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

    const sizeX = mapInfo?.size_x ?? mapSize;
    const sizeY = mapInfo?.size_y ?? mapSize;
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
          getComputedStyle(canvas).getPropertyValue("background-color")?.trim() ||
          "#1c1610";
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
          drawTile(tileX, tileY, classifyColor(event.playerId));
        }
      }

      if (isTownCenter(event.buildingTypeId) || isCastle(event.buildingTypeId)) {
        iconBuildings.push(event);
      }
    };

    if (showBuildings) {
      anchorToEvent.forEach((event) => {
        if (minimapPlayerId === undefined || event.playerId === minimapPlayerId) {
          drawBuilding(event);
        }
      });
      iconBuildings.forEach((event) => {
        if (minimapPlayerId !== undefined && event.playerId !== minimapPlayerId) {
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
        context.fillStyle = classifyColor(event.playerId);
        context.lineWidth = MINIMAP_ICON_BORDER;
        context.lineJoin = "round";
        context.strokeStyle = classifyOutline(event.playerId);
        context.stroke(iconPath);
        context.fill(iconPath);
        context.restore();
      });
    }

    if (showUnits) {
      currentUnitsMap.forEach((event) => {
        if (event.x === undefined || event.y === undefined) return;
        const age = selectedTime - event.time;
        if (age < 0 || age > MINIMAP_UNIT_FADE_SECONDS) return;
        const pos = toCanvas(event.x, event.y);
        context.globalAlpha = MINIMAP_UNIT_ALPHA;
        context.beginPath();
        context.fillStyle = classifyColor(event.playerId);
        context.arc(pos.x, pos.y, MINIMAP_UNIT_CIRCLE_RADIUS, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = MINIMAP_UNIT_BORDER;
        context.strokeStyle = classifyOutline(event.playerId);
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
    minimapPlayerId,
  ]);

  const loadReplayData = async (buffer: ArrayBuffer) => {
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
      const extractedInfo = extractMatchInfo(parsedSummary);

      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 50));

      setReplay(parsed);
      setSummary(parsedSummary);
      setMatchInfo(extractedInfo);
      setEvents(timeline);
      setDuration(gameDuration);

      // Reset interactive state
      setIsPlaying(false);
      setSelectedTime(0);
      setMapZoom(1);
      setMapPan({ x: 0, y: 0 });
      setHoveredEntity(null);
    } catch (err) {
      setError("The replay file could not be parsed. Try another file. Games with AI players are not supported yet.");
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
    setSelectedTime(0);
    setIsPlaying(false);
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.addEventListener("loadend", async () => {
      const buffer = reader.result as ArrayBuffer;
      await loadReplayData(buffer);
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

  // Global keyboard listener for seeking (Left/Right arrows)
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
              <h1 className="headline text-xl font-semibold text-[color:var(--foreground)] md:text-4xl">
                <span className="text-[color:var(--muted)]">AoE2</span> Replay Viewer
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--muted)] md:text-lg">
                Upload a replay to see minimap playback, key stats, and build timelines.
              </p>
            </div>
            <label
              className="panel flex cursor-pointer flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold text-[color:var(--foreground)] md:flex-col md:px-6 md:py-4 md:text-sm"
              onClick={() => setIsPlaying(false)}
            >
              <span className="text-xl md:text-2xl">📁</span>
              <span className="hidden md:inline">Open .aoe2record replay file</span>
              <span className="md:hidden">Open Replay</span>
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
                    selectedId={minimapPlayerId}
                    onSelect={setMinimapPlayerId}
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
                  className="absolute right-1 md:right-2 top-12 md:top-2 z-10 flex flex-col gap-2 w-9"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onPointerMove={(e) => {
                    e.stopPropagation();
                    setHoveredEntity(null);
                  }}
                >
                  <button
                    type="button"
                    className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom(1);
                      setMapPan({ x: 0, y: 0 });
                      setMinimapPlayerId(undefined);
                      setMinimapViewMode("both");
                    }}
                    title="Reset view"
                  >
                    ↺
                  </button>
                  <div className="pointer-events-auto w-full overflow-hidden rounded-xl bg-white/10 shadow-lg border border-white/10 font-semibold text-xl text-white select-none backdrop-blur-sm flex flex-col">
                    <button
                      type="button"
                      className="flex h-9 items-center justify-center transition hover:bg-white/20 border-b border-white/10 cursor-pointer"
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
                      className="flex h-9 items-center justify-center transition hover:bg-white/20 cursor-pointer"
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
                    className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm"
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
                        Replay Error
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
                        style={{ background: classifyColor(hoveredEntity.playerId) }}
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
            <div className="flex items-center gap-4">
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
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 1)}
                  value={selectedTime}
                  className="w-full accent-[color:var(--accent)]"
                  onChange={(event) => setSelectedTime(Number(event.target.value))}
                />
              </div>
              <div className="text-sm font-semibold tabular-nums text-[color:var(--muted-foreground)]">
                {formatClock(selectedTime)} / {formatClock(duration)}
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
                <div className="flex flex-col gap-6">
                  <section className="panel rounded-3xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="headline text-2xl">Players</h2>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {players.map((player) => {
                        const stats = timelineStats.find(
                          (item) => item.playerId === player.id
                        );
                        return (
                          <TiltCard
                            key={player.id}
                            className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <h3 className="headline text-lg leading-tight">
                                  {player.name}
                                  {player.won && <sup className="ml-1">👑</sup>}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <span>{getCivName(player.civId)}</span>
                                  <span>•</span>
                                  <span>Team {player.teamId}</span>
                                </div>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ background: classifyColor(player.id) }}
                              ></span>
                            </div>
                            <div className="flex flex-col gap-4 text-sm">
                              <div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-white/30">Age up time</span>
                                </div>
                                {stats?.ageTimings ? (
                                  <div className="space-y-1.5">
                                    {Object.entries(stats.ageTimings).map(([age, time]) => (
                                      <div key={age} className="flex justify-between items-center group/age">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[color:var(--muted)]">{age}</span>
                                          {time === fastestAges[age] && (
                                            <span title="Fastest" className="text-[10px] select-none">🥇</span>
                                          )}
                                        </div>
                                        <span className="text-white tabular-nums pl-2 font-medium">{formatClock(time)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-white/20 italic">—</p>
                                )}
                              </div>
                              {stats?.autoscoutUsage ? (
                                <div className="mt-auto pt-2">
                                  <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                                    Auto Scouted
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </TiltCard>
                        );
                      })}
                    </div>
                  </section>

                  {matchInfo && (
                    <section className="panel flex flex-col gap-4 rounded-3xl p-6">
                      <h2 className="headline text-2xl">Game Info</h2>
                      <div className="grid gap-6 md:grid-cols-4">
                        {matchInfo.gameTypeId !== undefined && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Game Mode</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getGameTypeName(matchInfo.gameTypeId) ?? `Type ${matchInfo.gameTypeId}`}
                            </span>
                          </div>
                        )}
                        {matchInfo.mapTypeId !== undefined && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Map Name</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getMapName(matchInfo.mapTypeId) ?? `Map ${matchInfo.mapTypeId}`}
                            </span>
                          </div>
                        )}
                        {matchInfo.mapSizeId !== undefined && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Map Size</span>
                            <span className="font-semibold text-[color:var(--foreground)]">
                              {getMapSizeName(matchInfo.mapSizeId) ?? matchInfo.mapSizeId}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              ) : activeTab === "stats" ? (
                <div className="flex flex-col gap-6">
                  <section className="panel rounded-3xl p-6 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="headline text-2xl">Actions per Minute</h2>
                    </div>

                    <APMChart
                      data={players.map(p => ({
                        playerId: p.id,
                        history: timelineStats.find(s => s.playerId === p.id)?.apmHistory || []
                      }))}
                      players={players}
                      classifyColor={classifyColor}
                    />

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {players.map((player) => {
                        const stats = timelineStats.find((s) => s.playerId === player.id);
                        return (
                          <TiltCard key={player.id} className="panel-strong p-4 flex flex-col gap-4 player-card-3d-base">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <h3 className="headline text-lg leading-tight">{player.name}</h3>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ background: classifyColor(player.id) }}
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
                      <h2 className="headline text-2xl">Favorite Units</h2>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {players.map((player) => {
                        const stats = unitStats.get(player.id) || { military: [], economic: [] };
                        const milCount = stats.military.reduce((acc, u) => acc + u.count, 0);
                        const ecoCount = stats.economic.reduce((acc, u) => acc + u.count, 0);

                        return (
                          <TiltCard
                            key={player.id}
                            className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <h3 className="headline text-lg leading-tight">{player.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <span>{getCivName(player.civId)}</span>
                                </div>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ background: classifyColor(player.id) }}
                              ></span>
                            </div>

                            <div className="space-y-4">
                              {/* Military Section */}
                              <div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent)]">Military</span>
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
                                  <span className="text-xs font-bold uppercase tracking-wider text-green-400/70">Economic</span>
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
                      <h2 className="headline text-2xl">Market Usage</h2>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {players.map((player) => {
                        const usage = timelineStats.find((s) => s.playerId === player.id)?.marketUsage || {
                          bought: { food: 0, wood: 0, stone: 0 },
                          sold: { food: 0, wood: 0, stone: 0 }
                        };

                        return (
                          <TiltCard
                            key={player.id}
                            className="panel-strong p-4 flex flex-col gap-6 player-card-3d-base"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <h3 className="headline text-lg leading-tight">{player.name}</h3>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ background: classifyColor(player.id) }}
                              ></span>
                            </div>

                            <div className="flex flex-col gap-2">
                              {(["wood", "food", "stone"] as const).map((res) => {
                                const bought = usage.bought[res];
                                const sold = usage.sold[res];
                                return (
                                  <div key={res} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/30">{res}</span>
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
              ) : (
                <section ref={timelineRef} className="w-full">
                  <div className="panel flex flex-col gap-6 rounded-3xl p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="headline text-2xl">Timeline</h2>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="toggle-pill group">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 transition-colors group-hover:text-white">
                            Research
                          </span>
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowResearch}
                              onChange={(e) => setTimelineShowResearch(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-6 w-9">
                              <div className="toggle-pill-thumb"></div>
                            </div>
                          </div>
                        </label>
                        <label className="toggle-pill group">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 transition-colors group-hover:text-white">
                            Buildings
                          </span>
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowBuildings}
                              onChange={(e) => setTimelineShowBuildings(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-6 w-9">
                              <div className="toggle-pill-thumb"></div>
                            </div>
                          </div>
                        </label>
                        <label className="toggle-pill group">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 transition-colors group-hover:text-white">
                            Units
                          </span>
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowUnits}
                              onChange={(e) => setTimelineShowUnits(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-6 w-9">
                              <div className="toggle-pill-thumb"></div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[leftPlayerId, rightPlayerId]
                        .filter((id): id is number => typeof id === "number")
                        .map((playerId, index) => {
                          const player = players.find((item) => item.id === playerId);
                          if (!player) return null;
                          const playerBuilds = buildEvents.filter(
                            (event) => event.playerId === player?.id
                          );
                          const playerTrains = trainEvents.filter(
                            (event) => event.playerId === player?.id
                          );
                          const playerResearch = researchEvents.filter(
                            (event) => event.playerId === player?.id
                          );
                          return (
                            <div key={`${player.id}-${index}`} className={`panel-strong rounded-2xl ${index === 1 ? 'hidden md:block' : ''}`}>
                              <div className="sticky top-0 z-30 flex items-center justify-between gap-2 p-4 bg-[color:var(--panel-strong)]/50 backdrop-blur-sm border-b border-white/10">
                                <div className="flex items-center">
                                  <div className="flex flex-col">
                                    <h3 className="headline text-lg leading-tight">{player.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                      <span>{getCivName(player.civId)}</span>
                                      <span>•</span>
                                      <span>Team {player.teamId}</span>
                                    </div>
                                  </div>
                                </div>
                                <Select
                                  options={players.map(p => ({ id: p.id, label: p.name, color: classifyColor(p.id) }))}
                                  selectedId={player.id}
                                  onSelect={(value) => {
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
                                />
                              </div>
                              <div
                                className="relative w-full bg-[#1c1610] rounded-b-xl"
                                style={{ height: timelineHeight, minHeight: TIMELINE_MIN_HEIGHT }}
                              >
                                {/* Time Markers */}
                                {Array.from({ length: Math.floor(duration / TIMELINE_MARKER_INTERVAL) + 1 }).map((_, i) => {
                                  const markerTime = i * TIMELINE_MARKER_INTERVAL;
                                  return (
                                    <div
                                      key={`marker-${markerTime}`}
                                      className="absolute left-0 w-full border-t border-[color:var(--panel)]"
                                      style={{ top: `${(markerTime / Math.max(duration, 1)) * 100}%` }}
                                    >
                                      {i !== 0 && (<span className="absolute left-[2px] text-[9px] font-medium tabular-nums text-[color:var(--muted-foreground)] opacity-30">
                                        {markerTime / 60 + "'"}
                                      </span>)}
                                    </div>
                                  );
                                })}

                                <div className="absolute left-8 top-0 h-full w-[2px] bg-[color:var(--panel)]"></div>
                                {consolidateEvents(playerResearch).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-22 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🧪</span>
                                    <div className="h-[1px] w-4 bg-white/10" />
                                    <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
                                  </div>
                                ))}
                                {consolidateEvents(playerBuilds).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-21 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🏛️</span>
                                    <div className="h-[1px] w-[6rem] bg-white/10" />
                                    <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
                                  </div>
                                ))}
                                {consolidateEvents(playerTrains).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-20 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">
                                      {event.isMilitary ? "🗡️" : "🙂"}
                                    </span>
                                    <div className="h-[1px] w-[12rem] bg-white/10" />
                                    <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
                                  </div>
                                ))}
                                {/* Age Up Markers */}
                                {Object.entries(timelineStats.find((s) => s.playerId === player.id)?.ageTimings ?? {}).map(([ageName, time]) => {
                                  const ageNumeral = ageName === "Feudal" ? "II" : ageName === "Castle" ? "III" : ageName === "Imperial" ? "IV" : "";
                                  if (!ageNumeral) return null;
                                  return (
                                    <div
                                      key={`age-${player.id}-${ageName}`}
                                      className="absolute left-0 w-full flex items-center pointer-events-none z-10"
                                      style={{ top: `${(time / Math.max(duration, 1)) * 100}%` }}
                                    >
                                      {/* Thin dotted line spanning the entire column */}
                                      <div className="absolute left-0 w-full border-t border-dotted border-[color:var(--accent)]" />
                                      {/* Roman numeral badge on the far left */}
                                      <div
                                        className="relative -translate-x-1/2 bg-[color:var(--accent)] text-[color:var(--panel)] w-5 h-5 flex items-center justify-center rounded-sm font-black text-s shadow-sm ring-2 ring-[color:var(--panel)] pointer-events-auto cursor-help"
                                        title={`${ageName} Age reached @ ${formatClock(time)}`}
                                      >
                                        {ageNumeral}
                                      </div>
                                    </div>
                                  );
                                })}

                                <div
                                  className="absolute left-0 h-[2px] w-full bg-[color:var(--foreground)]"
                                  style={{ top: `${(selectedTime / Math.max(duration, 1)) * 100}%` }}
                                >
                                  {index === 0 && (
                                    <div className="absolute left-0 -translate-y-1/2 -translate-x-[120%] pl-2">
                                      <span className="rounded bg-[color:var(--foreground)] px-1 py-0.5 text-[9px] font-bold tabular-nums text-[color:var(--panel)] shadow-sm">
                                        {formatClock(selectedTime)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
