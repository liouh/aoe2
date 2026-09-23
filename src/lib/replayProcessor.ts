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

export type MapResourceType = "gold" | "stone" | "forage" | "relic";

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

import { getEntityName, getBuildingName } from "./entityMappings";
import { getBuildingFootprint, isBuildingId } from "./buildingMappings";
import { CHEAT_ID_TO_NAME, getCheatName } from "./gameMappings";
export { CHEAT_ID_TO_NAME, getCheatName };

import { DEBUG } from "./debug";

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
const parseActionData = (type: string, data: number[]) => {
  const bytes = Uint8Array.from(data);
  if (bytes.length === 0) return undefined;
  const view = new DataView(bytes.buffer);

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

export const summarizePlayers = (
  summary: any,
  replay?: any
): PlayerSummary[] => {
  const players: PlayerSummary[] = [];

  const postGameOp = replay?.operations?.find((op: any) => op.PostGame)?.PostGame;
  const leaderboardsBlock = postGameOp?.blocks?.find((b: any) => b.Leaderboards)?.Leaderboards;
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

  const source = replay || summary;
  const gameSettings = source?.zheader?.game_settings || source?.header?.game_settings || source?.game_settings;

  if (gameSettings?.players) {
    const matchedPlayers = new Set<PlayerSummary>();
    gameSettings.players.forEach((p: any) => {
      let player = players.find(sp => !matchedPlayers.has(sp) && (sp.slotId ?? sp.id) === p.player_number && (sp.name === p.name || !sp.name))
        ?? players.find(sp => !matchedPlayers.has(sp) && (sp.slotId ?? sp.id) === p.player_number);

      const eloInfo = eloMap.get(p.player_number - 1);
      if (!player) {
        const basePlayer = players.find(sp => (sp.slotId ?? sp.id) === p.player_number);
        player = {
          id: playerCounter++,
          slotId: p.player_number,
          colorId: p.color_id ?? basePlayer?.colorId,
          civId: p.civ_id ?? basePlayer?.civId,
          teamId: p.resolved_team_id ?? p.selected_team_id ?? basePlayer?.teamId,
          ai: p.player_type === 4,
          name: p.name,
          elo: eloInfo?.elo,
          rank: eloInfo?.rank,
          teamElo: eloInfo?.teamElo,
          teamRank: eloInfo?.teamRank,
        };
        players.push(player);
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

  return players;
};

export const buildPlayerMapping = (
  operations: Record<string, unknown>[],
  players: PlayerSummary[]
): Map<number, number> => {
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

  const playerMapping = new Map<number, number>();
  for (const eid of rawEventPlayerIds) {
    const player = players.find(p => (p.slotId ?? p.id) === eid)
      ?? players.find(p => p.id === eid);
    playerMapping.set(eid, player ? player.id : eid);
  }

  return playerMapping;
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

export const extractChatEvents = (
  replay: unknown,
  summary?: any,
  providedPlayers?: PlayerSummary[]
): ChatEvent[] => {
  if (!replay) return [];
  const replayRecord = replay as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  if (!operations) return [];

  const players = providedPlayers ?? summarizePlayers(summary, replay);
  const playerMapping = buildPlayerMapping(operations, players);
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
  let currentTime = 0;

  operations.forEach((op, index) => {
    const action = op.Action as Record<string, unknown> | undefined;
    if (action?.world_time !== undefined) {
      currentTime = (pickNumber(action.world_time) ?? 0) / 1000;
    }

    const actionData = action?.action_data as Record<string, unknown> | undefined;
    if (actionData?.Resign) {
      const resignData = actionData.Resign as Record<string, unknown>;
      const rawPid = pickNumber(resignData?.player_id);
      const pid = rawPid !== undefined ? (playerMapping.get(rawPid) ?? rawPid) : undefined;
      if (pid !== undefined && !resignedPlayerIds.has(pid)) {
        resignedPlayerIds.add(pid);
        const resignedPlayer = players.find((p) => p.id === pid);
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
          const cheatName = getCheatName(cheatId);
          const rawPid = pickNumber(gameData?.player_id);
          const pid = rawPid !== undefined ? (playerMapping.get(rawPid) ?? rawPid) : undefined;
          const cheatPlayer = pid !== undefined ? players.find((p) => p.id === pid) : undefined;
          const playerName = cheatPlayer?.name || (pid !== undefined ? `Player ${pid}` : "Unknown Player");

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
            raw: { ...cheatData, type: "Cheat", cheatId, cheatName },
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
    const player = playerId !== undefined ? players.find((p) => p.id === playerId) : undefined;
    const rawMessage = typeof payload.message === "string" ? payload.message : (chatOp.text ?? "");
    const tauntNumber = pickNumber(payload.tauntNumber);
    const channel = pickNumber(payload.channel);
    const tagMatch = rawMessage.match(/<player_id,\s*(\d+)[^>]*>/i);
    const tagPlayerId = tagMatch ? pickNumber(parseInt(tagMatch[1], 10)) : undefined;
    const tagPlayer = tagPlayerId !== undefined ? players.find(p => (p.slotId ?? p.id) === tagPlayerId) : undefined;
    const resolvedPlayerId = (playerId !== undefined && playerId !== 0)
      ? playerId
      : tagPlayer?.id ?? tagPlayerId;
    const resolvedPlayer = resolvedPlayerId !== undefined ? players.find((p) => p.id === resolvedPlayerId) : player;

    const hasPlayerIdTag = tagMatch !== null;
    const isCandidateSystem = hasPlayerIdTag || playerId === 0 || playerId === undefined;
    const detectedAge = isCandidateSystem ? detectAgeAdvance(rawMessage, undefined, resolvedPlayer?.name) : null;
    const isAgeAdvance = detectedAge !== null;
    const isSystem = hasPlayerIdTag || isAgeAdvance || playerId === 0 || playerId === undefined;

    // In DE replays, empty messageAGP indicates internal engine triggers or pre-game lobby packets
    if (payload.messageAGP === "" && isSystem) {
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

export const buildTimeline = (
  replay: unknown,
  summary?: any
): {
  events: TimelineEvent[];
  mapResources: Record<string, MapResourceType>;
  chatEvents: ChatEvent[];
} => {
  if (!replay) return { events: [], mapResources: {}, chatEvents: [] };
  const replayRecord = replay as Record<string, unknown>;
  const operations = Array.isArray(replayRecord.operations)
    ? (replayRecord.operations as Record<string, unknown>[])
    : null;
  const events: TimelineEvent[] = [];
  const players = summarizePlayers(summary, replay);
  const chatEvents = extractChatEvents(replay, summary, players);

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
          typeName.includes("Pineapple Bush") ||
          typeName.includes("Papaya Tree")
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

      // At game start, if there is a mule cart overlapping a town center, do not put the mule cart on the map
      const isMuleCart = obj.object_type_id === 1808 || getBuildingName(obj.object_type_id).includes("Mule Cart");
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
          return;
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
        raw: { ...obj, isInitial: true },
      });
    });

    if (DEBUG) {
      console.log("Gaia resources:", gaiaCombinations);
    }
  }

  if (operations) {
    const actionTypeCounts: Record<string, number> = {};
    const playerMapping = buildPlayerMapping(operations, players);

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
    chatEvents,
  };
};

export const extractPlayerStats = (
  events: TimelineEvent[],
  durationSeconds: number | undefined,
  players?: PlayerSummary[],
  chatEvents?: ChatEvent[]
): PlayerStats[] => {
  const maxGameMinute = events.length > 0 ? Math.floor(events[events.length - 1].time / 60) : 0;
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
    const player = players?.find((p) => p.id === playerId);
    const civId = player?.civId;
    const ageTimings: Record<string, number> = {};

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

    // Extract age-up timings directly from ground-truth chat notifications (supporting all official game languages)
    if (chatEvents && chatEvents.length > 0) {
      chatEvents.forEach((chat) => {
        const chatPlayer = players?.find((p) => p.id === chat.playerId);
        const matchesPlayer = chat.playerId === playerId || (
          player?.slotId !== undefined && (chatPlayer?.slotId ?? chat.playerId) === player.slotId
        );
        if (matchesPlayer && chat.time > 0 && chat.isSystem) {
          const age = detectAgeAdvance(chat.rawMessage, chat.message, chat.playerName);
          if (age && !ageTimings[age]) {
            ageTimings[age] = chat.time;
          }
        }
      });
    }

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
  timestamp?: number;
};

export const extractMatchInfo = (source: any, filename?: string, sourceUrl?: string): MatchInfo => {
  const settings = source?.zheader?.game_settings || source?.header?.game_settings || source?.game_settings;
  const replayData = source?.header?.replay || source?.replay;

  const difficultyId = pickNumber(settings?.difficulty);
  const difficultyName = typeof settings?.difficulty === "string" ? settings.difficulty : undefined;

  const rawTimestamp = pickNumber(source?.zheader?.timestamp)
    ?? pickNumber(source?.zheader?.game_settings?.timestamp)
    ?? pickNumber(source?.header?.timestamp)
    ?? pickNumber(source?.header?.game_settings?.timestamp)
    ?? pickNumber(source?.meta?.timestamp)
    ?? pickNumber(source?.timestamp);

  const timestamp = rawTimestamp !== undefined && rawTimestamp > 0 ? rawTimestamp : undefined;

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
    timestamp,
  };
};
