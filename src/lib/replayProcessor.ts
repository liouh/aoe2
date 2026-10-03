export type TimelineEventCategory = "build" | "move" | "research" | "train" | "autoscout" | "market" | "gatherpoint" | "flare" | "other";

export type TimelineEvent = {
  id: string;
  time: number;
  playerId?: number;
  type: string;
  category: TimelineEventCategory;
  x?: number;
  y?: number;
  unitId?: string | number;
  unitIds?: number[];
  unitTypeId?: number;
  buildingTypeId?: number;
  techId?: number;
  raw: Record<string, unknown>;
};

export type MapResourceType = "gold" | "stone" | "forage" | "relic" | "wood";

export type ChatEvent = {
  id: string;
  time: number;
  playerId?: number;
  playerName?: string;
  teamId?: number;
  isAi: boolean;
  message: string;
  rawMessage: string;
  tauntNumber?: number;
  channel?: number;
  scope?: "all" | "team" | "direct";
  recipientPlayerId?: number;
  recipientName?: string;
  isSystem: boolean;
  raw: Record<string, unknown>;
};

import {
  getEntity,
  getEntityName,
  getBuildingName,
  getUnitName,
  isEconomic,
  getBuildingFootprint,
  isBuildingId,
} from "./entityMappings";
import { CHEAT_ID_TO_NAME, getCheatName } from "./gameMappings";
export { CHEAT_ID_TO_NAME, getCheatName };

import { DEBUG } from "./debug";

export const normalizeReplay = (rec: any): any => {
  if (!rec || typeof rec !== "object") return rec;
  const chapters = Array.isArray(rec.chapters) ? rec.chapters : undefined;
  const zheader = rec.zheader ?? chapters?.[0]?.zheader;
  const operations = rec.operations ?? chapters?.flatMap((c: any) => c.operations ?? []) ?? [];
  const meta = rec.meta ?? operations.find((op: any) => op && typeof op === "object" && "Pregame" in op)?.Pregame;
  let postgame = rec.postgame;
  if (!postgame && operations.length > 0) {
    for (let i = operations.length - 1; i >= Math.max(0, operations.length - 50); i--) {
      if (operations[i]?.PostGame) {
        postgame = operations[i].PostGame;
        break;
      }
    }
  }
  return {
    ...rec,
    zheader,
    operations,
    meta,
    postgame,
  };
};

export type PlayerSummary = {
  id: number;
  slotId?: number;
  ai: boolean;
  name: string;
  colorId?: number;
  civId?: number;
  teamId?: number;
  won?: boolean;
  handicap?: number;
  elo?: number;
  rank?: number;
  teamElo?: number;
  teamRank?: number;
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
  opening?: string;
};

const classifyEvent = (type: string, isAi?: boolean): TimelineEventCategory => {
  switch (type) {
    case "Research":
      return "research";
    case "AiQueue":
    case "DeQueue":
      return "train";
    case "Build":
    case "Wall":
      return "build";
    case "Gatherpoint":
    case "MultiGatherpoint":
    case "Unknown45":
      return "gatherpoint";
    case "AiMove":
    case "Move":
    case "AiInteract":
    case "Interact":
    case "AttackGround":
    case "DeAttackMove":
    case "Patrol":
      return "move";
    case "Autoscout":
      return "autoscout";
    case "Buy":
    case "Sell":
      return "market";
    case "Flare":
      return "flare";
  }
  return "other";
};

const pickNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

