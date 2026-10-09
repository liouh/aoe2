import { type TimelineEvent, type TimelineEventCategory } from "./replayProcessor";

/**
 * Single step / action within an author-friendly raw build order.
 */
export interface RawPresetBuildOrderEvent {
  /**
   * Timestamp in seconds (e.g. 580) or "MM:SS" / "M:SS" string (e.g. "09:40", "2:15").
   */
  time: number | string;
  /**
   * Category of event matching the timeline filters and icons:
   * - "build": buildings (e.g. Barracks, Stable, Mill)
   * - "train": units (e.g. Villager, Scout Cavalry, Archer)
   * - "research": technologies / age upgrades (e.g. Loom, Feudal Age, Double-Bit Axe)
   * - "market": market buy / sell actions
   */
  category: TimelineEventCategory;
  /**
   * Display name shown in the timeline (e.g. "Barracks", "Double-Bit Axe", "Scout Cavalry").
   */
  label: string;
  /**
   * Optional quantity (default 1). For example, 2 for 2 Houses or 3 for 3 Scouts.
   */
  count?: number;
}

/**
 * Raw definition of a hard-coded preset build order for convenient authoring.
 */
export interface RawPresetBuildOrder {
  /** User-friendly name displayed in dropdown and header */
  name: string;
  /** Recommended civilization or archetype (e.g. "Generic / Franks", "Britons") */
  civ?: string;
  /**
   * Target Age reached timings in seconds (number) or "MM:SS" strings.
   * Renders the distinctive II, III, IV banners across the timeline.
   */
  ageTimings?: {
    Feudal?: number | string;
    Castle?: number | string;
    Imperial?: number | string;
  };
  /**
   * Ordered or unordered list of events with customizable timestamps.
   */
  events: RawPresetBuildOrderEvent[];
}

/**
 * Processed, ready-to-use preset build order consumed directly by TimelineTab.
 */
export interface PresetBuildOrder {
  /** Unique identifier (e.g. "preset-0") */
  id: string;
  /** User-friendly display name */
  name: string;
  /** Civilization or archetype description */
  civ: string;
  /** Normalized age timings in numeric seconds */
  ageTimings: Record<string, number>;
  /** Sorted timeline events ready for rendering/consolidation */
  events: TimelineEvent[];
  /** Maximum timestamp across all events and age upgrades */
  maxTime: number;
}

/**
 * Converts timestamps like "09:40" or 580 into seconds as a number.
 */
