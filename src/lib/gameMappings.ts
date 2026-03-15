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
  9: "Capture the Relic",
  10: "Sudden Death",
  11: "Battle Royale",
  12: "Empire Wars",
};

export const getGameTypeName = (id?: number) => (id !== undefined ? GAME_TYPES[id] : undefined);

export const MAP_SIZES: Record<number, string> = {
  // Enum values
  0: "Tiny (2 player)",
  1: "Small (3 player)",
  2: "Medium (4 player)",
  3: "Normal (6 player)",
  4: "Large (8 player)",
  5: "Giant",
  6: "LudaKiris",
  // Map dimensions
  120: "Tiny (2 player)",
  144: "Small (3 player)",
  168: "Medium (4 player)",
  200: "Normal (6 player)",
  240: "Large (8 player)",
  255: "Giant",
  256: "Giant",
  480: "LudaKiris",
};

export const getMapSizeName = (id?: number) => (id !== undefined ? MAP_SIZES[id] : undefined);
export const MAP_TYPES: Record<number, string> = {
  9: "Arabia",
  10: "Coastal",
  11: "Continental",
  12: "Black Forest",
  13: "Crater Lake",
  14: "Gold Rush",
  15: "Islands",
  16: "Migration",
  17: "Mediterranean",
  19: "Team Islands",
  20: "Rivers",
  21: "Oasis",
  22: "Ghost Lake",
  23: "Salt Marsh",
  24: "Fortress",
  25: "Scandinavia",
  26: "Mongolia",
  27: "Yucatan",
  29: "Arena",
  33: "Nomad",
  115: "Hideout",
  124: "MegaRandom",
  137: "Acropolis",
};

export const getMapName = (id?: number) => (id !== undefined ? MAP_TYPES[id] : undefined);
