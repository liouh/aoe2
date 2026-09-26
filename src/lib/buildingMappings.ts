export type BuildingFootprint = {
  w: number;
  h: number;
};

const FOOTPRINTS: Record<number, BuildingFootprint> = {
  10: { w: 3, h: 3 }, // Archery Range, Castle Age
  12: { w: 3, h: 3 }, // Barracks, Dark Age
  14: { w: 3, h: 3 }, // Archery Range, Imperial Age
  18: { w: 3, h: 3 }, // Blacksmith, Castle Age
  19: { w: 3, h: 3 }, // Blacksmith, Imperial Age
  20: { w: 3, h: 3 }, // Barracks, Imperial Age
  30: { w: 3, h: 3 }, // Monastery, Feudal Age
  31: { w: 3, h: 3 }, // Monastery, Castle Age, Upgraded
  32: { w: 3, h: 3 }, // Monastery, Imperial Age
  33: { w: 4, h: 4 }, // Fortress
  45: { w: 3, h: 3 }, // Dock, Dark Age
  47: { w: 3, h: 3 }, // Dock, Castle Age
  49: { w: 4, h: 4 }, // Siege Workshop
  50: { w: 3, h: 3 }, // Farm
  51: { w: 3, h: 3 }, // Dock, Imperial Age
  63: { w: 2, h: 1 }, // Fortified Gate, Ascending Closed
  64: { w: 2, h: 1 }, // Gate, Ascending Closed
  67: { w: 2, h: 1 }, // Fortified Gate, Ascending Open
  68: { w: 2, h: 2 }, // Mill, Dark Age
  70: { w: 2, h: 2 }, // House, Dark Age
  71: { w: 4, h: 4 }, // Town Center, Feudal Age
  72: { w: 1, h: 1 }, // Palisade Wall
  78: { w: 2, h: 1 }, // Gate, Ascending Open
  79: { w: 1, h: 1 }, // Watch Tower
  80: { w: 1, h: 1 }, // Fortified Gate, Ascending Endpieces
  81: { w: 1, h: 1 }, // Gate, Ascending Endpieces
  82: { w: 4, h: 4 }, // Castle
  84: { w: 4, h: 4 }, // Market, Feudal Age
  85: { w: 1, h: 2 }, // Fortified Gate, Descending Closed
  86: { w: 3, h: 3 }, // Stable, Castle Age
  87: { w: 3, h: 3 }, // Archery Range, Feudal Age
  88: { w: 1, h: 2 }, // Gate, Descending Closed
  90: { w: 1, h: 2 }, // Fortified Gate, Descending Open
  91: { w: 1, h: 2 }, // Gate, Descending Open
  92: { w: 1, h: 1 }, // Fortified Gate, Descending Endpieces
  95: { w: 1, h: 1 }, // Gate, Descending Endpieces
  101: { w: 3, h: 3 }, // Stable, Feudal Age
  103: { w: 3, h: 3 }, // Blacksmith, Feudal Age
  104: { w: 3, h: 3 }, // Monastery, Castle Age, Base
  105: { w: 3, h: 3 }, // Blacksmith
  109: { w: 4, h: 4 }, // Town Center, Dark Age
  110: { w: 3, h: 3 }, // Trade Workshop
  116: { w: 4, h: 4 }, // Market, Castle Age
  117: { w: 1, h: 1 }, // Stone Wall
  119: { w: 1, h: 1 }, // Fortified Palisade Wall
  129: { w: 2, h: 2 }, // Mill, Feudal Age
  130: { w: 2, h: 2 }, // Mill, Castle Age
  131: { w: 2, h: 2 }, // Mill, Imperial Age
  132: { w: 3, h: 3 }, // Barracks, Castle Age
  133: { w: 3, h: 3 }, // Dock, Feudal Age
  137: { w: 4, h: 4 }, // Market, Imperial Age
  141: { w: 4, h: 4 }, // Town Center, Castle Age
  142: { w: 4, h: 4 }, // Town Center, Imperial Age
  150: { w: 4, h: 4 }, // Siege Workshop
  153: { w: 3, h: 3 }, // Stable, Imperial Age
  155: { w: 1, h: 1 }, // Fortified Wall
  179: { w: 3, h: 3 }, // Trade Workshop
  182: { w: 5, h: 5 }, // WNDR
  190: { w: 1, h: 1 }, // Fire Tower
  191: { w: 2, h: 2 }, // House
  192: { w: 2, h: 2 }, // House
  199: { w: 1, h: 1 }, // Fish Trap
  209: { w: 4, h: 4 }, // University, Castle Age
  210: { w: 4, h: 4 }, // University, Imperial Age
  234: { w: 1, h: 1 }, // Guard Tower
  235: { w: 1, h: 1 }, // Keep
  236: { w: 1, h: 1 }, // Bombard Tower
  241: { w: 1, h: 1 }, // Cracks
  276: { w: 5, h: 5 }, // Wonder
  444: { w: 4, h: 4 }, // Town Center, Packed
  463: { w: 2, h: 2 }, // House, Feudal Age
  464: { w: 2, h: 2 }, // House, Castle Age
  465: { w: 2, h: 2 }, // House, Imperial Age
  481: { w: 4, h: 4 }, // Town Center, Annex 1, Castle Age
  482: { w: 4, h: 4 }, // Town Center, Annex 2, Castle Age
  483: { w: 4, h: 4 }, // Town Center, Annex 3, Castle Age
  484: { w: 4, h: 4 }, // Town Center
  487: { w: 4, h: 1 }, // Gate, Ascending Foundation
  488: { w: 4, h: 1 }, // Fortified Gate, Ascending Foundation
  490: { w: 1, h: 4 }, // Gate, Descending Foundation
  491: { w: 1, h: 4 }, // Fortified Gate, Descending Foundation
  498: { w: 3, h: 3 }, // Barracks, Feudal Age
  562: { w: 2, h: 2 }, // Lumber Camp, Dark Age
  563: { w: 2, h: 2 }, // Lumber Camp, Feudal Age
  564: { w: 2, h: 2 }, // Lumber Camp, Castle Age
  565: { w: 2, h: 2 }, // Lumber Camp, Imperial Age
  566: { w: 1, h: 1 }, // Watch Tower
  584: { w: 2, h: 2 }, // Mining Camp, Dark Age
  585: { w: 2, h: 2 }, // Mining Camp, Feudal Age
  586: { w: 2, h: 2 }, // Mining Camp, Castle Age
  587: { w: 2, h: 2 }, // Mining Camp, Imperial Age
  597: { w: 4, h: 4 }, // Town Center
  598: { w: 1, h: 1 }, // Outpost
  599: { w: 4, h: 4 }, // Cathedral
  611: { w: 4, h: 4 }, // Town Center, Annex 1, Imperial Age
  612: { w: 4, h: 4 }, // Town Center, Annex 2, Castle Age
  613: { w: 4, h: 4 }, // Town Center, Annex 3, Imperial Age
  614: { w: 4, h: 4 }, // Town Center, Annex 1, Feudal Age
  615: { w: 4, h: 4 }, // Town Center, Annex 2, Feudal Age
  616: { w: 4, h: 4 }, // Town Center, Annex 3, Feudal Age
  617: { w: 4, h: 4 }, // Town Center
  618: { w: 4, h: 4 }, // Town Center, Annex 1, Dark Age
  619: { w: 4, h: 4 }, // Town Center, Annex 2, Dark Age
  620: { w: 4, h: 4 }, // Town Center, Annex 3, Dark Age
  621: { w: 4, h: 4 }, // Town Center, Foundation
  637: { w: 4, h: 4 }, // Temple of Heaven
  655: { w: 3, h: 3 }, // Mosque
  659: { w: 2, h: 2 }, // Gate, Horizontal Closed
  660: { w: 2, h: 2 }, // Fortified Gate, Horizontal Closed
  661: { w: 2, h: 2 }, // Gate, Horizontal Open
  662: { w: 2, h: 2 }, // Fortified Gate, Horizontal Open
  663: { w: 1, h: 1 }, // Gate, Horizontal Endpieces
  664: { w: 1, h: 1 }, // Fortified Gate, Horizontal Endpieces
  665: { w: 1, h: 1 }, // Gate, Horizontal Foundation
  666: { w: 1, h: 1 }, // Fortified Gate, Horizontal Foundation
  667: { w: 2, h: 2 }, // Gate, Vertical Closed
  668: { w: 2, h: 2 }, // Fortified Gate, Vertical Closed
  669: { w: 2, h: 2 }, // Gate, Vertical Open
  670: { w: 2, h: 2 }, // Fortified Gate, Vertical Open
  671: { w: 1, h: 1 }, // Gate, Vertical Endpieces
  672: { w: 1, h: 1 }, // Fortified Gate, Vertical Endpieces
  673: { w: 1, h: 1 }, // Gate, Vertical Foundation
  674: { w: 1, h: 1 }, // Fortified Gate, Vertical Foundation
  689: { w: 4, h: 4 }, // Pyramid
  690: { w: 4, h: 4 }, // Dome of the Rock
  696: { w: 4, h: 4 }, // Great Pyramid
  712: { w: 3, h: 3 }, // Yurt A
  713: { w: 2, h: 2 }, // Yurt B
  714: { w: 2, h: 2 }, // Yurt C
  715: { w: 2, h: 2 }, // Yurt D
  716: { w: 2, h: 2 }, // Yurt E
  717: { w: 2, h: 2 }, // Yurt F
  718: { w: 2, h: 2 }, // Yurt G
  719: { w: 3, h: 3 }, // Yurt H
  785: { w: 1, h: 1 }, // Sea Tower
  788: { w: 1, h: 1 }, // Sea Wall
  789: { w: 2, h: 1 }, // Palisade Gate, Ascending Closed
  790: { w: 2, h: 1 }, // Palisade Gate, Ascending Open
  791: { w: 1, h: 1 }, // Palisade Gate, Ascending Endpieces
  792: { w: 4, h: 1 }, // Palisade Gate, Ascending Foundation
  793: { w: 1, h: 2 }, // Palisade Gate, Descending Closed
  794: { w: 1, h: 2 }, // Palisade Gate, Descending Open
  795: { w: 1, h: 1 }, // Palisade Gate, Descending Endpieces
  796: { w: 1, h: 4 }, // Palisade Gate, Descending Foundation
  797: { w: 2, h: 2 }, // Palisade Gate, Horizontal Closed
  798: { w: 2, h: 2 }, // Palisade Gate, Horizontal Open
  799: { w: 1, h: 1 }, // Palisade Gate, Horizontal Endpieces
  800: { w: 1, h: 1 }, // Palisade Gate, Horizontal Foundation
  801: { w: 2, h: 2 }, // Palisade Gate, Vertical Closed
  802: { w: 2, h: 2 }, // Palisade Gate, Vertical Open
  803: { w: 1, h: 1 }, // Palisade Gate, Vertical Endpieces
  804: { w: 1, h: 1 }, // Palisade Gate, Vertical Foundation
  805: { w: 3, h: 3 }, // Dock
  806: { w: 3, h: 3 }, // Dock
  807: { w: 3, h: 3 }, // Dock
  808: { w: 3, h: 3 }, // Dock
  826: { w: 2, h: 2 }, // Monument
  872: { w: 4, h: 4 }, // Quimper Cathedral
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
  1379: { w: 2, h: 1 }, // Sea Gate, Ascending Closed
  1380: { w: 2, h: 1 }, // Sea Gate, Ascending Open
  1381: { w: 1, h: 1 }, // Sea Gate, Ascending Endpieces
  1382: { w: 4, h: 1 }, // Sea Gate, Ascending Foundation
  1383: { w: 1, h: 2 }, // Sea Gate, Descending Closed
  1384: { w: 1, h: 2 }, // Sea Gate, Descending Open
  1385: { w: 1, h: 1 }, // Sea Gate, Descending Endpieces
  1386: { w: 1, h: 4 }, // Sea Gate, Descending Foundation
  1387: { w: 2, h: 2 }, // Sea Gate, Horizontal Closed
  1388: { w: 2, h: 2 }, // Sea Gate, Horizontal Open
  1389: { w: 1, h: 1 }, // Sea Gate, Horizontal Endpieces
  1390: { w: 1, h: 1 }, // Sea Gate, Horizontal Foundation
  1391: { w: 2, h: 2 }, // Sea Gate, Vertical Closed
  1392: { w: 2, h: 2 }, // Sea Gate, Vertical Open
  1393: { w: 1, h: 1 }, // Sea Gate, Vertical Endpieces
  1394: { w: 1, h: 1 }, // Sea Gate, Vertical Foundation
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
  1711: { w: 3, h: 3 }, // Folwark, Feudal Age
  1712: { w: 2, h: 2 }, // Pagan Shrine
  1720: { w: 3, h: 3 }, // Folwark, Castle Age
  1734: { w: 3, h: 3 }, // Folwark, Dark Age
  1754: { w: 4, h: 4 }, // Caravanserai
  1806: { w: 3, h: 3 }, // Fortified Church
  1807: { w: 1, h: 1 }, // Svan Tower
  1808: { w: 1, h: 1 }, // Mule Cart
  1832: { w: 2, h: 2 }, // Yurt I
  1833: { w: 2, h: 2 }, // Yurt J
  1834: { w: 2, h: 2 }, // Yurt K
  1835: { w: 3, h: 3 }, // Yurt L
  1836: { w: 3, h: 3 }, // Chapel
  1870: { w: 4, h: 4 }, // Chief's Yurt
  1889: { w: 4, h: 4 }, // Pasture
  1893: { w: 4, h: 4 }, // Pasture, Mangrove
  1897: { w: 4, h: 4 }, // Pasture, Land
  2033: { w: 2, h: 2 }, // Yurt M
  2119: { w: 4, h: 4 }, // Shipyard
  2120: { w: 3, h: 3 }, // Dock
  2121: { w: 3, h: 3 }, // Dock
  2122: { w: 3, h: 3 }, // Dock
  2144: { w: 3, h: 3 }, // Dock
  2145: { w: 3, h: 3 }, // Dock
  2146: { w: 3, h: 3 }, // Dock
  2172: { w: 4, h: 4 }, // Port
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
  2556: { w: 3, h: 3 }, // Settlement, Dark Age
  2558: { w: 3, h: 3 }, // Settlement, Feudal Age
  2559: { w: 3, h: 2 }, // Longhouse A
  2560: { w: 3, h: 3 }, // Settlement, Castle Age
  2561: { w: 2, h: 3 }, // Longhouse B
  2600: { w: 4, h: 4 }, // Wooden Fort
  2678: { w: 1, h: 1 }, // Fort Wall
  2679: { w: 2, h: 1 }, // Fort Gate, Ascending Closed
  2680: { w: 2, h: 1 }, // Fort Gate, Ascending Open
  2681: { w: 1, h: 1 }, // Fort Gate, Ascending Endpieces
  2682: { w: 4, h: 1 }, // Fort Gate, Ascending Foundation
  2683: { w: 1, h: 2 }, // Fort Gate, Descending Closed
  2684: { w: 1, h: 2 }, // Fort Gate, Descending Open
  2685: { w: 1, h: 1 }, // Fort Gate, Descending Endpieces
  2686: { w: 1, h: 4 }, // Fort Gate, Descending Foundation
  2687: { w: 2, h: 2 }, // Fort Gate, Horizontal Closed
  2688: { w: 2, h: 2 }, // Fort Gate, Horizontal Open
  2689: { w: 1, h: 1 }, // Fort Gate, Horizontal Endpieces
  2690: { w: 1, h: 1 }, // Fort Gate, Horizontal Foundation
  2691: { w: 2, h: 2 }, // Fort Gate, Vertical Closed
  2692: { w: 2, h: 2 }, // Fort Gate, Vertical Open
  2693: { w: 1, h: 1 }, // Fort Gate, Vertical Endpieces
  2694: { w: 1, h: 1 }, // Fort Gate, Vertical Foundation
  2745: { w: 2, h: 2 }, // Army Tent F
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
  // 50: Farm, 357: Dead Farm, 1187: Rice Farm, 1188: Dead Rice Farm
  // 1889, 1893, 1897: Pasture, 1894, 1898: Dead Pasture
  return [50, 357, 1187, 1188, 1889, 1893, 1894, 1897, 1898].includes(id);
};

