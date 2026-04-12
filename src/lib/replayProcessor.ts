export type TimelineEventCategory = "build" | "move" | "research" | "train" | "autoscout" | "market" | "other";

export type TimelineEvent = {
  id: string;
  time: number;
  playerId?: number;
  type: string;
  category: TimelineEventCategory;
  x?: number;
  y?: number;
  unitId?: string | number;
  unitTypeId?: number;
  buildingTypeId?: number;
  techId?: number;
  raw: Record<string, unknown>;
};

export type MapResourceType = "gold" | "stone" | "forage" | "relic";

import { getEntityName, getBuildingName } from "./entityNames";
import { isBuildingId } from "./buildingFootprints";

import { DEBUG } from "./debug";

export type PlayerSummary = {
  id: number;
  ai: boolean;
  name: string;
  colorId?: number;
  civId?: number;
  teamId?: number;
  won?: boolean;
  handicap?: number;
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

const classifyEvent = (type: string, isAi?: boolean): TimelineEventCategory => {
  switch (type) {
    case "Research":
      return "research";
    case "AiQueue":
      return "train";
    case "DeQueue":
      return isAi ? "other" : "train";  // DeQueue is only for human players
    case "Build":
    case "Wall":
      return "build";
    case "AiMove":
    case "Move":
    case "Patrol":
    case "DeAttackMove":
    case "AttackGround":
      return "move";
    case "Autoscout": return "autoscout";
    case "Buy":
    case "Sell":
      return "market";
  }
  return "other";
};

const pickNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

// Structs from https://github.com/aoe2ct/aoe2rec/blob/main/patterns/aoe2operations.hexpat
const parseActionData = (type: string, data: number[]) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length === 0) return undefined;
  const view = new DataView(bytes.buffer);

  try {
    switch (type) {
      case "Move": {
        return {};  // handled by parser
      }
      case "AiMove": {
        if (bytes.length < 40) return undefined;
        const x = view.getFloat32(20, true);
        const y = view.getFloat32(24, true);
        return { x, y };
      }
      case "Patrol":
      case "DeAttackMove": {
        if (bytes.length < 88) return undefined;
        const x = view.getFloat32(8, true);
        const y = view.getFloat32(48, true);
        return { x, y };
      }
      case "Build": {
        if (bytes.length < 28) return undefined;
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        const buildingTypeId = view.getUint32(12, true);
        return { x, y, buildingTypeId };
      }
      case "Wall": {
        if (bytes.length < 24) return undefined;
        const x1 = view.getInt16(4, true);
        const y1 = view.getInt16(6, true);
        const x2 = view.getInt16(8, true);
        const y2 = view.getInt16(10, true);
        const buildingTypeId = view.getInt32(12, true);
        // Prefer straight or diagonal lines with a max of one bend
        const tiles: { x: number; y: number }[] = [];
        const dx = x2 - x1, dy = y2 - y1;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;

        const diagLen = Math.min(adx, ady);
        const straightLen = Math.max(adx, ady) - diagLen;

        let x_curr = x1, y_curr = y1;
        if (straightLen > diagLen) {
          // Straight segment is longest, so it comes first
          if (adx > ady) {
            // Horizontal first
            for (let i = 0; i < straightLen; i++) {
              tiles.push({ x: x_curr, y: y_curr });
              x_curr += sx;
            }
          } else {
            // Vertical first
            for (let i = 0; i < straightLen; i++) {
              tiles.push({ x: x_curr, y: y_curr });
              y_curr += sy;
            }
          }
          // Followed by diagonal
          for (let i = 0; i <= diagLen; i++) {
            tiles.push({ x: x_curr, y: y_curr });
            x_curr += sx;
            y_curr += sy;
          }
        } else {
          // Diagonal segment is longest (or equal), so it comes first
          for (let i = 0; i < diagLen; i++) {
            tiles.push({ x: x_curr, y: y_curr });
            x_curr += sx;
            y_curr += sy;
          }
          // Followed by straight
          if (adx > ady) {
            // Horizontal last
            for (let i = 0; i <= straightLen; i++) {
              tiles.push({ x: x_curr, y: y_curr });
              x_curr += sx;
            }
          } else {
            // Vertical last
            for (let i = 0; i <= straightLen; i++) {
              tiles.push({ x: x_curr, y: y_curr });
              y_curr += sy;
            }
          }
        }
        return { tiles, buildingTypeId };
      }
      case "Research": {
        return {};  // handled by parser
      }
      case "DeQueue": {
        return {};  // handled by parser
      }
      case "AiQueue": {
        if (bytes.length < 12) return undefined;
        const unitTypeId = view.getInt32(8, true);
        return { unitTypeId };
      }
      case "Sell":
      case "Buy": {
        if (bytes.length < 8) return undefined;
        const resourceId = view.getUint16(0, true);
        const amount = view.getUint16(2, true);
        return { resourceId, amount };
      }
      case "Autoscout": {
        return {};
      }
      case "AttackGround": {
        if (bytes.length < 16) return undefined;
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        return { x, y };
      }
    }
  } catch (e) {
    console.error(`Error parsing action data for ${type}:`, e);
  }
  return undefined;
};