// Structs from https://github.com/aoe2ct/aoe2rec/blob/main/patterns/aoe2operations.hexpat
const parseActionData = (type: string, data: number[] | Uint8Array) => {
  const bytes = data instanceof Uint8Array ? data : Uint8Array.from(data);
  if (bytes.length === 0) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const extractUnitIds = (selected: number, minOffset: number) => {
    if (selected <= 0) return undefined;
    const offset = bytes.length - selected * 4;
    if (offset < minOffset) return undefined;
    const unitIds: number[] = [];
    for (let i = 0; i < selected; i++) {
      unitIds.push(view.getUint32(offset + i * 4, true));
    }
    return unitIds;
  };

  try {
    switch (type) {
      case "Interact":
      case "Move": {
        if (bytes.length < 20) return undefined;
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        const selected = view.getInt16(12, true);
        return { x, y, unitIds: extractUnitIds(selected, 20) };
      }
      case "Stop": {
        if (bytes.length < 4) return undefined;
        const selected = view.getUint32(0, true);
        return { unitIds: extractUnitIds(selected, 4) };
      }
      case "Stance":
      case "Guard":
      case "Follow":
      case "Formation": {
        if (bytes.length < 8) return undefined;
        const selected = view.getUint32(0, true);
        return { unitIds: extractUnitIds(selected, 8) };
      }
      case "Repair": {
        if (bytes.length < 12) return undefined;
        const selected = view.getUint32(0, true);
        return { unitIds: extractUnitIds(selected, 12) };
      }
      case "Ungarrison":
      case "Release": {
        if (bytes.length < 16) return undefined;
        const selected = view.getUint32(0, true);
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        return { x, y, unitIds: extractUnitIds(selected, 16) };
      }
      case "Order": {
        if (bytes.length < 29) return undefined;
        const selected = view.getUint32(0, true);
        const x = view.getFloat32(8, true);
        const y = view.getFloat32(12, true);
        return { x, y, unitIds: extractUnitIds(selected, 29) };
      }
      case "Gatherpoint": {
        if (bytes.length < 21) return undefined;
        const selected = view.getUint32(0, true);
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        return { x, y, unitIds: extractUnitIds(selected, 21) };
      }
      case "Multiqueue": {
        if (bytes.length < 4) return undefined;
        const selected = view.getUint8(2);
        return { unitIds: extractUnitIds(selected, 4) };
      }
      case "AiInteract": {
        if (bytes.length < 20) return undefined;
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        const selected = view.getInt32(12, true);
        return { x, y, unitIds: extractUnitIds(selected, 20) };
      }
      case "Unknown44": {
        if (bytes.length < 21) return undefined;
        const selected = view.getUint32(0, true);
        const x = view.getFloat32(8, true);
        const y = view.getFloat32(12, true);
        return { x, y, unitIds: extractUnitIds(selected, 21) };
      }
      case "MultiGatherpoint":
      case "Unknown45": {
        if (bytes.length < 20) return undefined;
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        const selected = view.getUint16(12, true);
        return { x, y, unitIds: extractUnitIds(selected, 20) };
      }
      case "AiMove": {
        if (bytes.length < 40) return undefined;
        const selected = view.getInt32(0, true);
        const x = view.getFloat32(20, true);
        const y = view.getFloat32(24, true);

        let unitIds: number[] | undefined = undefined;
        if (selected === 1) {
          const entityId = view.getUint32(4, true);
          if (entityId > 0) unitIds = [entityId];
        } else if (selected > 1) {
          unitIds = extractUnitIds(selected, 40);
        }
        return { x, y, unitIds };
      }
      case "Patrol":
      case "DeAttackMove": {
        if (bytes.length < 88) return undefined;
        const selected = view.getUint32(0, true);
        const x = view.getFloat32(8, true);
        const y = view.getFloat32(48, true);
        return { x, y, unitIds: extractUnitIds(selected, 88) };
      }
      case "Build": {
        if (bytes.length < 28) return undefined;
        const selected = view.getInt32(0, true);
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        const buildingTypeId = view.getUint32(12, true);
        return { x, y, buildingTypeId, unitIds: extractUnitIds(selected, 28) };
      }
      case "Wall": {
        if (bytes.length < 24) return undefined;
        const selected = view.getInt32(0, true);
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
        return { tiles, buildingTypeId, unitIds: extractUnitIds(selected, 24) };
      }
      case "Research": {
        return {};  // handled by parser
      }
      case "DeQueue": {
        if (bytes.length < 12) return undefined;
        const selected = view.getUint16(0, true);
        return { unitIds: extractUnitIds(selected, 12) };
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
        const selected = view.getInt32(0, true);
        const x = view.getFloat32(4, true);
        const y = view.getFloat32(8, true);
        return { x, y, unitIds: extractUnitIds(selected, 16) };
      }
      case "Flare": {
        if (bytes.length < 12) return undefined;
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

export const buildPlayerMapping = (
  _operations: Record<string, unknown>[],
  players: PlayerSummary[]
): Map<number, number> => {
  const isSharedControl = (() => {
    const slots = players.map((p) => p.slotId).filter((s): s is number => s !== undefined);
    return new Set(slots).size < slots.length;
  })();

  const potentialIds = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8]);
  players.forEach((p) => {
    potentialIds.add(p.id);
    if (p.slotId !== undefined) potentialIds.add(p.slotId);
  });

  const playerMapping = new Map<number, number>();
  for (const eid of potentialIds) {
    const player = isSharedControl
      ? (players.find((p) => p.id === eid) ?? players.find((p) => (p.slotId ?? p.id) === eid))
      : (players.find((p) => (p.slotId ?? p.id) === eid) ?? players.find((p) => p.id === eid));
    playerMapping.set(eid, player ? player.id : eid);
  }

  return playerMapping;
};

export const summarizePlayers = (
  replayOrSummary?: any,
  legacyReplay?: any
): PlayerSummary[] => {
  const normReplay = normalizeReplay(
    replayOrSummary?.operations || replayOrSummary?.chapters || replayOrSummary?.zheader
      ? replayOrSummary
      : legacyReplay
  );
  const summary = replayOrSummary?.teams ? replayOrSummary : legacyReplay?.teams ? legacyReplay : undefined;
  const players: PlayerSummary[] = [];

  const postGameOp = normReplay?.postgame ?? (() => {
    const ops = normReplay?.operations;
    if (!ops || !Array.isArray(ops)) return undefined;
    for (let i = ops.length - 1; i >= Math.max(0, ops.length - 50); i--) {
      if (ops[i]?.PostGame) return ops[i].PostGame;
    }
    return undefined;
  })();
  const leaderboardsBlock = postGameOp?.blocks?.find((b: any) => b?.Leaderboards)?.Leaderboards;
  const leaderboards = leaderboardsBlock?.leaderboards || [];
  const rm1v1Lb = leaderboards.find((l: any) => l.id === 3);
  const teamRmLb = leaderboards.find((l: any) => l.id === 4);
  const eloMap = new Map<number, { elo?: number; rank?: number; teamElo?: number; teamRank?: number }>();
  if (rm1v1Lb?.players) {
    rm1v1Lb.players.forEach((p: any) => {
      const existing = eloMap.get(p.player_number) || {};
      eloMap.set(p.player_number, {
        ...existing,
        elo: typeof p.elo === "number" && p.elo > 0 ? p.elo : undefined,
        rank: typeof p.rank === "number" && p.rank > 0 ? p.rank : undefined,
      });
    });
  }
  if (teamRmLb?.players) {
    teamRmLb.players.forEach((p: any) => {
      const existing = eloMap.get(p.player_number) || {};
      eloMap.set(p.player_number, {
        ...existing,
        teamElo: typeof p.elo === "number" && p.elo > 0 ? p.elo : undefined,
        teamRank: typeof p.rank === "number" && p.rank > 0 ? p.rank : undefined,
      });
    });
  }

  const operations = Array.isArray(normReplay?.operations)
    ? (normReplay.operations as Record<string, unknown>[])
    : null;

  const summaryTeams = summary?.teams ?? [];
  let playerCounter = 1;
  summaryTeams.forEach((team: any, teamIndex: number) => {
    (team?.players ?? []).forEach((p: any) => {
      const eloInfo = eloMap.get(p.player_number - 1);
      players.push({
        id: playerCounter++,
        slotId: p.player_number,
        ai: p.player_type === 4,
        name: p.name,
        colorId: p.color_id,
        civId: p.civ_id,
        teamId: teamIndex + 1,
        won: team.winner,
        elo: eloInfo?.elo,
        rank: eloInfo?.rank,
        teamElo: eloInfo?.teamElo,
        teamRank: eloInfo?.teamRank,
      });
    });
  });

  const source = normReplay || summary;
  const gameSettings = source?.zheader?.game_settings || source?.header?.game_settings || source?.game_settings;

  const gsTeamMap = new Map<string, number>();
  if (gameSettings?.players) {
    const rawKeys: string[] = [];
    gameSettings.players.forEach((p: any, idx: number) => {
      let key: string;
      if (typeof p.resolved_team_id === "number" && p.resolved_team_id > 1) {
        key = `team_${p.resolved_team_id}`;
      } else if (typeof p.selected_team_id === "number" && p.selected_team_id >= 1 && p.selected_team_id <= 4) {
        key = `team_${p.selected_team_id}`;
      } else {
        key = `solo_${p.player_number ?? idx + 1}`;
      }
      if (!rawKeys.includes(key)) {
        rawKeys.push(key);
      }
    });
    rawKeys.forEach((key, i) => {
      gsTeamMap.set(key, i + 1);
    });
  }

  if (gameSettings?.players) {
    const matchedPlayers = new Set<PlayerSummary>();
    gameSettings.players.forEach((p: any, idx: number) => {
      let player = players.find(sp => !matchedPlayers.has(sp) && (sp.slotId ?? sp.id) === p.player_number && (sp.name === p.name || !sp.name))
        ?? players.find(sp => !matchedPlayers.has(sp) && (sp.slotId ?? sp.id) === p.player_number);

      const gsPlayerKey = typeof p.resolved_team_id === "number" && p.resolved_team_id > 1
        ? `team_${p.resolved_team_id}`
        : (typeof p.selected_team_id === "number" && p.selected_team_id >= 1 && p.selected_team_id <= 4)
        ? `team_${p.selected_team_id}`
        : `solo_${p.player_number ?? idx + 1}`;
      const defaultTeamId = gsTeamMap.get(gsPlayerKey) ?? 1;

      const eloInfo = eloMap.get(p.player_number - 1);
      if (!player) {
        const basePlayer = players.find(sp => (sp.slotId ?? sp.id) === p.player_number);
        player = {
          id: playerCounter++,
          slotId: p.player_number,
          colorId: p.color_id ?? basePlayer?.colorId,
          civId: p.civ_id ?? basePlayer?.civId,
          teamId: basePlayer?.teamId ?? defaultTeamId,
          ai: p.player_type === 4,
          name: p.name,
          elo: eloInfo?.elo,
          rank: eloInfo?.rank,
          teamElo: eloInfo?.teamElo,
          teamRank: eloInfo?.teamRank,
        };
        players.push(player);
      } else if (player.teamId === undefined) {
        player.teamId = defaultTeamId;
      }
      matchedPlayers.add(player);

      if (p.color_id !== undefined && player.colorId === undefined) {
        player.colorId = p.color_id;
      }
      if (p.civ_id !== undefined && player.civId === undefined) {
        player.civId = p.civ_id;
      }
      if (eloInfo?.elo && player.elo === undefined) {
        player.elo = eloInfo.elo;
      }
      if (eloInfo?.rank && player.rank === undefined) {
        player.rank = eloInfo.rank;
      }
      if (eloInfo?.teamElo && player.teamElo === undefined) {
        player.teamElo = eloInfo.teamElo;
      }
      if (eloInfo?.teamRank && player.teamRank === undefined) {
        player.teamRank = eloInfo.teamRank;
      }

      const aiName = p.ai_name;
      const displayName = aiName && aiName.length > 0 ? aiName : (p.name && p.name.length > 0 ? p.name : (player.name && player.name.length > 0 ? player.name : `Player ${p.player_number}`));

      player.name = displayName;
      player.handicap = p.handicap;
    });
  }

  // Fast scan for resign actions from operations with their earliest timestamp
  const resignTimeByPlayerId = new Map<number, number>();
  if (operations && players.length > 0) {
    const playerMapping = buildPlayerMapping(operations, players);
    const len = operations.length;
    for (let i = 0; i < len; i++) {
      const action = (operations[i] as any).Action;
      if (!action) continue;
      const ad = action.action_data;
      if (!ad) continue;
      const resign = ad.Resign;
      if (resign && typeof resign.player_id === "number" && resign.player_id > 0) {
        const mappedPid = playerMapping.get(resign.player_id) ?? resign.player_id;
        if (!resignTimeByPlayerId.has(mappedPid)) {
          resignTimeByPlayerId.set(mappedPid, action.world_time ?? 0);
        }
      }
    }
  }

  // Derive won flag from resignations if not already populated or if all teams were marked defeated
  if (players.length > 0 && (players.some((p) => p.won === undefined) || players.every((p) => !p.won))) {
    const teamMembers = new Map<number, PlayerSummary[]>();
    players.forEach((p) => {
      const tid = p.teamId ?? 1;
      const list = teamMembers.get(tid) || [];
      list.push(p);
      teamMembers.set(tid, list);
    });

    const hasAnyResigns = resignTimeByPlayerId.size > 0;
    if (!hasAnyResigns) {
      players.forEach((p) => {
        if (p.won === undefined) p.won = true;
      });
    } else {
      // Calculate each team's resignation time (when all members of that team resigned)
      // Surviving teams get Infinity.
      const teamResignTime = new Map<number, number>();
      let maxResignTime = -1;
      let winningTeamId: number | null = null;
      let hasSurvivingTeam = false;

      teamMembers.forEach((members, tid) => {
        const allResigned = members.length > 0 && members.every((m) => resignTimeByPlayerId.has(m.id));
        if (allResigned) {
          const teamTime = Math.max(...members.map((m) => resignTimeByPlayerId.get(m.id) ?? 0));
          teamResignTime.set(tid, teamTime);
          if (teamTime > maxResignTime) {
            maxResignTime = teamTime;
            winningTeamId = tid;
          }
        } else {
          hasSurvivingTeam = true;
          teamResignTime.set(tid, Infinity);
        }
      });

      players.forEach((p) => {
        const tid = p.teamId ?? 1;
        const time = teamResignTime.get(tid) ?? Infinity;
        if (hasSurvivingTeam) {
          p.won = time === Infinity;
        } else {
          p.won = tid === winningTeamId;
        }
      });
    }
  }

  players.sort((a, b) => {
    const teamA = a.teamId ?? 1;
    const teamB = b.teamId ?? 1;
    if (teamA !== teamB) return teamA - teamB;

    const slotA = a.slotId ?? a.id;
    const slotB = b.slotId ?? b.id;
    if (slotA !== slotB) return slotA - slotB;
    return a.id - b.id;
  });

  return players;
};

export const AGE_PATTERNS: Array<{
  age: "Feudal" | "Castle" | "Imperial";
  pattern: RegExp;
}> = [
    {
      age: "Feudal",
      pattern: /feudal|f[eé]odal|феодальн|封建|領主|봉건|phong ki[eế]n|सामंती/i,
    },
    {
      age: "Castle",
      pattern: /castle|ritterzeit|castillos|ch[aâ]teaux|castelli|castelos|zamk|замк|城堡|城主|성주|kale|l[aâ]u đ[aà]i|महल/i,
    },
    {
      age: "Imperial",
      pattern: /imperial|imp[eé]rial|imperiale|имперск|帝王|왕정|imparatorluk|đ[eế] qu[oố]c|शाही/i,
    },
  ];

export const detectAgeAdvance = (
  rawMessage?: string,
  formattedMessage?: string,
  playerName?: string
): "Feudal" | "Castle" | "Imperial" | null => {
  // Prefer rawMessage since in DE replays it contains <player_id, X> instead of the actual player username
  let text = (rawMessage || formattedMessage || "").trim();

  // Strip player_id tags e.g. <player_id, 1> or @<player_id, 1>
  text = text.replace(/@?<player_id,\s*\d+[^>]*>/gi, "").trim();

  // If playerName is provided and message still has it at the start (e.g. "@Player " or "Player: "), strip it
  if (playerName) {
    const escapedName = playerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`^@?${escapedName}\\s*[:\\-]?\\s*`, "i"), "").trim();
  }

  // Remove leading "@" or ":" that might remain
  text = text.replace(/^[@:]\s*/, "").trim();

  for (const group of AGE_PATTERNS) {
    if (group.pattern.test(text)) {
      return group.age;
    }
  }

  return null;
};

