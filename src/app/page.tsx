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
import { getUnitName } from "@/lib/techMappings";
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

const isEconomic = (name: string) => {
  const lower = name.toLowerCase();
  return (
    lower.includes("villager") ||
    lower.includes("trade cart") ||
    lower.includes("trade cog") ||
    lower.includes("fishing ship") ||
    lower.includes("transport ship") ||
    lower.includes("llama") ||
    lower.includes("cow") ||
    lower.includes("sheep") ||
    lower.includes("turkey") ||
    lower.includes("goat") ||
    lower.includes("goose") ||
    lower.includes("pig") ||
    lower.includes("mule cart")
  );
};

function consolidateEvents(events: TimelineEvent[], windowSeconds: number = CONSOLIDATION_WINDOW_SECONDS) {
  if (events.length === 0) return [];

  const consolidated: (TimelineEvent & {
    count: number;
    isMilitary?: boolean;
    items: Map<string, number>;
  })[] = [];

  const activeGroups = new Map<string, any>();

  for (const event of events) {
    const identity = event.category;
    const current = activeGroups.get(identity);

    const amount = typeof event.raw?.amount === "number" && event.raw.amount > 0
      ? event.raw.amount
      : 1;

    let itemLabel = event.label;
    if (event.category === "build") {
      itemLabel = getBuildingName(event.buildingTypeId) ?? event.label;
    } else if (event.category === "train") {
      itemLabel = getUnitName(event.unitTypeId) ?? event.label;
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

const UNIT_FADE_SECONDS = 200;
const MAX_ZOOM = 5;
const SCALE_BOOST = 1.0;
const PX_PER_SECOND = 2;
const MIN_TIMELINE_HEIGHT = 520;
const UNIT_CIRCLE_RADIUS = 4;
const TIMELINE_MARKER_INTERVAL = 300;
const CONSOLIDATION_WINDOW_SECONDS = 5;
const ISO_ICON_MIN_SIZE = 12;
const ISO_ICON_SCALE_FACTOR = 3;
const PAD_TOP = 0;
const PAD_BOTTOM = 0;

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineShowBuildings, setTimelineShowBuildings] = useState(true);
  const [timelineShowUnits, setTimelineShowUnits] = useState(true);
  const [timelineShowResearch, setTimelineShowResearch] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"timeline" | "units" | "info">("units");

  const LOADING_STEPS = [
    "Reading file...",
    "Parsing replay data...",
    "Constructing timeline...",
    "Preparing viewer..."
  ];

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
  const timelineRef = useRef<HTMLElement>(null);
  const terrainCacheKeyRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const lastKeyTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const pendingScrollRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const zoomLimitTimestampRef = useRef<number | null>(null);
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
    () => summarizePlayers(summary, replay, events),
    [summary, replay, events]
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

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return prev;
        }
        return Math.min(prev + 10, duration);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    if (activeTab === "timeline" && pendingScrollRef.current && timelineRef.current) {
      pendingScrollRef.current = false;
      const targetOffset = selectedTime * PX_PER_SECOND;
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
    const targetOffset = selectedTime * PX_PER_SECOND;
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
    const heightScale = (rect.height - PAD_BOTTOM - PAD_TOP) / (mapSpan * 0.5);
    const isoScale = Math.max(1, Math.min(widthScale, heightScale) * SCALE_BOOST * z);

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
    const containerEffectiveHeight = rect.height - PAD_BOTTOM - PAD_TOP;
    if (diamondHeight <= containerEffectiveHeight) {
      minPanY = 0;
      maxPanY = 0;
    } else {
      const baseOriginY = (rect.height - PAD_BOTTOM - diamondHeight) / 2 + PAD_TOP;
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


  const buildEventsTimeline = useMemo(
    () => events.filter((event) => event.category === "build" && timelineShowBuildings),
    [events, timelineShowBuildings]
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
          name: getUnitName(event.unitTypeId) ?? "Unknown Unit",
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
    return Math.max(MIN_TIMELINE_HEIGHT, duration * PX_PER_SECOND);
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
    const widthScale = (bounds.width - 2) / mapSpan;
    const heightScale = (bounds.height - PAD_BOTTOM - PAD_TOP) / (mapSpan * 0.5);
    const isoScale = Math.max(
      1,
      Math.min(widthScale, heightScale) * SCALE_BOOST * mapZoom
    );
    const isoOriginX = bounds.width * 0.5 + mapPan.x;
    const diamondHeight = mapSpan * isoScale * 0.5;
    const isoOriginY =
      (bounds.height - PAD_BOTTOM - diamondHeight) / 2 + PAD_TOP + mapPan.y;

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
        const iconSize = Math.max(ISO_ICON_MIN_SIZE, isoScale * ISO_ICON_SCALE_FACTOR);
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
        context.arc(pos.x, pos.y, UNIT_CIRCLE_RADIUS, 0, Math.PI * 2);
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
    setLoadingStep(0);
    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      try {
        setLoadingStep(1);
        const buffer = reader.result as ArrayBuffer;
        const parsed = parse_rec(buffer);
        const parsedSummary = parse_rec_summary(buffer);
        if (typeof window !== "undefined") {
          (window as any).__aoe2rec = parsed;
          (window as any).__aoe2summary = parsedSummary;
        }
        setLoadingStep(2);
        const timeline = buildTimeline(parsed);
        const gameDuration = determineDuration(parsedSummary, timeline);
        const extractedInfo = extractMatchInfo(parsedSummary);

        setLoadingStep(3);
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
        setLoadingStep(0);
        const response = await fetch("default.aoe2record");
        if (!response.ok) return; // Silent fail if no default exists
        const buffer = await response.arrayBuffer();

        setLoadingStep(1);
        const parsed = parse_rec(buffer);
        const parsedSummary = parse_rec_summary(buffer);
        if (typeof window !== "undefined") {
          (window as any).__aoe2rec = parsed;
          (window as any).__aoe2summary = parsedSummary;
        }
        setLoadingStep(2);
        const timeline = buildTimeline(parsed);
        const gameDuration = determineDuration(parsedSummary, timeline);
        const extractedInfo = extractMatchInfo(parsedSummary);

        setLoadingStep(3);
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
      // If zooming in and not yet at MAX_ZOOM
      if (event.deltaY < 0 && mapZoom < MAX_ZOOM) {
        zoomLimitTimestampRef.current = null;
        event.preventDefault();
      }
      // If zooming out and not yet at 1
      else if (event.deltaY > 0 && mapZoom > 1) {
        zoomLimitTimestampRef.current = null;
        event.preventDefault();
      }
      // At a limit and continuing to scroll in that direction
      else if ((event.deltaY < 0 && mapZoom >= MAX_ZOOM) || (event.deltaY > 0 && mapZoom <= 1)) {
        if (zoomLimitTimestampRef.current === null) {
          zoomLimitTimestampRef.current = Date.now();
        }

        const elapsed = Date.now() - zoomLimitTimestampRef.current;
        if (elapsed < 300) {
          event.preventDefault();
        }
      }
      // Scrolling AWAY from a limit
      else {
        zoomLimitTimestampRef.current = null;
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [mapZoom]);

  return (
    <div className="gradient-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="headline text-xl font-semibold text-[color:var(--foreground)] md:text-4xl">
                <span className="text-[color:var(--muted)]">AoE2</span> Replay Viewer
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--muted)] md:text-lg">
                Upload a replay to see minimap playback, key metrics, and build timelines.
              </p>
            </div>
            <label
              className="panel flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-[color:var(--foreground)]"
              onClick={() => setIsPlaying(false)}
            >
              <span className="text-2xl">📁</span>
              <span>Open .aoe2record replay file</span>
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
          {error && (
            <div className="panel-strong rounded-2xl px-4 py-3 text-sm text-[color:var(--accent)]">
              {error}
            </div>
          )}
        </header>

        <main className="flex flex-col gap-6">
          <section className="panel-dark flex flex-col gap-4 rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <label className="toggle-pill gap-2 group">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors group-hover:text-white peer-checked:text-white peer-checked:font-bold">
                    Buildings
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={showBuildings}
                      onChange={(event) => setShowBuildings(event.target.checked)}
                    />
                    <div className="toggle-pill-track ring-1 ring-white/5 peer-focus:ring-var(--accent)/40">
                      <div className="toggle-pill-thumb" />
                    </div>
                  </div>
                </label>
                <label className="toggle-pill gap-2 group">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors group-hover:text-white peer-checked:text-white peer-checked:font-bold">
                    Unit movements
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={showUnits}
                      onChange={(event) => setShowUnits(event.target.checked)}
                    />
                    <div className="toggle-pill-track ring-1 ring-white/5 peer-focus:ring-var(--accent)/40">
                      <div className="toggle-pill-thumb" />
                    </div>
                  </div>
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
                  if (next === prev) return prev;

                  if (next <= 1) {
                    setMapPan({ x: 0, y: 0 });
                    return next;
                  }

                  const rectMap = canvas.getBoundingClientRect();
                  const mapSpan = Math.max(mapInfo?.size_x ?? mapSize, mapInfo?.size_y ?? mapSize);
                  const wScale = (rectMap.width - 2) / mapSpan;
                  const hScale = (rectMap.height - PAD_BOTTOM - PAD_TOP) / (mapSpan * 0.5);
                  const baseScale = Math.min(wScale, hScale) * SCALE_BOOST;

                  const prevIsoScale = Math.max(1, baseScale * prev);
                  const nextIsoScale = Math.max(1, baseScale * next);
                  const scaleChange = nextIsoScale / prevIsoScale;

                  const centerY = (rectMap.height - PAD_BOTTOM) / 2 + PAD_TOP;

                  setMapPan((pan) =>
                    clampPan(
                      {
                        x: pan.x + (1 - scaleChange) * (cursorX - centerX - pan.x),
                        y: pan.y + (1 - scaleChange) * (cursorY - centerY - pan.y),
                      },
                      next
                    )
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
                <div className="pointer-events-auto w-full overflow-hidden rounded-xl bg-white/10 shadow-lg border border-white/10 font-semibold text-xl text-white select-none backdrop-blur-sm">
                  <button
                    type="button"
                    className="py-1 w-full transition hover:bg-white/20 border-b border-white/10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom((prev) => {
                        const next = clamp(prev * 1.25, 1, MAX_ZOOM);
                        if (next === prev) return prev;
                        const scaleChange = next / prev;
                        setMapPan((pan) => clampPan({ x: pan.x * scaleChange, y: pan.y * scaleChange }, next));
                        return next;
                      });
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="py-1 w-full transition hover:bg-white/20 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapZoom((prev) => {
                        const next = clamp(prev * 0.8, 1, MAX_ZOOM);
                        if (next === prev) return prev;
                        if (next <= 1) {
                          setMapPan({ x: 0, y: 0 });
                          return next;
                        }
                        const scaleChange = next / prev;
                        setMapPan((pan) => clampPan({ x: pan.x * scaleChange, y: pan.y * scaleChange }, next));
                        return next;
                      });
                    }}
                  >
                    -
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 py-1 pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapZoom(1);
                    setMapPan({ x: 0, y: 0 });
                  }}
                  title="Reset zoom"
                >
                  ⛶
                </button>
                <button
                  type="button"
                  className="mt-2 py-1 pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/30 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToTimeline();
                  }}
                  title="Jump to timeline position"
                >
                  ⏲
                </button>
              </div>
              <canvas ref={canvasRef} className="h-full w-full rounded-2xl" />

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

          {loading && (
            <div className="panel overflow-hidden rounded-3xl p-8 shadow-2xl ring-1 ring-white/10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-10 py-6">
                {/* Spinner / Progress Orb */}
                <div className="relative h-24 w-24 shrink-0">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[color:var(--accent)] opacity-20"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full bg-[color:var(--accent)] opacity-40"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[color:var(--panel-strong)] shadow-inner ring-1 ring-white/20">
                    <span className="text-3xl animate-bounce">📜</span>
                  </div>
                </div>

                <div className="flex w-full max-w-sm flex-col gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold uppercase tracking-wider text-[color:var(--accent)]">
                      {LOADING_STEPS[loadingStep]}
                    </span>
                    <span className="font-mono text-[color:var(--muted)]">
                      {Math.round(((loadingStep + 1) / LOADING_STEPS.length) * 100)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-[color:var(--accent)] to-amber-400 transition-all duration-500 ease-out"
                      style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {LOADING_STEPS.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${idx === loadingStep
                            ? "text-[color:var(--foreground)] opacity-100"
                            : idx < loadingStep
                              ? "text-emerald-400 opacity-60"
                              : "text-[color:var(--muted)] opacity-30"
                          }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${idx === loadingStep
                            ? "bg-[color:var(--accent)] animate-pulse"
                            : idx < loadingStep
                              ? "bg-emerald-400"
                              : "bg-white/20"
                          }`} />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {replay && (
            <div className="flex flex-col gap-6">
              <div className="flex border-b border-white/10">
                <button
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === "units"
                    ? "border-b-2 border-[color:var(--accent)] text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                  onClick={() => setActiveTab("units")}
                >
                  Units
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
                <button
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === "info"
                    ? "border-b-2 border-[color:var(--accent)] text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                  onClick={() => setActiveTab("info")}
                >
                  Info
                </button>
              </div>

              {activeTab === "timeline" ? (
                <section ref={timelineRef} className="w-full">
                  <div className="panel flex flex-col gap-6 rounded-3xl p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="headline text-2xl">Timeline</h2>
                      <div className="flex flex-wrap items-center gap-4 pr-2 py-2 rounded-2xl">
                        <label className="toggle-pill gap-1 group">
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowBuildings}
                              onChange={(e) => setTimelineShowBuildings(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-5 w-9">
                              <div className="toggle-pill-thumb h-3 w-3 top-1 left-1 peer-checked:translate-x-4"></div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--foreground)] peer-checked:text-[color:var(--foreground)]">
                            Buildings
                          </span>
                        </label>
                        <label className="toggle-pill gap-1 group">
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowUnits}
                              onChange={(e) => setTimelineShowUnits(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-5 w-9">
                              <div className="toggle-pill-thumb h-3 w-3 top-1 left-1 peer-checked:translate-x-4"></div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--foreground)] peer-checked:text-[color:var(--foreground)]">
                            Units
                          </span>
                        </label>
                        <label className="toggle-pill gap-1 group">
                          <div className="relative scale-75">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={timelineShowResearch}
                              onChange={(e) => setTimelineShowResearch(e.target.checked)}
                            />
                            <div className="toggle-pill-track h-5 w-9">
                              <div className="toggle-pill-thumb h-3 w-3 top-1 left-1 peer-checked:translate-x-4"></div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--foreground)] peer-checked:text-[color:var(--foreground)]">
                            Research
                          </span>
                        </label>
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
                          const playerResearch = researchEvents.filter(
                            (event) => event.playerId === player?.id
                          );
                          return (
                            <div key={`${player.id}-${index}`} className="panel-strong rounded-2xl">
                              <div className="flex items-center justify-between gap-2 p-4">
                                <div className="flex items-center">
                                  <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ background: classifyColor(player.id) }}
                                  ></span>
                                  <div className="flex flex-col ml-4">
                                    <h3 className="headline text-lg leading-tight">{player.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                      <span>{getCivName(player.civId) || "Unknown Civ"}</span>
                                      <span>•</span>
                                      <span>Team {player.teamId !== undefined ? player.teamId + 1 : "—"}</span>
                                    </div>
                                  </div>
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
                                className="relative mt-1 w-full"
                                style={{ height: timelineHeight, minHeight: MIN_TIMELINE_HEIGHT }}
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
                                {consolidateEvents(playerBuilds).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-22 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🏛️</span>
                                    <div className="h-[1px] w-4 bg-white/10" />
                                    <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
                                  </div>
                                ))}
                                {consolidateEvents(playerTrains).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-21 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">
                                      {event.isMilitary ? "🗡️" : "🙂"}
                                    </span>
                                    <div className="h-[1px] w-[6rem] bg-white/10" />
                                    <span className="whitespace-nowrap pl-1 text-[9px] text-[color:var(--muted)]">{event.label}</span>
                                  </div>
                                ))}
                                {consolidateEvents(playerResearch).map((event) => (
                                  <div key={event.id} className="group absolute left-8 flex items-center z-20 cursor-help" style={{ top: `${(event.time / Math.max(duration, 1)) * 100}%` }} title={`${event.label} @ ${formatClock(event.time)}`}>
                                    <span className="absolute left-0 -translate-x-1/2 text-[12px] transition-transform group-hover:-translate-x-5 select-none">🧪</span>
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
                                      <span className="rounded bg-[color:var(--foreground)] px-1 py-0.5 text-[9px] font-bold text-[color:var(--panel)] shadow-sm">
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
              ) : activeTab === "units" ? (
                <section className="panel rounded-3xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="headline text-2xl">Units Trained</h2>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {players.map((player) => {
                      const stats = unitStats.get(player.id) || { military: [], economic: [] };
                      const milCount = stats.military.reduce((acc, u) => acc + u.count, 0);
                      const ecoCount = stats.economic.reduce((acc, u) => acc + u.count, 0);

                      return (
                        <div key={player.id} className="panel-strong rounded-2xl p-4 flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <h3 className="headline text-lg leading-tight">{player.name}</h3>
                              <div className="flex items-center gap-2 text-xs text-white/40">
                                <span>{getCivName(player.civId) || "Unknown Civ"}</span>
                                <span>•</span>
                                <span>Team {player.teamId !== undefined ? player.teamId + 1 : "—"}</span>
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
                                <span className="text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/50">{milCount}</span>
                              </div>
                              <div className="flex flex-col gap-1.5 min-h-[20px]">
                                {stats.military.length > 0 ? (
                                  stats.military.map((u, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                                      <span className="font-mono font-bold shrink-0">{u.count}</span>
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
                                <span className="text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/50">{ecoCount}</span>
                              </div>
                              <div className="flex flex-col gap-1.5 min-h-[20px]">
                                {stats.economic.length > 0 ? (
                                  stats.economic.map((u, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-[color:var(--muted)] truncate pr-2">{u.name}</span>
                                      <span className="font-mono font-bold shrink-0">{u.count}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-white/20 italic">No eco units trained</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
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
                          <div
                            key={player.id}
                            className="panel-strong rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <h3 className="headline text-lg leading-tight">
                                  {player.name}
                                  {player.won && <sup className="ml-1">👑</sup>}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <span>{getCivName(player.civId) || "Unknown Civ"}</span>
                                  <span>•</span>
                                  <span>Team {player.teamId !== undefined ? player.teamId + 1 : "—"}</span>
                                </div>
                              </div>
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ background: classifyColor(player.id) }}
                              ></span>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-[color:var(--muted)]">APM</p>
                                <p className="text-lg font-semibold">{formatOptional(stats?.apm)}</p>
                              </div>
                              <div>
                                {stats?.ageTimings ? (
                                  <div className="space-y-1 text-m text-[color:var(--muted)]">
                                    {Object.entries(stats.ageTimings).map(([age, time]) => (
                                      <div key={age}>
                                        {age}<span className="text-white pl-2">{formatClock(time)}</span>
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
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
