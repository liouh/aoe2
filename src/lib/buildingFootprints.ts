export type BuildingFootprint = {
  w: number;
  h: number;
};

const FOOTPRINTS: Record<number, BuildingFootprint> = {
  10: { w: 3, h: 3 }, // Archery Range
  12: { w: 3, h: 3 }, // Barracks
  14: { w: 3, h: 3 }, // Archery Range
  18: { w: 3, h: 3 }, // Blacksmith
  19: { w: 3, h: 3 }, // Blacksmith
  20: { w: 3, h: 3 }, // Barracks
  30: { w: 3, h: 3 }, // Monastery
  31: { w: 3, h: 3 }, // Monastery
  32: { w: 3, h: 3 }, // Monastery
  33: { w: 4, h: 4 }, // Fortress
  45: { w: 3, h: 3 }, // Dock
  47: { w: 3, h: 3 }, // Dock
  49: { w: 4, h: 4 }, // Siege Workshop
  50: { w: 3, h: 3 }, // Farm
  51: { w: 3, h: 3 }, // Dock
  56: { w: 3, h: 3 }, // Dock
  63: { w: 2, h: 1 }, // Fortified Gate
  64: { w: 2, h: 1 }, // Gate
  67: { w: 1, h: 1 }, // Fortified Gate
  68: { w: 2, h: 2 }, // Mill
  70: { w: 2, h: 2 }, // House
  71: { w: 4, h: 4 }, // Town Center
  72: { w: 1, h: 1 }, // Palisade Wall
  78: { w: 1, h: 1 }, // Gate
  79: { w: 1, h: 1 }, // Watch Tower
  80: { w: 1, h: 1 }, // Fortified Gate
  81: { w: 1, h: 1 }, // Gate
  82: { w: 4, h: 4 }, // Castle
  84: { w: 4, h: 4 }, // Market
  85: { w: 1, h: 2 }, // Fortified Gate
  86: { w: 3, h: 3 }, // Stable
  87: { w: 3, h: 3 }, // Archery Range
  88: { w: 1, h: 2 }, // Gate
  90: { w: 1, h: 1 }, // Fortified Gate
  91: { w: 1, h: 1 }, // Gate
  92: { w: 1, h: 1 }, // Fortified Gate
  95: { w: 1, h: 1 }, // Gate
  101: { w: 3, h: 3 }, // Stable
  103: { w: 3, h: 3 }, // Blacksmith
  104: { w: 3, h: 3 }, // Monastery
  105: { w: 3, h: 3 }, // Blacksmith
  109: { w: 4, h: 4 }, // Town Center
  110: { w: 3, h: 3 }, // Trade Workshop
  116: { w: 4, h: 4 }, // Market
  117: { w: 1, h: 1 }, // Stone Wall
  119: { w: 1, h: 1 }, // Fortified Palisade Wall
  129: { w: 2, h: 2 }, // Mill
  130: { w: 2, h: 2 }, // Mill
  131: { w: 2, h: 2 }, // Mill
  132: { w: 3, h: 3 }, // Barracks
  133: { w: 3, h: 3 }, // Dock
  137: { w: 4, h: 4 }, // Market
  141: { w: 4, h: 4 }, // Town Center
  142: { w: 4, h: 4 }, // Town Center
  150: { w: 4, h: 4 }, // Siege Workshop
  153: { w: 3, h: 3 }, // Stable
  155: { w: 1, h: 1 }, // Fortified Wall
  179: { w: 3, h: 3 }, // Trade Workshop
  182: { w: 5, h: 5 }, // Wonder
  190: { w: 1, h: 1 }, // Fire Tower
  191: { w: 2, h: 2 }, // House
  192: { w: 2, h: 2 }, // House
  199: { w: 1, h: 1 }, // Fish Trap
  209: { w: 4, h: 4 }, // University
  210: { w: 4, h: 4 }, // University
  234: { w: 1, h: 1 }, // Guard Tower
  235: { w: 1, h: 1 }, // Keep
  236: { w: 1, h: 1 }, // Bombard Tower
  241: { w: 1, h: 1 }, // Outpost
  276: { w: 5, h: 5 }, // Wonder
  463: { w: 2, h: 2 }, // House
  464: { w: 2, h: 2 }, // House
  465: { w: 2, h: 2 }, // House
  481: { w: 4, h: 4 }, // Town Center
  482: { w: 4, h: 4 }, // Town Center
  483: { w: 4, h: 4 }, // Town Center
  484: { w: 4, h: 4 }, // Town Center
  487: { w: 4, h: 1 }, // Gate (Ascending Foundation)
  488: { w: 4, h: 1 }, // Fortified Gate (Ascending Foundation)
  490: { w: 1, h: 4 }, // Gate (Descending Foundation)
  491: { w: 1, h: 4 }, // Fortified Gate (Descending Foundation)
  498: { w: 3, h: 3 }, // Barracks
  562: { w: 2, h: 2 }, // Lumber Camp
  563: { w: 2, h: 2 }, // Lumber Camp
  564: { w: 2, h: 2 }, // Lumber Camp
  565: { w: 2, h: 2 }, // Lumber Camp
  566: { w: 1, h: 1 }, // Watch Tower
  584: { w: 2, h: 2 }, // Mining Camp
  585: { w: 2, h: 2 }, // Mining Camp
  586: { w: 2, h: 2 }, // Mining Camp
  587: { w: 2, h: 2 }, // Mining Camp
  597: { w: 4, h: 4 }, // Town Center
  598: { w: 1, h: 1 }, // Outpost
  599: { w: 4, h: 4 }, // Cathedral
  611: { w: 4, h: 4 }, // Town Center
  612: { w: 4, h: 4 }, // Town Center
  613: { w: 4, h: 4 }, // Town Center
  614: { w: 4, h: 4 }, // Town Center
  615: { w: 4, h: 4 }, // Town Center
  616: { w: 4, h: 4 }, // Town Center
  617: { w: 4, h: 4 }, // Town Center
  618: { w: 4, h: 4 }, // Town Center
  619: { w: 4, h: 4 }, // Town Center
  620: { w: 4, h: 4 }, // Town Center
  621: { w: 4, h: 4 }, // Town Center
  637: { w: 4, h: 4 }, // Temple of Heaven
  655: { w: 3, h: 3 }, // Mosque
  659: { w: 2, h: 2 }, // Gate (Horizontal Closed)
  660: { w: 2, h: 2 }, // Fortified Gate (Horizontal Closed)
  661: { w: 2, h: 2 }, // Gate (Horizontal Open)
  662: { w: 2, h: 2 }, // Fortified Gate (Horizontal Open)
  663: { w: 1, h: 1 }, // Gate
  664: { w: 1, h: 1 }, // Fortified Gate
  665: { w: 1, h: 1 }, // Gate
  666: { w: 1, h: 1 }, // Fortified Gate
  667: { w: 2, h: 2 }, // Gate (Vertical Closed)
  668: { w: 2, h: 2 }, // Fortified Gate (Vertical Closed)
  669: { w: 2, h: 2 }, // Gate (Vertical Open)
  670: { w: 2, h: 2 }, // Fortified Gate (Vertical Open)
  671: { w: 1, h: 1 }, // Gate
  672: { w: 1, h: 1 }, // Fortified Gate
  673: { w: 1, h: 1 }, // Gate
  674: { w: 1, h: 1 }, // Fortified Gate
  689: { w: 4, h: 4 }, // Pyramid
  690: { w: 4, h: 4 }, // Dome of the Rock
  696: { w: 4, h: 4 }, // Great Pyramid
  785: { w: 1, h: 1 }, // Sea Tower
  788: { w: 1, h: 1 }, // Sea Wall
  789: { w: 2, h: 1 }, // Palisade Gate
  790: { w: 1, h: 1 }, // Palisade Gate
  791: { w: 1, h: 1 }, // Palisade Gate
  792: { w: 4, h: 1 }, // Palisade Gate (Ascending Foundation)
  793: { w: 1, h: 2 }, // Palisade Gate
  794: { w: 1, h: 1 }, // Palisade Gate
  795: { w: 1, h: 1 }, // Palisade Gate
  796: { w: 1, h: 4 }, // Palisade Gate (Descending Foundation)
  797: { w: 2, h: 2 }, // Palisade Gate (Horizontal Closed)
  798: { w: 2, h: 2 }, // Palisade Gate (Horizontal Open)
  799: { w: 1, h: 1 }, // Palisade Gate
  800: { w: 1, h: 1 }, // Palisade Gate
  801: { w: 2, h: 2 }, // Palisade Gate (Vertical Closed)
  802: { w: 2, h: 2 }, // Palisade Gate (Vertical Open)
  803: { w: 1, h: 1 }, // Palisade Gate
  804: { w: 1, h: 1 }, // Palisade Gate
  805: { w: 3, h: 3 }, // Dock
  806: { w: 3, h: 3 }, // Dock
  807: { w: 3, h: 3 }, // Dock
  808: { w: 3, h: 3 }, // Dock
  826: { w: 2, h: 2 }, // Monument
  872: { w: 4, h: 4 }, // Cathedral
  888: { w: 2, h: 2 }, // Llama building
  1021: { w: 5, h: 5 }, // Feitoria
  1096: { w: 4, h: 4 }, // Palace
  1102: { w: 1, h: 1 }, // Fortified Tower
  1187: { w: 3, h: 3 }, // Rice Farm
  1189: { w: 3, h: 3 }, // Harbor
  1192: { w: 1, h: 1 }, // Gate
  1251: { w: 3, h: 3 }, // Krepost
  1264: { w: 2, h: 2 }, // Shrine
  1367: { w: 4, h: 4 }, // Sankore Madrasah
  1368: { w: 4, h: 4 }, // Tower of London
  1369: { w: 4, h: 4 }, // Dormition Cathedral
  1378: { w: 3, h: 3 }, // Rock Church
  1379: { w: 1, h: 1 }, // Sea Gate
  1380: { w: 1, h: 1 }, // Sea Gate
  1381: { w: 1, h: 1 }, // Sea Gate
  1382: { w: 1, h: 1 }, // Sea Gate
  1383: { w: 1, h: 1 }, // Sea Gate
  1384: { w: 1, h: 1 }, // Sea Gate
  1385: { w: 1, h: 1 }, // Sea Gate
  1386: { w: 1, h: 1 }, // Sea Gate
  1387: { w: 1, h: 1 }, // Sea Gate
  1388: { w: 1, h: 1 }, // Sea Gate
  1389: { w: 1, h: 1 }, // Sea Gate
  1390: { w: 1, h: 1 }, // Sea Gate
  1391: { w: 1, h: 1 }, // Sea Gate
  1392: { w: 1, h: 1 }, // Sea Gate
  1393: { w: 1, h: 1 }, // Sea Gate
  1394: { w: 1, h: 1 }, // Sea Gate
  1579: { w: 1, h: 1 }, // City Gate
  1580: { w: 1, h: 1 }, // City Gate
  1581: { w: 1, h: 1 }, // City Gate
  1582: { w: 1, h: 1 }, // City Gate
  1583: { w: 1, h: 1 }, // City Gate
  1584: { w: 1, h: 1 }, // City Gate
  1585: { w: 1, h: 1 }, // City Gate
  1586: { w: 1, h: 1 }, // City Gate
  1587: { w: 1, h: 1 }, // City Gate
  1588: { w: 1, h: 1 }, // City Gate
  1589: { w: 1, h: 1 }, // City Gate
  1590: { w: 1, h: 1 }, // City Gate
  1591: { w: 1, h: 1 }, // City Gate
  1592: { w: 1, h: 1 }, // City Gate
  1593: { w: 1, h: 1 }, // City Gate
  1594: { w: 1, h: 1 }, // City Gate
  1646: { w: 4, h: 4 }, // Market
  1647: { w: 3, h: 3 }, // Trade Workshop
  1665: { w: 2, h: 2 }, // Donjon
  1711: { w: 3, h: 3 }, // Folwark
  1712: { w: 2, h: 2 }, // Pagan Shrine
  1720: { w: 3, h: 3 }, // Folwark
  1734: { w: 3, h: 3 }, // Folwark
  1754: { w: 4, h: 4 }, // Caravanserai
  1806: { w: 3, h: 3 }, // Fortified Church
  1807: { w: 1, h: 1 }, // Svan Tower
  1808: { w: 1, h: 1 }, // Mule Cart
  1836: { w: 3, h: 3 }, // Chapel
  1889: { w: 4, h: 4 }, // Pasture
  1893: { w: 4, h: 4 }, // Pasture
  1897: { w: 4, h: 4 }, // Pasture
  2120: { w: 3, h: 3 }, // Dock
  2121: { w: 3, h: 3 }, // Dock
  2122: { w: 3, h: 3 }, // Dock
  2144: { w: 3, h: 3 }, // Dock
  2145: { w: 3, h: 3 }, // Dock
  2146: { w: 3, h: 3 }, // Dock
  2173: { w: 3, h: 3 }, // Dock
  2300: { w: 4, h: 4 }, // Castle
  2348: { w: 3, h: 3 }, // Oracle Temple
  2414: { w: 4, h: 4 }, // Macedonian Command Post
  2415: { w: 1, h: 1 }, // Fortified Outpost
  2417: { w: 1, h: 1 }, // Fortified Outpost
  2437: { w: 3, h: 3 }, // Camp Barracks
  2438: { w: 3, h: 3 }, // Camp Archery Range
  2439: { w: 3, h: 3 }, // Camp Stable
  2440: { w: 4, h: 4 }, // Camp Siege Workshop
  2441: { w: 3, h: 3 }, // Camp Blacksmith
  2556: { w: 3, h: 3 }, // Settlement
  2558: { w: 3, h: 3 }, // Settlement
  2560: { w: 3, h: 3 }, // Settlement
};

export const getBuildingFootprint = (
  buildingTypeId?: number
): BuildingFootprint => {
  if (!buildingTypeId) return { w: 1, h: 1 };
  if (!FOOTPRINTS[buildingTypeId]) console.log(`Missing footprint for ${buildingTypeId}`);
  return FOOTPRINTS[buildingTypeId] ?? { w: 1, h: 1 };
};

export const isBuildingId = (id: number): boolean => {
  return id in FOOTPRINTS;
};

export const isFarmId = (id?: number): boolean => {
  if (id === undefined) return false;
  // 50: Farm, 1187: Rice Farm
  // 1889, 1893, 1897: Pasture
  return [50, 1187, 1889, 1893, 1897].includes(id);
};
