import { getTechName, getUnitName } from "@/lib/techMappings";

export type TimelineEvent = {
  id: string;
  time: number;
  playerId?: number;
  type: string;
  label: string;
  category: "build" | "move" | "research" | "train" | "other";
  x?: number;
  y?: number;
  unitId?: string | number;
  unitTypeId?: number;
  buildingId?: string | number;
  buildingTypeId?: number;
  targetId?: number;
  techId?: number;
  age?: string;
  raw: Record<string, unknown>;
};

export type PlayerSummary = {
  id: number;
  name: string;
  colorId?: number;
  civId?: number;
  teamId?: number;
  won?: boolean;
};

export type TimeSeriesPoint = {
  time: number;
  value: number;
};

export type ResourceSeries = {
  food: TimeSeriesPoint[];
  wood: TimeSeriesPoint[];
  gold: TimeSeriesPoint[];
  stone: TimeSeriesPoint[];
};

export type PlayerStats = {
  playerId: number;
  apm: number;
  villagerPeak?: number;
  villagerSeries?: TimeSeriesPoint[];
  militaryPeak?: number;
  resources?: ResourceSeries;
  ageTimings?: Record<string, number>;
};

const AGE_LABELS = ["Dark", "Feudal", "Castle", "Imperial"];

const TIME_KEYS = ["time", "timestamp", "tick", "t", "world_time", "game_time"];
const PLAYER_KEYS = [
  "player",
  "player_id",
  "playerId",
  "owner",
  "sourcePlayer",
  "source_player",
  "player_number",
];
const POSITION_KEYS = ["pos", "position", "coords", "target", "to", "location"];
const TYPE_KEYS = ["type", "action", "kind", "name", "command", "event"];

const RESOURCE_KEYS = {
  food: ["food", "food_workers", "villagers_food", "vils_food"],
  wood: ["wood", "wood_workers", "villagers_wood", "vils_wood"],
  gold: ["gold", "gold_workers", "villagers_gold", "vils_gold"],
  stone: ["stone", "stone_workers", "villagers_stone", "vils_stone"],
};

const VILLAGER_KEYS = ["villagers", "villager_count", "vils", "villagers_total"];
const MILITARY_KEYS = ["military", "military_count", "army", "units_military"];

const AGE_MATCH = [
  { match: /dark/i, label: "Dark" },
  { match: /feudal/i, label: "Feudal" },
  { match: /castle/i, label: "Castle" },
  { match: /imperial/i, label: "Imperial" },
];
const AGE_TECH_NAMES = {
  Feudal: "Feudal Age",
  Castle: "Castle Age",
  Imperial: "Imperial Age",
};
const AGE_TECH_DURATIONS: Record<string, number> = {
  Feudal: 130,
  Castle: 160,
  Imperial: 190,
};
const CHAT_KEYS = [
  "chat",
  "message",
  "msg",
  "text",
  "chat_message",
  "chat_text",
  "message_text",
  "chatMessage",
];

const MAX_SCAN_DEPTH = 6;
const MAX_ARRAY_SCAN = 5000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pickNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const timeScaleFromValue = (value: number): number => {
  if (value > 100_000) return 1000;
  if (value > 10_000) return 100;
  return 1;
};

const normalizeTime = (value: number, scale?: number): number => {
  const appliedScale = scale ?? timeScaleFromValue(value);
  return value / appliedScale;
};

const stringFromValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const extractAge = (value: unknown): string | undefined => {
  const raw = stringFromValue(value);
  if (!raw) return undefined;
  const match = AGE_MATCH.find((entry) => entry.match.test(raw));
  return match?.label;
};

const extractChatText = (event: Record<string, unknown>) => {
  for (const key of CHAT_KEYS) {
    const value = stringFromValue(event[key]);
    if (value) return value;
  }
  return undefined;
};

const extractPosition = (event: Record<string, unknown>) => {
  if (typeof event.x === "number" && typeof event.y === "number") {
    return { x: event.x, y: event.y };
  }
  for (const key of POSITION_KEYS) {
    const candidate = event[key];
    if (isRecord(candidate)) {
      const x = pickNumber(candidate.x);
      const y = pickNumber(candidate.y);
      if (x !== undefined && y !== undefined) {
        return { x, y };
      }
    }
    if (Array.isArray(candidate) && candidate.length >= 2) {
      const x = pickNumber(candidate[0]);
      const y = pickNumber(candidate[1]);
      if (x !== undefined && y !== undefined) {
        return { x, y };
      }
    }
  }
  return undefined;
};