export const buildTimeline = (replay: unknown, summary?: any): { events: TimelineEvent[]; mapResources: Record<string, MapResourceType> } => {
  if (!replay) return { events: [], mapResources: {} };
  const replayRecord = replay as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  const events: TimelineEvent[] = [];
  const players = summarizePlayers(summary, replay);

  // Process initial object instances if available
  const zheader = replayRecord.zheader as any;
  const initialMap = zheader?.initial;
  // Account for both Map and plain object access
  const initialInstances = (typeof initialMap?.get === "function"
    ? initialMap.get("initial_object_instances")
    : (initialMap as any)?.initial_object_instances) as any[];

  const mapResources: Record<string, MapResourceType> = {};

  if (initialInstances) {
    const gaiaCombinations: Record<string, number> = {};

    initialInstances.forEach((obj, idx) => {
      // Process Gaia (player 0) objects for analysis
      if (obj.player_id === 0) {
        const typeName = getEntityName(obj.object_type_id) ?? `Unknown (${obj.object_type_id})`;

        if (DEBUG) {
          const comboKey = `${typeName} (Type ${obj.object_type_id}, Kind ${obj.object_kind})`;
          gaiaCombinations[comboKey] = (gaiaCombinations[comboKey] || 0) + 1;
        }

        // Track resource locations
        if (typeName.includes("Gold Mine")) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "gold";
        } else if (typeName.includes("Stone Mine")) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "stone";
        } else if (typeName === "Relic") {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "relic";
        } else if (
          typeName.includes("Forage Bush") ||
          typeName.includes("Fruit Bush") ||
          typeName.includes("Pineapple Bush")
        ) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "forage";
        }
        return;
      }

      const isBuilding = isBuildingId(obj.object_type_id);
      if (!isBuilding) return;

      // Deduplicate: There are 4 pieces for the starting Town Center.
      // If we already added an event for this specific Town Center, skip the duplicates.
      const isTC = getBuildingName(obj.object_type_id).includes("Town Center");
      if (isTC && obj.object_type_id !== 109) return;

      events.push({
        id: `initial-${obj.object_id ?? idx}`,
        time: 0,
        playerId: obj.player_id,
        type: "Build",
        category: "build",
        x: obj.x,
        y: obj.y,
        buildingTypeId: obj.object_type_id,
        raw: { ...obj, isInitial: true },
      });
    });

    if (DEBUG) {
      console.log("Gaia Resource Combinations:", gaiaCombinations);
    }
  }

  if (operations) {
    // First pass: identify unique player IDs in events to handle mismatches
    const rawEventPlayerIds = new Set<number>();
    operations.forEach((op) => {
      const action = op.Action as Record<string, unknown> | undefined;
      const actionData = action?.action_data as Record<string, unknown> | undefined;
      if (actionData) {
        const actionType = Object.keys(actionData)[0];
        const payload = actionData[actionType] as Record<string, unknown>;
        const pid = pickNumber(payload?.player_id);
        if (pid !== undefined && pid !== 0) {
          rawEventPlayerIds.add(pid);
        }
      }
    });

    const sortedEventIds = Array.from(rawEventPlayerIds).sort((a, b) => a - b);
    const sortedSummaryIds = players.map(p => p.id).sort((a, b) => a - b);

    // Create a mapping from event ID to summary ID
    const playerMapping = new Map<number, number>();
    if (sortedEventIds.length === sortedSummaryIds.length) {
      // Perfect match in count - map by relative order
      sortedEventIds.forEach((eid, idx) => {
        playerMapping.set(eid, sortedSummaryIds[idx]);
      });
    } else {
      // Fallback: identify mapping or identity
      sortedEventIds.forEach(eid => playerMapping.set(eid, eid));
    }

    operations.forEach((op, index) => {
      const action = op.Action as Record<string, unknown> | undefined;
      if (!action) return;

      const time = (pickNumber(action.world_time) ?? 0) / 1000;
      const actionData = action.action_data as Record<string, unknown> | undefined;
      if (!actionData) return;

      const actionType = Object.keys(actionData)[0];
      if (!actionType) return;

      const payload = actionData[actionType] as Record<string, unknown>;
      const rawPlayerId = pickNumber(payload?.player_id);
      if (!rawPlayerId) return;

      // Adjust player ID based on mapping
      const playerId = playerMapping.get(rawPlayerId) ?? rawPlayerId;

      const player = players.find(p => p.id === playerId);
      const isAi = player?.ai;
      const civId = player?.civId;
      const category = classifyEvent(actionType, isAi);
      const data = Array.isArray(payload?.data) ? parseActionData(actionType, payload.data as number[]) : undefined;

      let position: { x: number; y: number } | undefined;
      if (typeof payload.x === "number" && typeof payload.y === "number") {
        position = { x: payload.x, y: payload.y };
      } else if (data && "x" in data && typeof data.x === "number" && "y" in data && typeof data.y === "number") {
        position = { x: data.x, y: data.y };
      }

      let unitId: string | number | undefined;
      if (data && "unitIds" in data && Array.isArray(data.unitIds) && data.unitIds.length > 0) {
        unitId = data.unitIds[0];
      } else if (data && "unitId" in data) {
        unitId = data.unitId as string | number;
      } else if (Array.isArray(payload?.unit_ids) && payload.unit_ids.length > 0) {
        unitId = payload.unit_ids[0] as string | number;
      }

      const unitTypeId = (data && "unitTypeId" in data)
        ? pickNumber(data.unitTypeId)
        : pickNumber(payload?.unit_id);

      let buildingTypeId = (data && "buildingTypeId" in data)
        ? pickNumber(data.buildingTypeId)
        : undefined;

      // Handle Polish Folwark (replaces Mill)
      const buildingName = getBuildingName(buildingTypeId);
      if (civId === 38 && buildingName.includes("Mill")) {
        buildingTypeId = 1711;
      }

      const techId = pickNumber(payload?.technology_type);

      // Expand wall commands into per-tile events
      if (actionType === "Wall" && data && "tiles" in data) {
        const wall = data as { tiles: { x: number; y: number }[]; buildingTypeId: number };
        wall.tiles.forEach((tile, tileIdx) => {
          const tileId = `${actionType}-${playerId}-${index}-${tileIdx}`;
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
            buildingTypeId: wall.buildingTypeId,
            techId,
            raw: { ...(payload ?? {}), ...data },
          });
        });
        return;
      }

      // Expand horizontal/vertical gate foundations into 4 discrete tiles
      const horizontalGateFoundations = [800, 665, 666];
      const verticalGateFoundations = [804, 673, 674];

      if (actionType === "Build" && position && buildingTypeId && (horizontalGateFoundations.includes(buildingTypeId) || verticalGateFoundations.includes(buildingTypeId))) {
        const isHorizontal = horizontalGateFoundations.includes(buildingTypeId);
        const offsets = isHorizontal
          ? [[-2, -1], [-1, 0], [0, 1], [1, 2]]
          : [[-2, 1], [-1, 0], [0, -1], [1, -2]];

        offsets.forEach(([dx, dy], tileIdx) => {
          events.push({
            id: `${actionType}-${playerId}-${index}-${tileIdx}`,
            time,
            playerId,
            type: actionType,
            category,
            x: position!.x + dx,
            y: position!.y + dy,
            unitId,
            unitTypeId,
            buildingTypeId,
            techId,
            raw: { ...(payload ?? {}), ...data, gateTileIdx: tileIdx },
          });
        });
        return;
      }

      const id = `${actionType}-${playerId}-${index}`;
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
        buildingTypeId,
        techId,
        raw: { ...(payload ?? {}), ...data },
      });
    });
  }

  return {
    events: events.sort((a, b) => a.time - b.time),
    mapResources,
  };
};