export const getBuildingIcon = (name: string): string | null => {
  let icon: string | null = null;

  if (name.includes("Farm") || name.includes("Pasture")) icon = "";
  else if (name.includes("Palisade Wall")) icon = "";
  else if (name.includes("Wall")) icon = "";
  else if (name.includes("Archery Range")) icon = "🏹";
  else if (name.includes("Barracks")) icon = "⚔️";
  else if (name.includes("Blacksmith")) icon = "⚒️";
  else if (name.includes("Castle")) icon = "🏰";
  else if (name.includes("Dock") || name.includes("Harbor") || name.includes("Shipyard") || name.includes("Port")) icon = "⚓";
  else if (name.includes("Feitoria") || name.includes("Caravanserai")) icon = "🏛️";
  else if (name.includes("Gate")) icon = "⛩️";
  else if (name.includes("House") || name.includes("Tent")) icon = "";
  else if (name.includes("Lumber Camp")) icon = "🌲\uFE0E";
  else if (name.includes("Market")) icon = "⚖️";
  else if (name.includes("Mill") || name.includes("Folwark")) icon = "𖣘";
  else if (name.includes("Mining Camp")) icon = "⛏️";
  else if (name.includes("Monastery") || name.includes("Church") || name.includes("Temple") || name.includes("Shrine")) icon = "⛪︎";
  else if (name.includes("Mule Cart")) icon = "🛷";
  else if (name.includes("Outpost")) icon = "📍";
  else if (name.includes("Settlement")) icon = "🛖";
  else if (name.includes("Siege Workshop")) icon = "⚙️";
  else if (name.includes("Stable")) icon = "🐎"; //🐴
  else if (name.includes("Tower") || name.includes("Donjon") || name.includes("Krepost") || name.includes("Fort")) icon = "♜";
  else if (name.includes("Town Center")) icon = "🏫";
  else if (name.includes("University")) icon = "📖\uFE0E";
  else if (name.includes("Wonder")) icon = "⭐";
  else icon = "❓";

  return icon;
};