const NINJALUI_SEQUENCE = Array.from({ length: 40 }, (_, i) => [102, 101, 103, 104][i % 4]);

export const extractChatEvents = (
  replay: unknown,
  summary?: any,
  providedPlayers?: PlayerSummary[],
  providedPlayerMapping?: Map<number, number>
): ChatEvent[] => {
  if (!replay) return [];
  const replayRecord = normalizeReplay(replay) as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  if (!operations) return [];

  const players = providedPlayers ?? summarizePlayers(summary, replayRecord);
  const playerById = new Map<number, PlayerSummary>(players.map((p) => [p.id, p]));
  const playerBySlotId = new Map<number, PlayerSummary>();
  players.forEach((p) => {
    if (p.slotId !== undefined && !playerBySlotId.has(p.slotId)) playerBySlotId.set(p.slotId, p);
  });
  const playerMapping = providedPlayerMapping ?? buildPlayerMapping(operations, players);
  const isTeamGame = players.length > 2 || (() => {
    const teamCounts = new Map<number, number>();
    players.forEach((p) => {
      if (p.teamId !== undefined && p.teamId > 0) {
        teamCounts.set(p.teamId, (teamCounts.get(p.teamId) || 0) + 1);
      }
    });
    return Array.from(teamCounts.values()).some((count) => count > 1);
  })();

  const chatEvents: ChatEvent[] = [];
  const resignedPlayerIds = new Set<number>();
  const consumedCheatOpIndices = new Set<number>();
  let currentTime = 0;

  operations.forEach((op, index) => {
    const action = op.Action as Record<string, unknown> | undefined;
    if (action?.world_time !== undefined) {
      currentTime = (pickNumber(action.world_time) ?? 0) / 1000;
    }

    if (consumedCheatOpIndices.has(index)) {
      return;
    }

    const actionData = action?.action_data as Record<string, unknown> | undefined;
    if (actionData?.Resign) {
      const resignData = actionData.Resign as Record<string, unknown>;
      const rawPid = pickNumber(resignData?.player_id);
      const pid = rawPid !== undefined ? (playerMapping.get(rawPid) ?? rawPid) : undefined;
      if (pid !== undefined && !resignedPlayerIds.has(pid)) {
        resignedPlayerIds.add(pid);
        const resignedPlayer = playerById.get(pid);
        const playerName = resignedPlayer?.name || `Player ${pid}`;

        chatEvents.push({
          id: `chat-resign-${index}`,
          time: Math.round(currentTime * 10) / 10,
          playerId: pid,
          playerName,
          teamId: resignedPlayer?.teamId,
          isAi: !!resignedPlayer?.ai,
          message: `${playerName} resigned.`,
          rawMessage: `${playerName} resigned.`,
          isSystem: true,
          raw: { ...resignData, type: "Resign" },
        });
      }
      return;
    }

    if (actionData?.Game) {
      const gameData = actionData.Game as Record<string, unknown>;
      const gameCommand = gameData?.game_command as Record<string, unknown> | undefined;
      if (gameCommand?.Cheat) {
        const cheatData = gameCommand.Cheat as Record<string, unknown>;
        const cheatId = pickNumber(cheatData?.cheat_id);
        if (cheatId !== undefined) {
          const rawPid = pickNumber(gameData?.player_id);
          const pid = rawPid !== undefined ? (playerMapping.get(rawPid) ?? rawPid) : undefined;
          const cheatPlayer = pid !== undefined ? playerById.get(pid) : undefined;
          const playerName = cheatPlayer?.name || (pid !== undefined ? `Player ${pid}` : "Unknown Player");

          let cheatName = getCheatName(cheatId);

          // "ninjaconnor", "ninjalui", and "rowshep" cheat codes expand into sequential calls of:
          // 102 ("cheese steak jimmy's"), 101 ("lumberjack"), 103 ("robin hood"), 104 ("rock on") repeated 10x in quick succession.
          if (cheatId === NINJALUI_SEQUENCE[0]) {
            const matchedIndices: number[] = [];
            let expectedIdx = 1;
            for (let j = index + 1; j < operations.length && expectedIdx < NINJALUI_SEQUENCE.length; j++) {
              const nextAction = operations[j]?.Action as Record<string, unknown> | undefined;
              if (!nextAction) continue;
              const nextTime = (pickNumber(nextAction.world_time) ?? (currentTime * 1000)) / 1000;
              if (nextTime - currentTime > 2) break;
              const nextGameData = (nextAction.action_data as Record<string, unknown> | undefined)?.Game as Record<string, unknown> | undefined;
              const nextGameCmd = nextGameData?.game_command as Record<string, unknown> | undefined;
              const nextCheat = nextGameCmd?.Cheat as Record<string, unknown> | undefined;
              if (!nextCheat) continue;
              const nextRawPid = pickNumber(nextGameData?.player_id);
              const nextPid = nextRawPid !== undefined ? (playerMapping.get(nextRawPid) ?? nextRawPid) : undefined;
              if (nextPid !== pid) continue;
              if (pickNumber(nextCheat.cheat_id) === NINJALUI_SEQUENCE[expectedIdx]) {
                matchedIndices.push(j);
                expectedIdx++;
              } else {
                break;
              }
            }
            if (expectedIdx === NINJALUI_SEQUENCE.length) {
              matchedIndices.forEach((idx) => consumedCheatOpIndices.add(idx));
              cheatName = "ninjaconnor / ninjalui / rowshep";
            }
          }

          chatEvents.push({
            id: `chat-cheat-${index}`,
            time: Math.round(currentTime * 10) / 10,
            playerId: pid,
            playerName,
            teamId: cheatPlayer?.teamId,
            isAi: !!cheatPlayer?.ai,
            message: `${playerName} used a cheat: ${cheatName}`,
            rawMessage: `${playerName} used a cheat: ${cheatName}`,
            isSystem: true,
            raw: cheatName === "ninjaconnor / ninjalui / rowshep"
              ? { type: "Cheat", cheatName }
              : { ...cheatData, type: "Cheat", cheatName },
          });
        }
      }
      return;
    }

    const chatOp = op.Chat as { padding?: number[]; text?: string } | undefined;
    if (!chatOp || typeof chatOp.text !== "string") return;

    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(chatOp.text);
    } catch {
      payload = { message: chatOp.text };
    }

    const rawPlayerId = pickNumber(payload.player);
    const playerId = rawPlayerId !== undefined ? (playerMapping.get(rawPlayerId) ?? rawPlayerId) : undefined;
    const player = playerId !== undefined ? playerById.get(playerId) : undefined;
    const rawMessage = typeof payload.message === "string" ? payload.message : (chatOp.text ?? "");
    const tauntNumber = pickNumber(payload.tauntNumber);
    const channel = pickNumber(payload.channel);
    const tagMatch = rawMessage.match(/<player_id,\s*(\d+)[^>]*>/i);
    const tagPlayerId = tagMatch ? pickNumber(parseInt(tagMatch[1], 10)) : undefined;
    const tagPlayer = tagPlayerId !== undefined ? (playerBySlotId.get(tagPlayerId) ?? playerById.get(tagPlayerId)) : undefined;
    const resolvedPlayerId = (playerId !== undefined && playerId !== 0)
      ? playerId
      : tagPlayer?.id ?? tagPlayerId;
    const resolvedPlayer = resolvedPlayerId !== undefined ? playerById.get(resolvedPlayerId) : player;

    const hasPlayerIdTag = tagMatch !== null;
    const isCandidateSystem = hasPlayerIdTag || playerId === 0 || playerId === undefined;
    const detectedAge = isCandidateSystem ? detectAgeAdvance(rawMessage, undefined, resolvedPlayer?.name) : null;
    const isAgeAdvance = detectedAge !== null;
    const isSystem = hasPlayerIdTag || isAgeAdvance || playerId === 0 || playerId === undefined;

    // In DE replays, empty messageAGP indicates internal engine triggers or pre-game lobby packets
    if (payload.messageAGP === "" && isSystem) {
      return;
    }

    // When DEBUG is false, hide lobby chats
    if (!DEBUG && currentTime === 0) {
      return;
    }

    let formattedMessage = rawMessage.replace(/<player_id,\s*(\d+)[^>]*>/gi, (_, pidStr) => {
      const targetPid = parseInt(pidStr, 10);
      const targetPlayer = players.find((p) => (p.slotId ?? p.id) === targetPid);
      return targetPlayer?.name || `Player ${targetPid}`;
    });

    const isAi = !!resolvedPlayer?.ai;

    if (isAi || /No resources to build:\s*\d+/i.test(formattedMessage)) {
      formattedMessage = formattedMessage.replace(/No resources to build:\s*(\d+)/gi, (match, idStr) => {
        const buildingId = parseInt(idStr, 10);
        const name = getBuildingName(buildingId);
        return name && name !== "Unknown Building" ? `${match} (${name})` : match;
      });
    }

    const rawDestMap = pickNumber(payload.destinationMap);

    // Drop all spectator broadcast / spectator chats (destinationMap: 1)
    if (rawDestMap === 1) {
      return;
    }

    let scope: "all" | "team" | "direct" | undefined = undefined;
    let recipientPlayerId: number | undefined = undefined;
    let recipientName: string | undefined = undefined;

    if (!isSystem) {
      if (!isTeamGame || channel === 1) {
        scope = "all";
      } else if (rawDestMap !== undefined) {
        const recipientPlayers = players.filter((p) => (rawDestMap & (1 << (p.id + 1))) !== 0);
        if (recipientPlayers.length >= players.length || (rawDestMap & 1020) === 1020) {
          scope = "all";
        } else {
          const otherRecipients = recipientPlayers.filter((p) => p.id !== resolvedPlayerId);
          if (otherRecipients.length === 1) {
            const recipient = otherRecipients[0];
            const isTeammate =
              resolvedPlayer?.teamId !== undefined &&
              resolvedPlayer.teamId > 0 &&
              recipient.teamId !== undefined &&
              recipient.teamId > 0 &&
              recipient.teamId === resolvedPlayer.teamId;
            const senderTeammates = players.filter(
              (p) => p.id !== resolvedPlayerId && p.teamId !== undefined && p.teamId > 0 && p.teamId === resolvedPlayer?.teamId
            );

            // Direct message if sent to an opponent/non-teammate, or singled out from multiple teammates
            if (!isTeammate || senderTeammates.length > 1) {
              scope = "direct";
              recipientPlayerId = recipient.id;
              recipientName = recipient.name;
            } else {
              scope = "team";
            }
          } else {
            scope = "team";
          }
        }
      } else {
        scope = "team";
      }
    }

    chatEvents.push({
      id: `chat-${index}`,
      time: Math.round(currentTime * 10) / 10,
      playerId: resolvedPlayerId,
      playerName: resolvedPlayer?.name,
      teamId: resolvedPlayer?.teamId,
      isAi,
      message: formattedMessage,
      rawMessage,
      tauntNumber: tauntNumber !== undefined && tauntNumber > 0 ? tauntNumber : undefined,
      channel,
      scope,
      recipientPlayerId,
      recipientName,
      isSystem,
      raw: { ...payload, padding: chatOp.padding },
    });
  });

  return chatEvents.sort((a, b) => a.time - b.time);
};