const extractPositionFromData = (
  data: number[],
  bounds?: { x: number; y: number }
) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length < 8) return undefined;
  const view = new DataView(bytes.buffer);
  const maxX = bounds?.x ?? 512;
  const maxY = bounds?.y ?? 512;
  let best: { x: number; y: number; score: number } | undefined;

  for (let i = 0; i + 8 <= bytes.length; i += 4) {
    const x = view.getFloat32(i, true);
    const y = view.getFloat32(i + 4, true);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x === 0 && y === 0) continue;
    if (x < 0 || y < 0 || x > maxX || y > maxY) continue;
    const score = Math.min(x, y, maxX - x, maxY - y);
    if (!best || score > best.score) {
      best = { x, y, score };
    }
  }

  if (best && best.score >= 1) {
    return { x: best.x, y: best.y };
  }
  return undefined;
};

const extractBuildingTypeId = (data: number[]) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length < 16) return undefined;
  const view = new DataView(bytes.buffer);
  const value = view.getInt32(12, true);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
};

const extractWallSegments = (data: number[]) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length < 14) return undefined;
  const view = new DataView(bytes.buffer);
  const startX = view.getUint16(4, true);
  const startY = view.getUint16(6, true);
  const endX = view.getUint16(8, true);
  const endY = view.getUint16(10, true);
  const buildingTypeId = view.getUint16(12, true);
  if (startX > 512 || startY > 512 || endX > 512 || endY > 512) return undefined;
  // Bresenham line interpolation
  const tiles: { x: number; y: number }[] = [];
  let x0 = startX, y0 = startY;
  const x1 = endX, y1 = endY;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (let step = 0; step <= dx + dy + 1; step++) {
    tiles.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return { tiles, buildingTypeId };
};

const extractIdFromData = (data: number[], offset = 0) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length < offset + 4) return undefined;
  const view = new DataView(bytes.buffer);
  const value = view.getInt32(offset, true);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
};

const extractDeleteTargetId = (data: number[]) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length < 4) return undefined;
  const view = new DataView(bytes.buffer);
  const value = view.getInt32(0, true);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
};

const detectType = (event: Record<string, unknown>): string => {
  for (const key of TYPE_KEYS) {
    const value = stringFromValue(event[key]);
    if (value) return value;
  }
  return "event";
};

const detectCategory = (type: string, event: Record<string, unknown>) => {
  const lower = type.toLowerCase();
  if (lower.includes("research") || lower.includes("tech")) {
    return "research";
  }
  if (lower.includes("train") || lower.includes("queue")) {
    return "train";
  }
  if (lower.includes("build") || lower.includes("wall") || "building" in event || "building_id" in event) {
    return "build";
  }
  if (
    lower.includes("move") ||
    lower.includes("patrol") ||
    lower.includes("attack") ||
    "target" in event
  ) {
    return "move";
  }
  return "other";
};

const detectAgeFromEvent = (event: Record<string, unknown>) => {
  for (const key of ["age", "age_id", "ageId", "tech", "research"]) {
    const age = extractAge(event[key]);
    if (age) return age;
  }
  const type = detectType(event);
  return extractAge(type);
};

const detectPlayerId = (event: Record<string, unknown>): number | undefined => {
  for (const key of PLAYER_KEYS) {
    const value = pickNumber(event[key]);
    if (value !== undefined) return value;
  }
  return undefined;
};

const detectUnitId = (event: Record<string, unknown>) => {
  const value =
    event.unit_id ?? event.unitId ?? event.entity_id ?? event.entityId ?? event.unit;
  return typeof value === "string" || typeof value === "number" ? value : undefined;
};

const extractUnitTypeId = (event: Record<string, unknown>) => {
  const keys = [
    "unit_type_id",
    "unit_type",
    "unitTypeId",
    "unitType",
    "train_unit_id",
    "train_unit_type",
  ];
  for (const key of keys) {
    const value = pickNumber(event[key]);
    if (value !== undefined) return value;
  }
  return undefined;
};

