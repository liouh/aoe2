// Based on https://github.com/happyleavesaoc/aoc-mgz/blob/master/mgz/enums.py

export const GAME_TYPES: Record<number, string> = {
  0: "Random Map",
  1: "Regicide",
  2: "Death Match",
  3: "Scenario",
  4: "Campaign",
  5: "King of the Hill",
  6: "Wonder Race",
  7: "Defend the Wonder",
  8: "Turbo Random Map",
  10: "Capture the Relic",
  11: "Sudden Death",
  12: "Battle Royale",
  13: "Empire Wars",
  15: "Co-op Campaign",
};

export const getGameTypeName = (id?: number) => (id !== undefined ? GAME_TYPES[id] : undefined);

export const VICTORY_TYPES: Record<number, string> = {
  0: "Standard",
  1: "Conquest",
  7: "Time Limit",
  8: "Score",
  11: "Last Man Standing",
};

export const getVictoryTypeName = (id?: number) => (id !== undefined ? VICTORY_TYPES[id] : undefined);

export const DIFFICULTY_TYPES: Record<number, string> = {
  "-1": "Extreme",
  0: "Hardest",
  1: "Hard",
  2: "Moderate",
  3: "Easy",
  4: "Easiest",
};

export const getDifficultyName = (id?: number) => (id !== undefined ? DIFFICULTY_TYPES[id] : undefined);

export const MAP_SIZES: Record<number, string> = {
  // Map dimensions
  120: "Tiny (2 player)",
  144: "Small (3 player)",
  168: "Medium (4 player)",
  200: "Normal (6 player)",
  220: "Large (8 player)",
  240: "Giant",
  480: "Ludicrous",
};

export const getMapSizeName = (id?: number) => (id !== undefined ? MAP_SIZES[id] : undefined);

// Need a better mapping for map names

export const MAP_TYPES: Record<number, string> = {
  9: "Arabia",
  10: "Archipelago",
  11: "Baltic",
  12: "Black Forest",
  13: "Coastal",
  14: "Continental",
  15: "Crater Lake",
  16: "Fortress",
  17: "Gold Rush",
  18: "Highland",
  19: "Islands",
  20: "Mediterranean",
  21: "Migration",
  22: "Rivers",
  23: "Team Islands",
  25: "Scandinavia",
  26: "Mongolia",
  27: "Yucatan",
  28: "Salt Marsh",
  29: "Arena",
  31: "Oasis",
  32: "Ghost Lake",
  33: "Nomad",
  44: "Lombardia",
  59: "Custom Map",
  67: "Acropolis",
  68: "Budapest",
  69: "Cenotes",
  70: "City of Lakes",
  71: "Golden Pit",
  72: "Hideout",
  73: "Hill Fort",
  74: "Lombardia",
  75: "Steppe",
  76: "Valley",
  77: "MegaRandom",
  83: "Kilimanjaro",
  86: "Serengeti",
  87: "Socotra",
  112: "Bog Islands",
  113: "Mangrove Jungle",
  114: "Pacific Islands",
  115: "Sandbank",
  122: "Alpine Lakes",
  124: "Mountain Ridge",
  125: "Ravines",
  126: "Wolf Hill",
  139: "Golden Swamp",
  140: "Four Lakes",
  141: "Land Nomad",
  147: "Amazon Tunnel",
  148: "Coastal Forest",
  149: "African Clearing",
  150: "Atacama",
  152: "Crater",
  153: "Crossroads",
  154: "Michi",
  155: "Team Moats",
  156: "Volcanic Island",
  157: "Acclivity",
  158: "Eruption",
  159: "Frigid Lake",
  160: "Greenland",
  161: "Lowland",
  162: "Marketplace",
  163: "Meadow",
  164: "Mountain Range",
  165: "Northern Isles",
  166: "Ring Fortress",
  167: "Runestones",
  168: "Aftermath",
  169: "Enclosed",
  170: "Haboob",
  171: "Kawasan",
  172: "Land Madness",
  173: "Sacred Springs",
  174: "Wade",
};

export const getMapName = (id?: number) => (id !== undefined ? MAP_TYPES[id] : undefined);