function parseTimestamp(time: number | string): number {
  if (typeof time === "number") return time;
  if (!time) return 0;

  const parts = time.trim().split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Converts a raw build order into a fully processed PresetBuildOrder.
 */
function processPresetBuildOrder(raw: RawPresetBuildOrder, index: number): PresetBuildOrder {
  const id = `preset-${index}`;
  let maxTime = 0;

  // Process age timings
  const ageTimings: Record<string, number> = {};
  if (raw.ageTimings) {
    for (const [age, val] of Object.entries(raw.ageTimings)) {
      if (val !== undefined) {
        const timeSec = parseTimestamp(val);
        ageTimings[age] = timeSec;
        if (timeSec > maxTime) maxTime = timeSec;
      }
    }
  }

  // Process timeline events
  const events: TimelineEvent[] = raw.events
    .map((event, eventIdx) => {
      const timeInSeconds = parseTimestamp(event.time);
      if (timeInSeconds > maxTime) maxTime = timeInSeconds;
      const amount = event.count && event.count > 0 ? event.count : 1;

      return {
        id: `${id}-event-${eventIdx}`,
        time: timeInSeconds,
        type: event.label,
        category: event.category,
        raw: {
          label: event.label,
          amount,
          count: amount,
          isInitial: false,
        },
      };
    })
    .sort((a, b) => a.time - b.time);

  return {
    id,
    name: raw.name,
    civ: raw.civ || "Preset build order",
    ageTimings,
    events,
    maxTime,
  };
}

/* =========================================================================
 * RAW BUILD ORDER DEFINITIONS
 * Author new build orders here
 * ========================================================================= */

const RAW_PRESET_BUILD_ORDERS: RawPresetBuildOrder[] = [
  {
    name: "Scout Rush (20 vils)",
    civ: "Generic",
    ageTimings: {
      Feudal: "9:40"
    },
    events: [
      { time: "0:00", category: "train", label: "Villager #4" },
      { time: "0:05", category: "build", label: "House", count: 2 },
      { time: "0:25", category: "train", label: "Villager #5" },
      { time: "0:50", category: "train", label: "Villager #6" },
      { time: "1:15", category: "train", label: "Villager #7" },
      { time: "1:40", category: "train", label: "Villager #8" },
      { time: "1:40", category: "build", label: "Lumber Camp" },
      { time: "2:05", category: "train", label: "Villager #9" },
      { time: "2:30", category: "train", label: "Villager #10" },
      { time: "2:55", category: "train", label: "Villager #11" },
      { time: "3:20", category: "train", label: "Villager #12" },
      { time: "3:45", category: "train", label: "Villager #13" },
      { time: "3:45", category: "build", label: "House", count: 2 },
      { time: "4:10", category: "train", label: "Villager #14" },
      { time: "4:10", category: "build", label: "Mill" },
      { time: "4:35", category: "train", label: "Villager #15" },
      { time: "5:00", category: "train", label: "Villager #16" },
      { time: "5:25", category: "train", label: "Villager #17" },
      { time: "5:50", category: "train", label: "Villager #18" },
      { time: "6:15", category: "train", label: "Villager #19" },
      { time: "6:15", category: "build", label: "Lumber Camp" },
      { time: "6:40", category: "train", label: "Villager #20" },
      { time: "7:05", category: "research", label: "Loom" },
      { time: "7:30", category: "research", label: "Feudal Age" },
      { time: "8:45", category: "build", label: "Barracks" },
      { time: "9:40", category: "build", label: "Stable" },
      { time: "9:50", category: "research", label: "Horse Collar" },
      { time: "9:50", category: "research", label: "Double-Bit Axe" },
      { time: "10:20", category: "train", label: "Scout Cavalry" },
      { time: "10:50", category: "train", label: "Scout Cavalry" },
      { time: "11:20", category: "train", label: "Scout Cavalry" },
    ],
  },
  {
    name: "Archer Rush (21 vils)",
    civ: "Generic",
    ageTimings: {
      Feudal: "10:05"
    },
    events: [
      { time: "0:00", category: "train", label: "Villager #4" },
      { time: "0:05", category: "build", label: "House", count: 2 },
      { time: "0:25", category: "train", label: "Villager #5" },
      { time: "0:50", category: "train", label: "Villager #6" },
      { time: "1:15", category: "train", label: "Villager #7" },
      { time: "1:40", category: "train", label: "Villager #8" },
      { time: "1:40", category: "build", label: "Lumber Camp" },
      { time: "2:05", category: "train", label: "Villager #9" },
      { time: "2:30", category: "train", label: "Villager #10" },
      { time: "2:55", category: "train", label: "Villager #11" },
      { time: "3:20", category: "train", label: "Villager #12" },
      { time: "3:45", category: "train", label: "Villager #13" },
      { time: "3:45", category: "build", label: "House", count: 2 },
      { time: "4:10", category: "train", label: "Villager #14" },
      { time: "4:10", category: "build", label: "Mill" },
      { time: "4:35", category: "train", label: "Villager #15" },
      { time: "5:00", category: "train", label: "Villager #16" },
      { time: "5:25", category: "train", label: "Villager #17" },
      { time: "5:50", category: "train", label: "Villager #18" },
      { time: "6:15", category: "train", label: "Villager #19" },
      { time: "6:15", category: "build", label: "Lumber Camp" },
      { time: "6:40", category: "train", label: "Villager #20" },
      { time: "7:05", category: "train", label: "Villager #21" },
      { time: "7:30", category: "research", label: "Loom" },
      { time: "7:55", category: "research", label: "Feudal Age" },
      { time: "8:00", category: "build", label: "Mining Camp" },
      { time: "9:10", category: "build", label: "Barracks" },
      { time: "10:05", category: "build", label: "Archery Range" },
      { time: "10:05", category: "build", label: "Archery Range" },
      { time: "10:15", category: "research", label: "Double-Bit Axe" },
      { time: "10:40", category: "build", label: "Blacksmith" },
      { time: "11:00", category: "train", label: "Archer", count: 2 },
      { time: "11:27", category: "train", label: "Archer", count: 2 },
      { time: "11:40", category: "research", label: "Fletching" },
      { time: "11:54", category: "train", label: "Archer", count: 2 },
    ],
  },
  {
    name: "Fast Castle (22+2 vils)",
    civ: "Red Phosphoru FC into UU",
    ageTimings: {
      Feudal: "10:30",
      Castle: "14:00",
    },
    events: [
      { time: "0:00", category: "train", label: "Villager #4" },
      { time: "0:05", category: "build", label: "House", count: 2 },
      { time: "0:25", category: "train", label: "Villager #5" },
      { time: "0:50", category: "train", label: "Villager #6" },
      { time: "1:15", category: "train", label: "Villager #7" },
      { time: "1:40", category: "train", label: "Villager #8" },
      { time: "1:40", category: "build", label: "Lumber Camp" },
      { time: "2:05", category: "train", label: "Villager #9" },
      { time: "2:30", category: "train", label: "Villager #10" },
      { time: "2:55", category: "train", label: "Villager #11" },
      { time: "3:20", category: "train", label: "Villager #12" },
      { time: "3:45", category: "train", label: "Villager #13" },
      { time: "3:45", category: "build", label: "House", count: 2 },
      { time: "4:10", category: "train", label: "Villager #14" },
      { time: "4:10", category: "build", label: "Mill" },
      { time: "4:35", category: "train", label: "Villager #15" },
      { time: "5:00", category: "train", label: "Villager #16" },
      { time: "5:25", category: "train", label: "Villager #17" },
      { time: "5:50", category: "train", label: "Villager #18" },
      { time: "6:15", category: "train", label: "Villager #19" },
      { time: "6:15", category: "build", label: "Mining Camp" },
      { time: "6:40", category: "train", label: "Villager #20" },
      { time: "7:05", category: "train", label: "Villager #21" },
      { time: "7:30", category: "train", label: "Villager #22" },
      { time: "7:55", category: "research", label: "Loom" },
      { time: "8:20", category: "research", label: "Feudal Age" },
      { time: "10:30", category: "train", label: "Villager #23" },
      { time: "10:35", category: "build", label: "Market" },
      { time: "10:35", category: "build", label: "Blacksmith" },
      { time: "10:55", category: "train", label: "Villager #24" },
      { time: "11:20", category: "market", label: "Sell 100 Wood" },
      { time: "11:20", category: "market", label: "Sell 100 Stone" },
      { time: "11:20", category: "research", label: "Castle Age" },
    ],
  },
  {
    name: "Fast Castle (24+2 vils)",
    civ: "Generic",
    ageTimings: {
      Feudal: "11:20",
      Castle: "14:50",
    },
    events: [
      { time: "0:00", category: "train", label: "Villager #4" },
      { time: "0:05", category: "build", label: "House", count: 2 },
      { time: "0:25", category: "train", label: "Villager #5" },
      { time: "0:50", category: "train", label: "Villager #6" },
      { time: "1:15", category: "train", label: "Villager #7" },
      { time: "1:40", category: "train", label: "Villager #8" },
      { time: "1:40", category: "build", label: "Lumber Camp" },
      { time: "2:05", category: "train", label: "Villager #9" },
      { time: "2:30", category: "train", label: "Villager #10" },
      { time: "2:55", category: "train", label: "Villager #11" },
      { time: "3:20", category: "train", label: "Villager #12" },
      { time: "3:45", category: "train", label: "Villager #13" },
      { time: "3:45", category: "build", label: "House", count: 2 },
      { time: "4:10", category: "train", label: "Villager #14" },
      { time: "4:10", category: "build", label: "Mill" },
      { time: "4:35", category: "train", label: "Villager #15" },
      { time: "5:00", category: "train", label: "Villager #16" },
      { time: "5:25", category: "train", label: "Villager #17" },
      { time: "5:50", category: "train", label: "Villager #18" },
      { time: "6:15", category: "train", label: "Villager #19" },
      { time: "6:40", category: "train", label: "Villager #20" },
      { time: "7:05", category: "train", label: "Villager #21" },
      { time: "7:30", category: "train", label: "Villager #22" },
      { time: "7:55", category: "train", label: "Villager #23" },
      { time: "7:55", category: "build", label: "Mining Camp" },
      { time: "8:20", category: "train", label: "Villager #24" },
      { time: "8:45", category: "research", label: "Loom" },
      { time: "9:10", category: "research", label: "Feudal Age" },
      { time: "10:30", category: "build", label: "House" },
      { time: "11:20", category: "train", label: "Villager #25" },
      { time: "11:25", category: "build", label: "Market" },
      { time: "11:25", category: "build", label: "Blacksmith" },
      { time: "11:45", category: "train", label: "Villager #26" },
      { time: "12:10", category: "research", label: "Castle Age" },
    ],
  },
];

/* =========================================================================
 * PROCESSED EXPORTS
 * Fully normalized and ready for immediate timeline consumption.
 * ========================================================================= */

export const PRESET_BUILD_ORDERS: PresetBuildOrder[] = RAW_PRESET_BUILD_ORDERS.map(processPresetBuildOrder);

const PRESET_MAP = new Map<string, PresetBuildOrder>(
  PRESET_BUILD_ORDERS.map((preset) => [preset.id, preset])
);

/**
 * Finds a pre-processed preset build order by ID (e.g. "preset-0").
 */
export function findPresetById(id: string): PresetBuildOrder | undefined {
  return PRESET_MAP.get(id);
}