const extractTechId = (event: Record<string, unknown>) => {
  const keys = [
    "tech_id",
    "technology_id",
    "research_id",
    "technology_type",
    "techId",
    "tech",
  ];
  for (const key of keys) {
    const value = pickNumber(event[key]);
    if (value !== undefined) return value;
  }
  return undefined;
};

const detectBuildingId = (event: Record<string, unknown>) => {
  const value =
    event.building_id ?? event.buildingId ?? event.structure_id ?? event.structureId;
  return typeof value === "string" || typeof value === "number" ? value : undefined;
};


const detectLabel = (event: Record<string, unknown>, type: string) => {
  const label =
    stringFromValue(event.name) ??
    stringFromValue(event.unit_name) ??
    stringFromValue(event.building_name) ??
    stringFromValue(event.tech_name) ??
    stringFromValue(event.action_name);

  if (label) return label;

  const unitCount = Array.isArray(event.unit_ids) ? event.unit_ids.length : undefined;
  if (type === "Move" && unitCount) return `Move (${unitCount} units)`;
  if (type === "Patrol" && unitCount) return `Patrol (${unitCount} units)`;
  if (type === "Build") return "Build structure";
  if (type === "Wall") return "Build wall segment";
  if (type === "Research") return "Research technology";
  if (type === "Train") return "Train unit";
  if (type === "Gatherpoint") return "Set gather point";
  if (type === "Interact") return "Interact";
  if (type === "Order") return "Issue order";
  if (type === "Resign") return "Resign";

  return type;
};

const normalizeEventLabel = (
  type: string,
  baseLabel: string,
  unitTypeId?: number,
  techId?: number
) => {
  const unitName = getUnitName(unitTypeId);
  const techName = getTechName(techId);
  if (type === "Research") {
    return techName ?? baseLabel;
  }
  if (type === "DeQueue") {
    if (unitName) return `Dequeue ${unitName}`;
    if (techName) return `Dequeue ${techName}`;
    return "Dequeue";
  }
  return baseLabel;
};

const shouldSkipEvent = (type: string, label: string) =>
  type === "Order" || label === "Issue order";


const extractTimeValue = (event: Record<string, unknown>) => {
  for (const key of TIME_KEYS) {
    const value = pickNumber(event[key]);
    if (value !== undefined) {
      return normalizeTime(value);
    }
  }
  return undefined;
};

const collectEventArrays = (
  value: unknown,
  depth = 0,
  arrays: Record<string, unknown>[][] = [],
  seen = new Set<unknown>()
) => {
  if (depth > MAX_SCAN_DEPTH) return arrays;
  if (!value || typeof value !== "object") return arrays;
  if (seen.has(value)) return arrays;
  seen.add(value);

  if (Array.isArray(value)) {
    const sample = value.find((item) => isRecord(item));
    if (sample && extractTimeValue(sample)) {
      arrays.push(value.filter(isRecord).slice(0, MAX_ARRAY_SCAN));
      return arrays;
    }
    value.slice(0, 100).forEach((entry) => {
      collectEventArrays(entry, depth + 1, arrays, seen);
    });
    return arrays;
  }

  if (isRecord(value)) {
    Object.values(value).forEach((entry) => {
      collectEventArrays(entry, depth + 1, arrays, seen);
    });
  }

  return arrays;
};

