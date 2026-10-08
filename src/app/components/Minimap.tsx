"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type MapResourceType, type MatchInfo, type TimelineEvent } from "@/lib/replayProcessor";
import { Select, type SelectOption } from "./Select";
import { TERRAIN_MINIMAP_COLORS } from "@/lib/terrainMappings";
import {
  getBuildingFootprint,
  isFarmId,
  getBuildingName,
} from "@/lib/entityMappings";
import { getBuildingIcon } from "@/lib/buildingIcons";
import { DEBUG } from "@/lib/debug";

const LOADING_STEP_COUNT = 4;

const MINIMAP_ZOOM_FACTOR = 1.5;
const MINIMAP_MOUSE_ZOOM_FACTOR = 1.1;
const MINIMAP_ZOOM_MAX = 7;
const MINIMAP_ZOOM_MAX_MOBILE = 17;

const MINIMAP_ICON_SIZE_MIN_MOBILE = 16;
const MINIMAP_ICON_SIZE_MIN_DESKTOP = 24;
const MINIMAP_ICON_SCALE_FACTOR = 2.4;
const MINIMAP_LANDMARK_ICON_BORDER_WIDTH = 16;

const MINIMAP_EMOJI_SCALE = 0.2;
const MINIMAP_EMOJI_ALPHA = 0.9;
const MINIMAP_EMOJI_FOOTPRINT_MIN_SIZE = 1.8;
const MINIMAP_EMOJI_ZOOM_THRESHOLD = 8;

const MINIMAP_BUILDING_ALPHA = 1;
const MINIMAP_BUILDING_OUTLINE_MIN_WIDTH = 1;
const MINIMAP_BUILDING_OUTLINE_SCALE = 0.1;
const MINIMAP_BUILDING_BORDER_OFFSET = 0.5;
const MINIMAP_BUILDING_HIGHLIGHT_PERCENT = 15;
const MINIMAP_BUILDING_SHADOW_PERCENT = -20;
const MINIMAP_BUILDING_FADE_IN_SECONDS = 30;
const MINIMAP_FARMS_ALPHA = 0.7;
const MINIMAP_FARMS_OUTLINE_WIDTH = 0.5;
const MINIMAP_FARMS_OUTLINE_ALPHA = 0.3;
const MINIMAP_BUILDING_HOVER_WIDTH = 3;

const MINIMAP_UNIT_ALPHA = 0.8;
const MINIMAP_UNIT_RADIUS_MOBILE = 2;
const MINIMAP_UNIT_RADIUS_DESKTOP = 4;
const MINIMAP_UNIT_BORDER_WIDTH_MOBILE = 0.5;
const MINIMAP_UNIT_BORDER_WIDTH_DESKTOP = 1.5;
const MINIMAP_UNIT_FADE_SECONDS = 30;
const MINIMAP_ACTIVE_GATHERPOINT_FADE_SECONDS = 120;

const MINIMAP_FLARE_WIDTH = 3;
const MINIMAP_FLARE_OUTLINE_WIDTH = 6;
const MINIMAP_FLARE_SIZE = 8;
const MINIMAP_FLARE_FADE_SECONDS = 120;

const MINIMAP_TERRAIN_ELEVATION_STEP = 3;
const MINIMAP_TERRAIN_ELEVATION_TAPER = 0.7;
const MINIMAP_TERRAIN_ALPHA = 1;
const MINIMAP_TERRAIN_CONTOUR_WIDTH = 2.5;
const MINIMAP_TERRAIN_HIGHLIGHT_PERCENT = 15;
const MINIMAP_TERRAIN_SHADOW_PERCENT = -20;
const BASE_TERRAIN_SCALE = 34;

const MINIMAP_GRID_WIDTH = 0.5;
const MINIMAP_GRID_COLOR = "rgba(255, 255, 255, 0.15)";
const MINIMAP_DIAMOND_BG_COLOR = "#aaaaaa";

const MINIMAP_CLIFF_COLOR = "#713600";
const MINIMAP_CLIFF_HIGHLIGHT_PERCENT = 15;
const MINIMAP_CLIFF_SHADOW_PERCENT = -30;

const MINIMAP_RESOURCE_COLORS = {
  gold: "#ffd700",
  stone: "#91a1ad",
  forage: "#34d399",
  relic: "#ffffff",
  wood: "#195e2b",
} as const;
const MINIMAP_RESOURCE_HIGHLIGHT_PERCENT = 15;
const MINIMAP_RESOURCE_SHADOW_PERCENT = -30;

const DEFAULT_LAYERS = ["terrain", "obstacles", "resources", "relics", "landmark_icons", "footprints", "farms", "icons", "gatherpoints", "flares", "moves"];

const VIEW_OPTIONS = [
  {
    id: "activity",
    label: "Activity view",
    layers: ["footprints", "farms", "icons", "gatherpoints", "flares", "moves"],
  },
  {
    id: "classic",
    label: "Classic view",
    layers: ["terrain", "obstacles", "footprints", "icons", "gatherpoints", "flares"],
  },
  {
    id: "default",
    label: "Default view",
    layers: DEFAULT_LAYERS,
  },
  {
    id: "map",
    label: "Map only view",
    layers: ["terrain", "obstacles", "resources", "relics"],
  },
  {
    id: "moves",
    label: "Unit moves view",
    layers: ["terrain", "landmark_icons", "moves"],
  },
  {
    id: "zen",
    label: "Zen view",
    layers: ["footprints", "farms"],
  },
];

interface MinimapProps {
  replay: any;
  matchInfo: MatchInfo | null;
  events: TimelineEvent[];
  mapResources: Record<string, MapResourceType>;
  mapCliffs?: Record<string, boolean>;
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
  onOpenFile: (file: File) => void;
  onShowUrlInput: () => void;
  onCachedCanvasesReady: () => void | Promise<void>;
  theme?: "dark" | "light";
}

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const factor = 1 + percent / 100;
  const R = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)));
  const G = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)));
  const B = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)));
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

/**
 * Calculates diminishing elevation shade percentage.
 * Higher step between 0 -> 1 and 1 -> 2, tapering off smoothly at higher elevations.
 * When elevation is 0, returns 0%.
 */