export type TimelineResult = {
  events: TimelineEvent[];
  mapResources: Record<string, MapResourceType>;
  mapCliffs: Record<string, boolean>;
  chatEvents: ChatEvent[];
  players?: PlayerSummary[];
};

export const buildTimeline = (
  replay: unknown,
  summary?: any
): TimelineResult => {
  if (!replay) return { events: [], mapResources: {}, mapCliffs: {}, chatEvents: [] };
  const replayRecord = normalizeReplay(replay) as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  const events: TimelineEvent[] = [];
  const players = summarizePlayers(replayRecord, summary);
  const playerById = new Map<number, PlayerSummary>(players.map((p) => [p.id, p]));
  const playerMapping = buildPlayerMapping(operations ?? [], players);
  const chatEvents = extractChatEvents(replayRecord, summary, players, playerMapping);

  // Process initial object instances if available
  const zheader = replayRecord.zheader as any;
  const initialMap = zheader?.initial;
  // Account for both Map and plain object access
  const initialInstances = (typeof initialMap?.get === "function"
    ? initialMap.get("initial_object_instances")
    : (initialMap as any)?.initial_object_instances) as any[];

  const mapResources: Record<string, MapResourceType> = {};
  const mapCliffs: Record<string, boolean> = {};

  if (initialInstances) {
    const gaiaCombinations: Record<string, number> = {};

    // Identify starting town centers to detect overlaps
    const startingTownCenters: { x: number; y: number; buildingTypeId: number }[] = [];
    initialInstances.forEach((obj) => {
      if (obj.player_id === 0) return;
      const isTC = getBuildingName(obj.object_type_id).includes("Town Center");
      if (isTC && obj.x !== undefined && obj.y !== undefined) {
        const alreadyAdded = startingTownCenters.some(
          (tc) => Math.abs(tc.x - obj.x) < 1 && Math.abs(tc.y - obj.y) < 1
        );
        if (!alreadyAdded) {
          startingTownCenters.push({
            x: obj.x,
            y: obj.y,
            buildingTypeId: obj.object_type_id,
          });
        }
      }
    });

    initialInstances.forEach((obj, idx) => {
      // Process Gaia (player 0) objects for analysis
      if (obj.player_id === 0) {
        const entity = getEntity(obj.object_type_id);
        const entityName = getEntityName(obj.object_type_id) ?? `Unknown (${obj.object_type_id})`;

        if (DEBUG) {
          const comboKey = `${entityName} (Type ${obj.object_type_id}, Kind ${obj.object_kind})`;
          gaiaCombinations[comboKey] = (gaiaCombinations[comboKey] || 0) + 1;
        }

        // Track resource locations
        if (entityName.includes("Gold Mine")) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "gold";
        } else if (entityName.includes("Stone Mine")) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "stone";
        } else if (entityName === "Relic") {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "relic";
        } else if (
          entityName.includes("Forage Bush") ||
          entityName.includes("Fruit Bush") ||
          entityName.includes("Pineapple Bush") ||
          entityName.includes("Papaya Tree")
        ) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "forage";
        } else if (
          entityName.toLowerCase().includes("tree") ||
          entityName.toLowerCase().includes("bush")
        ) {
          mapResources[`${Math.floor(obj.x)},${Math.floor(obj.y)}`] = "wood";
        } else if (
          (entity?.class === 1 || entity?.class === 6) &&
          obj.x !== undefined && obj.y !== undefined &&
          !entityName.toLowerCase().includes("blocker")
        ) {
          const footprint = getBuildingFootprint(obj.object_type_id);
          const w = footprint.w;
          const h = footprint.h;
          const startX = Math.floor(obj.x - w / 2);
          const startY = Math.floor(obj.y - h / 2);
          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              mapCliffs[`${startX + dx},${startY + dy}`] = true;
            }
          }
        } else if (
          isBuildingId(obj.object_type_id) &&
          obj.x !== undefined &&
          obj.y !== undefined
        ) {
          const footprint = getBuildingFootprint(obj.object_type_id);
          if (footprint && footprint.w > 0 && footprint.h > 0) {
            // Deduplicate: There are 4 pieces for the starting Town Center.
            // If we already added an event for this specific Town Center, skip the duplicates.
            const isTC = getBuildingName(obj.object_type_id).includes("Town Center");
            if (isTC && obj.object_type_id !== 109) return;

            events.push({
              id: `initial-gaia-${obj.object_id ?? idx}`,
              time: 0,
              playerId: 0,
              type: "Build",
              category: "build",
              x: obj.x,
              y: obj.y,
              buildingTypeId: obj.object_type_id,
              raw: { ...obj, isInitial: true, hideOnMinimap: false },
            });
          }
        }
        return;
      }

      const isBuilding = isBuildingId(obj.object_type_id);
      if (!isBuilding) {
        const initialPlayer = players.find((p) => (p.slotId ?? p.id) === obj.player_id);
        const entity = getEntity(obj.object_type_id);
        if (
          initialPlayer &&
          entity &&
          entity.type === 5 &&
          !entity.name.toLowerCase().includes("annex")
        ) {
          events.push({
            id: `initial-unit-${obj.object_id ?? idx}`,
            time: 0,
            playerId: initialPlayer.id,
            type: "Train",
            category: "train",
            unitTypeId: obj.object_type_id,
            raw: { ...obj, isInitial: true },
          });
        }
        return;
      }

      // Deduplicate: There are 4 pieces for the starting Town Center.
      // If we already added an event for this specific Town Center, skip the duplicates.
      const isTC = getBuildingName(obj.object_type_id).includes("Town Center");
      if (isTC && obj.object_type_id !== 109) return;

      // At game start, if there is a mule cart overlapping a town center, do not put the mule cart on the map
      const isMuleCart = obj.object_type_id === 1808 || getBuildingName(obj.object_type_id).includes("Mule Cart");
      let hideOnMinimap = false;
      if (isMuleCart && obj.x !== undefined && obj.y !== undefined) {
        const mcFootprint = getBuildingFootprint(obj.object_type_id);
        const mcAnchorX = Math.floor(obj.x);
        const mcAnchorY = Math.floor(obj.y);
        const mcBaseX = mcAnchorX - Math.floor(mcFootprint.w / 2);
        const mcBaseY = mcAnchorY - Math.floor(mcFootprint.h / 2);
        const mcMinX = mcBaseX;
        const mcMaxX = mcBaseX + mcFootprint.w;
        const mcMinY = mcBaseY;
        const mcMaxY = mcBaseY + mcFootprint.h;

        const overlapsTC = startingTownCenters.some((tc) => {
          const tcFootprint = getBuildingFootprint(tc.buildingTypeId);
          const tcAnchorX = Math.floor(tc.x);
          const tcAnchorY = Math.floor(tc.y);
          const tcBaseX = tcAnchorX - Math.floor(tcFootprint.w / 2);
          const tcBaseY = tcAnchorY - Math.floor(tcFootprint.h / 2);
          const tcMinX = tcBaseX;
          const tcMaxX = tcBaseX + tcFootprint.w;
          const tcMinY = tcBaseY;
          const tcMaxY = tcBaseY + tcFootprint.h;

          return (
            mcMinX < tcMaxX &&
            mcMaxX > tcMinX &&
            mcMinY < tcMaxY &&
            mcMaxY > tcMinY
          );
        });

        if (overlapsTC) {
          hideOnMinimap = true;
        }
      }

      const initialPlayer = players.find((p) => (p.slotId ?? p.id) === obj.player_id);
      events.push({
        id: `initial-${obj.object_id ?? idx}`,
        time: 0,
        playerId: initialPlayer ? initialPlayer.id : obj.player_id,
        type: "Build",
        category: "build",
        x: obj.x,
        y: obj.y,
        buildingTypeId: obj.object_type_id,
        raw: { ...obj, isInitial: true, hideOnMinimap },
      });
    });

    if (DEBUG) {
      console.log("Gaia resources:", gaiaCombinations);
    }
  }

  if (operations) {
    const actionTypeCounts: Record<string, number> = {};

    const lastUnitIds = new Map<number, number[]>();

    operations.forEach((op, index) => {
      const action = op.Action as Record<string, unknown> | undefined;
      if (!action) return;

      const time = (pickNumber(action.world_time) ?? 0) / 1000;
      const actionData = action.action_data as Record<string, unknown> | undefined;
      if (!actionData) return;

      const actionType = Object.keys(actionData)[0];
      if (!actionType) return;

      if (DEBUG) {
        actionTypeCounts[actionType] = (actionTypeCounts[actionType] || 0) + 1;
      }

      const payload = actionData[actionType] as Record<string, unknown>;
      const rawPlayerId = pickNumber(payload?.player_id);
      if (!rawPlayerId) return;

      // Adjust player ID based on mapping
      const playerId = playerMapping.get(rawPlayerId) ?? rawPlayerId;

      const player = playerById.get(playerId);
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
      let unitIds: number[] | undefined;
      if (data && "unitIds" in data && Array.isArray(data.unitIds) && data.unitIds.length > 0) {
        unitIds = data.unitIds as number[];
        unitId = unitIds[0];
      } else if (data && "unitId" in data) {
        unitId = data.unitId as string | number;
      } else if (Array.isArray(payload?.unit_ids) && payload.unit_ids.length > 0) {
        unitIds = payload.unit_ids as number[];
        unitId = unitIds[0];
      }

      if (!unitIds && payload.selected === -1) {
        unitIds = lastUnitIds.get(playerId);
        if (unitIds && unitIds.length > 0) {
          unitId = unitIds[0];
        }
      }

      if (unitIds && unitIds.length > 0) {
        lastUnitIds.set(playerId, unitIds);
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

      const gateFoundationsToOpen: Record<number, number> = {
        800: 798, // Palisade Horizontal
        804: 802, // Palisade Vertical
        665: 661, // Stone Horizontal
        673: 669, // Stone Vertical
        666: 662, // Fortified Horizontal
        674: 670, // Fortified Vertical
      };

      if (actionType === "Build" && position && buildingTypeId && (horizontalGateFoundations.includes(buildingTypeId) || verticalGateFoundations.includes(buildingTypeId))) {
        const isHorizontal = horizontalGateFoundations.includes(buildingTypeId);
        const offsets = isHorizontal
          ? [[-2, -1], [-1, 0], [0, 1], [1, 2]]
          : [[-2, 1], [-1, 0], [0, -1], [1, -2]];

        // 1. First Outer Foundation
        events.push({
          id: `${actionType}-${playerId}-${index}-0`,
          time,
          playerId,
          type: actionType,
          category,
          x: position!.x + offsets[0][0],
          y: position!.y + offsets[0][1],
          unitId,
          unitTypeId,
          buildingTypeId,
          techId,
          raw: { ...(payload ?? {}), ...data },
        });

        // 2. Middle Open Gate (one building for segments 1 and 2)
        const openId = gateFoundationsToOpen[buildingTypeId];
        events.push({
          id: `${actionType}-${playerId}-${index}-middle`,
          time,
          playerId,
          type: actionType,
          category,
          x: position!.x,
          y: isHorizontal ? position!.y + 1 : position!.y,
          unitId,
          unitTypeId,
          buildingTypeId: openId,
          techId,
          raw: { ...(payload ?? {}), ...data },
        });

        // 3. Second Outer Foundation
        events.push({
          id: `${actionType}-${playerId}-${index}-3`,
          time,
          playerId,
          type: actionType,
          category,
          x: position!.x + offsets[3][0],
          y: position!.y + offsets[3][1],
          unitId,
          unitTypeId,
          buildingTypeId,
          techId,
          raw: { ...(payload ?? {}), ...data },
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
        unitIds: category === "move" || category === "gatherpoint" ? unitIds : undefined,
        unitTypeId,
        buildingTypeId,
        techId,
        raw: { ...(payload ?? {}), ...data },
      });
    });

    if (DEBUG) {
      console.log("Action types:", actionTypeCounts);
    }
  }

  return {
    events: events.sort((a, b) => a.time - b.time),
    mapResources,
    mapCliffs,
    chatEvents,
    players,
  };
};

/**
 * Determines the player's opening strategy based on the military unit
 * they made the most of out of their first 5 trained military units.
 * Returns undefined if there are no military units built or if there is a tie for the most.
 */
export const determineOpening = (events: TimelineEvent[]): string | undefined => {
  const firstFiveMilitaryUnits: string[] = [];

  for (const event of events) {
    if (event.category !== "train" || event.raw?.isInitial) continue;
    if (event.unitTypeId === undefined) continue;

    const unitName = getUnitName(event.unitTypeId);
    if (!unitName || unitName === "Unknown Unit" || isEconomic(unitName)) continue;

    const rawAmount = event.raw?.amount;
    const amount = typeof rawAmount === "number" && rawAmount > 0 ? rawAmount : 1;

    for (let i = 0; i < amount && firstFiveMilitaryUnits.length < 5; i++) {
      firstFiveMilitaryUnits.push(unitName);
    }

    if (firstFiveMilitaryUnits.length >= 5) break;
  }

  if (firstFiveMilitaryUnits.length === 0) {
    return undefined;
  }

  const counts = new Map<string, number>();
  for (const unit of firstFiveMilitaryUnits) {
    counts.set(unit, (counts.get(unit) || 0) + 1);
  }

  let maxCount = 0;
  let topUnit: string | undefined;
  let isTie = false;

  for (const [unit, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      topUnit = unit;
      isTie = false;
    } else if (count === maxCount) {
      isTie = true;
    }
  }

  if (isTie || !topUnit) {
    return undefined;
  }

  return topUnit;
};

export const extractPlayerStats = (
  events: TimelineEvent[],
  durationSeconds: number | undefined,
  players?: PlayerSummary[],
  chatEvents?: ChatEvent[]
): PlayerStats[] => {
  const maxGameMinute = events.length > 0 ? Math.floor(events[events.length - 1].time / 60) : 0;
  const eventsByPlayer = new Map<number, TimelineEvent[]>();
  const playerById = new Map<number, PlayerSummary>(players?.map((p) => [p.id, p]) ?? []);
  const playerBySlotId = new Map<number, PlayerSummary>();
  players?.forEach((player) => {
    eventsByPlayer.set(player.id, []);
    if (player.slotId !== undefined) playerBySlotId.set(player.slotId, player);
  });
  events.forEach((event) => {
    if (event.playerId === undefined || event.playerId === 0) return;
    const list = eventsByPlayer.get(event.playerId);
    if (!list) return;
    list.push(event);
  });

  // Pre-calculate age advancements from system chat notifications
  const ageTimingsByPlayerId = new Map<number, Record<string, number>>();
  const playersBySlotId = new Map<number, PlayerSummary[]>();
  players?.forEach((p) => {
    if (p.slotId !== undefined) {
      const list = playersBySlotId.get(p.slotId) ?? [];
      list.push(p);
      playersBySlotId.set(p.slotId, list);
    }
  });

  if (chatEvents && chatEvents.length > 0) {
    chatEvents.forEach((chat) => {
      if (chat.time > 0 && chat.isSystem) {
        const age = detectAgeAdvance(chat.rawMessage, chat.message, chat.playerName);
        if (age) {
          const chatPlayer = chat.playerId !== undefined ? playerById.get(chat.playerId) : undefined;
          const matchedPlayers = new Set<PlayerSummary>();
          if (chatPlayer) {
            matchedPlayers.add(chatPlayer);
          }
          const slot = chatPlayer?.slotId ?? chat.playerId;
          if (slot !== undefined) {
            const slotPlayers = playersBySlotId.get(slot);
            if (slotPlayers) {
              slotPlayers.forEach((sp) => matchedPlayers.add(sp));
            }
          }

          matchedPlayers.forEach((p) => {
            let timings = ageTimingsByPlayerId.get(p.id);
            if (!timings) {
              timings = {};
              ageTimingsByPlayerId.set(p.id, timings);
            }
            if (!timings[age]) {
              timings[age] = chat.time;
            }
          });
        }
      }
    });
  }

  const stats: PlayerStats[] = [];
  eventsByPlayer.forEach((playerEvents, playerId) => {
    const resignChat = chatEvents?.find(
      (c) => c.playerId === playerId && (c.raw as any)?.type === "Resign"
    );
    const resignTime = resignChat ? resignChat.time : undefined;

    const playerDurationSeconds = resignTime !== undefined
      ? Math.min(resignTime, durationSeconds ?? resignTime)
      : (durationSeconds ?? (playerEvents.length > 0 ? playerEvents[playerEvents.length - 1].time : 0));
    const playerDurationMinutes = Math.max(playerDurationSeconds, 1) / 60;

    const activePlayerEvents = resignTime !== undefined
      ? playerEvents.filter((e) => e.time <= resignTime && !e.raw?.isInitial)
      : playerEvents.filter((e) => !e.raw?.isInitial);

    const apm = Math.round(activePlayerEvents.length / playerDurationMinutes);
    const player = playerById.get(playerId);
    const ageTimings: Record<string, number> = { ...(ageTimingsByPlayerId.get(playerId) ?? {}) };

    let autoscoutUsage = 0;
    const marketUsage: MarketUsage = {
      bought: { food: 0, wood: 0, stone: 0 },
      sold: { food: 0, wood: 0, stone: 0 },
    };

    const minuteBuckets = new Map<number, number>();
    activePlayerEvents.forEach((event) => {
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
    });

    const playerMaxMinute = resignTime !== undefined
      ? Math.floor(playerDurationSeconds / 60)
      : maxGameMinute;

    for (let m = 0; m <= playerMaxMinute; m++) {
      if (!minuteBuckets.has(m)) {
        minuteBuckets.set(m, 0);
      }
    }

    const peakApm = minuteBuckets.size > 0 ? Math.max(...Array.from(minuteBuckets.values())) : 0;
    const apmHistory = Array.from(minuteBuckets.entries())
      .map(([minute, count]) => ({ minute, apm: count }))
      .sort((a, b) => a.minute - b.minute);

    const opening = determineOpening(activePlayerEvents);

    stats.push({
      playerId,
      apm,
      peakApm,
      apmHistory,
      ageTimings,
      autoscoutUsage,
      marketUsage,
      opening,
    });
  });

  return stats;
};

export const determineDuration = (
  source: any,
  events: TimelineEvent[]
): number => {
  const normReplay = normalizeReplay(source);
  const postGameOp = normReplay?.postgame;
  const worldTimeBlock = postGameOp?.blocks?.find((b: any) => b?.WorldTime)?.WorldTime;
  const rawDuration = worldTimeBlock?.world_time ?? pickNumber(source?.duration);
  const calculatedDuration = rawDuration !== undefined ? rawDuration / 1000 : undefined;

  if (!events.length) return calculatedDuration ?? 0;
  const lastEventTime = events[events.length - 1]?.time ?? 0;
  if (calculatedDuration === undefined) return lastEventTime;
  if (calculatedDuration > lastEventTime * 1.2) {
    return lastEventTime;
  }
  return Math.max(calculatedDuration, lastEventTime);
};

export type MatchInfo = {
  mapTypeId?: number;
  customMapName?: string;
  customMapPackName?: string;
  mapSizeId?: number;
  gameTypeId?: number;
  difficultyId?: number;
  difficultyName?: string;
  populationLimit?: number;
  victoryTypeId?: number;
  cheats: boolean;
  filename?: string;
  sourceUrl?: string;
  timestamp?: number;
};

export const extractMatchInfo = (source: any, filename?: string, sourceUrl?: string, summary?: any): MatchInfo => {
  const normSource = normalizeReplay(source);
  const settings = normSource?.zheader?.game_settings || normSource?.header?.game_settings || normSource?.game_settings;
  const summarySettings = summary?.header?.game_settings;
  const replayData = normSource?.header?.replay || normSource?.replay;
  const mapTypeId = pickNumber(settings?.resolved_map_id) ?? pickNumber(settings?.selected_map_id) ?? pickNumber(replayData?.map_id);
  const rmsStrings = summarySettings?.rms_strings ?? settings?.rms_strings;
  const customMapMetadata = mapTypeId === 59 && Array.isArray(rmsStrings)
    ? rmsStrings
      .map((entry: unknown) => {
        if (typeof entry !== "string") return undefined;
        const match = entry.match(/([^:]+)\.rms(?::([^:]*))?/i);
        if (!match) return undefined;
        return {
          name: match[1].trim(),
          packName: match[2]?.replace(/^\d+_/, "").trim() || undefined,
        };
      })
      .find((metadata: { name: string; packName?: string } | undefined) => Boolean(metadata?.name))
    : undefined;

  const difficultyId = pickNumber(settings?.difficulty);
  const difficultyName = typeof settings?.difficulty === "string" ? settings.difficulty : undefined;

  const rawTimestamp = pickNumber(normSource?.zheader?.timestamp)
    ?? pickNumber(normSource?.zheader?.game_settings?.timestamp)
    ?? pickNumber(normSource?.header?.timestamp)
    ?? pickNumber(normSource?.header?.game_settings?.timestamp)
    ?? pickNumber(normSource?.meta?.timestamp)
    ?? pickNumber(normSource?.timestamp);

  const timestamp = rawTimestamp !== undefined && rawTimestamp > 0 ? rawTimestamp : undefined;

  const isCampaign =
    (replayData?.campaign ?? 0) > 0 ||
    (replayData?.king_campaign ?? 0) > 0 ||
    settings?.resolved_map_id === 4294967293 ||
    settings?.resolved_map_id === -3;

  const isScenario =
    replayData?.game_mode === 1 ||
    settings?.resolved_map_id === 4294967294 ||
    settings?.resolved_map_id === -2 ||
    settings?.resolved_map_id === 0;

  const gameTypeId = isCampaign
    ? 4
    : isScenario
    ? 3
    : pickNumber(settings?.game_type);

  return {
    mapTypeId,
    customMapName: customMapMetadata?.name,
    customMapPackName: customMapMetadata?.packName,
    mapSizeId: pickNumber(settings?.map_size) ?? pickNumber(replayData?.map_size),
    gameTypeId,
    difficultyId,
    difficultyName,
    populationLimit: pickNumber(settings?.population_limit),
    victoryTypeId: pickNumber(settings?.victory_type_id),
    cheats: settings?.cheats,
    filename,
    sourceUrl,
    timestamp,
  };
};