export const buildTimeline = (replay: unknown): TimelineEvent[] => {
  if (!replay) return [];
  const replayRecord = replay as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  const events: TimelineEvent[] = [];
  const used = new Set<string>();

  if (operations) {
    const mapInfo = (replayRecord.zheader as any)?.map_info;
    const bounds =
      mapInfo?.size_x && mapInfo?.size_y
        ? { x: mapInfo.size_x, y: mapInfo.size_y }
        : undefined;
    let maxWorldTime = 0;
    operations.forEach((op) => {
      const action = op.Action as Record<string, unknown> | undefined;
      if (!action) return;
      const rawTime = pickNumber(action.world_time);
      if (rawTime !== undefined && rawTime > maxWorldTime) {
        maxWorldTime = rawTime;
      }
    });
    const timeScale = timeScaleFromValue(maxWorldTime);

    operations.forEach((op, index) => {
      const action = op.Action as Record<string, unknown> | undefined;
      if (!action) return;
      const time = normalizeTime(pickNumber(action.world_time) ?? 0, timeScale);
      const actionData = action.action_data as Record<string, unknown> | undefined;
      if (!actionData) return;
      const actionType = Object.keys(actionData)[0];
      if (!actionType) return;
      const payload = actionData[actionType] as Record<string, unknown>;
      const playerId = pickNumber(payload?.player_id);
      const position =
        extractPosition(payload) ??
        (Array.isArray(payload?.data)
          ? extractPositionFromData(payload.data as number[], bounds)
          : undefined);
      const category = detectCategory(actionType, payload ?? {});
      const age = detectAgeFromEvent(payload ?? {});
      const unitId = Array.isArray(payload?.unit_ids) ? payload?.unit_ids?.[0] : undefined;
      let unitTypeId =
        extractUnitTypeId(payload ?? {}) ??
        (Array.isArray(payload?.data) ? extractIdFromData(payload.data as number[]) : undefined);
      if (actionType === "DeQueue" && unitTypeId === undefined) {
        const dequeueUnit = pickNumber(payload?.unit_id);
        if (dequeueUnit !== undefined) {
          unitTypeId = dequeueUnit;
        }
      }
      let techId =
        extractTechId(payload ?? {}) ??
        (Array.isArray(payload?.data) ? extractIdFromData(payload.data as number[]) : undefined);
      const buildingId = payload?.building_id;
      const buildingTypeId =
        Array.isArray(payload?.data) && (actionType === "Build" || actionType === "Wall")
          ? extractBuildingTypeId(payload.data as number[])
          : undefined;
      const targetId =
        actionType === "Interact" && typeof payload?.target_id === "number"
          ? payload.target_id
          : actionType === "Delete" && Array.isArray(payload?.data)
            ? extractDeleteTargetId(payload.data as number[])
            : undefined;
      const baseLabel = detectLabel(payload ?? {}, actionType);
      const label = normalizeEventLabel(actionType, baseLabel, unitTypeId, techId);
      if (shouldSkipEvent(actionType, label)) return;

      // Expand wall commands into per-tile events
      if (actionType === "Wall" && Array.isArray(payload?.data)) {
        const wall = extractWallSegments(payload.data as number[]);
        if (wall) {
          wall.tiles.forEach((tile, tileIdx) => {
            const tileId = `${actionType}-${playerId ?? "p"}-${time}-${index}-${tileIdx}`;
            if (used.has(tileId)) return;
            used.add(tileId);
            events.push({
              id: tileId,
              time,
              playerId,
              type: actionType,
              label,
              category,
              x: tile.x,
              y: tile.y,
              unitId,
              unitTypeId,
              buildingId: undefined,
              buildingTypeId: wall.buildingTypeId,
              targetId,
              techId,
              age,
              raw: payload ?? {},
            });
          });
          return;
        }
      }

      const id = `${actionType}-${playerId ?? "p"}-${time}-${index}`;
      if (used.has(id)) return;
      used.add(id);
      events.push({
        id,
        time,
        playerId,
        type: actionType,
        label,
        category,
        x: position?.x,
        y: position?.y,
        unitId,
        unitTypeId,
        buildingId:
          typeof buildingId === "string" || typeof buildingId === "number"
            ? buildingId
            : undefined,
        buildingTypeId,
        targetId,
        techId,
        age,
        raw: payload ?? {},
      });
    });

    return events.sort((a, b) => a.time - b.time);
  }

  const arrays = collectEventArrays(replay);
  arrays.forEach((array) => {
    array.forEach((event, index) => {
      const time = extractTimeValue(event);
      if (time === undefined) return;
      const type = detectType(event);
      const position = extractPosition(event);
      const playerId = detectPlayerId(event);
      const category = detectCategory(type, event);
      const age = detectAgeFromEvent(event);
      let unitTypeId =
        extractUnitTypeId(event) ??
        (Array.isArray(event.data)
          ? extractIdFromData(event.data as number[])
          : undefined);
      let techId =
        extractTechId(event) ??
        (Array.isArray(event.data)
          ? extractIdFromData(event.data as number[])
          : undefined);
      const baseLabel = detectLabel(event, type);
      const label = normalizeEventLabel(type, baseLabel, unitTypeId, techId);
      if (shouldSkipEvent(type, label)) return;
      const id = `${type}-${playerId ?? "p"}-${time}-${index}`;
      if (used.has(id)) return;
      used.add(id);
      events.push({
        id,
        time,
        playerId,
        type,
        label,
        category,
        x: position?.x,
        y: position?.y,
        unitId: detectUnitId(event),
        unitTypeId,
        buildingId: detectBuildingId(event),
        techId,
        age,
        raw: event,
      });
    });
  });

  return events.sort((a, b) => a.time - b.time);
};