function getElevationShadePercent(elevation: number): number {
  if (elevation <= 0) return 0;
  if (MINIMAP_TERRAIN_ELEVATION_TAPER >= 1) {
    return elevation * MINIMAP_TERRAIN_ELEVATION_STEP;
  }
  const taper = Math.max(0.01, MINIMAP_TERRAIN_ELEVATION_TAPER);
  return (MINIMAP_TERRAIN_ELEVATION_STEP * (1 - Math.pow(taper, elevation))) / (1 - taper);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function Minimap({
  replay,
  matchInfo,
  events,
  mapResources,
  mapCliffs,
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
  onOpenFile,
  onShowUrlInput,
  onCachedCanvasesReady,
  theme = "dark",
}: MinimapProps) {
  const [minimapViewFilters, setMinimapViewFilters] = useState<string[]>(DEFAULT_LAYERS);
  const iconCheckReplayRef = useRef<any>(null);
  const checkedMissingBuildingIconsRef = useRef<Set<number>>(new Set());
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<{
    name: string;
    playerId?: number;
    type: "unit" | "building";
    anchorKey?: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const terrainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const obstacleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const relicCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const readyReplayRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const iconCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const playButtonRef = useRef<HTMLButtonElement | null>(null);

  const mapZoomRef = useRef(mapZoom);
  const mapPanRef = useRef(mapPan);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{
    lastDistance: number;
    lastCenter: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    mapZoomRef.current = mapZoom;
  }, [mapZoom]);

  useEffect(() => {
    mapPanRef.current = mapPan;
  }, [mapPan]);

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

  const mapInfo = useMemo(() => (replay?.zheader ?? replay?.chapters?.[0]?.zheader)?.map_info ?? null, [replay]);

  const [isMobile, setIsMobile] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);


  const currentViewId = useMemo(() => {
    const matched = VIEW_OPTIONS.find(p =>
      p.layers.length === minimapViewFilters.length &&
      p.layers.every(layer => minimapViewFilters.includes(layer))
    );
    return matched ? matched.id : "custom";
  }, [minimapViewFilters]);

  const viewSelectOptions: SelectOption<string>[] = useMemo(() => {
    return VIEW_OPTIONS.map(p => ({
      id: p.id,
      label: p.label,
    }));
  }, []);

  const handleViewSelect = (id: string) => {
    const view = VIEW_OPTIONS.find(p => p.id === id);
    if (view) {
      setMinimapViewFilters(view.layers);
    }
  };

  const minimapViewOptions: SelectOption<string>[] = [
    { id: "terrain", label: "Terrain" },
    { id: "obstacles", label: "Obstacles" },
    { id: "resources", label: "Resources" },
    { id: "relics", label: "Relics" },
    { id: "landmark_icons", label: "TC + castle markers" },
    { id: "footprints", label: "Buildings" },
    { id: "farms", label: "▸ Farms + fish traps" },
    { id: "icons", label: "▸ Building icons" },
    { id: "gatherpoints", label: "Gather points" },
    { id: "flares", label: "Flares" },
    { id: "moves", label: "Unit movements" },
  ];

  const toggleFullscreen = (value?: boolean) => {
    const next = value ?? !isFullscreen;
    setIsFullscreen(next);
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    mapZoomRef.current = 1;
    mapPanRef.current = { x: 0, y: 0 };
    activePointersRef.current.clear();
    pinchStateRef.current = null;
  };

  const filters = useMemo(() => (
    <>
      <Select
        options={viewSelectOptions}
        selectedId={currentViewId}
        onSelect={(id) => handleViewSelect(id as string)}
        placeholder="Custom view"
        align="left"
        className="w-[140px]"
      />
      <Select
        options={minimapViewOptions}
        selectedId={minimapViewFilters}
        onSelect={(id) => {
          setMinimapViewFilters(prev => {
            const isAdding = !prev.includes(id as string);
            let next = isAdding ? [...prev, id as string] : prev.filter(f => f !== id);

            if (id === "footprints") {
              if (isAdding) {
                if (!next.includes("farms")) next.push("farms");
                if (!next.includes("icons")) next.push("icons");
              } else {
                next = next.filter(f => f !== "farms" && f !== "icons");
              }
            } else if ((id === "farms" || id === "icons") && isAdding) {
              if (!next.includes("footprints")) next.push("footprints");
            }

            return next;
          });
        }}
        multi
        multiLabel="layers"
        placeholder="Select layers"
        align="left"
        className="w-[100px]"
      />
    </>
  ), [minimapViewOptions, minimapViewFilters, viewSelectOptions, currentViewId]);

  const fullscreenButton = (extraClass = "") => (
    <button
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--btn-border)] bg-[color:var(--panel)]/90 text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-strong)] select-none cursor-pointer backdrop-blur-md focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] outline-none ${extraClass}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFullscreen();
      }}
      title={isFullscreen ? "Exit full screen" : "Full screen"}
    >
      {isFullscreen ? (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 5.5V3a.5.5 0 0 1 .5-.5h2.5m5 0H13a.5.5 0 0 1 .5.5v2.5m0 5V13a.5.5 0 0 1-.5.5h-2.5m-5 0H3a.5.5 0 0 1-.5-.5v-2.5" />
        </svg>
      )}
    </button>
  );

  const showBuildingOutlines = minimapViewFilters.includes("footprints");
  const showBuildingIcons = minimapViewFilters.includes("icons");
  const showLandmarkIcons = minimapViewFilters.includes("landmark_icons");
  const showFarms = minimapViewFilters.includes("farms");
  const showUnits = minimapViewFilters.includes("moves");
  const showGatherpoints = minimapViewFilters.includes("gatherpoints");
  const showResources = minimapViewFilters.includes("resources");
  const showRelics = minimapViewFilters.includes("relics");
  const showTerrain = minimapViewFilters.includes("terrain");
  const showObstacles = minimapViewFilters.includes("obstacles");
  const showFlares = minimapViewFilters.includes("flares");
  const showBuildings = showBuildingOutlines || showBuildingIcons || showFarms || showLandmarkIcons;

  const updateHoveredEntity = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
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
    const isVisibleBuilding = building && (
      isFarmId(building.buildingTypeId) ? showFarms : showBuildingOutlines
    );
    if (isVisibleBuilding && building) {
      setHoveredEntity({
        name: getBuildingName(building.buildingTypeId),
        playerId: building.playerId,
        type: "building",
        anchorKey,
      });
      setTooltipPos({ x: clientX, y: clientY });
    } else {
      setHoveredEntity(null);
    }
  }, [showFarms, showBuildingOutlines]);

  useEffect(() => {
    if (!hoveredEntity) return;
    const handleDocumentPointerDown = (e: PointerEvent) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
        setHoveredEntity(null);
      }
    };
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [hoveredEntity]);

  // Reset internal state when a new replay is loaded
  useEffect(() => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    mapZoomRef.current = 1;
    mapPanRef.current = { x: 0, y: 0 };
    activePointersRef.current.clear();
    pinchStateRef.current = null;
    setMinimapViewFilters(DEFAULT_LAYERS);
    setHoveredEntity(null);
    iconCacheRef.current.clear();
    terrainCanvasRef.current = null;
    obstacleCanvasRef.current = null;
    resourceCanvasRef.current = null;
    relicCanvasRef.current = null;
    readyReplayRef.current = null;
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

  const clampPan = useMemo(() => (pan: { x: number; y: number }, zoom?: number) => {
    const container = mapContainerRef.current;
    if (!container) return pan;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return pan;

    const z = zoom ?? mapZoomRef.current;
    const sizeX = mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120;
    const sizeY = mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120;
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
  }, [mapInfo, matchInfo]);

  const canPan = useMemo(() => {
    const container = mapContainerRef.current;
    if (!container) return mapZoom > 1;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return mapZoom > 1;

    const sizeX = mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120;
    const sizeY = mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120;
    const mapSpan = Math.max(sizeX, sizeY);

    const widthScale = (rect.width - 2) / mapSpan;
    const heightScale = rect.height / (mapSpan * 0.5);
    const isoScale = Math.max(1, Math.min(widthScale, heightScale) * mapZoom);

    const diamondWidth = mapSpan * isoScale;
    const diamondHeight = mapSpan * isoScale * 0.5;

    const isOverflowing = diamondWidth > rect.width || diamondHeight > rect.height;
    return isOverflowing || mapPan.x !== 0 || mapPan.y !== 0;
  }, [mapZoom, mapInfo, matchInfo, mapPan, isFullscreen, resizeKey]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setResizeKey((prev) => prev + 1);
      setHoveredEntity(null);
      setMapPan((prev) => {
        const next = clampPan(prev);
        mapPanRef.current = next;
        return next;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const container = mapContainerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [clampPan]);

  const handleZoom = useMemo(() => (targetX: number, targetY: number, zoomFactor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const currentZoom = mapZoomRef.current;
    const currentPan = mapPanRef.current;

    const maxZoom = isMobile ? MINIMAP_ZOOM_MAX_MOBILE : MINIMAP_ZOOM_MAX;
    const nextZoom = clamp(currentZoom * zoomFactor, 1, maxZoom);
    if (nextZoom === currentZoom) return;

    const mapSpan = Math.max(mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120, mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120);
    const wScale = (rect.width - 2) / mapSpan;
    const hScale = rect.height / (mapSpan * 0.5);
    const baseScale = Math.min(wScale, hScale);

    const prevIsoScale = Math.max(1, baseScale * currentZoom);
    const nextIsoScale = Math.max(1, baseScale * nextZoom);

    const prevOriginX = rect.width * 0.5 + currentPan.x;
    const prevDiamondHeight = mapSpan * prevIsoScale * 0.5;
    const prevOriginY = (rect.height - prevDiamondHeight) / 2 + currentPan.y;

    const relX = targetX - prevOriginX;
    const relY = targetY - prevOriginY;
    const rx = relX / prevIsoScale + (2 * relY) / prevIsoScale;
    const ry = (2 * relY) / prevIsoScale - relX / prevIsoScale;

    const nextDiamondHeight = mapSpan * nextIsoScale * 0.5;
    const nextOriginY_noPan = (rect.height - nextDiamondHeight) / 2;
    const nextOriginX_noPan = rect.width * 0.5;

    const nextIsoX_noPan = (rx - ry) * nextIsoScale * 0.5 + nextOriginX_noPan;
    const nextIsoY_noPan = (rx + ry) * nextIsoScale * 0.25 + nextOriginY_noPan;

    const nextPan = clampPan(
      {
        x: targetX - nextIsoX_noPan,
        y: targetY - nextIsoY_noPan,
      },
      nextZoom
    );

    mapZoomRef.current = nextZoom;
    mapPanRef.current = nextPan;
    setMapZoom(nextZoom);
    setMapPan(nextPan);
  }, [isMobile, mapInfo, matchInfo, clampPan]);

  const handlePinchZoom = useMemo(() => (
    prevCenterScreen: { x: number; y: number },
    newCenterScreen: { x: number; y: number },
    zoomFactor: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const currentZoom = mapZoomRef.current;
    const currentPan = mapPanRef.current;

    const maxZoom = isMobile ? MINIMAP_ZOOM_MAX_MOBILE : MINIMAP_ZOOM_MAX;
    const nextZoom = clamp(currentZoom * zoomFactor, 1, maxZoom);

    const sizeX = mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120;
    const sizeY = mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120;
    const mapSpan = Math.max(sizeX, sizeY);

    const wScale = (rect.width - 2) / mapSpan;
    const hScale = rect.height / (mapSpan * 0.5);
    const baseScale = Math.min(wScale, hScale);

    const prevIsoScale = Math.max(1, baseScale * currentZoom);
    const nextIsoScale = Math.max(1, baseScale * nextZoom);

    const prevCenter = {
      x: prevCenterScreen.x - rect.left,
      y: prevCenterScreen.y - rect.top,
    };
    const newCenter = {
      x: newCenterScreen.x - rect.left,
      y: newCenterScreen.y - rect.top,
    };

    const prevOriginX = rect.width * 0.5 + currentPan.x;
    const prevDiamondHeight = mapSpan * prevIsoScale * 0.5;
    const prevOriginY = (rect.height - prevDiamondHeight) / 2 + currentPan.y;

    const relX = prevCenter.x - prevOriginX;
    const relY = prevCenter.y - prevOriginY;
    const rx = relX / prevIsoScale + (2 * relY) / prevIsoScale;
    const ry = (2 * relY) / prevIsoScale - relX / prevIsoScale;

    const nextDiamondHeight = mapSpan * nextIsoScale * 0.5;
    const nextOriginY_noPan = (rect.height - nextDiamondHeight) / 2;
    const nextOriginX_noPan = rect.width * 0.5;

    const nextIsoX_noPan = (rx - ry) * nextIsoScale * 0.5 + nextOriginX_noPan;
    const nextIsoY_noPan = (rx + ry) * nextIsoScale * 0.25 + nextOriginY_noPan;

    const rawPanX = newCenter.x - nextIsoX_noPan;
    const rawPanY = newCenter.y - nextIsoY_noPan;

    const nextPan = clampPan({ x: rawPanX, y: rawPanY }, nextZoom);

    mapZoomRef.current = nextZoom;
    mapPanRef.current = nextPan;
    setMapZoom(nextZoom);
    setMapPan(nextPan);
  }, [isMobile, mapInfo, matchInfo, clampPan]);

  // Focus play button when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      playButtonRef.current?.focus();
    }
  }, [isFullscreen]);

  // Handle mouse wheel and trackpad pinch zoom with native listener to avoid "passive event" issues
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (!isFullscreen && !event.ctrlKey) return;
      event.preventDefault();

      const rect = container.getBoundingClientRect();
      const targetX = event.clientX - rect.left;
      const targetY = event.clientY - rect.top;

      let zoomFactor: number;
      if (event.ctrlKey && Math.abs(event.deltaY) < 40) {
        zoomFactor = clamp(Math.exp(-event.deltaY * 0.01), 1 / MINIMAP_MOUSE_ZOOM_FACTOR, MINIMAP_MOUSE_ZOOM_FACTOR);
      } else {
        zoomFactor = event.deltaY < 0 ? MINIMAP_MOUSE_ZOOM_FACTOR : 1 / MINIMAP_MOUSE_ZOOM_FACTOR;
      }
      handleZoom(targetX, targetY, zoomFactor);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [isFullscreen, handleZoom]);

  // Prevent Safari viewport gestures while pinching on the minimap
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener("gesturestart", preventGesture);
    container.addEventListener("gesturechange", preventGesture);

    return () => {
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
    };
  }, []);

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

  useEffect(() => {
    if (!DEBUG) return;

    if (iconCheckReplayRef.current !== replay) {
      iconCheckReplayRef.current = replay;
      checkedMissingBuildingIconsRef.current.clear();
    }

    for (const event of events) {
      if (event.category !== "build") continue;
      const buildingTypeId = event.buildingTypeId;
      if (buildingTypeId === undefined || checkedMissingBuildingIconsRef.current.has(buildingTypeId)) {
        continue;
      }

      const name = getBuildingName(buildingTypeId);
      if (getBuildingIcon(name) === "❓") {
        checkedMissingBuildingIconsRef.current.add(buildingTypeId);
        console.log(`No building icon mapping for ${buildingTypeId}: "${name}"`);
      }
    }
  }, [events, replay]);

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
          event.playerId !== undefined
      );
    },
    [events, mapInfo]
  );

  const gatherpointEvents = useMemo(
    () => {
      const sizeX = mapInfo?.size_x ?? 120;
      const sizeY = mapInfo?.size_y ?? 120;
      return events.filter(
        (event) =>
          event.category === "gatherpoint" &&
          event.x !== undefined &&
          event.y !== undefined &&
          event.x >= 0 &&
          event.y >= 0 &&
          event.x <= sizeX &&
          event.y <= sizeY &&
          event.playerId !== undefined
      );
    },
    [events, mapInfo]
  );

  const flareEvents = useMemo(
    () => {
      const sizeX = mapInfo?.size_x ?? 120;
      const sizeY = mapInfo?.size_y ?? 120;
      return events.filter(
        (event) =>
          event.category === "flare" &&
          event.x !== undefined &&
          event.y !== undefined &&
          event.x >= 0 &&
          event.y >= 0 &&
          event.x <= sizeX &&
          event.y <= sizeY &&
          event.playerId !== undefined
      );
    },
    [events, mapInfo]
  );

  const activeGatherpoints = useMemo(() => {
    const active = new Set<string>();
    const buildingToGatherpoint = new Map<number, string>();
    for (const event of gatherpointEvents) {
      if (event.time > selectedTime) break;
      if (!event.unitIds) continue;
      for (const unitId of event.unitIds) {
        buildingToGatherpoint.set(unitId, event.id);
      }
    }
    for (const eventId of buildingToGatherpoint.values()) {
      active.add(eventId);
    }
    return active;
  }, [gatherpointEvents, selectedTime]);

  const buildingData = useMemo(() => {
    const sizeX = mapInfo?.size_x ?? 120;
    const sizeY = mapInfo?.size_y ?? 120;
    const tileToAnchor = new Map<string, string>();
    const anchorToEvent = new Map<string, TimelineEvent>();

    for (const event of buildEvents) {
      if (event.time > selectedTime) break;
      if (event.x === undefined || event.y === undefined) continue;

      const anchorX = Math.max(0, Math.min(sizeX - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min(sizeY - 1, Math.floor(event.y)));
      const footprint = getBuildingFootprint(event.buildingTypeId);
      const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
      const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
      const anchorKey = `${baseX},${baseY}`;

      anchorToEvent.set(anchorKey, event);
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
        }
      }
      for (const oldAnchor of displacedAnchors) {
        anchorToEvent.delete(oldAnchor);
      }
    }

    return { tileToAnchor, anchorToEvent };
  }, [buildEvents, selectedTime, mapInfo]);

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

    const sizeX = mapInfo?.size_x ?? matchInfo?.mapSizeId ?? 120;
    const sizeY = mapInfo?.size_y ?? matchInfo?.mapSizeId ?? 120;
    const mapSpan = Math.max(sizeX, sizeY);
    const widthScale = (bounds.width - 2) / mapSpan;
    const heightScale = bounds.height / (mapSpan * 0.5);
    const isoScale = Math.max(
      1,
      Math.min(widthScale, heightScale) * mapZoom
    );
    const effectivePan = clampPan(mapPan);
    if (effectivePan.x !== mapPan.x || effectivePan.y !== mapPan.y) {
      setMapPan(effectivePan);
    }
    const isoOriginX = bounds.width * 0.5 + effectivePan.x;
    const diamondHeight = mapSpan * isoScale * 0.5;
    const isoOriginY =
      (bounds.height - diamondHeight) / 2 + effectivePan.y;

    const toCanvas = (x: number, y: number) => {
      const rx = y;
      const ry = (sizeX ?? 120) - x;
      const isoX = (rx - ry) * isoScale * 0.5 + isoOriginX;
      const isoY = (rx + ry) * isoScale * 0.25 + isoOriginY;
      return { x: isoX, y: isoY };
    };

    const terrainWidth = (sizeX! + sizeY!) * BASE_TERRAIN_SCALE * 0.5;
    const terrainHeight = (sizeX! + sizeY!) * BASE_TERRAIN_SCALE * 0.25;
    const offOriginX = sizeX! * BASE_TERRAIN_SCALE * 0.5;
    const offOriginY = 0;

    const toOffscreen = (x: number, y: number) => {
      const rx = y;
      const ry = sizeX! - x;
      const isoX = (rx - ry) * BASE_TERRAIN_SCALE * 0.5 + offOriginX;
      const isoY = (rx + ry) * BASE_TERRAIN_SCALE * 0.25 + offOriginY;
      return { x: isoX, y: isoY };
    };

    // High-resolution terrain cache
    if (!terrainCanvasRef.current) {
      terrainCanvasRef.current = document.createElement("canvas");
      const terrainCanvas = terrainCanvasRef.current!;
      terrainCanvas.width = terrainWidth;
      terrainCanvas.height = terrainHeight;
      const terrainContext = terrainCanvas.getContext("2d");
      if (terrainContext && sizeX && sizeY) {
        const top = toOffscreen(sizeX, 0);
        const right = toOffscreen(sizeX, sizeY);
        const bottom = toOffscreen(0, sizeY);
        const left = toOffscreen(0, 0);
        terrainContext.beginPath();
        terrainContext.moveTo(top.x, top.y);
        terrainContext.lineTo(right.x, right.y);
        terrainContext.lineTo(bottom.x, bottom.y);
        terrainContext.lineTo(left.x, left.y);
        terrainContext.closePath();
        terrainContext.fillStyle = MINIMAP_DIAMOND_BG_COLOR;
        terrainContext.fill();

        const tiles = mapInfo?.tiles;
        if (tiles && tiles.length >= sizeX * sizeY) {
          terrainContext.globalAlpha = MINIMAP_TERRAIN_ALPHA;
          terrainContext.strokeStyle = MINIMAP_GRID_COLOR;
          terrainContext.lineWidth = MINIMAP_GRID_WIDTH;
          for (let y = 0; y < sizeY; y += 1) {
            for (let x = 0; x < sizeX; x += 1) {
              const tile = tiles[y * sizeX + x] as { terrain_type?: number; elevation?: number };
              const terrainType = tile?.terrain_type ?? 14;
              let terrainColor = TERRAIN_MINIMAP_COLORS[terrainType] ?? "#cbb892";

              if (tile?.elevation !== undefined) {
                terrainColor = shadeColor(terrainColor, getElevationShadePercent(tile.elevation));
              }

              const p1 = toOffscreen(x, y);
              const p2 = toOffscreen(x + 1, y);
              const p3 = toOffscreen(x + 1, y + 1);
              const p4 = toOffscreen(x, y + 1);
              terrainContext.fillStyle = terrainColor;
              terrainContext.beginPath();
              terrainContext.moveTo(p1.x, p1.y);
              terrainContext.lineTo(p2.x, p2.y);
              terrainContext.lineTo(p3.x, p3.y);
              terrainContext.lineTo(p4.x, p4.y);
              terrainContext.closePath();
              terrainContext.fill();
              terrainContext.stroke();
            }
          }

          const shadowSegmentsByColor: Record<string, number[]> = {};
          const highlightSegmentsByColor: Record<string, number[]> = {};

          for (let y = 0; y < sizeY; y += 1) {
            for (let x = 0; x < sizeX; x += 1) {
              const tile = tiles[y * sizeX + x] as { terrain_type?: number; elevation?: number };
              const e = tile?.elevation ?? 0;

              // Check East boundary (shared edge p2 -> p3)
              if (x + 1 < sizeX) {
                const neighbor = tiles[y * sizeX + (x + 1)] as { terrain_type?: number; elevation?: number };
                const eEast = neighbor?.elevation ?? e;
                if (e !== eEast) {
                  const higherTile = e >= eEast ? tile : neighbor;
                  const higherElev = higherTile?.elevation ?? 0;
                  const terType = higherTile?.terrain_type ?? 14;
                  const baseColor = TERRAIN_MINIMAP_COLORS[terType] ?? "#cbb892";
                  const higherColor = shadeColor(baseColor, getElevationShadePercent(higherElev));
                  const isHighlight = e > eEast;
                  const lineColor = isHighlight
                    ? shadeColor(higherColor, MINIMAP_TERRAIN_HIGHLIGHT_PERCENT)
                    : shadeColor(higherColor, MINIMAP_TERRAIN_SHADOW_PERCENT);
                  const targetMap = isHighlight ? highlightSegmentsByColor : shadowSegmentsByColor;

                  if (!targetMap[lineColor]) targetMap[lineColor] = [];
                  const p2 = toOffscreen(x + 1, y);
                  const p3 = toOffscreen(x + 1, y + 1);
                  targetMap[lineColor].push(p2.x, p2.y, p3.x, p3.y);
                }
              }

              // Check South boundary (shared edge p4 -> p3)
              if (y + 1 < sizeY) {
                const neighbor = tiles[(y + 1) * sizeX + x] as { terrain_type?: number; elevation?: number };
                const eSouth = neighbor?.elevation ?? e;
                if (e !== eSouth) {
                  const higherTile = e >= eSouth ? tile : neighbor;
                  const higherElev = higherTile?.elevation ?? 0;
                  const terType = higherTile?.terrain_type ?? 14;
                  const baseColor = TERRAIN_MINIMAP_COLORS[terType] ?? "#cbb892";
                  const higherColor = shadeColor(baseColor, getElevationShadePercent(higherElev));
                  const isHighlight = e < eSouth;
                  const lineColor = isHighlight
                    ? shadeColor(higherColor, MINIMAP_TERRAIN_HIGHLIGHT_PERCENT)
                    : shadeColor(higherColor, MINIMAP_TERRAIN_SHADOW_PERCENT);
                  const targetMap = isHighlight ? highlightSegmentsByColor : shadowSegmentsByColor;

                  if (!targetMap[lineColor]) targetMap[lineColor] = [];
                  const p4 = toOffscreen(x, y + 1);
                  const p3 = toOffscreen(x + 1, y + 1);
                  targetMap[lineColor].push(p4.x, p4.y, p3.x, p3.y);
                }
              }
            }
          }

          terrainContext.globalAlpha = MINIMAP_TERRAIN_ALPHA;
          terrainContext.lineWidth = MINIMAP_TERRAIN_CONTOUR_WIDTH;
          terrainContext.lineCap = "round";
          terrainContext.lineJoin = "round";

          // Draw darker shadow lines first
          for (const [lineColor, coords] of Object.entries(shadowSegmentsByColor)) {
            terrainContext.strokeStyle = lineColor;
            terrainContext.beginPath();
            for (let i = 0; i < coords.length; i += 4) {
              terrainContext.moveTo(coords[i], coords[i + 1]);
              terrainContext.lineTo(coords[i + 2], coords[i + 3]);
            }
            terrainContext.stroke();
          }

          // Draw bright highlight lines on top
          for (const [lineColor, coords] of Object.entries(highlightSegmentsByColor)) {
            terrainContext.strokeStyle = lineColor;
            terrainContext.beginPath();
            for (let i = 0; i < coords.length; i += 4) {
              terrainContext.moveTo(coords[i], coords[i + 1]);
              terrainContext.lineTo(coords[i + 2], coords[i + 3]);
            }
            terrainContext.stroke();
          }
        }
      }
    }

    const drawObstacleLayer = (target: HTMLCanvasElement) => {
      target.width = terrainWidth;
      target.height = terrainHeight;
      const obstacleContext = target.getContext("2d");
      if (!obstacleContext || !sizeX || !sizeY) return;

      const tiles = mapInfo?.tiles;
      const isCliffTile = (cx: number, cy: number) => {
        if (cx < 0 || cx >= sizeX || cy < 0 || cy >= sizeY) return false;
        const t = tiles?.[cy * sizeX + cx] as { isCliff?: boolean } | undefined;
        return Boolean(t?.isCliff || (mapCliffs && mapCliffs[`${cx},${cy}`]));
      };

      // 1. Fill cliff diamonds
      obstacleContext.globalAlpha = MINIMAP_TERRAIN_ALPHA;
      obstacleContext.fillStyle = MINIMAP_CLIFF_COLOR;
      obstacleContext.strokeStyle = shadeColor(MINIMAP_CLIFF_COLOR, MINIMAP_CLIFF_HIGHLIGHT_PERCENT);
      obstacleContext.lineWidth = MINIMAP_GRID_WIDTH;
      for (let y = 0; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          if (!isCliffTile(x, y)) continue;

          const p1 = toOffscreen(x, y);
          const p2 = toOffscreen(x + 1, y);
          const p3 = toOffscreen(x + 1, y + 1);
          const p4 = toOffscreen(x, y + 1);
          obstacleContext.beginPath();
          obstacleContext.moveTo(p1.x, p1.y);
          obstacleContext.lineTo(p2.x, p2.y);
          obstacleContext.lineTo(p3.x, p3.y);
          obstacleContext.lineTo(p4.x, p4.y);
          obstacleContext.closePath();
          obstacleContext.fill();
          obstacleContext.stroke();
        }
      }

      // 2. Draw cliff 3D directional highlight and shadow edges around each cliff set
      const cliffHighlightLines: number[] = [];
      const cliffShadowLines: number[] = [];
      const cliffHighlightColor = shadeColor(MINIMAP_CLIFF_COLOR, MINIMAP_CLIFF_HIGHLIGHT_PERCENT);
      const cliffShadowColor = shadeColor(MINIMAP_CLIFF_COLOR, MINIMAP_CLIFF_SHADOW_PERCENT);

      for (let y = 0; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          if (!isCliffTile(x, y)) continue;

          const p1 = toOffscreen(x, y);
          const p2 = toOffscreen(x + 1, y);
          const p3 = toOffscreen(x + 1, y + 1);
          const p4 = toOffscreen(x, y + 1);

          // NW edge (p1 -> p2): faces North-West sunward -> Highlight
          if (!isCliffTile(x, y - 1)) {
            cliffHighlightLines.push(p1.x, p1.y, p2.x, p2.y);
          }

          // NE edge (p2 -> p3): faces North-East sunward -> Highlight
          if (!isCliffTile(x + 1, y)) {
            cliffHighlightLines.push(p2.x, p2.y, p3.x, p3.y);
          }

          // SE edge (p3 -> p4): faces South-East leeward -> Shadow
          if (!isCliffTile(x, y + 1)) {
            cliffShadowLines.push(p3.x, p3.y, p4.x, p4.y);
          }

          // SW edge (p4 -> p1): faces South-West leeward -> Shadow
          if (!isCliffTile(x - 1, y)) {
            cliffShadowLines.push(p4.x, p4.y, p1.x, p1.y);
          }
        }
      }

      if (cliffShadowLines.length > 0 || cliffHighlightLines.length > 0) {
        obstacleContext.lineWidth = MINIMAP_TERRAIN_CONTOUR_WIDTH;
        obstacleContext.lineCap = "round";
        obstacleContext.lineJoin = "round";

        // 1. Cliff shadow lines first
        if (cliffShadowLines.length > 0) {
          obstacleContext.strokeStyle = cliffShadowColor;
          obstacleContext.beginPath();
          for (let i = 0; i < cliffShadowLines.length; i += 4) {
            obstacleContext.moveTo(cliffShadowLines[i], cliffShadowLines[i + 1]);
            obstacleContext.lineTo(cliffShadowLines[i + 2], cliffShadowLines[i + 3]);
          }
          obstacleContext.stroke();
        }

        // 2. Cliff highlight lines on top
        if (cliffHighlightLines.length > 0) {
          obstacleContext.strokeStyle = cliffHighlightColor;
          obstacleContext.beginPath();
          for (let i = 0; i < cliffHighlightLines.length; i += 4) {
            obstacleContext.moveTo(cliffHighlightLines[i], cliffHighlightLines[i + 1]);
            obstacleContext.lineTo(cliffHighlightLines[i + 2], cliffHighlightLines[i + 3]);
          }
          obstacleContext.stroke();
        }
      }
    };

    if (!obstacleCanvasRef.current) {
      obstacleCanvasRef.current = document.createElement("canvas");
      drawObstacleLayer(obstacleCanvasRef.current);
    }

    const drawResourceLayer = (target: HTMLCanvasElement, relicLayer: boolean) => {
      target.width = terrainWidth;
      target.height = terrainHeight;
      const resourceContext = target.getContext("2d");
      if (!resourceContext) return;
      // Draw resources above terrain and contour lines with 3D directional bevel outlines
      resourceContext.globalAlpha = 1.0;
      resourceContext.lineWidth = MINIMAP_GRID_WIDTH;
      const resourceShadowLinesByColor: Record<string, number[]> = {};
      const resourceHighlightLinesByColor: Record<string, number[]> = {};

      for (const [resourceKey, resource] of Object.entries(mapResources)) {
        const isVisible = (resource === "relic") === relicLayer;
        if (!isVisible) continue;

        const commaIdx = resourceKey.indexOf(",");
        if (commaIdx === -1) continue;
        const x = Number(resourceKey.slice(0, commaIdx));
        const y = Number(resourceKey.slice(commaIdx + 1));

        const p1 = toOffscreen(x, y);
        const p2 = toOffscreen(x + 1, y);
        const p3 = toOffscreen(x + 1, y + 1);
        const p4 = toOffscreen(x, y + 1);
        const baseColor = MINIMAP_RESOURCE_COLORS[resource];

        // Fill resource diamond
        resourceContext.fillStyle = baseColor;
        resourceContext.strokeStyle = shadeColor(baseColor, MINIMAP_RESOURCE_HIGHLIGHT_PERCENT);
        resourceContext.beginPath();
        resourceContext.moveTo(p1.x, p1.y);
        resourceContext.lineTo(p2.x, p2.y);
        resourceContext.lineTo(p3.x, p3.y);
        resourceContext.lineTo(p4.x, p4.y);
        resourceContext.closePath();
        resourceContext.fill();
        resourceContext.stroke();

        // Collect 3D directional outline edges on the outside of all resources
        const isResourceTile = (nx: number, ny: number) => {
          const nRes = mapResources[`${nx},${ny}`];
          if (!nRes) return false;
          return (nRes === "relic") === relicLayer;
        };

        const highlightColor = shadeColor(baseColor, MINIMAP_RESOURCE_HIGHLIGHT_PERCENT);
        const shadowColor = shadeColor(baseColor, MINIMAP_RESOURCE_SHADOW_PERCENT);

        // NW edge (p1 -> p2): faces North-West sunward -> Highlight
        if (!isResourceTile(x, y - 1)) {
          if (!resourceHighlightLinesByColor[highlightColor]) resourceHighlightLinesByColor[highlightColor] = [];
          resourceHighlightLinesByColor[highlightColor].push(p1.x, p1.y, p2.x, p2.y);
        }

        // NE edge (p2 -> p3): faces North-East sunward -> Highlight
        if (!isResourceTile(x + 1, y)) {
          if (!resourceHighlightLinesByColor[highlightColor]) resourceHighlightLinesByColor[highlightColor] = [];
          resourceHighlightLinesByColor[highlightColor].push(p2.x, p2.y, p3.x, p3.y);
        }

        // SE edge (p3 -> p4): faces South-East leeward -> Shadow
        if (!isResourceTile(x, y + 1)) {
          if (!resourceShadowLinesByColor[shadowColor]) resourceShadowLinesByColor[shadowColor] = [];
          resourceShadowLinesByColor[shadowColor].push(p3.x, p3.y, p4.x, p4.y);
        }

        // SW edge (p4 -> p1): faces South-West leeward -> Shadow
        if (!isResourceTile(x - 1, y)) {
          if (!resourceShadowLinesByColor[shadowColor]) resourceShadowLinesByColor[shadowColor] = [];
          resourceShadowLinesByColor[shadowColor].push(p4.x, p4.y, p1.x, p1.y);
        }
      }

      // Stroke 3D resource outline edges: darker lines first, bright highlights on top
      resourceContext.lineWidth = MINIMAP_TERRAIN_CONTOUR_WIDTH;
      resourceContext.lineCap = "round";
      resourceContext.lineJoin = "round";

      // 1. Shadow lines first
      for (const [lineColor, coords] of Object.entries(resourceShadowLinesByColor)) {
        resourceContext.strokeStyle = lineColor;
        resourceContext.beginPath();
        for (let i = 0; i < coords.length; i += 4) {
          resourceContext.moveTo(coords[i], coords[i + 1]);
          resourceContext.lineTo(coords[i + 2], coords[i + 3]);
        }
        resourceContext.stroke();
      }

      // 2. Bright highlight lines on top
      for (const [lineColor, coords] of Object.entries(resourceHighlightLinesByColor)) {
        resourceContext.strokeStyle = lineColor;
        resourceContext.beginPath();
        for (let i = 0; i < coords.length; i += 4) {
          resourceContext.moveTo(coords[i], coords[i + 1]);
          resourceContext.lineTo(coords[i + 2], coords[i + 3]);
        }
        resourceContext.stroke();
      }
    };
    if (!resourceCanvasRef.current) {
      resourceCanvasRef.current = document.createElement("canvas");
      drawResourceLayer(resourceCanvasRef.current, false);
    }
    if (!relicCanvasRef.current) {
      relicCanvasRef.current = document.createElement("canvas");
      drawResourceLayer(relicCanvasRef.current, true);
    }

    if (
      replay &&
      terrainCanvasRef.current &&
      obstacleCanvasRef.current &&
      resourceCanvasRef.current &&
      relicCanvasRef.current &&
      readyReplayRef.current !== replay
    ) {
      readyReplayRef.current = replay;
      void onCachedCanvasesReady();
    }

    const drawCachedCanvas = (
      cachedCanvas: HTMLCanvasElement | null,
      visible: boolean
    ) => {
      if (!visible || !cachedCanvas || !sizeX || !sizeY) return;
      try {
        const offOriginX = sizeX * BASE_TERRAIN_SCALE * 0.5;
        const dx = isoOriginX - (offOriginX * isoScale / BASE_TERRAIN_SCALE);
        const dy = isoOriginY;
        const dw = cachedCanvas.width * isoScale / BASE_TERRAIN_SCALE;
        const dh = cachedCanvas.height * isoScale / BASE_TERRAIN_SCALE;

        context.drawImage(cachedCanvas, dx, dy, dw, dh);
      } catch (e) {
        console.error("Minimap cached canvas drawImage failed:", e);
      }
    };

    drawCachedCanvas(terrainCanvasRef.current, showTerrain);
    drawCachedCanvas(obstacleCanvasRef.current, showObstacles);
    drawCachedCanvas(resourceCanvasRef.current, showResources);
    drawCachedCanvas(relicCanvasRef.current, showRelics);

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
      const isLandmark = name.includes("Town Center") || name.includes("Castle");
      const hasEmoji = !!getBuildingEmoji(id);

      if (isLandmark) {
        return showLandmarkIcons || showBuildingIcons;
      }

      return showBuildingIcons && hasEmoji;
    };

    const { tileToAnchor, anchorToEvent } = buildingData;
    const iconBuildings: TimelineEvent[] = [];
    const minIconSize = isMobile ? MINIMAP_ICON_SIZE_MIN_MOBILE : MINIMAP_ICON_SIZE_MIN_DESKTOP;
    const buildingShadowLinesByColor: Record<string, number[]> = {};
    const buildingHighlightLinesByColor: Record<string, number[]> = {};
    const buildingLineWidth = Math.max(MINIMAP_BUILDING_OUTLINE_MIN_WIDTH, isoScale * MINIMAP_BUILDING_OUTLINE_SCALE);
    const buildingOffset = buildingLineWidth * MINIMAP_BUILDING_BORDER_OFFSET;

    const getBuildingFadeProgress = (event: TimelineEvent) => {
      if (event.raw?.isInitial || event.time === 0) return 1;
      const age = selectedTime - event.time;
      if (age >= MINIMAP_BUILDING_FADE_IN_SECONDS) return 1;
      if (age <= 0) return 0.05;
      return 0.05 + 0.95 * (age / MINIMAP_BUILDING_FADE_IN_SECONDS);
    };

    const drawBuilding = (event: TimelineEvent) => {
      const isFarm = isFarmId(event.buildingTypeId);
      const isVisible = isFarm ? showFarms : showBuildingOutlines;
      const canHaveIcon = isIconBuilding(event.buildingTypeId);

      if (!isVisible && !canHaveIcon) return;

      const fadeProgress = getBuildingFadeProgress(event);

      if (canHaveIcon && fadeProgress >= 1) {
        iconBuildings.push(event);
      }

      if (!isVisible) return;

      if (event.x === undefined || event.y === undefined) return;
      if (event.x < 0 || event.y < 0 || event.x > (sizeX ?? 120) || event.y > (sizeY ?? 120)) return;
      const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
      const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
      const footprint = getBuildingFootprint(event.buildingTypeId);
      const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
      const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));

      // Draw the building footprint as a single diamond shape
      const p1 = toCanvas(baseX, baseY);
      const p2 = toCanvas(baseX + footprint.w, baseY);
      const p3 = toCanvas(baseX + footprint.w, baseY + footprint.h);
      const p4 = toCanvas(baseX, baseY + footprint.h);

      context.save();
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.lineTo(p4.x, p4.y);
      context.closePath();

      // 1. Fill the shape with player's color
      const playerColor = getPlayerColor(event.playerId);
      context.save();
      context.globalAlpha = (isFarm ? MINIMAP_FARMS_ALPHA : MINIMAP_BUILDING_ALPHA) * fadeProgress;
      context.fillStyle = playerColor;
      context.fill();
      context.restore();

      // 2. Outlines
      if (isFarm) {
        // Farms and pastures are left unchanged
        if (isoScale >= MINIMAP_EMOJI_ZOOM_THRESHOLD) {
          context.globalAlpha = MINIMAP_FARMS_OUTLINE_ALPHA * fadeProgress;
          context.strokeStyle = getPlayerOutline(event.playerId);
          context.lineWidth = MINIMAP_FARMS_OUTLINE_WIDTH;
          context.stroke();
        }
      } else if (showBuildingOutlines && fadeProgress >= 1) {
        // Inset inside in all directions for non-farm buildings
        const insetY = Math.min((buildingOffset * Math.sqrt(5)) / 2, (p4.y - p2.y) * 0.4);
        const insetX = insetY * 2;
        const ip1 = { x: p1.x + insetX, y: p1.y };
        const ip2 = { x: p2.x, y: p2.y + insetY };
        const ip3 = { x: p3.x - insetX, y: p3.y };
        const ip4 = { x: p4.x, y: p4.y - insetY };

        // 3D directional bevel outline edges for non-farm buildings
        const highlightColor = shadeColor(playerColor, MINIMAP_BUILDING_HIGHLIGHT_PERCENT);
        const shadowColor = shadeColor(playerColor, MINIMAP_BUILDING_SHADOW_PERCENT);

        // NW & NE edges (ip1 -> ip2 -> ip3): faces sunward -> Highlight
        if (!buildingHighlightLinesByColor[highlightColor]) {
          buildingHighlightLinesByColor[highlightColor] = [];
        }
        buildingHighlightLinesByColor[highlightColor].push(
          ip1.x, ip1.y,
          ip2.x, ip2.y,
          ip3.x, ip3.y
        );

        // SE & SW edges (ip3 -> ip4 -> ip1): faces leeward -> Shadow
        if (!buildingShadowLinesByColor[shadowColor]) {
          buildingShadowLinesByColor[shadowColor] = [];
        }
        buildingShadowLinesByColor[shadowColor].push(
          ip3.x, ip3.y,
          ip4.x, ip4.y,
          ip1.x, ip1.y
        );
      }
      context.restore();

      if (isIconBuilding(event.buildingTypeId) && fadeProgress >= 1) {
        iconBuildings.push(event);
      }
    };

    if (showBuildings) {
      anchorToEvent.forEach((event) => {
        drawBuilding(event);
      });

      // Stroke 3D building outline edges: darker lines first, bright highlights on top
      if (showBuildingOutlines) {
        context.save();
        context.lineWidth = buildingLineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";

        // 1. Darker shadow lines first
        for (const [lineColor, coords] of Object.entries(buildingShadowLinesByColor)) {
          context.strokeStyle = lineColor;
          context.beginPath();
          for (let i = 0; i < coords.length; i += 6) {
            context.moveTo(coords[i], coords[i + 1]);
            context.lineTo(coords[i + 2], coords[i + 3]);
            context.lineTo(coords[i + 4], coords[i + 5]);
          }
          context.stroke();
        }

        // 2. Bright highlight lines on top
        for (const [lineColor, coords] of Object.entries(buildingHighlightLinesByColor)) {
          context.strokeStyle = lineColor;
          context.beginPath();
          for (let i = 0; i < coords.length; i += 6) {
            context.moveTo(coords[i], coords[i + 1]);
            context.lineTo(coords[i + 2], coords[i + 3]);
            context.lineTo(coords[i + 4], coords[i + 5]);
          }
          context.stroke();
        }
        context.restore();
      }

      const hoveredBuilding = hoveredEntity?.type === "building" && hoveredEntity.anchorKey ? anchorToEvent.get(hoveredEntity.anchorKey) : null;
      const showHoverOutline = hoveredBuilding && (isFarmId(hoveredBuilding.buildingTypeId) ? showFarms : showBuildingOutlines);
      if (showHoverOutline && hoveredEntity?.anchorKey) {
        const anchorKey = hoveredEntity.anchorKey;
        const footprint = hoveredBuilding ? getBuildingFootprint(hoveredBuilding.buildingTypeId) : null;
        if (footprint) {
          const [ax, ay] = anchorKey.split(",").map(Number);
          const p1 = toCanvas(ax, ay);
          const p2 = toCanvas(ax + footprint.w, ay);
          const p3 = toCanvas(ax + footprint.w, ay + footprint.h);
          const p4 = toCanvas(ax, ay + footprint.h);

          context.save();
          context.strokeStyle = getPlayerOutline(hoveredEntity.playerId);
          context.lineWidth = MINIMAP_BUILDING_HOVER_WIDTH;
          context.lineCap = "round";
          context.lineJoin = "round";
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

      // First pass: Draw non-landmark (emoji) icons
      (isoScale >= MINIMAP_EMOJI_ZOOM_THRESHOLD) && iconBuildings.forEach((event) => {
        if (event.x === undefined || event.y === undefined) return;
        const name = getBuildingName(event.buildingTypeId);
        const emoji = getBuildingEmoji(event.buildingTypeId);

        if (emoji && showBuildingOutlines) {
          const isTC = name.includes("Town Center");
          const isCastle = name.includes("Castle");
          const isBigIconShown = (isTC || isCastle) && showLandmarkIcons;

          if (isBigIconShown) return;

          const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
          const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
          const footprint = getBuildingFootprint(event.buildingTypeId);
          const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
          const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
          const centerTileX = baseX + footprint.w / 2;
          const centerTileY = baseY + footprint.h / 2;
          const center = toCanvas(centerTileX, centerTileY);
          const footprintScale = Math.max(MINIMAP_EMOJI_FOOTPRINT_MIN_SIZE, Math.min(footprint.w, footprint.h)) / 2;
          const iconSize = Math.max(minIconSize, isoScale * MINIMAP_ICON_SCALE_FACTOR) * footprintScale;
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
      // These show regardless of other building icons as long as their specific filters are enabled
      iconBuildings.forEach((event) => {
        if (event.x === undefined || event.y === undefined) return;
        const name = getBuildingName(event.buildingTypeId);
        const isLandmark = name.includes("Town Center") || name.includes("Castle");

        if (isLandmark) {
          if (showLandmarkIcons) {
            const anchorX = Math.max(0, Math.min((sizeX ?? 120) - 1, Math.floor(event.x)));
            const anchorY = Math.max(0, Math.min((sizeY ?? 120) - 1, Math.floor(event.y)));
            const footprint = getBuildingFootprint(event.buildingTypeId);
            const baseX = Math.max(0, anchorX - Math.floor(footprint.w / 2));
            const baseY = Math.max(0, anchorY - Math.floor(footprint.h / 2));
            const centerTileX = baseX + footprint.w / 2;
            const centerTileY = baseY + footprint.h / 2;
            const center = toCanvas(centerTileX, centerTileY);
            const iconSize = Math.max(minIconSize, isoScale * MINIMAP_ICON_SCALE_FACTOR);

            const iconPath = name.includes("Castle") ? castlePath : townCenterPath;
            const color = getPlayerColor(event.playerId);
            const outline = getPlayerOutline(event.playerId);
            context.save();
            context.translate(center.x - iconSize / 2, center.y - iconSize * 0.8);
            context.scale(iconSize / 100, iconSize / 100);
            context.fillStyle = color;
            context.lineWidth = MINIMAP_LANDMARK_ICON_BORDER_WIDTH;
            context.lineJoin = "round";
            context.strokeStyle = outline;
            context.stroke(iconPath);
            context.fill(iconPath);
            context.restore();
          }
        }
      });
    }

    const radius = isMobile ? MINIMAP_UNIT_RADIUS_MOBILE : MINIMAP_UNIT_RADIUS_DESKTOP;
    const borderWidth = isMobile ? MINIMAP_UNIT_BORDER_WIDTH_MOBILE : MINIMAP_UNIT_BORDER_WIDTH_DESKTOP;

    if (showUnits) {
      for (let i = moveEvents.length - 1; i >= 0; i--) {
        const event = moveEvents[i];
        if (event.time > selectedTime) continue;
        const age = selectedTime - event.time;
        if (age > MINIMAP_UNIT_FADE_SECONDS) break;

        if (event.x === undefined || event.y === undefined) continue;

        const progress = Math.min(1, age / MINIMAP_UNIT_FADE_SECONDS);
        const alpha = Math.max(0, MINIMAP_UNIT_ALPHA * (1 - Math.pow(progress, 5)));
        const pos = toCanvas(event.x, event.y);

        const numUnits = event.unitIds?.length || 1;
        const scaledRadius = radius * (1 + Math.log10(numUnits));

        context.globalAlpha = alpha;
        context.beginPath();
        context.fillStyle = getPlayerColor(event.playerId);
        context.arc(pos.x, pos.y, scaledRadius, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = borderWidth;
        context.strokeStyle = getPlayerOutline(event.playerId);
        context.stroke();
      }

      context.globalAlpha = 1;
    }

    if (showGatherpoints) {
      for (let i = gatherpointEvents.length - 1; i >= 0; i--) {
        const event = gatherpointEvents[i];
        if (event.time > selectedTime) continue;
        const isActive = activeGatherpoints.has(event.id);
        if (!isActive) continue;
        const age = selectedTime - event.time;
        const fadeSeconds = MINIMAP_ACTIVE_GATHERPOINT_FADE_SECONDS;
        if (age > fadeSeconds) continue;

        if (event.x === undefined || event.y === undefined) continue;

        const progress = Math.min(1, age / fadeSeconds);
        const alpha = Math.max(0, MINIMAP_UNIT_ALPHA * (1 - Math.pow(progress, 10)));
        const pos = toCanvas(event.x, event.y);

        context.globalAlpha = alpha;

        const poleHeight = radius * 3.5;
        const flagWidth = radius * 2.5;
        const flagHeight = radius * 1.5;

        // Draw the pole
        context.beginPath();
        context.moveTo(pos.x, pos.y);
        context.lineTo(pos.x, pos.y - poleHeight);
        context.strokeStyle = getPlayerOutline(event.playerId);
        context.lineWidth = borderWidth;
        context.stroke();

        // Draw the flag
        context.beginPath();
        context.moveTo(pos.x, pos.y - poleHeight);
        context.lineTo(pos.x + flagWidth, pos.y - poleHeight + flagHeight / 2);
        context.lineTo(pos.x, pos.y - poleHeight + flagHeight);
        context.closePath();

        context.fillStyle = getPlayerColor(event.playerId);
        context.fill();
        context.stroke();
      }

      context.globalAlpha = 1;
    }

    if (showFlares) {
      for (let i = flareEvents.length - 1; i >= 0; i--) {
        const event = flareEvents[i];
        if (event.time > selectedTime) continue;
        const age = selectedTime - event.time;
        if (age > MINIMAP_FLARE_FADE_SECONDS) break;

        if (event.x === undefined || event.y === undefined) continue;

        const progress = Math.min(1, age / MINIMAP_FLARE_FADE_SECONDS);
        const alpha = Math.max(0, 1 - Math.pow(progress, 3));
        const pos = toCanvas(event.x, event.y);

        context.save();
        context.globalAlpha = alpha;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(pos.x - MINIMAP_FLARE_SIZE, pos.y - MINIMAP_FLARE_SIZE);
        context.lineTo(pos.x + MINIMAP_FLARE_SIZE, pos.y + MINIMAP_FLARE_SIZE);
        context.moveTo(pos.x + MINIMAP_FLARE_SIZE, pos.y - MINIMAP_FLARE_SIZE);
        context.lineTo(pos.x - MINIMAP_FLARE_SIZE, pos.y + MINIMAP_FLARE_SIZE);

        // Thicker outline/shadow matching player outline color
        context.strokeStyle = getPlayerOutline(event.playerId);
        context.lineWidth = MINIMAP_FLARE_OUTLINE_WIDTH;
        context.stroke();

        // Foreground X stroke
        context.strokeStyle = getPlayerColor(event.playerId);
        context.lineWidth = MINIMAP_FLARE_WIDTH;
        context.stroke();

        context.restore();
      }

      context.globalAlpha = 1;
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
    buildingData,
    mapInfo,
    replay,
    mapPan,
    mapZoom,
    selectedTime,
    showBuildingOutlines,
    showBuildingIcons,
    showLandmarkIcons,
    showBuildings,
    showFarms,
    showUnits,
    showResources,
    showRelics,
    showTerrain,
    showObstacles,
    mapCliffs,
    showGatherpoints,
    showFlares,
    moveEvents,
    gatherpointEvents,
    flareEvents,
    activeGatherpoints,
    hoveredEntity,
    getPlayerColor,
    getPlayerOutline,
    isFullscreen,
    isMobile,
    resizeKey,
    onCachedCanvasesReady,
    error,
  ]);

  return (
    <section
      className={`panel-dark flex flex-col p-4 pb-6 gap-2 justify-center ${isFullscreen
        ? `fixed inset-0 z-[100] rounded-none`
        : "rounded-3xl"
        }`}
      style={isFullscreen ? { border: "none", outline: "none", boxShadow: "none" } : {}}
    >
      {(isFullscreen || (!loading && !error)) && (
        <div className="flex md:hidden items-center justify-between gap-2">
          {!error && (
            <div className="flex items-center gap-2">
              {filters}
            </div>
          )}
          {fullscreenButton("ml-auto")}
        </div>
      )}
      <div
        className={`minimap-canvas-viewport relative w-full ${isFullscreen ? "flex-1 min-h-0 mx-auto" : "aspect-[2/1]"
          }`}
        ref={mapContainerRef}
        style={{
          touchAction: isFullscreen || canPan ? "none" : "pan-y",
        }}
        onPointerDown={(event) => {
          activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

          const pointerCount = activePointersRef.current.size;

          if (pointerCount === 1) {
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
                setHoveredEntity(null);
                event.preventDefault();
                return;
              }
            }
            lastTapRef.current = { time: now, x: cursorX, y: cursorY };

            // Check building at pointer location immediately on tap/touch down
            updateHoveredEntity(event.clientX, event.clientY);

            if (isFullscreen || canPan) {
              try {
                (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
              } catch { }
            }
            isDraggingRef.current = false;
            dragStartPosRef.current = { x: event.clientX, y: event.clientY };
            lastPointerRef.current = { x: event.clientX, y: event.clientY };
          } else if (pointerCount >= 2) {
            lastTapRef.current = null;
            isDraggingRef.current = false;
            lastPointerRef.current = null;
            dragStartPosRef.current = null;
            setHoveredEntity(null);

            event.preventDefault();
            for (const pid of activePointersRef.current.keys()) {
              try {
                (event.currentTarget as HTMLElement).setPointerCapture(pid);
              } catch { }
            }

            const points = Array.from(activePointersRef.current.values());
            const p1 = points[0];
            const p2 = points[1];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            pinchStateRef.current = { lastDistance: dist, lastCenter: center };
          }
        }}
        onPointerMove={(event) => {
          if (activePointersRef.current.has(event.pointerId)) {
            activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          }

          const pointerCount = activePointersRef.current.size;

          if (pointerCount >= 2 && pinchStateRef.current) {
            event.preventDefault();
            const points = Array.from(activePointersRef.current.values());
            const p1 = points[0];
            const p2 = points[1];
            const newDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const newCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

            if (pinchStateRef.current.lastDistance > 10 && newDist > 10) {
              const zoomFactor = newDist / pinchStateRef.current.lastDistance;
              handlePinchZoom(pinchStateRef.current.lastCenter, newCenter, zoomFactor);
              pinchStateRef.current = {
                lastDistance: newDist,
                lastCenter: newCenter,
              };
            }
            setHoveredEntity(null);
            return;
          }

          if ((isFullscreen || canPan) && dragStartPosRef.current && !isDraggingRef.current) {
            const totalDist = Math.hypot(
              event.clientX - dragStartPosRef.current.x,
              event.clientY - dragStartPosRef.current.y
            );
            if (totalDist > 6) {
              isDraggingRef.current = true;
              setHoveredEntity(null);
            }
          }

          if (isDraggingRef.current && lastPointerRef.current) {
            const dx = event.clientX - lastPointerRef.current.x;
            const dy = event.clientY - lastPointerRef.current.y;
            lastPointerRef.current = { x: event.clientX, y: event.clientY };
            const nextPan = clampPan({ x: mapPanRef.current.x + dx, y: mapPanRef.current.y + dy }, mapZoomRef.current);
            mapPanRef.current = nextPan;
            setMapPan(nextPan);
          }

          if (!isDraggingRef.current && pointerCount <= 1) {
            updateHoveredEntity(event.clientX, event.clientY);
          }
        }}
        onPointerUp={(event) => {
          activePointersRef.current.delete(event.pointerId);
          try {
            if ((event.currentTarget as HTMLElement).hasPointerCapture?.(event.pointerId)) {
              (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
            }
          } catch { }

          const remainingCount = activePointersRef.current.size;
          if (remainingCount === 0) {
            if (!isDraggingRef.current && dragStartPosRef.current) {
              const totalDist = Math.hypot(
                event.clientX - dragStartPosRef.current.x,
                event.clientY - dragStartPosRef.current.y
              );
              if (totalDist <= 10) {
                updateHoveredEntity(event.clientX, event.clientY);
              }
            }
            isDraggingRef.current = false;
            lastPointerRef.current = null;
            dragStartPosRef.current = null;
            pinchStateRef.current = null;
          } else if (remainingCount === 1) {
            pinchStateRef.current = null;
            const [remainingPointer] = Array.from(activePointersRef.current.values());
            lastPointerRef.current = { x: remainingPointer.x, y: remainingPointer.y };
            dragStartPosRef.current = { x: remainingPointer.x, y: remainingPointer.y };
            isDraggingRef.current = true;
          }
        }}
        onPointerCancel={(event) => {
          activePointersRef.current.delete(event.pointerId);
          try {
            if ((event.currentTarget as HTMLElement).hasPointerCapture?.(event.pointerId)) {
              (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
            }
          } catch { }

          const remainingCount = activePointersRef.current.size;
          if (remainingCount === 0) {
            isDraggingRef.current = false;
            lastPointerRef.current = null;
            dragStartPosRef.current = null;
            pinchStateRef.current = null;
          } else if (remainingCount === 1) {
            pinchStateRef.current = null;
            const [remainingPointer] = Array.from(activePointersRef.current.values());
            lastPointerRef.current = { x: remainingPointer.x, y: remainingPointer.y };
            dragStartPosRef.current = { x: remainingPointer.x, y: remainingPointer.y };
            isDraggingRef.current = true;
          }
        }}
        onPointerLeave={(event) => {
          try {
            if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
              activePointersRef.current.delete(event.pointerId);
              if (activePointersRef.current.size === 0) {
                isDraggingRef.current = false;
                lastPointerRef.current = null;
                dragStartPosRef.current = null;
                pinchStateRef.current = null;
              }
            }
          } catch {
            activePointersRef.current.delete(event.pointerId);
            if (activePointersRef.current.size === 0) {
              isDraggingRef.current = false;
              lastPointerRef.current = null;
              dragStartPosRef.current = null;
              pinchStateRef.current = null;
            }
          }
          if (event.pointerType !== "touch") {
            setHoveredEntity(null);
          }
        }}
      >
        {!error && (
          <div className={`absolute inset-0 overflow-hidden ${isFullscreen ? "rounded-xl" : "rounded-2xl"} ${loading ? "invisible" : ""}`}>
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
        )}

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
        {!loading && (
          <div
            className="absolute hidden md:flex right-2 top-2 z-20 items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => {
              e.stopPropagation();
              setHoveredEntity(null);
            }}
          >
            {!error && fullscreenButton()}
          </div>
        )}
        {!loading && !error && replay && (
          <>
            <div
              className="absolute right-1 md:right-2 bottom-2 z-10 flex flex-col gap-2 w-9"
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerMove={(e) => {
                e.stopPropagation();
                setHoveredEntity(null);
              }}
            >
              <div className="pointer-events-auto w-full select-none flex flex-col">
                <button
                  type="button"
                  className="minimap-zoom-btn flex h-9 items-center justify-center rounded-t-lg transition bg-[color:var(--panel)]/90 hover:bg-[color:var(--panel-strong)] text-[color:var(--foreground)] border border-[color:var(--btn-border)] backdrop-blur-md cursor-pointer outline-none"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    handleZoom(rect.width / 2, rect.height / 2, MINIMAP_ZOOM_FACTOR);
                  }}
                  title="Zoom in"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                    <line x1="8" y1="2.5" x2="8" y2="13.5" />
                    <line x1="2.5" y1="8" x2="13.5" y2="8" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="minimap-zoom-btn flex h-9 items-center justify-center rounded-b-lg transition bg-[color:var(--panel)]/90 hover:bg-[color:var(--panel-strong)] text-[color:var(--foreground)] border border-[color:var(--btn-border)] backdrop-blur-md cursor-pointer outline-none"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    handleZoom(rect.width / 2, rect.height / 2, 1 / MINIMAP_ZOOM_FACTOR);
                  }}
                  title="Zoom out"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                    <line x1="2.5" y1="8" x2="13.5" y2="8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl">
            <div className="flex w-full max-w-md flex-col gap-6 px-10">
              <div className="flex items-center justify-between text-sm font-semibold tracking-wide">
                <span className="text-[color:var(--accent)] uppercase">
                  Loading replay...
                </span>
                <span className="tabular-nums text-[color:var(--muted)]">
                  {Math.round(((loadingStep + 1) / LOADING_STEP_COUNT) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[color:var(--accent)] to-amber-200"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEP_COUNT) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl">
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
                <>{players.find((p) => p.id === hoveredEntity.playerId)?.name ?? (hoveredEntity.playerId === 0 ? "Gaia" : "")}</>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={`flex items-center gap-4 ${isFullscreen ? "w-full max-w-6xl mx-auto" : ""}`}>
        <button
          ref={playButtonRef}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--btn-subtle-bg)] text-[color:var(--foreground)] transition hover:bg-[color:var(--btn-subtle-bg-hover)] hover:scale-105 active:scale-95 cursor-pointer"
          onClick={() => {
            if (selectedTime >= duration - 1) {
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
            className="w-full cursor-pointer outline-none"
            style={{
              ["--progress" as string]: `${duration > 0 ? (selectedTime / duration) * 100 : 0}%`,
            }}
            tabIndex={-1}
            onChange={(event) => setSelectedTime(Number(event.target.value))}
          />
          <div className="absolute bottom-0 left-0 text-[10px] font-medium tabular-nums text-[color:var(--muted)] pointer-events-none translate-y-1.5">
            {formatClock(selectedTime)} / {formatClock(duration)}
          </div>
        </div>
      </div>
    </section>
  );
}
