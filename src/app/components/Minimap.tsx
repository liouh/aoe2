"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type MatchInfo, type TimelineEvent } from "@/lib/replayProcessor";
import { Select, type SelectOption } from "./Select";
import { TERRAIN_MINIMAP_COLORS } from "@/lib/terrainPalette";
import { getBuildingFootprint } from "@/lib/buildingFootprints";
import { getBuildingName } from "@/lib/entityNames";
import { getBuildingIcon } from "@/lib/buildingIcons";

const MINIMAP_ZOOM_FACTOR = 1.5;
const MINIMAP_MAX_ZOOM = 7;
const MINIMAP_MOBILE_MAX_ZOOM = 17;
const MINIMAP_ICON_MIN_SIZE = 20;
const MINIMAP_ICON_SCALE_FACTOR = 3;
const MINIMAP_ICON_BORDER = 14;
const MINIMAP_EMOJI_SCALE = 0.18;
const MINIMAP_EMOJI_ALPHA = 0.8;
const MINIMAP_EMOJI_ZOOM_THRESHOLD = 10;
const MINIMAP_HOVER_OUTLINE = 2;
const MINIMAP_UNIT_ALPHA = 1;
const MINIMAP_UNIT_CIRCLE_RADIUS_MOBILE = 3;
const MINIMAP_UNIT_CIRCLE_RADIUS_DESKTOP = 5;
const MINIMAP_UNIT_BORDER_MOBILE = 1;
const MINIMAP_UNIT_BORDER_DESKTOP = 2;
const MINIMAP_UNIT_FADE_SECONDS = 50;
const MINIMAP_ELEVATION_STEP = 3;
const MINIMAP_TERRAIN_ALPHA = 1;

const LOADING_STEPS = [
  "Loading replay...",
  "Loading timeline...",
  "Loading viewer..."
];

interface MinimapProps {
  replay: any;
  matchInfo: MatchInfo | null;
  events: TimelineEvent[];
  duration: number;
  selectedTime: number;
  setSelectedTime: (time: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  loadingStep: number;
  error: string | null;
  players: any[];
  getPlayerColor: (playerId?: number) => string;
  getPlayerOutline: (playerId?: number) => string;
  formatClock: (seconds: number) => string;
  setActiveTab: (tab: "game" | "stats" | "timeline") => void;
  setPendingJump: (pending: boolean) => void;
  onOpenFile: (file: File) => void;
  onShowUrlInput: () => void;
}

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function Minimap({
  replay,
  matchInfo,
  events,
  duration,
  selectedTime,
  setSelectedTime,
  isPlaying,
  setIsPlaying,
  loading,
  loadingStep,
  error,
  players,
  getPlayerColor,
  getPlayerOutline,
  formatClock,
  setActiveTab,
  setPendingJump,
  onOpenFile,
  onShowUrlInput,
}: MinimapProps) {
  const [minimapViewMode, setMinimapViewMode] = useState<"both" | "buildings" | "moves" | "no_icons">("both");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<{
    name: string;
    playerId?: number;
    type: "unit" | "building";
    anchorKey?: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainCacheKeyRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const iconCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const mapInfo = useMemo(() => replay?.zheader?.map_info ?? null, [replay]);

  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setResizeKey(prev => prev + 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const minimapPlayers: SelectOption<number | undefined>[] = useMemo(() => {
    return [
      { id: undefined, label: "All players", color: "var(--foreground)" },
      ...players.map(p => ({ id: p.id, label: p.name, color: getPlayerColor(p.id), isAi: p.ai }))
    ];
  }, [players, getPlayerColor]);

  const minimapViewOptions: SelectOption<"both" | "buildings" | "moves" | "no_icons">[] = [
    { id: "both", label: "All data" },
    { id: "no_icons", label: "No building icons" },
    { id: "buildings", label: "Only buildings" },
    { id: "moves", label: "Only unit movements" },
  ];

  const toggleFullscreen = (value?: boolean) => {
    const next = value ?? !isFullscreen;
    setIsFullscreen(next);
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  };

  const filters = useMemo(() => (
    <>
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
    </>
  ), [minimapPlayers, selectedPlayerIds, minimapViewMode, minimapViewOptions]);

  const showBuildings = minimapViewMode === "both" || minimapViewMode === "buildings" || minimapViewMode === "no_icons";
  const showUnits = minimapViewMode === "both" || minimapViewMode === "moves" || minimapViewMode === "no_icons";
  const showBuildingIcons = minimapViewMode !== "no_icons";

  // Reset internal state when a new replay is loaded
  useEffect(() => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    setSelectedPlayerIds([]);
    setMinimapViewMode("both");
    setHoveredEntity(null);
    iconCacheRef.current.clear();
  }, [replay]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  // Disable body scroll when full screen is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Focus play button when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      playButtonRef.current?.focus();
    }
  }, [isFullscreen]);

