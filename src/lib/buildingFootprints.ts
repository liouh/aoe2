export type BuildingFootprint = {
  w: number;
  h: number;
};

const FOOTPRINTS: Record<number, BuildingFootprint> = {
  12: { w: 3, h: 3 }, // Barracks
  45: { w: 3, h: 3 }, // Dock
  49: { w: 4, h: 4 }, // Siege Workshop
  50: { w: 3, h: 3 }, // Farm
  68: { w: 2, h: 2 }, // Mill
  70: { w: 2, h: 2 }, // House
  72: { w: 1, h: 1 }, // Palisade Wall
  79: { w: 2, h: 2 }, // Watch Tower
  82: { w: 4, h: 4 }, // Castle
  84: { w: 4, h: 4 }, // Market
  87: { w: 3, h: 3 }, // Archery Range
  88: { w: 1, h: 1 }, // Gate NW-SE
  101: { w: 3, h: 3 }, // Stable
  103: { w: 3, h: 3 }, // Blacksmith
  104: { w: 3, h: 3 }, // Monastery
  109: { w: 4, h: 4 }, // Town Center
  117: { w: 1, h: 1 }, // Stone Wall
  119: { w: 1, h: 1 }, // Fortified Palisade Wall
  190: { w: 2, h: 2 }, // Fire Tower
  199: { w: 1, h: 1 }, // Fish Trap
  209: { w: 4, h: 4 }, // University
  234: { w: 2, h: 2 }, // Guard Tower
  235: { w: 2, h: 2 }, // Keep
  236: { w: 2, h: 2 }, // Bombard Tower
  241: { w: 2, h: 2 }, // Outpost (Fortified)
  276: { w: 4, h: 4 }, // Wonder
  562: { w: 2, h: 2 }, // Lumber Camp
  584: { w: 2, h: 2 }, // Mining Camp
  598: { w: 1, h: 1 }, // Outpost
  621: { w: 4, h: 4 }, // Town Center (packed / alternate)
  659: { w: 1, h: 1 }, // Gate W-E
  667: { w: 1, h: 1 }, // Gate N-S
  789: { w: 1, h: 1 }, // Palisade Gate SW-NE
  792: { w: 1, h: 1 }, // Palisade Gate
  793: { w: 1, h: 1 }, // Palisade Gate NW-SE
  797: { w: 1, h: 1 }, // Palisade Gate W-E
  801: { w: 1, h: 1 }, // Palisade Gate N-S
  1102: { w: 2, h: 2 }, // Fortified Tower
  1187: { w: 3, h: 3 }, // Rice Farm
  1379: { w: 1, h: 1 }, // Sea Gate SW-NE
  1383: { w: 1, h: 1 }, // Sea Gate NW-SE
  1387: { w: 1, h: 1 }, // Sea Gate W-E
  1391: { w: 1, h: 1 }, // Sea Gate N-S
  1579: { w: 1, h: 1 }, // City Gate SW-NE
  1583: { w: 1, h: 1 }, // City Gate NW-SE
  1587: { w: 1, h: 1 }, // City Gate W-E
  1591: { w: 1, h: 1 }, // City Gate N-S
  487: { w: 1, h: 1 }, // Gate
  488: { w: 1, h: 1 }, // Fortified Gate
  63: { w: 1, h: 1 }, // Fortified Gate SW-NE
  85: { w: 1, h: 1 }, // Fortified Gate NW-SE
  660: { w: 1, h: 1 }, // Fortified Gate W-E
  668: { w: 1, h: 1 }, // Fortified Gate N-S
};

const BUILDING_NAMES: Record<number, string> = {
  12: "Barracks",
  45: "Dock",
  49: "Siege Workshop",
  50: "Farm",
  68: "Mill",
  70: "House",
  72: "Palisade Wall",
  79: "Watch Tower",
  82: "Castle",
  84: "Market",
  87: "Archery Range",
  88: "Gate NW-SE",
  101: "Stable",
  103: "Blacksmith",
  104: "Monastery",
  109: "Town Center",
  117: "Stone Wall",
  119: "Fortified Palisade Wall",
  190: "Fire Tower",
  199: "Fish Trap",
  209: "University",
  234: "Guard Tower",
  235: "Keep",
  236: "Bombard Tower",
  241: "Outpost (Fortified)",
  276: "Wonder",
  562: "Lumber Camp",
  584: "Mining Camp",
  598: "Outpost",
  621: "Town Center",
  659: "Gate W-E",
  667: "Gate N-S",
  789: "Palisade Gate SW-NE",
  792: "Palisade Gate",
  793: "Palisade Gate NW-SE",
  797: "Palisade Gate W-E",
  801: "Palisade Gate N-S",
  1102: "Fortified Tower",
  1187: "Rice Farm",
  1251: "Krepost",
  1379: "Sea Gate SW-NE",
  1383: "Sea Gate NW-SE",
  1387: "Sea Gate W-E",
  1391: "Sea Gate N-S",
  1579: "City Gate SW-NE",
  1583: "City Gate NW-SE",
  1587: "City Gate W-E",
  1591: "City Gate N-S",
  487: "Gate",
  488: "Fortified Gate",
  490: "Gate",
  63: "Fortified Gate SW-NE",
  85: "Fortified Gate NW-SE",
  660: "Fortified Gate W-E",
  668: "Fortified Gate N-S",
};

export const getBuildingFootprint = (
  buildingTypeId?: number
): BuildingFootprint => {
  if (!buildingTypeId) return { w: 1, h: 1 };
  return FOOTPRINTS[buildingTypeId] ?? { w: 1, h: 1 };
};

export const getBuildingName = (buildingTypeId?: number) => {
  if (!buildingTypeId) return undefined;
  // if (!BUILDING_NAMES[buildingTypeId]) console.log(buildingTypeId);
  return BUILDING_NAMES[buildingTypeId];
};