export const summarizePlayers = (
  summary: any,
  replay: any,
  events: TimelineEvent[] = []
): PlayerSummary[] => {
  const players: PlayerSummary[] = [];

  // 1. Identify raw players from summary or replay
  const summaryTeams = summary?.teams ?? [];
  summaryTeams.forEach((team: any, teamIndex: number) => {
    (team?.players ?? []).forEach((player: any) => {
      players.push({
        id: player.player_number ?? players.length + 1,
        name: player.name ?? `Player ${players.length + 1}`,
        colorId: player.color_id ?? player.selected_color,
        civId: player.civ_id,
        teamId: player.resolved_team_id ?? teamIndex + 1,
        won: player.victory === true || player.won === true,
      });
    });
  });

  if (!players.length) {
    const replayPlayers =
      replay?.players ?? replay?.player ?? replay?.player_settings ?? [];
    replayPlayers.forEach((player: any, index: number) => {
      players.push({
        id: player.player_number ?? index + 1,
        name: player.name ?? `Player ${index + 1}`,
        colorId: player.color_id ?? player.selected_color,
        civId: player.civ_id,
        teamId: player.team_id,
        won: player.victory === true || player.won === true,
      });
    });
  }

  // 2. Winner inference fallback using Resign events
  const explicitWinner = players.some((p) => p.won);
  if (!explicitWinner && events.length > 0) {
    const resigners = new Set(
      events.filter((e) => e.type === "Resign").map((e) => e.playerId)
    );
    if (resigners.size > 0 && resigners.size < players.length) {
      players.forEach((p) => {
        if (!resigners.has(p.id)) {
          p.won = true;
        }
      });
    }
  }

  return players;
};

const extractSeriesFromArray = (
  items: Record<string, unknown>[],
  key: string
): TimeSeriesPoint[] =>
  items
    .map((item) => {
      const time = extractTimeValue(item);
      const value = pickNumber(item[key]);
      if (time === undefined || value === undefined) return undefined;
      return { time, value };
    })
    .filter((point): point is TimeSeriesPoint => Boolean(point))
    .sort((a, b) => a.time - b.time);

const findSeries = (
  source: unknown,
  keys: string[]
): { key: string; series: TimeSeriesPoint[] } | undefined => {
  if (!source) return undefined;
  const arrays = collectEventArrays(source);
  for (const array of arrays) {
    for (const key of keys) {
      if (array.some((item) => key in item)) {
        return { key, series: extractSeriesFromArray(array, key) };
      }
    }
  }
  return undefined;
};

export const extractPlayerStats = (
  events: TimelineEvent[],
  durationSeconds: number | undefined,
  replay: any,
  players?: PlayerSummary[]
): PlayerStats[] => {
  const durationMinutes = Math.max(durationSeconds ?? 0, 1) / 60;
  const eventsByPlayer = new Map<number, TimelineEvent[]>();
  players?.forEach((player) => {
    eventsByPlayer.set(player.id, []);
  });
  events.forEach((event) => {
    if (event.playerId === undefined) return;
    const list = eventsByPlayer.get(event.playerId) ?? [];
    list.push(event);
    eventsByPlayer.set(event.playerId, list);
  });

  const stats: PlayerStats[] = [];
  eventsByPlayer.forEach((playerEvents, playerId) => {
    const apm = Math.round(playerEvents.length / durationMinutes);
    const resourceSeries: ResourceSeries = {
      food: [],
      wood: [],
      gold: [],
      stone: [],
    };

    Object.entries(RESOURCE_KEYS).forEach(([resource, keys]) => {
      const found = findSeries(replay, keys);
      if (found) {
        resourceSeries[resource as keyof ResourceSeries] = found.series;
      }
    });

    const villSeries =
      findSeries(replay, VILLAGER_KEYS)?.series ??
      (resourceSeries.food.length
        ? resourceSeries.food.map((point) => ({
          time: point.time,
          value: point.value,
        }))
        : undefined);

    const militarySeries = findSeries(replay, MILITARY_KEYS)?.series;

    const ageTimings: Record<string, number> = {};
    playerEvents.forEach((event) => {
      // 1. Check for Research-based age ups (prioritize LAST occurrence, e.g. after cancel/restart)
      if (event.type === "Research" && event.label) {
        const lower = event.label.toLowerCase();
        Object.entries(AGE_TECH_NAMES).forEach(([age, name]) => {
          if (lower.includes(name.toLowerCase())) {
            const adjustedTime = event.time + (AGE_TECH_DURATIONS[age] ?? 0);
            // Use ">" to get the LATEST occurrence
            if (ageTimings[age] === undefined || adjustedTime > ageTimings[age]) {
              ageTimings[age] = adjustedTime;
            }
          }
        });
      }
      // 2. Check for age-tagged events (fallback)
      if (event.age && ageTimings[event.age] === undefined) {
        ageTimings[event.age] = event.time;
      }
    });

    stats.push({
      playerId,
      apm,
      villagerSeries: villSeries,
      villagerPeak: villSeries
        ? Math.max(...villSeries.map((point) => point.value))
        : undefined,
      militaryPeak: militarySeries
        ? Math.max(...militarySeries.map((point) => point.value))
        : undefined,
      resources: resourceSeries,
      ageTimings,
    });
  });

  return stats;
};

