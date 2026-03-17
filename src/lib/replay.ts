export type TimelineEvent = {
  id: string;
  time: number;
  playerId?: number;
  type: string;
  category: "build" | "move" | "research" | "train" | "autoscout" | "market" | "other";
  x?: number;
  y?: number;
  unitId?: string | number;
  unitTypeId?: number;
  buildingId?: string | number;
  buildingTypeId?: number;
  techId?: number;
  age?: string;
  raw: Record<string, unknown>;
};

import { determineStartingLocations } from "./tcPlacement";

export type PlayerSummary = {
  id: number;
  name: string;
  colorId?: number;
  civId?: number;
  teamId?: number;
  won?: boolean;
};

export type MarketUsage = {
  bought: { food: number; wood: number; stone: number };
  sold: { food: number; wood: number; stone: number };
};

export type PlayerStats = {
  playerId: number;
  apm: number;
  peakApm: number;
  apmHistory: { minute: number; apm: number }[];
  ageTimings?: Record<string, number>;
  autoscoutUsage?: number;
  marketUsage?: MarketUsage;
};

const AGE_TECH_IDS = {
  Feudal: 101,
  Castle: 102,
  Imperial: 103,
};
const AGE_TECH_DURATIONS: Record<string, number> = {
  Feudal: 130,
  Castle: 160,
  Imperial: 190,
};

const pickNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const normalizeTime = (value: number): number => {
  return value / 1000;
};

const extractPosition = (event: Record<string, unknown>) => {
  if (typeof event.x === "number" && typeof event.y === "number") {
    return { x: event.x, y: event.y };
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

const detectCategory = (type: string, event: Record<string, unknown>) => {
  switch (type) {
    case "Research": return "research";
    case "DeQueue": return "train";
    case "Build": return "build";
    case "Wall": return "build";
    case "Move": return "move";
    case "Patrol": return "move";
    case "DeAttack": return "move";
    case "Follow": return "move";
    case "AttackGround": return "move";
    case "Autoscout": return "autoscout";
    case "Buy": return "market";
    case "Sell": return "market";
  }
  return "other";
};

export const buildTimeline = (replay: unknown, summary?: any): TimelineEvent[] => {
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


    operations.forEach((op, index) => {
      const action = op.Action as Record<string, unknown> | undefined;
      if (!action) return;
      const time = normalizeTime(pickNumber(action.world_time) ?? 0);
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
      const unitId = Array.isArray(payload?.unit_ids) ? payload?.unit_ids?.[0] : undefined;
      let unitTypeId = pickNumber(payload?.unit_id);
      let techId = pickNumber(payload?.technology_type);
      const buildingId = payload?.building_id;
      const buildingTypeId =
        Array.isArray(payload?.data) && (actionType === "Build" || actionType === "Wall")
          ? extractBuildingTypeId(payload.data as number[])
          : undefined;

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
              category,
              x: tile.x,
              y: tile.y,
              unitId,
              unitTypeId,
              buildingId: undefined,
              buildingTypeId: wall.buildingTypeId,
              techId,
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
        techId,
        raw: payload ?? {},
      });
    });

    const sortedEvents = events.sort((a, b) => a.time - b.time);
    const players = summarizePlayers(summary);
    const startingEvents = determineStartingLocations(players, sortedEvents);

    return [...startingEvents, ...sortedEvents].sort((a, b) => a.time - b.time);
  }

  return events;
};

export const summarizePlayers = (
  summary: any
): PlayerSummary[] => {
  const players: PlayerSummary[] = [];

  const summaryTeams = summary?.teams ?? [];
  summaryTeams.forEach((team: any, teamIndex: number) => {
    (team?.players ?? []).forEach((player: any) => {
      players.push({
        id: player.player_number,
        name: player.name ?? `Player ${player.player_number}`,
        colorId: player.color_id,
        civId: player.civ_id,
        teamId: teamIndex + 1,
        won: team.winner,
      });
    });
  });

  return players;
};

export const extractPlayerStats = (
  events: TimelineEvent[],
  durationSeconds: number | undefined,
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
    const player = players?.find((p) => p.id === playerId);
    const civId = player?.civId;
    const ageTimings: Record<string, number> = {};

    let autoscoutUsage = 0;
    const marketUsage: MarketUsage = {
      bought: { food: 0, wood: 0, stone: 0 },
      sold: { food: 0, wood: 0, stone: 0 },
    };

    const minuteBuckets = new Map<number, number>();
    playerEvents.forEach((event) => {
      const minute = Math.floor(event.time / 60);
      minuteBuckets.set(minute, (minuteBuckets.get(minute) ?? 0) + 1);

      if (event.category === "autoscout") autoscoutUsage++;

      if (event.category === "market" && Array.isArray(event.raw?.data)) {
        const data = event.raw.data as number[];
        const resourceType = data[0]; // 0=food, 1=wood, 2=stone
        const amount = (data[2] ?? 0) * 100;

        const resourceMap: Record<number, keyof MarketUsage["bought"]> = {
          0: "food",
          1: "wood",
          2: "stone",
        };
        const resource = resourceMap[resourceType];
        if (resource) {
          if (event.type === "Buy") {
            marketUsage.bought[resource] += amount;
          } else if (event.type === "Sell") {
            marketUsage.sold[resource] += amount;
          }
        }
      }

      // Check for Research-based age ups (prioritize LAST occurrence, e.g. after cancel/restart)
      if (event.type === "Research" && event.techId) {
        Object.entries(AGE_TECH_IDS).forEach(([age, id]) => {
          if (event.techId === id) {
            let duration = AGE_TECH_DURATIONS[age] ?? 0;

            // Apply Civ Bonuses
            if (civId === 29) { // Malay
              duration /= 1.66;
            } else if (civId === 8) { // Persians
              if (age === "Feudal") duration /= 1.05;
              if (age === "Castle") duration /= 1.10;
              if (age === "Imperial") duration /= 1.15;
            }

            const adjustedTime = event.time + duration;

            // Only count as complete if it finished before the game did
            if (durationSeconds !== undefined && adjustedTime > durationSeconds) {
              return;
            }

            // Use ">" to get the LATEST occurrence
            if (ageTimings[age] === undefined || adjustedTime > ageTimings[age]) {
              ageTimings[age] = adjustedTime;
            }
          }
        });
      }
    });

    const peakApm = minuteBuckets.size > 0 ? Math.max(...Array.from(minuteBuckets.values())) : 0;
    const apmHistory = Array.from(minuteBuckets.entries())
      .map(([minute, count]) => ({ minute, apm: count }))
      .sort((a, b) => a.minute - b.minute);

    stats.push({
      playerId,
      apm,
      peakApm,
      apmHistory,
      ageTimings,
      autoscoutUsage,
      marketUsage,
    });
  });

  return stats;
};

export const determineDuration = (
  summary: any,
  events: TimelineEvent[]
): number => {
  const rawSummaryDuration = pickNumber(summary?.duration);
  const summaryDuration =
    rawSummaryDuration !== undefined
      ? normalizeTime(rawSummaryDuration)
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
