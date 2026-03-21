import { TimelineEvent, PlayerSummary } from "./replayProcessor";
import { getBuildingFootprint } from "./buildingFootprints";

const FARM_IDS = [50, 1187];
const PASTURE_IDS = [1889, 1893, 1897];
const TARGET_IDS = [...FARM_IDS, ...PASTURE_IDS];

type VotedLocation = {
  weight: number;
  directions: Set<string>;
};

/**
 * Isolated logic to determine and place starting Town Centers.
 * It identifies the 4x4 "hole" in the center of a player's farm/pasture cluster.
 * 
 * NOTE: The viewer uses center-anchored coordinates: 
 * anchor = floor(coord) - floor(size / 2).
 * We calculate everything in "true" top-left anchors and translate back for the viewer.
 */
export const determineStartingLocations = (
  players: PlayerSummary[],
  events: TimelineEvent[]
): TimelineEvent[] => {
  const startEvents: TimelineEvent[] = [];

  players.forEach((player) => {
    // Nomad Check: if a Town Center is built in the first 10 minutes, skip starting TC inference.
    const hasEarlyTc = events.some(
      (e) =>
        e.playerId === player.id &&
        e.category === "build" &&
        e.time < 600 &&
        (e.buildingTypeId === 109 || e.buildingTypeId === 621 || e.buildingTypeId === 71)
    );
    if (hasEarlyTc) return;

    // Key: "tx,ty" (true top-left anchor of 4x4 TC), Value: { weight, directions }
    const candidates = new Map<string, VotedLocation>();
    const playerBuildings: { x: number; y: number; w: number; h: number; time: number }[] = [];
    let firstPos: { x: number; y: number } | null = null;

    // First pass: collect buildings (converted to true top-left anchors)
    for (const event of events) {
      if (event.playerId !== player.id) continue;

      if (event.x !== undefined && event.y !== undefined) {
        if (event.category === "build") {
          if (!firstPos) {
            firstPos = { x: event.x, y: event.y };
          }
          const { w, h } = getBuildingFootprint(event.buildingTypeId);
          // Calculate TRUE top-left anchor used by the viewer
          const ax = Math.floor(event.x) - Math.floor(w / 2);
          const ay = Math.floor(event.y) - Math.floor(h / 2);
          playerBuildings.push({ x: ax, y: ay, w, h, time: event.time });
        }
      }
    }

    // Second pass: vote for TC true anchors based on farms/pastures
    for (const event of events) {
      if (
        event.playerId === player.id &&
        event.category === "build" &&
        event.buildingTypeId &&
        TARGET_IDS.includes(event.buildingTypeId) &&
        event.x !== undefined &&
        event.y !== undefined
      ) {
        const { w: bw, h: bh } = getBuildingFootprint(event.buildingTypeId);

        // True anchor of this farm/pasture
        const fax = Math.floor(event.x) - Math.floor(bw / 2);
        const fay = Math.floor(event.y) - Math.floor(bh / 2);

        // Weight earlier farms more (before 15 mins)
        const weight = event.time < 900 ? 5 : 1;

        const vote = (tx: number, ty: number, dir: string) => {
          const key = `${tx},${ty}`;
          if (!candidates.has(key)) {
            candidates.set(key, { weight: 0, directions: new Set() });
          }
          const data = candidates.get(key)!;
          data.weight += weight;
          data.directions.add(dir);
        };

        // A TC (4x4) at true anchor (tx, ty) has neighbors:
        // North: fay = ty - bh => ty = fay + bh (TC is below farm)
        for (let tx = fax - 3; tx < fax + bw; tx++) vote(tx, fay + bh, "N");
        // South: fay = ty + 4  => ty = fay - 4  (TC is above farm)
        for (let tx = fax - 3; tx < fax + bw; tx++) vote(tx, fay - 4, "S");
        // West:  fax = tx + 4  => tx = fax - 4  (TC is left of farm)
        for (let ty = fay - 3; ty < fay + bh; ty++) vote(fax - 4, ty, "E");
        // East:  fax = tx - bw => tx = fax + bw (TC is right of farm)
        for (let ty = fay - 3; ty < fay + bh; ty++) vote(fax + bw, ty, "W");
      }
    }

    // Final selection: find the best candidate (true anchor)
    let bestTrueAnchor: { x: number; y: number } | null = null;
    let maxScore = 0;

    for (const [key, data] of candidates.entries()) {
      const [tx, ty] = key.split(",").map(Number);

      // Spatial Proximity (within 30 tiles of start)
      if (firstPos) {
        const distSq = (tx - firstPos.x) ** 2 + (ty - firstPos.y) ** 2;
        if (distSq > 30 * 30) continue;
      }

      // Filter 2: High Confidence Hole Detection
      // A good candidate should have neighbors on multiple sides
      const sideScore = data.directions.size;

      // Filter: Overlap with future buildings
      let overlapPenalty = 1.0;
      for (const b of playerBuildings) {
        // Overlap check (TC is 4x4)
        const overlaps = !(tx + 4 <= b.x || tx >= b.x + b.w || ty + 4 <= b.y || ty >= b.y + b.h);
        if (overlaps) {
          if (b.time < 720) { // Big penalty if overlap with 0-12 min building
            overlapPenalty *= 0.1;
          } else {
            overlapPenalty *= 0.5;
          }
        }
      }

      // Exponentially reward more sides
      let score = data.weight * Math.pow(2, sideScore) * overlapPenalty;

      // Massive bonus for perfect "holes" (surrounded on all 4 sides)
      if (sideScore === 4) score += 100;

      if (score > maxScore) {
        maxScore = score;
        bestTrueAnchor = { x: tx, y: ty };
      }
    }

    // Translate best true anchor back to viewer coordinate (center-ish)
    if (bestTrueAnchor && maxScore > 1) {
      startEvents.push({
        id: `init-tc-${player.id}`,
        time: 0,
        playerId: player.id,
        type: "Build",
        category: "build",
        x: bestTrueAnchor.x + 2, // floor(4 / 2)
        y: bestTrueAnchor.y + 2, // floor(4 / 2)
        buildingTypeId: 109,
        raw: { isInitial: true, confidence: maxScore, tx: bestTrueAnchor.x, ty: bestTrueAnchor.y },
      });
    }
  });

  return startEvents;
};