export const formatClock = (seconds: number) => {
  const total = Math.max(seconds, 0);
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const buildOrdersByAge = (events: TimelineEvent[]) => {
  const orders = events.filter((event) =>
    ["build", "train", "research"].includes(event.category)
  );
  const byAge = new Map<string, TimelineEvent[]>();
  orders.forEach((event) => {
    const age = event.age ?? "Unknown";
    const list = byAge.get(age) ?? [];
    list.push(event);
    byAge.set(age, list);
  });
  AGE_LABELS.forEach((label) => {
    if (!byAge.has(label)) byAge.set(label, []);
  });
  if (!byAge.has("Unknown")) byAge.set("Unknown", []);
  return byAge;
};

export const determineDuration = (
  summary: any,
  events: TimelineEvent[]
): number => {
  const rawSummaryDuration = pickNumber(summary?.duration);
  const summaryDuration =
    rawSummaryDuration !== undefined
      ? normalizeTime(rawSummaryDuration, timeScaleFromValue(rawSummaryDuration))
      : undefined;
  if (!events.length) return 0;
  const lastEventTime = events[events.length - 1]?.time ?? 0;
  const lastResign = [...events]
    .reverse()
    .find((event) => event.type === "Resign")?.time;
  if (lastResign !== undefined) {
    return lastResign;
  }
  if (summaryDuration === undefined) return lastEventTime;
  if (summaryDuration > lastEventTime * 1.2) {
    return lastEventTime;
  }
  return summaryDuration;
};

export const extractMapSize = (replay: any, summary: any): number => {
  const candidates = [
    replay?.zheader?.map_info?.size_x,
    replay?.zheader?.map_info?.size_y,
    replay?.map_size,
    replay?.mapSize,
    summary?.header?.game_settings?.map_size,
  ];
  for (const value of candidates) {
    const num = pickNumber(value);
    if (num !== undefined) return num;
  }
  return 200;
};

export type MatchInfo = {
  mapTypeId?: number;
  mapSizeId?: number;
  gameTypeId?: number;
  difficultyId?: number;
  startingAgeId?: number;
  populationLimit?: number;
  speedId?: number;
  cheats?: boolean;
};

export const extractMatchInfo = (summary: any): MatchInfo => {
  const settings = summary?.header?.game_settings;
  const replayData = summary?.header?.replay;
  return {
    mapTypeId: pickNumber(settings?.resolved_map_id) ?? pickNumber(settings?.selected_map_id) ?? pickNumber(replayData?.map_id),
    mapSizeId: pickNumber(settings?.map_size) ?? pickNumber(replayData?.map_size),
    gameTypeId: pickNumber(settings?.game_type),
    difficultyId: pickNumber(settings?.difficulty),
    startingAgeId: pickNumber(settings?.starting_age_id),
    populationLimit: pickNumber(settings?.population_limit),
    speedId: pickNumber(settings?.speed) ?? pickNumber(replayData?.game_speed_id),
    cheats: settings?.cheats === true || replayData?.cheats_enabled === true,
  };
};