export const summarizePlayers = (
  summary: any,
  replay?: any
): PlayerSummary[] => {
  const players: PlayerSummary[] = [];

  const summaryTeams = summary?.teams ?? [];
  summaryTeams.forEach((team: any, teamIndex: number) => {
    (team?.players ?? []).forEach((p: any) => {
      players.push({
        id: p.player_number,
        ai: p.player_type === 4,
        name: p.name,
        colorId: p.color_id,
        civId: p.civ_id,
        teamId: teamIndex + 1,
        won: team.winner,
      });
    });
  });

  const source = replay || summary;
  const gameSettings = source?.zheader?.game_settings || source?.header?.game_settings || source?.game_settings;

  if (gameSettings?.players) {
    gameSettings.players.forEach((p: any) => {
      let player = players.find(sp => sp.id === p.player_number);
      if (!player) {
        player = {
          id: p.player_number,
          teamId: p.resolved_team_id ?? p.selected_team_id,
          ai: p.player_type === 4,
          name: p.name,
        };
        players.push(player);
      }

      const aiName = p.ai_name;
      const displayName = aiName && aiName.length > 0 ? aiName : (player.name && player.name.length > 0 ? player.name : `Player ${p.player_number}`);

      player.name = displayName;
      player.handicap = p.handicap;
    });
  }

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

      if (event.category === "market") {
        const resourceId = pickNumber(event.raw?.resourceId);
        const amount = (pickNumber(event.raw?.amount) ?? 0) * 100;

        const resourceMap: Record<number, keyof MarketUsage["bought"]> = {
          0: "food",
          1: "wood",
          2: "stone",
        };
        const resource = resourceId !== undefined ? resourceMap[resourceId] : undefined;
        if (resource && amount > 0) {
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
      ? rawSummaryDuration / 1000
      : undefined;
  if (!events.length) return 0;
  const lastEventTime = events[events.length - 1]?.time ?? 0;
  if (summaryDuration === undefined) return lastEventTime;
  if (summaryDuration > lastEventTime * 1.2) {
    return lastEventTime;
  }
  return summaryDuration;
};

export type MatchInfo = {
  mapTypeId?: number;
  mapSizeId?: number;
  gameTypeId?: number;
  difficultyId?: number;
  difficultyName?: string;
  populationLimit?: number;
  victoryTypeId?: number;
  cheats: boolean;
  filename?: string;
  sourceUrl?: string;
};

export const extractMatchInfo = (source: any, filename?: string, sourceUrl?: string): MatchInfo => {
  const settings = source?.zheader?.game_settings || source?.header?.game_settings || source?.game_settings;
  const replayData = source?.header?.replay || source?.replay;

  const difficultyId = pickNumber(settings?.difficulty);
  const difficultyName = typeof settings?.difficulty === "string" ? settings.difficulty : undefined;

  return {
    mapTypeId: pickNumber(settings?.resolved_map_id) ?? pickNumber(settings?.selected_map_id) ?? pickNumber(replayData?.map_id),
    mapSizeId: pickNumber(settings?.map_size) ?? pickNumber(replayData?.map_size),
    gameTypeId: pickNumber(settings?.game_type),
    difficultyId,
    difficultyName,
    populationLimit: pickNumber(settings?.population_limit),
    victoryTypeId: pickNumber(settings?.victory_type_id),
    cheats: settings?.cheats,
    filename,
    sourceUrl,
  };
};