  // Handle window resize to redraw canvas
  useEffect(() => {
    const handleResize = () => {
      setHoveredEntity(null);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      const prevOriginX = rect.width * 0.5 + mapPan.x;
      const prevDiamondHeight = mapSpan * prevIsoScale * 0.5;
      const prevOriginY = (rect.height - prevDiamondHeight) / 2 + mapPan.y;

      const relX = targetX - prevOriginX;
      const relY = targetY - prevOriginY;
      const rx = relX / prevIsoScale + (2 * relY) / prevIsoScale;
      const ry = (2 * relY) / prevIsoScale - relX / prevIsoScale;

      const nextDiamondHeight = mapSpan * nextIsoScale * 0.5;
      const nextOriginY_noPan = (rect.height - nextDiamondHeight) / 2;
      const nextOriginX_noPan = rect.width * 0.5;

      const nextIsoX_noPan = (rx - ry) * nextIsoScale * 0.5 + nextOriginX_noPan;
      const nextIsoY_noPan = (rx + ry) * nextIsoScale * 0.25 + nextOriginY_noPan;

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

  const jumpToTimeline = () => {
    setIsPlaying(false);
    setActiveTab("timeline");
    setPendingJump(true);
  };

  const buildEvents = useMemo(
    () => {
      const sizeX = mapInfo?.size_x ?? 120;
      const sizeY = mapInfo?.size_y ?? 120;
      return events.filter(
        (event) =>
          event.category === "build" &&
          event.x !== undefined &&
          event.y !== undefined &&
          event.x >= 0 &&
          event.y >= 0 &&
          event.x <= sizeX &&
          event.y <= sizeY
      );
    },
    [events, mapInfo]
  );

  const moveEvents = useMemo(
    () => {
      const sizeX = mapInfo?.size_x ?? 120;
      const sizeY = mapInfo?.size_y ?? 120;
      return events.filter(
        (event) =>
          event.category === "move" &&
          event.x !== undefined &&
          event.y !== undefined &&
          event.x >= 0 &&
          event.y >= 0 &&
          event.x <= sizeX &&
          event.y <= sizeY &&
          (selectedPlayerIds.length === 0 || (event.playerId !== undefined && selectedPlayerIds.includes(event.playerId)))
      );
    },
    [events, selectedPlayerIds, mapInfo]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

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
      const ry = (sizeX ?? 120) - x;
      const isoX = (rx - ry) * isoScale * 0.5 + isoOriginX;
      const isoY = (rx + ry) * isoScale * 0.25 + isoOriginY;
      return { x: isoX, y: isoY };
    };

    const terrainCacheKey = `${sizeX},${sizeY},${isoScale},${isoOriginX},${isoOriginY},${mapInfo?.tiles?.length},${MINIMAP_TERRAIN_ALPHA}`;

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
          terrainContext.globalAlpha = MINIMAP_TERRAIN_ALPHA;
          for (let y = 0; y < sizeY; y += 1) {
            for (let x = 0; x < sizeX; x += 1) {
              const tile = tiles[y * sizeX + x] as { terrain_type?: number; elevation?: number };
              const terrainType = tile?.terrain_type ?? 14;
              let color = TERRAIN_MINIMAP_COLORS[terrainType] ?? "#cbb892";

              if (tile?.elevation !== undefined) {
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
          terrainContext.globalAlpha = 1.0;
        }
        terrainContext.strokeStyle = "rgba(28, 22, 16, 0.2)";
        terrainContext.lineWidth = 1;
        terrainContext.beginPath();
        const top = toCanvas(0, 0);
        const right = toCanvas(sizeX ?? 120, 0);
        const bottom = toCanvas(sizeX ?? 120, sizeY ?? 120);
        const left = toCanvas(0, sizeY ?? 120);
        terrainContext.moveTo(top.x, top.y);
        terrainContext.lineTo(right.x, right.y);
        terrainContext.lineTo(bottom.x, bottom.y);
        terrainContext.lineTo(left.x, left.y);
        terrainContext.closePath();
        terrainContext.stroke();
      }
      terrainCacheKeyRef.current = terrainCacheKey;
    }

    if (terrainCanvasRef.current && terrainCanvasRef.current.width > 0 && terrainCanvasRef.current.height > 0) {
      try {
        context.drawImage(terrainCanvasRef.current, 0, 0, bounds.width, bounds.height);
      } catch (e) {
        console.error("Minimap drawImage failed:", e);
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

    const getBuildingEmoji = (id?: number) => {
      const name = getBuildingName(id);
      return getBuildingIcon(name);
    };

    const isIconBuilding = (id?: number) => {
      const name = getBuildingName(id);
      return (
        name.includes("Town Center") ||
        name.includes("Castle") ||
        !!getBuildingEmoji(id)
      );
    };

    const iconBuildings: TimelineEvent[] = [];

    const destroyedTiles = new Set<string>();
    const tileToAnchor = new Map<string, string>();
    const anchorToFootprint = new Map<string, { w: number; h: number }>();
    const anchorToEvent = new Map<string, TimelineEvent>();

    for (const event of buildEvents) {
      if (event.time > selectedTime) break;
      if (event.x === undefined || event.y === undefined) continue;

      const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
      const footprint = getBuildingFootprint(event.buildingTypeId);
      const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
      const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
      const anchorKey = `${baseX},${baseY}`;

      anchorToFootprint.set(anchorKey, footprint);
      anchorToEvent.set(anchorKey, event);
      const displacedAnchors = new Set<string>();
      for (let dx = 0; dx < footprint.w; dx += 1) {
        for (let dy = 0; dy < footprint.h; dy += 1) {
          const tileX = baseX + dx;
          const tileY = baseY + dy;
          if (tileX >= (sizeX ?? 120) || tileY >= (sizeY ?? 120)) continue;
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
    const drawBuilding = (event: TimelineEvent) => {
      if (event.x === undefined || event.y === undefined) return;
      if (event.x < 0 || event.y < 0 || event.x > (sizeX ?? 120) || event.y > (sizeY ?? 120)) return;
      const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
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
          if (tileX >= (sizeX ?? 120) || tileY >= (sizeY ?? 120)) continue;
          drawTile(tileX, tileY, getPlayerColor(event.playerId));
        }
      }

      if (isIconBuilding(event.buildingTypeId)) {
        iconBuildings.push(event);
      }
    };

    if (showBuildings) {
      anchorToEvent.forEach((event) => {
        if (selectedPlayerIds.length === 0 || (event.playerId !== undefined && selectedPlayerIds.includes(event.playerId))) {
          drawBuilding(event);
        }
      });

      if (showBuildingIcons) {
        // First pass: Draw non-landmark (emoji) icons
        (isoScale >= MINIMAP_EMOJI_ZOOM_THRESHOLD) && iconBuildings.forEach((event) => {
          if (selectedPlayerIds.length > 0 && (event.playerId === undefined || !selectedPlayerIds.includes(event.playerId))) {
            return;
          }
          if (event.x === undefined || event.y === undefined) return;
          const name = getBuildingName(event.buildingTypeId);
          const emoji = getBuildingEmoji(event.buildingTypeId);
          const isLandmark = name.includes("Town Center") || name.includes("Castle");

          if (!isLandmark && emoji) {
            const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
            const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
            const footprint = getBuildingFootprint(event.buildingTypeId);
            const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
            const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
            const centerTileX = baseX + footprint.w / 2;
            const centerTileY = baseY + footprint.h / 2;
            const center = toCanvas(centerTileX, centerTileY);
            const footprintScale = Math.max(footprint.w, footprint.h) / 2;
            const iconSize = Math.max(MINIMAP_ICON_MIN_SIZE, isoScale * MINIMAP_ICON_SCALE_FACTOR) * footprintScale;
            const color = getPlayerColor(event.playerId);
            const outline = getPlayerOutline(event.playerId);
            const emojiSize = iconSize * MINIMAP_EMOJI_SCALE;
            const cacheKey = `${emoji}-${color}-${outline}-${Math.round(emojiSize)}`;

            let cachedCanvas = iconCacheRef.current.get(cacheKey);

            if (!cachedCanvas) {
              cachedCanvas = document.createElement("canvas");
              const offCtx = cachedCanvas.getContext("2d");
              if (offCtx) {
                const canvasDim = emojiSize * 2;
                cachedCanvas.width = canvasDim;
                cachedCanvas.height = canvasDim;

                offCtx.font = `bold ${emojiSize}px sans-serif`;
                offCtx.textAlign = "center";
                offCtx.textBaseline = "middle";

                // 1. Draw mask
                offCtx.globalCompositeOperation = "source-over";
                offCtx.fillText(emoji, emojiSize, emojiSize);

                // 2. Tint with player outline color
                offCtx.globalCompositeOperation = "source-in";
                offCtx.fillStyle = outline;
                offCtx.fillRect(0, 0, canvasDim, canvasDim);

                iconCacheRef.current.set(cacheKey, cachedCanvas);
              }
            }

            if (cachedCanvas) {
              context.globalAlpha = MINIMAP_EMOJI_ALPHA;
              context.drawImage(
                cachedCanvas,
                center.x - emojiSize,
                center.y - emojiSize
              );
              context.globalAlpha = 1.0;
            }
          }
        });

        // Second pass: Draw landmark icons (Town Centers and Castles) on top
        iconBuildings.forEach((event) => {
          if (selectedPlayerIds.length > 0 && (event.playerId === undefined || !selectedPlayerIds.includes(event.playerId))) {
            return;
          }
          if (event.x === undefined || event.y === undefined) return;
          const name = getBuildingName(event.buildingTypeId);
          const isLandmark = name.includes("Town Center") || name.includes("Castle");

          if (isLandmark) {
            const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
            const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
            const footprint = getBuildingFootprint(event.buildingTypeId);
            const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
            const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
            const centerTileX = baseX + footprint.w / 2;
            const centerTileY = baseY + footprint.h / 2;
            const center = toCanvas(centerTileX, centerTileY);
            const iconSize = Math.max(MINIMAP_ICON_MIN_SIZE, isoScale * MINIMAP_ICON_SCALE_FACTOR);

            const iconPath = name.includes("Castle") ? castlePath : townCenterPath;
            const color = getPlayerColor(event.playerId);
            const outline = getPlayerOutline(event.playerId);
            context.save();
            context.translate(center.x - iconSize / 2, center.y - iconSize * 0.8);
            context.scale(iconSize / 100, iconSize / 100);
            context.fillStyle = color;
            context.lineWidth = MINIMAP_ICON_BORDER;
            context.lineJoin = "round";
            context.strokeStyle = outline;
            context.stroke(iconPath);
            context.fill(iconPath);
            context.restore();
          }
        });
      }
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
        context.arc(pos.x, pos.y, isMobile ? MINIMAP_UNIT_CIRCLE_RADIUS_MOBILE : MINIMAP_UNIT_CIRCLE_RADIUS_DESKTOP, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = isMobile ? MINIMAP_UNIT_BORDER_MOBILE : MINIMAP_UNIT_BORDER_DESKTOP;
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
        context.strokeStyle = getPlayerOutline(hoveredEntity.playerId);
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
      sizeX: sizeX ?? 120,
      sizeY: sizeY ?? 120,
    };
  }, [
    buildEvents,
    mapInfo,
    replay,
    mapPan,
    mapZoom,
    selectedTime,
    showBuildings,
    showBuildingIcons,
    showUnits,
    moveEvents,
    hoveredEntity,
    selectedPlayerIds,
    getPlayerColor,
    getPlayerOutline,
    isFullscreen,
    resizeKey,
  ]);

  return (
    <section
      className={`panel-dark flex flex-col p-4 pb-6 gap-4 justify-center ${isFullscreen
        ? `fixed inset-0 z-[100] rounded-none`
        : "rounded-3xl"
        }`}
      style={isFullscreen ? { border: "none", outline: "none", boxShadow: "none" } : {}}
    >
      {!loading && !error && (
        <div className="flex md:hidden items-center gap-2 px-1">
          {filters}
        </div>
      )}
      <div
        className={`relative aspect-[2/1] w-full ${isFullscreen ? "max-h-screen mx-auto overflow-hidden" : ""
          }`}
        ref={mapContainerRef}
        style={{
          touchAction: mapZoom > 1 ? "none" : "pan-y",
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
          (event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId);
        }}
        onPointerLeave={() => {
          isDraggingRef.current = false;
          lastPointerRef.current = null;
          setHoveredEntity(null);
        }}
      >
        {!loading && !error && (
          <div
            className="absolute hidden md:flex left-2 top-2 z-20 items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onPointerMove={(e) => {
              e.stopPropagation();
              setHoveredEntity(null);
            }}
          >
            {filters}
          </div>
        )}
        {isFullscreen && (
          <div
            className="absolute hidden md:flex right-2 top-2 z-20 flex items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => {
              e.stopPropagation();
              setHoveredEntity(null);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".aoe2record,.zip"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onOpenFile(file);
                }
              }}
            />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white shadow-lg transition hover:border-white/20 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
              onClick={() => {
                setIsPlaying(false);
                fileInputRef.current?.click();
              }}
              title="Open .aoe2record file"
            >
              📁
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white shadow-lg transition hover:border-white/20 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
              onClick={() => {
                toggleFullscreen(false);
                onShowUrlInput();
              }}
              title="Load replay from URL"
            >
              🔗
            </button>
          </div>
        )}
        {!loading && !error && replay && (
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
              className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/20 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? "×" : "⛶"}
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
              className="flex h-9 items-center justify-center pointer-events-auto w-full rounded-xl border border-white/10 bg-white/10 text-xl font-semibold text-white shadow-lg transition hover:border-white/20 hover:bg-white/20 select-none cursor-pointer backdrop-blur-sm outline-none"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen(false);
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
            className="pointer-events-none fixed z-[110] rounded-lg border border-[color:var(--panel-strong)] bg-[color:var(--panel)] p-2 text-xs shadow-xl animate-in fade-in zoom-in duration-100"
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
      <div className={`flex items-center gap-4 px-0.5 md:px-1.5 ${isFullscreen ? "w-full max-w-6xl mx-auto" : ""}`}>
        <button
          ref={playButtonRef}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/30 hover:border-white/20 hover:scale-105 active:scale-95 cursor-pointer"
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
            id="time-scrubber"
            name="time-scrubber"
            type="range"
            min={0}
            max={duration}
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
  );
}
