export type Entity = {
  name: string;
  type: number;
  class: number;
  footprint?: {
    w: number;
    h: number;
  };
};

/**
 * Complete obstruction and footprint mappings for all AoE2 DE entities (0–2749).
 *
 * type:
 *  0: No obstruction (passable; projectiles, corpses, flares, ambient sea rocks)
 *  1: Removed / deprecated
 *  2: Static obstacle (buildings, trees, land rocks, cliffs)
 *  3: Special static obstacle (ruins, bonfires, loot)
 *  4: Hover / water obstacle (hover rocks)
 *  5: Dynamic unit collision (military, villagers, animals)
 * 10: Mountain obstacle (impassable mountain peaks)
 *
 * class:
 *  0: None / walkable
 *  1: Resource / Natural scenery / Terrain obstacle (trees, rocks, mines, stalls)
 *  2: Unit
 *  3: Standard building
 *  4: Wall
 *  5: Gate
 *  6: Cliff
 */
export const ENTITIES: Record<number, Entity> = {
  0: { name: "Moveable Map Revealer", type: 0, class: 0 },
  1: { name: "Imperial Legionary", type: 5, class: 2 },
  2: { name: "Imperial Legionary (Dead)", type: 0, class: 0 },
  3: { name: "Archer (Dead)", type: 0, class: 0 },
  4: { name: "Archer", type: 5, class: 2 },
  5: { name: "Hand Cannoneer", type: 5, class: 2 },
  6: { name: "Elite Skirmisher", type: 5, class: 2 },
  7: { name: "Skirmisher", type: 5, class: 2 },
  8: { name: "Longbowman", type: 5, class: 2 },
  9: { name: "Arrow", type: 0, class: 0 },
  10: { name: "Archery Range", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  11: { name: "Mangudai", type: 5, class: 2 },
  12: { name: "Barracks", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Dark Age
  13: { name: "Fishing Ship", type: 5, class: 2 },
  14: { name: "Archery Range", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  15: { name: "Junk", type: 5, class: 2 },
  16: { name: "Bombard Cannon (Dead)", type: 0, class: 0 },
  17: { name: "Trade Cog", type: 5, class: 2 },
  18: { name: "Blacksmith", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  19: { name: "Blacksmith", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  20: { name: "Barracks", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  21: { name: "War Galley", type: 5, class: 2 },
  22: { name: "Beta Berserk (Dead)", type: 0, class: 0 },
  23: { name: "Battering Ram (Dead)", type: 0, class: 0 },
  24: { name: "Crossbowman", type: 5, class: 2 },
  25: { name: "Teutonic Knight", type: 5, class: 2 },
  26: { name: "Crossbowman (Dead)", type: 0, class: 0 },
  27: { name: "Cataphract (Dead)", type: 0, class: 0 },
  28: { name: "Chu Ko Nu (Dead)", type: 0, class: 0 },
  29: { name: "Trading Cog (Dead)", type: 0, class: 0 },
  30: { name: "Monastery", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  31: { name: "Monastery", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age, Upgraded
  32: { name: "Monastery", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  33: { name: "Fortress", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  34: { name: "Cavalry Archer (Dead)", type: 0, class: 0 },
  35: { name: "Battering Ram", type: 5, class: 2 },
  36: { name: "Bombard Cannon", type: 5, class: 2 },
  37: { name: "Camel Rider", type: 5, class: 2 },
  38: { name: "Knight", type: 5, class: 2 },
  39: { name: "Cavalry Archer", type: 5, class: 2 },
  40: { name: "Cataphract", type: 5, class: 2 },
  41: { name: "Huskarl", type: 5, class: 2 },
  42: { name: "Trebuchet", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Unpacked
  43: { name: "Deer (Dead)", type: 0, class: 0 },
  44: { name: "Mameluke (Dead)", type: 0, class: 0 },
  45: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Dark Age
  46: { name: "Janissary", type: 5, class: 2 },
  47: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  48: { name: "Wild Boar", type: 5, class: 2 },
  49: { name: "Siege Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  50: { name: "Farm", type: 0, class: 0, footprint: { w: 3, h: 3 } },
  51: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  52: { name: "Royal Janissary", type: 5, class: 2 },
  53: { name: "Fish", type: 0, class: 0 }, // Perch
  54: { name: "Projectile VOL", type: 0, class: 0 },
  55: { name: "Fishing Ship (Dead)", type: 0, class: 0 },
  56: { name: "Fisherman", type: 5, class: 2 }, // Male
  57: { name: "Fisherman", type: 5, class: 2 }, // Female
  58: { name: "Villager Male Fisherman (Dead)", type: 0, class: 0 },
  59: { name: "Forage Bush", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  60: { name: "Villager Female Fisherman (Dead)", type: 0, class: 0 },
  61: { name: "Dolphin", type: 0, class: 0 },
  62: { name: "Huskarl (Dead)", type: 0, class: 0 },
  63: { name: "Fortified Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Closed
  64: { name: "Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Closed
  65: { name: "Deer", type: 5, class: 2 },
  66: { name: "Gold Mine", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  67: { name: "Fortified Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Open
  68: { name: "Mill", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Dark Age
  69: { name: "Fish", type: 0, class: 0 }, // Shore
  70: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Dark Age
  71: { name: "Town Center", type: 0, class: 0, footprint: { w: 4, h: 4 } }, // Feudal Age
  72: { name: "Palisade Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  73: { name: "Chu Ko Nu", type: 5, class: 2 },
  74: { name: "Militia", type: 5, class: 2 },
  75: { name: "Man-at-Arms", type: 5, class: 2 },
  76: { name: "Heavy Swordsman", type: 5, class: 2 },
  77: { name: "Long Swordsman", type: 5, class: 2 },
  78: { name: "Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Open
  79: { name: "Watch Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  80: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Ascending Endpieces
  81: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Ascending Endpieces
  82: { name: "Castle", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  83: { name: "Villager", type: 5, class: 2 }, // Male
  84: { name: "Market", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Feudal Age
  85: { name: "Fortified Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } }, // Descending Closed
  86: { name: "Stable", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  87: { name: "Archery Range", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  88: { name: "Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } }, // Descending Closed
  89: { name: "Dire Wolf", type: 5, class: 2 },
  90: { name: "Fortified Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } }, // Descending Open
  91: { name: "Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } }, // Descending Open
  92: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Descending Endpieces
  93: { name: "Spearman", type: 5, class: 2 },
  94: { name: "Beta Berserk", type: 3, class: 2, footprint: { w: 1, h: 1 } },
  95: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Descending Endpieces
  96: { name: "Hawk", type: 5, class: 2 },
  97: { name: "Arrow", type: 0, class: 0 },
  98: { name: "Hand Cannoneer (Dead)", type: 0, class: 0 },
  99: { name: "Heavy Swordsman (Dead)", type: 0, class: 0 },
  100: { name: "Elite Skirmisher (Dead)", type: 0, class: 0 },
  101: { name: "Stable", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  102: { name: "Stone Mine", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  103: { name: "Blacksmith", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  104: { name: "Monastery", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age, Base
  105: { name: "Blacksmith", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  106: { name: "Leif Erikson", type: 5, class: 2 },
  107: { name: "Janissary (Dead)", type: 0, class: 0 },
  108: { name: "Junk (Dead)", type: 0, class: 0 },
  109: { name: "Town Center", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Dark Age (type 0, class 0 override)
  110: { name: "Trade Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  111: { name: "Knight (Dead)", type: 0, class: 0 },
  112: { name: "Revealer", type: 0, class: 0 },
  113: { name: "Camel Rider (Dead)", type: 0, class: 0 },
  114: { name: "Stoertebeker", type: 5, class: 2 },
  115: { name: "Longbowman (Dead)", type: 0, class: 0 },
  116: { name: "Market", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Castle Age
  117: { name: "Stone Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  118: { name: "Builder", type: 5, class: 2 }, // Male
  119: { name: "Fortified Palisade Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  120: { name: "Forager", type: 5, class: 2 }, // Male
  121: { name: "Mangonel (Dead)", type: 0, class: 0 },
  122: { name: "Hunter", type: 5, class: 2 }, // Male
  123: { name: "Lumberjack", type: 5, class: 2 }, // Male
  124: { name: "Stone Miner", type: 5, class: 2 }, // Male
  125: { name: "Monk", type: 5, class: 2 },
  126: { name: "Grey Wolf", type: 5, class: 2 },
  127: { name: "OLD_EXPLORER", type: 0, class: 0 },
  128: { name: "Trade Cart", type: 5, class: 2 }, // Empty
  129: { name: "Mill", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Feudal Age
  130: { name: "Mill", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Castle Age
  131: { name: "Mill", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Imperial Age
  132: { name: "Barracks", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  133: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  134: { name: "Monk (Dead)", type: 0, class: 0 },
  135: { name: "Mangudai (Dead)", type: 0, class: 0 },
  136: { name: "War Elephant (Dead)", type: 0, class: 0 },
  137: { name: "Market", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Imperial Age
  138: { name: "Spy", type: 5, class: 2 },
  139: { name: "Cavalier (Dead)", type: 0, class: 0 },
  140: { name: "Spearman (Dead)", type: 0, class: 0 },
  141: { name: "Town Center", type: 0, class: 0, footprint: { w: 4, h: 4 } }, // Castle Age
  142: { name: "Town Center", type: 0, class: 0, footprint: { w: 4, h: 4 } }, // Imperial Age
  143: { name: "Rubble 1 x 1", type: 0, class: 0 },
  144: { name: "Rubble 2 x 2", type: 0, class: 0 },
  145: { name: "Rubble 3 x 3", type: 0, class: 0 },
  146: { name: "Rubble 4 x 4", type: 0, class: 0 },
  147: { name: "Rubble 6 x 6", type: 0, class: 0 },
  148: { name: "Rubble 8 x 8", type: 0, class: 0 },
  149: { name: "Scorpion (Dead)", type: 0, class: 0 },
  150: { name: "Siege Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  151: { name: "Samurai (Dead)", type: 0, class: 0 },
  152: { name: "Militia (Dead)", type: 0, class: 0 },
  153: { name: "Stable", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Imperial Age
  154: { name: "Man-At-Arms (Dead)", type: 0, class: 0 },
  155: { name: "Fortified Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  156: { name: "Repairer", type: 5, class: 2 }, // Male
  157: { name: "Throwing Axeman (Dead)", type: 0, class: 0 },
  158: { name: "Outlaw", type: 5, class: 2 },
  159: { name: "Relic Cart", type: 5, class: 2 },
  160: { name: "Richard the Lionheart", type: 5, class: 2 },
  161: { name: "The Black Prince", type: 5, class: 2 },
  162: { name: "FLAGX", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  163: { name: "Friar Tuck", type: 5, class: 2 },
  164: { name: "Sheriff of Nottingham", type: 5, class: 2 },
  165: { name: "Charlemagne", type: 5, class: 2 },
  166: { name: "Roland", type: 5, class: 2 },
  167: { name: "Belisarius", type: 5, class: 2 },
  168: { name: "Theodoric the Goth", type: 5, class: 2 },
  169: { name: "Aethelfrith", type: 5, class: 2 },
  170: { name: "Siegfried", type: 5, class: 2 },
  171: { name: "Erik the Red", type: 5, class: 2 },
  172: { name: "Tamerlane", type: 5, class: 2 },
  173: { name: "King Arthur", type: 5, class: 2 },
  174: { name: "Lancelot", type: 5, class: 2 },
  175: { name: "Gawain", type: 5, class: 2 },
  176: { name: "Mordred", type: 5, class: 2 },
  177: { name: "Archbishop", type: 5, class: 2 },
  178: { name: "Trade Cart Empty (Dead)", type: 0, class: 0 },
  179: { name: "Trade Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  180: { name: "Long Swordsman (Dead)", type: 0, class: 0 },
  181: { name: "Teutonic Knight (Dead)", type: 0, class: 0 },
  182: { name: "WNDR", type: 0, class: 0, footprint: { w: 5, h: 5 } },
  183: { name: "TMISB", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  184: { name: "Condottiero", type: 5, class: 2 }, // Placeholder
  185: { name: "Slinger", type: 5, class: 2 },
  186: { name: "Slinger (Dead)", type: 0, class: 0 },
  187: { name: "Projectile Slinger", type: 0, class: 0 },
  188: { name: "Flamethrower", type: 5, class: 2 },
  189: { name: "Flamethrower (Dead)", type: 0, class: 0 },
  190: { name: "Fire Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  191: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  192: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  193: { name: "Vlad Dracula", type: 5, class: 2 },
  194: { name: "Trebuchet (Dead)", type: 0, class: 0 },
  195: { name: "Kitabatake", type: 5, class: 2 },
  196: { name: "Minamoto", type: 5, class: 2 },
  197: { name: "Alexander Nevski", type: 5, class: 2 },
  198: { name: "El Cid", type: 5, class: 2 },
  199: { name: "Fish Trap", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  200: { name: "Robin Hood", type: 5, class: 2 },
  201: { name: "Tree", type: 0, class: 0 },
  202: { name: "Rabid Wolf", type: 5, class: 2 },
  203: { name: "Vasco da Gama", type: 5, class: 2 },
  204: { name: "Trade Cart", type: 5, class: 2 }, // Full
  205: { name: "Trade Cart (Dead)", type: 0, class: 0 }, // Full, Dead
  206: { name: "VMDL", type: 5, class: 2 },
  207: { name: "Imperial Camel Rider", type: 5, class: 2 },
  208: { name: "TWAL", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  209: { name: "University", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Castle Age
  210: { name: "University", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Imperial Age
  211: { name: "Villager Female (Dead)", type: 0, class: 0 },
  212: { name: "Builder", type: 5, class: 2 }, // Female
  213: { name: "Villager Female Builder (Dead)", type: 0, class: 0 },
  214: { name: "Farmer", type: 5, class: 2 }, // Female
  215: { name: "Villager Female Farmer (Dead)", type: 0, class: 0 },
  216: { name: "Hunter", type: 5, class: 2 }, // Female
  217: { name: "Villager Female Hunter (Dead)", type: 0, class: 0 },
  218: { name: "Lumberjack", type: 5, class: 2 }, // Female
  219: { name: "Villager Female Lumberjack (Dead)", type: 0, class: 0 },
  220: { name: "Stone Miner", type: 5, class: 2 }, // Female
  221: { name: "Villager Female Stone Miner (Dead)", type: 0, class: 0 },
  222: { name: "Repairer", type: 5, class: 2 }, // Female
  223: { name: "Alaric the Goth", type: 5, class: 2 },
  224: { name: "Villager Male (Dead)", type: 0, class: 0 },
  225: { name: "Villager Male Builder (Dead)", type: 0, class: 0 },
  226: { name: "Villager Male Farmer (Dead)", type: 0, class: 0 },
  227: { name: "Villager Male Hunter (Dead)", type: 0, class: 0 },
  228: { name: "Villager Male Lumberjack (Dead)", type: 0, class: 0 },
  229: { name: "Villager Male Stone Miner (Dead)", type: 0, class: 0 },
  230: { name: "King Bela IV", type: 5, class: 2 },
  231: { name: "Aqueduct", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  232: { name: "Woad Raider", type: 5, class: 2 },
  233: { name: "Woad Raider (Dead)", type: 0, class: 0 },
  234: { name: "Guard Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  235: { name: "Keep", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  236: { name: "Bombard Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  237: { name: "Wolf (Dead)", type: 0, class: 0 },
  238: { name: "Skirmisher (Dead)", type: 0, class: 0 },
  239: { name: "War Elephant", type: 5, class: 2 },
  240: { name: "TERRC", type: 0, class: 0 },
  241: { name: "Cracks", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  242: { name: "Projectile Stone Catapult", type: 0, class: 0 },
  243: { name: "Doppelganger", type: 0, class: 0 },
  244: { name: "Projectile Stone Catapult", type: 0, class: 0 }, // Fire
  245: { name: "Projectile Bolt", type: 0, class: 0 },
  246: { name: "Projectile Bolt", type: 0, class: 0 }, // Fire
  247: { name: "Trail Smoke", type: 0, class: 0 },
  248: { name: "Pile of Stone", type: 0, class: 0 },
  249: { name: "POREX", type: 0, class: 0 },
  250: { name: "Longboat", type: 5, class: 2 },
  251: { name: "Amphitheatre", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  252: { name: "Pile of Gold", type: 0, class: 0 },
  253: { name: "Pile of Wood", type: 0, class: 0 },
  254: { name: "PILE1", type: 0, class: 0 },
  255: { name: "PILE2", type: 0, class: 0 },
  256: { name: "PILE3", type: 0, class: 0 },
  257: { name: "PILE4", type: 0, class: 0 },
  258: { name: "PILE6", type: 0, class: 0 },
  259: { name: "Farmer", type: 5, class: 2 }, // Male
  260: { name: "Disabled", type: 0, class: 0 },
  261: { name: "PILE8", type: 0, class: 0 },
  262: { name: "Pile of Food", type: 0, class: 0 },
  263: { name: "Colosseum", type: 2, class: 3, footprint: { w: 8, h: 8 } },
  264: { name: "Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  265: { name: "Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  266: { name: "Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  267: { name: "Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  268: { name: "Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  269: { name: "Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  270: { name: "Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  271: { name: "Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  272: { name: "Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  273: { name: "Placeholder", type: 0, class: 0 },
  274: { name: "Flare", type: 0, class: 0 },
  275: { name: "Imperial Centurion", type: 5, class: 2 },
  276: { name: "Wonder", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  277: { name: "Imperial Centurion (Dead)", type: 0, class: 0 },
  278: { name: "Fish Trap (Dead)", type: 0, class: 0 },
  279: { name: "Scorpion", type: 5, class: 2 },
  280: { name: "Mangonel", type: 5, class: 2 },
  281: { name: "Throwing Axeman", type: 5, class: 2 },
  282: { name: "Mameluke", type: 5, class: 2 },
  283: { name: "Cavalier", type: 5, class: 2 },
  284: { name: "Tree TD", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  285: { name: "Relic", type: 5, class: 2 },
  286: { name: "Monk with Relic", type: 5, class: 2 },
  287: { name: "British Relic", type: 5, class: 2 },
  288: { name: "Byzantine Relic", type: 5, class: 2 },
  289: { name: "Chinese Relic", type: 5, class: 2 },
  290: { name: "Frankish Relic", type: 5, class: 2 },
  291: { name: "Samurai", type: 5, class: 2 },
  292: { name: "Gothic Relic", type: 5, class: 2 },
  293: { name: "Villager", type: 5, class: 2 }, // Female
  294: { name: "Japanese Relic", type: 5, class: 2 },
  295: { name: "Persian Relic", type: 5, class: 2 },
  296: { name: "Saracen Relic", type: 5, class: 2 },
  297: { name: "Teutonic Relic", type: 5, class: 2 },
  298: { name: "Turkish Relic", type: 5, class: 2 },
  299: { name: "Bandit", type: 5, class: 2 },
  300: { name: "Imperial Camel Rider (Dead)", type: 0, class: 0 },
  301: { name: "Grass Patch, Green", type: 0, class: 0 },
  302: { name: "Bush A", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  303: { name: "Seagulls", type: 5, class: 2 },
  304: { name: "Bonfire", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  305: { name: "Llama", type: 5, class: 2 },
  306: { name: "Black Tile", type: 0, class: 0 },
  307: { name: "Cuauhtemoc", type: 5, class: 2 },
  308: { name: "Indestructible Outpost", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  309: { name: "Monk with Turkish Relic", type: 5, class: 2 },
  310: { name: "Mountain 1", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  311: { name: "Mountain 2", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  312: { name: "Projectile Arrow 2", type: 0, class: 0 },
  313: { name: "Projectile Stone, Trebuchet", type: 0, class: 0 },
  314: { name: "Projectile Stone, Mangonel", type: 0, class: 0 },
  315: { name: "Projectile Arrow 3", type: 0, class: 0 },
  316: { name: "Projectile Arrow 4", type: 0, class: 0 },
  317: { name: "Projectile Arrow 5", type: 0, class: 0 },
  318: { name: "Projectile Arrow 6", type: 0, class: 0 },
  319: { name: "Projectile Arrow 7", type: 0, class: 0 },
  320: { name: "Projectile Arrow 8", type: 0, class: 0 },
  321: { name: "Projectile Arrow 9", type: 0, class: 0 },
  322: { name: "Projectile Arrow 10", type: 0, class: 0 },
  323: { name: "Projectile Stone, Catapult 1", type: 0, class: 0 },
  324: { name: "Projectile Stone, Catapult 2", type: 0, class: 0 },
  325: { name: "Projectile Stone, Catapult 3", type: 0, class: 0 },
  326: { name: "Projectile Stone, Catapult 4", type: 0, class: 0 },
  327: { name: "Projectile Stone, Catapult 5", type: 0, class: 0 },
  328: { name: "Projectile VOL", type: 0, class: 0 }, // Fire
  329: { name: "Camel Rider", type: 5, class: 2 },
  330: { name: "Heavy Camel Rider", type: 5, class: 2 },
  331: { name: "Trebuchet", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Packed
  332: { name: "Flare", type: 0, class: 0 },
  333: { name: "Deer", type: 0, class: 0 },
  334: { name: "Flowers 1", type: 0, class: 0 },
  335: { name: "Flowers 2", type: 0, class: 0 },
  336: { name: "Flowers 3", type: 0, class: 0 },
  337: { name: "Flowers 4", type: 0, class: 0 },
  338: { name: "Path 4", type: 0, class: 0 },
  339: { name: "Path 1", type: 0, class: 0 },
  340: { name: "Path 2", type: 0, class: 0 },
  341: { name: "Path 3", type: 0, class: 0 },
  342: { name: "Cuman Chief", type: 0, class: 0 },
  343: { name: "TERRV", type: 0, class: 0 },
  344: { name: "TERRW", type: 0, class: 0 },
  345: { name: "Ruins", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  346: { name: "TERRY", type: 0, class: 0 },
  347: { name: "TERRZ", type: 0, class: 0 },
  348: { name: "Bamboo Forest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  349: { name: "Oak Forest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  350: { name: "Pine Forest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  351: { name: "Palm Forest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  352: { name: "OREMN", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  353: { name: "Villager Male Forager (Dead)", type: 0, class: 0 },
  354: { name: "Forager", type: 5, class: 2 }, // Female
  355: { name: "Villager Female Forager (Dead)", type: 0, class: 0 },
  356: { name: "Boar (Dead)", type: 0, class: 0 },
  357: { name: "Farm (Dead)", type: 0, class: 0 },
  358: { name: "Pikeman", type: 5, class: 2 },
  359: { name: "Halberdier", type: 5, class: 2 },
  360: { name: "Projectile Arrow", type: 0, class: 0 }, // Fire
  361: { name: "Norse Warrior", type: 5, class: 2 },
  362: { name: "Norse Warrior (Dead)", type: 0, class: 0 },
  363: { name: "Projectile Archer", type: 0, class: 0 },
  364: { name: "Projectile Crossbowman", type: 0, class: 0 },
  365: { name: "Projectile Skirmisher", type: 0, class: 0 },
  366: { name: "Projectile Elite Skirmisher", type: 0, class: 0 },
  367: { name: "Projectile Scorpion", type: 0, class: 0 },
  368: { name: "Projectile Bombard Cannon", type: 0, class: 0 },
  369: { name: "Projectile Mangonel", type: 0, class: 0 }, // Secondary
  370: { name: "City Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  371: { name: "Projectile Trebuchet", type: 0, class: 0 },
  372: { name: "Projectile Galleon", type: 0, class: 0 },
  373: { name: "Projectile War Galley", type: 0, class: 0 },
  374: { name: "Projectile Cannon Galleon", type: 0, class: 0 },
  375: { name: "Projectile Crossbowman", type: 0, class: 0 }, // Fire
  376: { name: "Projectile Skirmisher", type: 0, class: 0 }, // Fire
  377: { name: "Projectile Elite Skirmisher", type: 0, class: 0 }, // Fire
  378: { name: "Projectile Scorpion", type: 0, class: 0 }, // Fire
  379: { name: "Placeholder", type: 0, class: 0 },
  380: { name: "Projectile Gunpowder", type: 0, class: 0 }, // Primary
  381: { name: "Projectile Bolt", type: 0, class: 0 }, // Fire
  382: { name: "Placeholder", type: 0, class: 0 },
  383: { name: "Placeholder", type: 0, class: 0 },
  384: { name: "Placeholder", type: 0, class: 0 },
  385: { name: "Projectile Bolt", type: 0, class: 0 }, // Fire
  386: { name: "Placeholder", type: 0, class: 0 },
  387: { name: "Placeholder", type: 0, class: 0 },
  388: { name: "Placeholder", type: 0, class: 0 },
  389: { name: "Sea Rocks 1", type: 0, class: 0 },
  390: { name: "TERRB", type: 0, class: 0 },
  391: { name: "TERRD", type: 0, class: 0 },
  392: { name: "TERRE", type: 0, class: 0 },
  393: { name: "TERRF", type: 0, class: 0 },
  394: { name: "TERRH", type: 0, class: 0 },
  395: { name: "TERRI", type: 0, class: 0 },
  396: { name: "Sea Rocks 2", type: 0, class: 0 },
  397: { name: "TERRK", type: 0, class: 0 },
  398: { name: "TERRL", type: 0, class: 0 },
  399: { name: "Tree A", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  400: { name: "Tree B", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  401: { name: "Tree C", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  402: { name: "Tree D", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  403: { name: "Tree E", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  404: { name: "Tree F", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  405: { name: "Tree G", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  406: { name: "Tree H", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  407: { name: "Tree I", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  408: { name: "Tree J", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  409: { name: "Tree K", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  410: { name: "Tree L", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  411: { name: "Forest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  412: { name: "Monk (Dead)", type: 0, class: 0 },
  413: { name: "Snow Pine Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  414: { name: "Jungle Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  415: { name: "Stump", type: 0, class: 0 },
  416: { name: "Debris", type: 0, class: 0 },
  417: { name: "Dust C", type: 0, class: 0 },
  418: { name: "Henry the Lion", type: 5, class: 2 },
  419: { name: "Debris B", type: 0, class: 0 },
  420: { name: "Cannon Galleon", type: 5, class: 2 },
  421: { name: "Cannon Galleon (Dead)", type: 0, class: 0 },
  422: { name: "Capped Ram", type: 5, class: 2 },
  423: { name: "Capped Ram (Dead)", type: 0, class: 0 },
  424: { name: "Charles Martel", type: 5, class: 2 },
  425: { name: "Francisco de Orellana", type: 5, class: 2 },
  426: { name: "Harald Hardraade", type: 5, class: 2 },
  427: { name: "Gonzalo Pizarro", type: 5, class: 2 },
  428: { name: "Hrolf the Ganger", type: 5, class: 2 },
  429: { name: "Frederick Barbarossa", type: 5, class: 2 },
  430: { name: "Joan the Maid", type: 5, class: 2 },
  431: { name: "Joan the Maid (Dead)", type: 0, class: 0 },
  432: { name: "William Wallace", type: 5, class: 2 },
  433: { name: "William Wallace (Dead)", type: 0, class: 0 },
  434: { name: "King", type: 5, class: 2 },
  435: { name: "King (Dead)", type: 0, class: 0 },
  436: { name: "OMTBO", type: 5, class: 2 },
  437: { name: "Prithviraj", type: 5, class: 2 },
  438: { name: "STRBO", type: 3, class: 2, footprint: { w: 1, h: 1 } },
  439: { name: "Francesco Sforza", type: 5, class: 2 },
  440: { name: "Petard", type: 5, class: 2 },
  441: { name: "Hussar", type: 5, class: 2 },
  442: { name: "Galleon", type: 5, class: 2 },
  443: { name: "Galleon (Dead)", type: 0, class: 0 },
  444: { name: "Town Center", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Packed
  445: { name: "Poenari Castle", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  446: { name: "Port", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  447: { name: "SHALW", type: 0, class: 0 },
  448: { name: "Scout Cavalry", type: 5, class: 2 },
  449: { name: "Scout Cavalry (Dead)", type: 0, class: 0 },
  450: { name: "Great Fish", type: 0, class: 0 }, // Marlin
  451: { name: "Great Fish", type: 0, class: 0 }, // Marlin
  452: { name: "Dolphin", type: 0, class: 0 },
  453: { name: "Ataulf", type: 5, class: 2 },
  454: { name: "DOLP5", type: 0, class: 0 },
  455: { name: "Fish", type: 0, class: 0 }, // Dorado
  456: { name: "Fish", type: 0, class: 0 }, // Salmon
  457: { name: "Fish", type: 0, class: 0 }, // Tuna
  458: { name: "Fish", type: 0, class: 0 }, // Snapper
  459: { name: "FISH5", type: 0, class: 0 },
  460: { name: "WHAL1", type: 0, class: 0 },
  461: { name: "WHAL2", type: 0, class: 0 },
  462: { name: "Projectile Mangonel", type: 0, class: 0 }, // Fire
  463: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Feudal Age
  464: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Castle Age
  465: { name: "House", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Imperial Age
  466: { name: "Projectile Archer", type: 0, class: 0 }, // Fire
  467: { name: "Placeholder", type: 0, class: 0 },
  468: { name: "Projectile Mangonel", type: 0, class: 0 }, // Secondary Fire
  469: { name: "Projectile Trebuchet", type: 0, class: 0 }, // Fire
  470: { name: "Projectile Galley", type: 0, class: 0 }, // Fire
  471: { name: "Projectile War Galley", type: 0, class: 0 }, // Fire
  472: { name: "Loot", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  473: { name: "Two-Handed Swordsman", type: 5, class: 2 },
  474: { name: "Heavy Cavalry Archer", type: 5, class: 2 },
  475: { name: "Projectile HAR", type: 0, class: 0 }, // Fire
  476: { name: "Projectile Harold Haraade", type: 0, class: 0 }, // Fire
  477: { name: "Projectile HAR", type: 0, class: 0 },
  478: { name: "Projectile Harold Haraade", type: 0, class: 0 },
  479: { name: "Packed Mangonel", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  480: { name: "Hussar (Dead)", type: 0, class: 0 },
  481: { name: "Town Center", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Annex 1, Castle Age
  482: { name: "Town Center", type: 0, class: 0 }, // Annex 2, Castle Age
  483: { name: "Town Center", type: 0, class: 0 }, // Annex 3, Castle Age
  484: { name: "Town Center", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  485: { name: "Projectile Town Center", type: 0, class: 0 },
  486: { name: "Brown Bear", type: 5, class: 2 },
  487: { name: "Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } }, // Ascending Foundation
  488: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } }, // Ascending Foundation
  489: { name: "Bear (Dead)", type: 0, class: 0 },
  490: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } }, // Descending Foundation
  491: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } }, // Descending Foundation
  492: { name: "Arbalest", type: 5, class: 2 },
  493: { name: "Advanced Heavy Crossbowman", type: 5, class: 2 },
  494: { name: "Camel Rider (Dead)", type: 0, class: 0 },
  495: { name: "Heavy Camel Rider (Dead)", type: 0, class: 0 },
  496: { name: "Arbalest (Dead)", type: 0, class: 0 },
  497: { name: "King (Dead)", type: 0, class: 0 },
  498: { name: "Barracks", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  499: { name: "Torch A", type: 0, class: 0 },
  500: { name: "Two Handed Swordsman (Dead)", type: 0, class: 0 },
  501: { name: "Pikeman (Dead)", type: 0, class: 0 },
  502: { name: "Halberdier (Dead)", type: 0, class: 0 },
  503: { name: "Projectile Watch Tower", type: 0, class: 0 },
  504: { name: "Projectile Guard Tower", type: 0, class: 0 },
  505: { name: "Projectile Keep", type: 0, class: 0 },
  506: { name: "Projectile Bombard Tower", type: 0, class: 0 },
  507: { name: "Projectile Arbalest", type: 0, class: 0 },
  508: { name: "Projectile Advanced Heavy Crossbowman", type: 0, class: 0 },
  509: { name: "Projectile Villager", type: 0, class: 0 },
  510: { name: "Projectile Chu Ko Nu", type: 0, class: 0 },
  511: { name: "Projectile Longbowman", type: 0, class: 0 },
  512: { name: "Projectile Longboat", type: 0, class: 0 },
  513: { name: "Projectile MSU", type: 0, class: 0 },
  514: { name: "Projectile MPC", type: 0, class: 0 },
  515: { name: "Projectile Axeman", type: 0, class: 0 },
  516: { name: "Projectile Watch Tower", type: 0, class: 0 }, // Fire
  517: { name: "Projectile Gaurd Tower", type: 0, class: 0 }, // Fire
  518: { name: "Projectile Keep", type: 0, class: 0 }, // Fire
  519: { name: "Projectile Arbalest", type: 0, class: 0 }, // Fire
  520: { name: "Projectile Heavy Crossbowman", type: 0, class: 0 }, // Fire
  521: { name: "Projectile Villager", type: 0, class: 0 }, // Fire
  522: { name: "Projectile Cho Ko Nu", type: 0, class: 0 }, // Fire
  523: { name: "Projectile Longbowman", type: 0, class: 0 }, // Fire
  524: { name: "Projectile Longboat", type: 0, class: 0 }, // Fire
  525: { name: "Projectile MPC", type: 0, class: 0 }, // Fire
  526: { name: "Projectile MSU", type: 0, class: 0 }, // Fire
  527: { name: "Demolition Ship", type: 5, class: 2 }, // non-WK
  528: { name: "Heavy Demolition Ship", type: 5, class: 2 },
  529: { name: "Fire Ship", type: 5, class: 2 }, // non-WK
  530: { name: "Elite Longbowman", type: 5, class: 2 },
  531: { name: "Elite Throwing Axeman", type: 5, class: 2 },
  532: { name: "Fast Fire Ship", type: 5, class: 2 },
  533: { name: "Elite Longboat", type: 5, class: 2 },
  534: { name: "Elite Woad Raider", type: 5, class: 2 },
  535: { name: "BDGAL", type: 5, class: 2 },
  536: { name: "ABGAL", type: 5, class: 2 },
  537: { name: "Projectile FRG", type: 0, class: 0 },
  538: { name: "Projectile HFG", type: 0, class: 0 },
  539: { name: "Galley", type: 5, class: 2 },
  540: { name: "Projectile Galley", type: 0, class: 0 },
  541: { name: "Projectile Galley", type: 0, class: 0 }, // Fire
  542: { name: "Heavy Scorpion", type: 5, class: 2 },
  543: { name: "Heavy Scorpion (Dead)", type: 0, class: 0 },
  544: { name: "FLDOG", type: 0, class: 0 },
  545: { name: "Transport Ship", type: 5, class: 2 },
  546: { name: "Light Cavalry", type: 5, class: 2 },
  547: { name: "Light Cavalry (Dead)", type: 0, class: 0 },
  548: { name: "Siege Ram", type: 5, class: 2 },
  549: { name: "Siege Ram (Dead)", type: 0, class: 0 },
  550: { name: "Onager", type: 5, class: 2 }, // non-WK
  551: { name: "Projectile Onager", type: 0, class: 0 },
  552: { name: "Projectile Onager", type: 0, class: 0 }, // Fire
  553: { name: "Elite Cataphract", type: 5, class: 2 },
  554: { name: "Elite Teutonic Knight", type: 5, class: 2 },
  555: { name: "Elite Huskarl", type: 5, class: 2 },
  556: { name: "Elite Mameluke", type: 5, class: 2 },
  557: { name: "Elite Janissary", type: 5, class: 2 },
  558: { name: "Elite War Elephant", type: 5, class: 2 },
  559: { name: "Elite Chu Ko Nu", type: 5, class: 2 },
  560: { name: "Elite Samurai", type: 5, class: 2 },
  561: { name: "Elite Mangudai", type: 5, class: 2 },
  562: { name: "Lumber Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Dark Age
  563: { name: "Lumber Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Feudal Age
  564: { name: "Lumber Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Castle Age
  565: { name: "Lumber Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Imperial Age
  566: { name: "Watch Tower", type: 2, class: 0, footprint: { w: 1, h: 1 } },
  567: { name: "Champion", type: 5, class: 2 },
  568: { name: "Champion (Dead)", type: 0, class: 0 },
  569: { name: "Paladin", type: 5, class: 2 },
  570: { name: "Paladin (Dead)", type: 0, class: 0 },
  571: { name: "Raider Archer", type: 5, class: 2 },
  572: { name: "Raider Archer (Dead)", type: 0, class: 0 },
  573: { name: "Raider Swordsman", type: 5, class: 2 },
  574: { name: "Raider Swordsman (Dead)", type: 0, class: 0 },
  575: { name: "Raider Cavalry", type: 5, class: 2 },
  576: { name: "Raider Cavalry (Dead)", type: 0, class: 0 },
  577: { name: "Raider Cavalry Archer", type: 5, class: 2 },
  578: { name: "Raider Cavalry Archer Dead", type: 0, class: 0 },
  579: { name: "Gold Miner", type: 5, class: 2 }, // Male
  580: { name: "Villager Male Gold Miner (Dead)", type: 0, class: 0 },
  581: { name: "Gold Miner", type: 5, class: 2 }, // Female
  582: { name: "Villager Female Gold Miner (Dead)", type: 0, class: 0 },
  583: { name: "Genitour", type: 5, class: 2 },
  584: { name: "Mining Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Dark Age
  585: { name: "Mining Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Feudal Age
  586: { name: "Mining Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Castle Age
  587: { name: "Mining Camp", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Imperial Age
  588: { name: "Siege Onager", type: 5, class: 2 },
  589: { name: "Siege Onager (Dead)", type: 0, class: 0 },
  590: { name: "Shepherd", type: 5, class: 2 }, // Female
  591: { name: "Villager Female Shepherd (Dead)", type: 0, class: 0 },
  592: { name: "Shepherd", type: 5, class: 2 }, // Male
  593: { name: "Villager Male Shepherd (Dead)", type: 0, class: 0 },
  594: { name: "Sheep", type: 5, class: 2 },
  595: { name: "Sheep (Dead)", type: 0, class: 0 },
  596: { name: "Elite Genitour", type: 5, class: 2 },
  597: { name: "Town Center", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  598: { name: "Outpost", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  599: { name: "Cathedral", type: 2, class: 3, footprint: { w: 8, h: 8 } },
  600: { name: "Flag A", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  601: { name: "Flag B", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  602: { name: "Flag C", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  603: { name: "Flag D", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  604: { name: "Flag E", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  605: { name: "Bridge A--Top", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  606: { name: "Bridge A--Middle", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  607: { name: "Bridge A--Bottom", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  608: { name: "Bridge B--Top", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  609: { name: "Bridge B--Middle", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  610: { name: "Bridge B--Bottom", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  611: { name: "Town Center", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Annex 1, Imperial Age
  612: { name: "Town Center", type: 0, class: 0 }, // Annex 2, Castle Age
  613: { name: "Town Center", type: 0, class: 0 }, // Annex 3, Imperial Age
  614: { name: "Town Center", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Annex 1, Feudal Age
  615: { name: "Town Center", type: 0, class: 0 }, // Annex 2, Feudal Age
  616: { name: "Town Center", type: 0, class: 0 }, // Annex 3, Feudal Age
  617: { name: "Town Center", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  618: { name: "Town Center", type: 2, class: 3, footprint: { w: 2, h: 2 } }, // Annex 1, Dark Age
  619: { name: "Town Center", type: 0, class: 0 }, // Annex 2, Dark Age
  620: { name: "Town Center", type: 0, class: 0 }, // Annex 3, Dark Age
  621: { name: "Town Center", type: 2, class: 3, footprint: { w: 4, h: 4 } }, // Foundation
  622: { name: "Elite Genitour (Dead)", type: 0, class: 0 },
  623: { name: "Rock 1", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  624: { name: "Pavilion A", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  625: { name: "Pavilion C", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  626: { name: "Pavilion B", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  627: { name: "Projectile Heavy Scorpion", type: 0, class: 0 },
  628: { name: "Projectile Heavy Scorpion", type: 0, class: 0 }, // Fire
  629: { name: "Joan of Arc", type: 5, class: 2 },
  630: { name: "Joan of Arc (Dead)", type: 0, class: 0 },
  631: { name: "Subotai (Dead)", type: 0, class: 0 },
  632: { name: "Frankish Paladin", type: 5, class: 2 },
  633: { name: "Frankish Paladin (Dead)", type: 0, class: 0 },
  634: { name: "Sieur de Metz", type: 5, class: 2 },
  635: { name: "Burned Building", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  636: { name: "Sieur Bertrand", type: 5, class: 2 },
  637: { name: "Temple of Heaven", type: 2, class: 3, footprint: { w: 8, h: 8 } },
  638: { name: "Duke D'Alençon", type: 5, class: 2 },
  639: { name: "Penguin", type: 5, class: 2 },
  640: { name: "La Hire", type: 5, class: 2 },
  641: { name: "Penguin (Dead)", type: 0, class: 0 },
  642: { name: "Lord de Graville", type: 5, class: 2 },
  643: { name: "Lord de Graville (Dead)", type: 0, class: 0 },
  644: { name: "Jean de Lorrain", type: 5, class: 2 },
  645: { name: "Jean de Lorrain (Dead)", type: 0, class: 0 },
  646: { name: "Constable Richemont", type: 5, class: 2 },
  647: { name: "Constable Richemont (Dead)", type: 0, class: 0 },
  648: { name: "Guy Josselyne", type: 5, class: 2 },
  649: { name: "Guy Josselyne (Dead)", type: 0, class: 0 },
  650: { name: "Jean Bureau", type: 5, class: 2 },
  651: { name: "Jean Bureau (Dead)", type: 0, class: 0 },
  652: { name: "Sir John Fastolf", type: 5, class: 2 },
  653: { name: "Sir John Fastolf (Dead)", type: 0, class: 0 },
  654: { name: "Trail Smoke", type: 0, class: 0 }, // Fire
  655: { name: "Mosque", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  656: { name: "Projectile Mangonel", type: 0, class: 0 }, // Primary
  657: { name: "Projectile GP1", type: 0, class: 0 },
  658: { name: "Projectile Mangonel", type: 0, class: 0 }, // Primary Fire
  659: { name: "Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Closed
  660: { name: "Fortified Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Closed
  661: { name: "Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Open
  662: { name: "Fortified Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Open
  663: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Endpieces
  664: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Endpieces
  665: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Foundation
  666: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Foundation
  667: { name: "Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Closed
  668: { name: "Fortified Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Closed
  669: { name: "Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Open
  670: { name: "Fortified Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Open
  671: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Endpieces
  672: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Endpieces
  673: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Foundation
  674: { name: "Fortified Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Foundation
  675: { name: "Onager (Dead)", type: 0, class: 0 },
  676: { name: "Projectile Fire Ship", type: 0, class: 0 },
  677: { name: "Projectile Fire Ship Small", type: 0, class: 0 },
  678: { name: "Reynald de Chatillon", type: 5, class: 2 },
  679: { name: "Reynald de Chatillon (Dead)", type: 0, class: 0 },
  680: { name: "Master of the Templar", type: 5, class: 2 },
  681: { name: "Master of the Templar (Dead)", type: 0, class: 0 },
  682: { name: "Bad Neighbor", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  683: { name: "God's Own Sling", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  684: { name: "The Accursed Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  685: { name: "The Tower of Flies", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  686: { name: "Archer of the Eyes", type: 5, class: 2 },
  687: { name: "Archer of the Eyes (Dead)", type: 0, class: 0 },
  688: { name: "Piece of the True Cross", type: 5, class: 2 },
  689: { name: "Pyramid", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  690: { name: "Dome of the Rock", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  691: { name: "Elite Cannon Galleon", type: 5, class: 2 },
  692: { name: "Berserk", type: 5, class: 2 },
  693: { name: "Berserk (Dead)", type: 0, class: 0 },
  694: { name: "Elite Berserk", type: 5, class: 2 },
  695: { name: "Elite Berserk (Dead)", type: 0, class: 0 },
  696: { name: "Great Pyramid", type: 2, class: 3, footprint: { w: 8, h: 8 } },
  697: { name: "FLARE4", type: 0, class: 0 },
  698: { name: "Subotai", type: 5, class: 2 },
  699: { name: "Subotai (Dead)", type: 0, class: 0 },
  700: { name: "Hunting Wolf", type: 5, class: 2 },
  701: { name: "Hunting Wolf (Dead)", type: 0, class: 0 },
  702: { name: "Kushluk", type: 5, class: 2 },
  703: { name: "Topa Yupanqui", type: 5, class: 2 },
  704: { name: "Shah", type: 5, class: 2 },
  705: { name: "Cow", type: 5, class: 2 }, // Black and White
  706: { name: "Saboteur", type: 5, class: 2 },
  707: { name: "Ornlu the Wolf", type: 5, class: 2 },
  708: { name: "Ornlu the Wolf (Dead)", type: 0, class: 0 },
  709: { name: "Cactus", type: 0, class: 0 },
  710: { name: "Skeleton", type: 0, class: 0 },
  711: { name: "Rugs", type: 0, class: 0 },
  712: { name: "Yurt A", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  713: { name: "Yurt B", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  714: { name: "Yurt C", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  715: { name: "Yurt D", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  716: { name: "Yurt E", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  717: { name: "Yurt F", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  718: { name: "Yurt G", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  719: { name: "Yurt H", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  720: { name: "Nine Bands", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  721: { name: "Shipwreck A", type: 0, class: 0 },
  722: { name: "Shipwreck B", type: 0, class: 0 },
  723: { name: "Crater", type: 0, class: 0 },
  724: { name: "Genitour (Dead)", type: 0, class: 0 },
  725: { name: "Jaguar Warrior", type: 5, class: 2 },
  726: { name: "Elite Jaguar Warrior", type: 5, class: 2 },
  727: { name: "Placeholder", type: 0, class: 0 },
  728: { name: "Ice, Navigable", type: 0, class: 0 },
  729: { name: "God's Own Sling", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Packed
  730: { name: "Bad Neighbor", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Packed
  731: { name: "Genghis Khan", type: 5, class: 2 },
  732: { name: "Genitour", type: 0, class: 0 }, // Placeholder
  733: { name: "Emperor in a Barrel", type: 5, class: 2 },
  734: { name: "Emperor in a Barrel (Dead)", type: 0, class: 0 },
  735: { name: "Packed Trebuchet (Dead)", type: 0, class: 0 },
  736: { name: "Projectile Mameluke", type: 0, class: 0 },
  737: { name: "Bamboo Stump", type: 0, class: 0 },
  738: { name: "Bridge A--Cracked", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  739: { name: "Bridge A--Broken Top", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  740: { name: "Bridge A--Broken Bottom", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  741: { name: "Bridge B--Cracked", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  742: { name: "Bridge B--Broken Top", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  743: { name: "Bridge B--Broken Bottom", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  744: { name: "Mountain 3", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  745: { name: "Mountain 4", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  746: { name: "Projectile Castle", type: 0, class: 0 },
  747: { name: "Projectile Castle", type: 0, class: 0 }, // Fire
  748: { name: "Cobra Car", type: 5, class: 2 },
  749: { name: "Cusi Yupanqui", type: 5, class: 2 },
  750: { name: "Jaguar Warrior (Dead)", type: 0, class: 0 },
  751: { name: "Eagle Scout", type: 5, class: 2 }, // non-TC, Eagle Warrior TC
  752: { name: "Elite Eagle Warrior", type: 5, class: 2 },
  753: { name: "Eagle Warrior", type: 5, class: 2 },
  754: { name: "Eagle Warrior (Dead)", type: 0, class: 0 },
  755: { name: "Tarkan", type: 5, class: 2 },
  756: { name: "Tarkan (Dead)", type: 0, class: 0 },
  757: { name: "Elite Tarkan", type: 5, class: 2 },
  758: { name: "Burned building", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  759: { name: "Huskarl", type: 5, class: 2 }, // Barracks
  760: { name: "Huskarl (Dead)", type: 0, class: 0 },
  761: { name: "Elite Huskarl", type: 5, class: 2 }, // Barracks
  762: { name: "Elite Huskarl (Dead)", type: 0, class: 0 },
  763: { name: "Plumed Archer", type: 5, class: 2 },
  764: { name: "Plumed Archer (Dead)", type: 0, class: 0 },
  765: { name: "Elite Plumed Archer", type: 5, class: 2 },
  766: { name: "Elite Plumed Archer (Dead)", type: 0, class: 0 },
  767: { name: "Projectile Elite Cannon Galleon", type: 0, class: 0 },
  768: { name: "Blue Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  769: { name: "Placeholder", type: 0, class: 0 },
  770: { name: "Placeholder", type: 0, class: 0 },
  771: { name: "Conquistador", type: 5, class: 2 },
  772: { name: "Conquistador (Dead)", type: 0, class: 0 },
  773: { name: "Elite Conquistador", type: 5, class: 2 },
  774: { name: "Elite Conquistador (Dead)", type: 0, class: 0 },
  775: { name: "Missionary", type: 5, class: 2 },
  776: { name: "Missionary (Dead)", type: 0, class: 0 },
  777: { name: "Attila the Hun", type: 5, class: 2 },
  778: { name: "Canoe", type: 5, class: 2 },
  779: { name: "Bleda the Hun", type: 5, class: 2 },
  780: { name: "Llama (Dead)", type: 0, class: 0 },
  781: { name: "Pope Leo I", type: 5, class: 2 },
  782: { name: "Pope Leo I (Dead)", type: 0, class: 0 },
  783: { name: "Scythian Wild Woman", type: 5, class: 2 },
  784: { name: "Scythian Wild Woman (Dead)", type: 0, class: 0 },
  785: { name: "Sea Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  786: { name: "Projectile Sea Tower", type: 0, class: 0 },
  787: { name: "Projectile Sea Tower", type: 0, class: 0 }, // Fire
  788: { name: "Sea Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  789: { name: "Palisade Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Closed
  790: { name: "Palisade Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Open
  791: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Ascending Endpieces
  792: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } }, // Ascending Foundation
  793: { name: "Palisade Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } }, // Descending Closed
  794: { name: "Palisade Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } }, // Descending Open
  795: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Descending Endpieces
  796: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } }, // Descending Foundation
  797: { name: "Palisade Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Closed
  798: { name: "Palisade Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Open
  799: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Endpieces
  800: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Foundation
  801: { name: "Palisade Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Closed
  802: { name: "Palisade Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Open
  803: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Endpieces
  804: { name: "Palisade Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Foundation
  805: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  806: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  807: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  808: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  809: { name: "Stump", type: 0, class: 0 },
  810: { name: "Iron Boar", type: 5, class: 2 },
  811: { name: "Iron Boar (Dead)", type: 0, class: 0 },
  812: { name: "Jaguar", type: 5, class: 2 },
  813: { name: "Jaguar (Dead)", type: 0, class: 0 },
  814: { name: "Horse A", type: 5, class: 2 },
  815: { name: "Horse (Dead)", type: 0, class: 0 },
  816: { name: "Macaw", type: 5, class: 2 },
  817: { name: "Statue A", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  818: { name: "Plant", type: 0, class: 0 },
  819: { name: "Sign", type: 0, class: 0 },
  820: { name: "Grave", type: 0, class: 0 },
  821: { name: "Head", type: 0, class: 0 },
  822: { name: "Javelina", type: 5, class: 2 },
  823: { name: "Javelina (Dead)", type: 0, class: 0 },
  824: { name: "El Cid Campeador", type: 5, class: 2 },
  825: { name: "Amazon Warrior", type: 5, class: 2 },
  826: { name: "Monument", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  827: { name: "War Wagon", type: 5, class: 2 },
  828: { name: "War Wagon (Dead)", type: 0, class: 0 },
  829: { name: "Elite War Wagon", type: 5, class: 2 },
  830: { name: "Elite War Wagon (Dead)", type: 0, class: 0 },
  831: { name: "Turtle Ship", type: 5, class: 2 },
  832: { name: "Elite Turtle Ship", type: 5, class: 2 },
  833: { name: "Turkey", type: 5, class: 2 },
  834: { name: "Turkey (Dead)", type: 0, class: 0 },
  835: { name: "Wild Horse A", type: 5, class: 2 },
  836: { name: "Wild Horse (Dead)", type: 0, class: 0 },
  837: { name: "Map Revealer", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  838: { name: "King Sancho", type: 5, class: 2 },
  839: { name: "Rock", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Stone
  840: { name: "King Alfonso", type: 5, class: 2 },
  841: { name: "Rock", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Gold
  842: { name: "Imam", type: 5, class: 2 },
  843: { name: "Cow (Dead)", type: 0, class: 0 },
  844: { name: "Admiral Yi Sun-shin", type: 5, class: 2 },
  845: { name: "Nobunaga", type: 5, class: 2 },
  846: { name: "Donkey", type: 5, class: 2 },
  847: { name: "Henry V", type: 5, class: 2 },
  848: { name: "Donkey (Dead)", type: 0, class: 0 },
  849: { name: "William the Conqueror", type: 5, class: 2 },
  850: { name: "Amazon Archer", type: 5, class: 2 },
  851: { name: "ES Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  852: { name: "Scythian Scout", type: 5, class: 2 },
  853: { name: "Scythian Scout (Dead)", type: 0, class: 0 },
  854: { name: "Torch A", type: 0, class: 0 }, // Convertable
  855: { name: "Old Stone Head", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  856: { name: "Roman Ruins", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  857: { name: "Hay Stack", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  858: { name: "Broken Cart", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  859: { name: "Flower Bed", type: 0, class: 0 },
  860: { name: "Furious the Monkey Boy", type: 5, class: 2 },
  861: { name: "Furious the Monkey Boy (Dead)", type: 0, class: 0 },
  862: { name: "Stormy Dog", type: 5, class: 2 },
  863: { name: "Rubble 1 x 1", type: 0, class: 0 },
  864: { name: "Rubble 2 x 2", type: 0, class: 0 },
  865: { name: "Rubble 3 x 3", type: 0, class: 0 },
  866: { name: "Genoese Crossbowman", type: 5, class: 2 },
  867: { name: "Genoese Crossbowman (Dead)", type: 0, class: 0 },
  868: { name: "Elite Genoese Crossbowman", type: 5, class: 2 },
  869: { name: "Magyar Huszar", type: 5, class: 2 },
  870: { name: "Magyar Huszar (Dead)", type: 0, class: 0 },
  871: { name: "Elite Magyar Huszar", type: 5, class: 2 },
  872: { name: "Quimper Cathedral", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  873: { name: "Elephant Archer", type: 5, class: 2 },
  874: { name: "Elephant Archer (Dead)", type: 0, class: 0 },
  875: { name: "Elite Elephant Archer", type: 5, class: 2 },
  876: { name: "Boyar", type: 5, class: 2 },
  877: { name: "Boyar (Dead)", type: 0, class: 0 },
  878: { name: "Elite Boyar", type: 5, class: 2 },
  879: { name: "Kamayuk", type: 5, class: 2 },
  880: { name: "Kamayuk (Dead)", type: 0, class: 0 },
  881: { name: "Elite Kamayuk", type: 5, class: 2 },
  882: { name: "Condottiero", type: 5, class: 2 },
  883: { name: "Condottiero (Dead)", type: 0, class: 0 },
  884: { name: "Wild Camel", type: 5, class: 2 },
  885: { name: "Siege Tower", type: 5, class: 2 },
  886: { name: "Tarkan", type: 5, class: 2 }, // Stable
  887: { name: "Elite Tarkan", type: 5, class: 2 }, // Stable
  888: { name: "Llama building", type: 0, class: 0 },
  889: { name: "Disable llama building", type: 5, class: 2 },
  890: { name: "Empty llama annex", type: 5, class: 2 },
  891: { name: "Siege Tower (Dead)", type: 0, class: 0 },
  892: { name: "Heavy Pikeman", type: 5, class: 2 },
  893: { name: "Heavy Pikeman (Dead)", type: 0, class: 0 },
  894: { name: "Eastern Swordsman", type: 5, class: 2 },
  895: { name: "Eastern Swordsman (Dead)", type: 0, class: 0 },
  896: { name: "Waterfall", type: 0, class: 0 },
  897: { name: "Camel", type: 5, class: 2 },
  898: { name: "Camel (Dead)", type: 0, class: 0 },
  899: { name: "Arch of Constantine", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  900: { name: "Rain", type: 0, class: 0 },
  901: { name: "Flag F", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  902: { name: "Smoke", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  903: { name: "Placeholder", type: 0, class: 0 },
  904: { name: "Wooden Bridge A--Top", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  905: { name: "Wooden Bridge A--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  906: { name: "Wooden Bridge A--Bottom", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  907: { name: "Wooden Bridge B--Top", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  908: { name: "Wooden Bridge B--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  909: { name: "Wooden Bridge B--Bottom", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  910: { name: "Impaled Corpse", type: 0, class: 0 },
  911: { name: "BGAA", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  912: { name: "BGAB", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  913: { name: "BGAC", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  914: { name: "Quarry", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  915: { name: "Lumber", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  916: { name: "Goods", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  917: { name: "Vulture", type: 5, class: 2 },
  918: { name: "Rock 2", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  919: { name: "Amazon Warrior (Dead)", type: 0, class: 0 },
  920: { name: "Amazon Archer (Dead)", type: 0, class: 0 },
  921: { name: "Imam (Dead)", type: 0, class: 0 },
  922: { name: "Monk with Relic", type: 5, class: 2 },
  923: { name: "Queen", type: 5, class: 2 },
  924: { name: "Queen (Dead)", type: 0, class: 0 },
  925: { name: "Sanyogita", type: 5, class: 2 },
  926: { name: "Prithvi", type: 5, class: 2 },
  927: { name: "Chand Bhai", type: 5, class: 2 },
  928: { name: "Chand Bhai (Dead)", type: 0, class: 0 },
  929: { name: "Saladin", type: 5, class: 2 },
  930: { name: "Khosrau", type: 5, class: 2 },
  931: { name: "Jarl", type: 5, class: 2 },
  932: { name: "Savar", type: 5, class: 2 },
  933: { name: "Barrels", type: 0, class: 0 },
  934: { name: "Alfred the Alpaca", type: 5, class: 2 },
  935: { name: "Alfred the Alpaca (Dead)", type: 0, class: 0 },
  936: { name: "Elephant", type: 5, class: 2 },
  937: { name: "Elephant (Dead)", type: 0, class: 0 },
  938: { name: "Dragon Ship", type: 5, class: 2 },
  939: { name: "Flame 1", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  940: { name: "Flame 2", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  941: { name: "Flame 3", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  942: { name: "Flame 4", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  943: { name: "Osman", type: 5, class: 2 },
  944: { name: "Relic Cart", type: 5, class: 2 },
  945: { name: "Shaw (Dead)", type: 0, class: 0 },
  946: { name: "Placeholder", type: 0, class: 0 },
  947: { name: "Placeholder", type: 0, class: 0 },
  948: { name: "Placeholder", type: 0, class: 0 },
  949: { name: "Placeholder", type: 0, class: 0 },
  950: { name: "Placeholder", type: 0, class: 0 },
  951: { name: "Placeholder", type: 0, class: 0 },
  952: { name: "Placeholder", type: 0, class: 0 },
  953: { name: "Placeholder", type: 0, class: 0 },
  954: { name: "Placeholder", type: 0, class: 0 },
  955: { name: "Placeholder", type: 0, class: 0 },
  956: { name: "Placeholder", type: 0, class: 0 },
  957: { name: "Placeholder", type: 0, class: 0 },
  958: { name: "Placeholder", type: 0, class: 0 },
  959: { name: "Placeholder", type: 0, class: 0 },
  960: { name: "Placeholder", type: 0, class: 0 },
  961: { name: "Placeholder", type: 0, class: 0 },
  962: { name: "Placeholder", type: 0, class: 0 },
  963: { name: "Placeholder", type: 0, class: 0 },
  964: { name: "Placeholder", type: 0, class: 0 },
  965: { name: "Placeholder", type: 0, class: 0 },
  966: { name: "Placeholder", type: 0, class: 0 },
  967: { name: "Placeholder", type: 0, class: 0 },
  968: { name: "Placeholder", type: 0, class: 0 },
  969: { name: "Placeholder", type: 0, class: 0 },
  970: { name: "Placeholder", type: 0, class: 0 },
  971: { name: "Placeholder", type: 0, class: 0 },
  972: { name: "Placeholder", type: 0, class: 0 },
  973: { name: "Placeholder", type: 0, class: 0 },
  974: { name: "Placeholder", type: 0, class: 0 },
  975: { name: "Placeholder", type: 0, class: 0 },
  976: { name: "Placeholder", type: 0, class: 0 },
  977: { name: "Placeholder", type: 0, class: 0 },
  978: { name: "Placeholder", type: 0, class: 0 },
  979: { name: "Placeholder", type: 0, class: 0 },
  980: { name: "Placeholder", type: 0, class: 0 },
  981: { name: "Placeholder", type: 0, class: 0 },
  982: { name: "Placeholder", type: 0, class: 0 },
  983: { name: "Placeholder", type: 0, class: 0 },
  984: { name: "Placeholder", type: 0, class: 0 },
  985: { name: "Placeholder", type: 0, class: 0 },
  986: { name: "Placeholder", type: 0, class: 0 },
  987: { name: "Placeholder", type: 0, class: 0 },
  988: { name: "Placeholder", type: 0, class: 0 },
  989: { name: "Placeholder", type: 0, class: 0 },
  990: { name: "Placeholder", type: 0, class: 0 },
  991: { name: "Placeholder", type: 0, class: 0 },
  992: { name: "Placeholder", type: 0, class: 0 },
  993: { name: "Placeholder", type: 0, class: 0 },
  994: { name: "Placeholder", type: 0, class: 0 },
  995: { name: "Placeholder", type: 0, class: 0 },
  996: { name: "Placeholder", type: 0, class: 0 },
  997: { name: "Placeholder", type: 0, class: 0 },
  998: { name: "Placeholder", type: 0, class: 0 },
  999: { name: "Placeholder", type: 0, class: 0 },
  1000: { name: "Placeholder", type: 0, class: 0 },
  1001: { name: "Organ Gun", type: 5, class: 2 },
  1002: { name: "Organ Gun (Dead)", type: 0, class: 0 },
  1003: { name: "Elite Organ Gun", type: 5, class: 2 },
  1004: { name: "Caravel", type: 5, class: 2 },
  1005: { name: "Organ Gun (Dead)", type: 0, class: 0 },
  1006: { name: "Elite Caravel", type: 5, class: 2 },
  1007: { name: "Camel Archer", type: 5, class: 2 },
  1008: { name: "Camel Archer (Dead)", type: 0, class: 0 },
  1009: { name: "Elite Camel Archer", type: 5, class: 2 },
  1010: { name: "Genitour", type: 5, class: 2 },
  1011: { name: "Genitour (Dead)", type: 0, class: 0 },
  1012: { name: "Elite Genitour", type: 5, class: 2 },
  1013: { name: "Gbeto", type: 5, class: 2 },
  1014: { name: "Gbeto (Dead)", type: 0, class: 0 },
  1015: { name: "Elite Gbeto", type: 5, class: 2 },
  1016: { name: "Shotel Warrior", type: 5, class: 2 },
  1017: { name: "Shotel Warrior (Dead)", type: 0, class: 0 },
  1018: { name: "Elite Shotel Warrior", type: 5, class: 2 },
  1019: { name: "Zebra", type: 5, class: 2 },
  1020: { name: "Zebra (Dead)", type: 0, class: 0 },
  1021: { name: "Feitoria", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1022: { name: "Monkboat", type: 5, class: 2 },
  1023: { name: "Priest", type: 5, class: 2 },
  1024: { name: "Priest (Dead)", type: 0, class: 0 },
  1025: { name: "Priest with relic", type: 5, class: 2 },
  1026: { name: "Ostrich", type: 5, class: 2 },
  1027: { name: "Ostrich (Dead)", type: 0, class: 0 },
  1028: { name: "Stork", type: 5, class: 2 },
  1029: { name: "Lion", type: 5, class: 2 },
  1030: { name: "Lion (Dead)", type: 0, class: 0 },
  1031: { name: "Crocodile", type: 5, class: 2 },
  1032: { name: "Crocodile (Dead)", type: 0, class: 0 },
  1033: { name: "Grass Patch, Dry", type: 0, class: 0 },
  1034: { name: "Musa ibn Nusayr", type: 5, class: 2 },
  1035: { name: "Sundjata", type: 5, class: 2 },
  1036: { name: "Tariq ibn Ziyad", type: 5, class: 2 },
  1037: { name: "Richard de Clare", type: 5, class: 2 },
  1038: { name: "Tristan", type: 5, class: 2 },
  1039: { name: "Princess Yodit", type: 5, class: 2 },
  1040: { name: "Henry II", type: 5, class: 2 },
  1041: { name: "Mountain 5", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1042: { name: "Mountain 6", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1043: { name: "Mountain 7", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1044: { name: "Mountain 8", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1045: { name: "Snow Mountain 1", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1046: { name: "Snow Mountain 2", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1047: { name: "Snow Mountain 3", type: 10, class: 1, footprint: { w: 4, h: 4 } },
  1048: { name: "Rock Formation 1", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1049: { name: "Rock Formation 2", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1050: { name: "Rock Formation 3", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1051: { name: "Dragon Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1052: { name: "Baobab Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1053: { name: "Bush B", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1054: { name: "Bush C", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1055: { name: "Projectile Knife", type: 0, class: 0 },
  1056: { name: "Falcon", type: 5, class: 2 },
  1057: { name: "Projectile CVB", type: 0, class: 0 },
  1058: { name: "Projectile CVB", type: 0, class: 0 }, // Fire
  1059: { name: "Fruit Bush", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1060: { name: "Goat", type: 5, class: 2 },
  1061: { name: "Goat (Dead)", type: 0, class: 0 },
  1062: { name: "Fence", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1063: { name: "Acacia Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1064: { name: "Yekuno Amlak", type: 5, class: 2 },
  1065: { name: "Fence", type: 0, class: 0 }, // Rubble
  1066: { name: "Yodit", type: 5, class: 2 },
  1067: { name: "Itzcoatl", type: 5, class: 2 },
  1068: { name: "Mustafa Pasha", type: 5, class: 2 },
  1069: { name: "Pacal II", type: 5, class: 2 },
  1070: { name: "Babur", type: 5, class: 2 },
  1071: { name: "Abraha Elephant", type: 5, class: 2 },
  1072: { name: "Guglielmo Embriaco", type: 5, class: 2 },
  1073: { name: "Su Dingfang", type: 5, class: 2 },
  1074: { name: "Pachacuti", type: 5, class: 2 },
  1075: { name: "Huanya Capac", type: 5, class: 2 },
  1076: { name: "Miklos Toldi", type: 5, class: 2 },
  1077: { name: "Little John", type: 5, class: 2 },
  1078: { name: "Zawisza the Black", type: 5, class: 2 },
  1079: { name: "GENITOPLACEHOLDER", type: 5, class: 2 },
  1080: { name: "Sumanguru", type: 5, class: 2 },
  1081: { name: "Storage", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1082: { name: "Hut A", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1083: { name: "Hut B", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1084: { name: "Hut C", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1085: { name: "Hut D", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1086: { name: "Hut E", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1087: { name: "Hut F", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1088: { name: "Hut G", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1089: { name: "Granary", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1090: { name: "Barricade A", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1091: { name: "Animal Skeleton", type: 0, class: 0 },
  1092: { name: "Stelae A", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1093: { name: "Stelae B", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1094: { name: "Stelae C", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1095: { name: "Gallow", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1096: { name: "Palace", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1097: { name: "Tent A", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1098: { name: "Tent B", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1099: { name: "Tent C", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1100: { name: "Tent D", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1101: { name: "Tent E", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1102: { name: "Fortified Tower", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1103: { name: "Fire Galley", type: 5, class: 2 },
  1104: { name: "Demolition Raft", type: 5, class: 2 },
  1105: { name: "Siege Tower", type: 5, class: 2 },
  1106: { name: "Dagnajan", type: 5, class: 2 },
  1107: { name: "Siege Tower (Dead)", type: 0, class: 0 },
  1108: { name: "Dagnajan (Dead)", type: 0, class: 0 },
  1109: { name: "Gidajan", type: 5, class: 2 },
  1110: { name: "Gidajan (Dead)", type: 0, class: 0 },
  1111: { name: "Projectile Light Ballista", type: 0, class: 0 },
  1112: { name: "Projectile Light Ballista", type: 0, class: 0 }, // Fire
  1113: { name: "Projectile Heavy Scorpion", type: 0, class: 0 },
  1114: { name: "Projectile Heavy Scorpion", type: 0, class: 0 }, // Fire
  1115: { name: "FACAHOLE", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1116: { name: "Eagle Warrior (Dead)", type: 0, class: 0 },
  1117: { name: "Elite Eagle Warrior (Dead)", type: 0, class: 0 },
  1118: { name: "Inca llama annex", type: 0, class: 0 },
  1119: { name: "Projectile Gunpowder", type: 0, class: 0 }, // Secondary
  1120: { name: "Ballista Elephant", type: 5, class: 2 },
  1121: { name: "Ballista Elephant (Dead)", type: 0, class: 0 },
  1122: { name: "Elite Ballista Elephant", type: 5, class: 2 },
  1123: { name: "Karambit Warrior", type: 5, class: 2 },
  1124: { name: "Karambit Warrior (Dead)", type: 0, class: 0 },
  1125: { name: "Elite Karambit Warrior", type: 5, class: 2 },
  1126: { name: "Arambai", type: 5, class: 2 },
  1127: { name: "Arambai (Dead)", type: 0, class: 0 },
  1128: { name: "Elite Arambai", type: 5, class: 2 },
  1129: { name: "Rattan Archer", type: 5, class: 2 },
  1130: { name: "Rattan Archer (Dead)", type: 0, class: 0 },
  1131: { name: "Elite Rattan Archer", type: 5, class: 2 },
  1132: { name: "Battle Elephant", type: 5, class: 2 },
  1133: { name: "Battle Elephant (Dead)", type: 0, class: 0 },
  1134: { name: "Elite Battle Elephant", type: 5, class: 2 },
  1135: { name: "Komodo Dragon", type: 5, class: 2 },
  1136: { name: "Komodo Dragon (Dead)", type: 0, class: 0 },
  1137: { name: "Tiger", type: 5, class: 2 },
  1138: { name: "Tiger (Dead)", type: 0, class: 0 },
  1139: { name: "Rhinoceros", type: 5, class: 2 },
  1140: { name: "Rhinoceros (Dead)", type: 0, class: 0 },
  1141: { name: "Box Turtles", type: 0, class: 0 },
  1142: { name: "Water Buffalo", type: 5, class: 2 },
  1143: { name: "Water Buffalo (Dead)", type: 0, class: 0 },
  1144: { name: "Mangrove Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1145: { name: "Ninja", type: 5, class: 2 },
  1146: { name: "Rainforest Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1147: { name: "Ninja (Dead)", type: 0, class: 0 },
  1148: { name: "Rock", type: 2, class: 1, footprint: { w: 2, h: 2 } }, // Beach
  1149: { name: "Rock", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Jungle
  1150: { name: "Flag G", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1151: { name: "Flag H", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1152: { name: "Flag I", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1153: { name: "Flag J", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1154: { name: "Elite Battle Elephant (Dead)", type: 0, class: 0 },
  1155: { name: "Imperial Skirmisher", type: 5, class: 2 },
  1156: { name: "Imperial Skirmisher (Dead)", type: 0, class: 0 },
  1157: { name: "Gajah Mada", type: 5, class: 2 },
  1158: { name: "Jayanegara", type: 5, class: 2 },
  1159: { name: "Raden Wijaya", type: 5, class: 2 },
  1160: { name: "Sunda Royal Fighter", type: 5, class: 2 },
  1161: { name: "Sunda Royal Fighter (Dead)", type: 0, class: 0 },
  1162: { name: "Suryavarman I", type: 5, class: 2 },
  1163: { name: "Udayadityavarman I", type: 5, class: 2 },
  1164: { name: "Jayaviravarman", type: 5, class: 2 },
  1165: { name: "Bayinnaung", type: 5, class: 2 },
  1166: { name: "Tabinshwehti", type: 5, class: 2 },
  1167: { name: "Projectile Ballista Elephant", type: 0, class: 0 },
  1168: { name: "Projectile Ballista Elephant", type: 0, class: 0 }, // Fire
  1169: { name: "Projectile Arambai", type: 0, class: 0 },
  1170: { name: "Projectile Arambai", type: 0, class: 0 }, // Fire
  1171: { name: "Buddha Statue A", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1172: { name: "Buddha Statue B", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1173: { name: "Buddha Statue C", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1174: { name: "Buddha Statue D", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1175: { name: "Fern Patch", type: 0, class: 0 },
  1176: { name: "Trowulan Gate", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1177: { name: "Vases", type: 0, class: 0 },
  1178: { name: "Le Loi", type: 5, class: 2 },
  1179: { name: "Le Lai", type: 5, class: 2 },
  1180: { name: "Le Lai", type: 5, class: 2 },
  1181: { name: "Le Trien", type: 5, class: 2 },
  1182: { name: "Luu Nhan Chu", type: 5, class: 2 },
  1183: { name: "Bui Bi", type: 5, class: 2 },
  1184: { name: "Dinh Le", type: 5, class: 2 },
  1185: { name: "Wang Tong", type: 5, class: 2 },
  1186: { name: "Envoy", type: 5, class: 2 },
  1187: { name: "Rice Farm", type: 0, class: 0, footprint: { w: 3, h: 3 } },
  1188: { name: "Rice Farm (Dead)", type: 0, class: 0 },
  1189: { name: "Harbor", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1190: { name: "Gajah Mada (Dead)", type: 0, class: 0 },
  1191: { name: "Stupa", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1192: { name: "Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1193: { name: "FARMDROP", type: 0, class: 0, footprint: { w: 3, h: 3 } },
  1194: { name: "FARMSTACK", type: 0, class: 0, footprint: { w: 3, h: 3 } },
  1195: { name: "RFARMDROP", type: 0, class: 0, footprint: { w: 3, h: 3 } },
  1196: { name: "Army Tent A", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1197: { name: "Army Tent B", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1198: { name: "Army Tent C", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1199: { name: "Army Tent D", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1200: { name: "Army Tent E", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1201: { name: "Pagoda A", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1202: { name: "Pagoda B", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1203: { name: "Pagoda C", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1204: { name: "Bridge C--Top", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1205: { name: "Bridge C--Middle", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1206: { name: "Bridge C--Bottom", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1207: { name: "Bridge D--Top", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1208: { name: "Bridge D--Middle", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1209: { name: "Bridge D--Bottom", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1210: { name: "Bridge C--Cracked", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1211: { name: "Bridge C--Broken Top", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1212: { name: "Bridge C--Broken Bottom", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1213: { name: "Bridge D--Cracked", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1214: { name: "Bridge D--Broken Top", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1215: { name: "Bridge D--Broken Bottom", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1216: { name: "Sanchi Stupa", type: 2, class: 3, footprint: { w: 8, h: 8 } },
  1217: { name: "Gol Gumbaz", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1218: { name: "Barricade B", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1219: { name: "Barricade C", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1220: { name: "Barricade D", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1221: { name: "Itzcoatl (Dead)", type: 0, class: 0 },
  1222: { name: "Sharkatzor", type: 5, class: 2 },
  1223: { name: "Projectile Cow", type: 0, class: 0 },
  1224: { name: "Dinh Le (Dead)", type: 0, class: 0 },
  1225: { name: "Konnik", type: 5, class: 2 },
  1226: { name: "Konnik (Dead)", type: 0, class: 0 },
  1227: { name: "Elite Konnik", type: 5, class: 2 },
  1228: { name: "Keshik", type: 5, class: 2 },
  1229: { name: "Keshik (Dead)", type: 0, class: 0 },
  1230: { name: "Elite Keshik", type: 5, class: 2 },
  1231: { name: "Kipchak", type: 5, class: 2 },
  1232: { name: "Kipchak (Dead)", type: 0, class: 0 },
  1233: { name: "Elite Kipchak", type: 5, class: 2 },
  1234: { name: "Leitis", type: 5, class: 2 },
  1235: { name: "Leitis (Dead)", type: 0, class: 0 },
  1236: { name: "Elite Leitis", type: 5, class: 2 },
  1237: { name: "Bactrian Camel", type: 5, class: 2 },
  1238: { name: "Bactrian Camel (Dead)", type: 0, class: 0 },
  1239: { name: "Ibex", type: 5, class: 2 },
  1240: { name: "Ibex (Dead)", type: 0, class: 0 },
  1241: { name: "Snow Leopard", type: 5, class: 2 },
  1242: { name: "Snow Leopard (Dead)", type: 0, class: 0 },
  1243: { name: "Goose", type: 5, class: 2 },
  1244: { name: "Goose (Dead)", type: 0, class: 0 },
  1245: { name: "Pig", type: 5, class: 2 },
  1246: { name: "Pig (Dead)", type: 0, class: 0 },
  1247: { name: "Wild Bactrian Camel", type: 5, class: 2 },
  1248: { name: "Oak Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Autumn
  1249: { name: "Oak Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Autumn Snow
  1250: { name: "Tree (Dead)", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1251: { name: "Krepost", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1252: { name: "Konnik", type: 5, class: 2 }, // Dismounted
  1253: { name: "Elite Konnik", type: 5, class: 2 }, // Dismounted
  1254: { name: "Konnik", type: 5, class: 2 }, // Krepost
  1255: { name: "Elite Konnik", type: 5, class: 2 }, // Krepost
  1256: { name: "Elite Konnik (Dead)", type: 0, class: 0 },
  1257: { name: "Konnik Infantry (Dead)", type: 0, class: 0 },
  1258: { name: "Battering Ram", type: 5, class: 2 }, // Feudal
  1259: { name: "Elite Kipchak", type: 5, class: 2 }, // Mercenary Placeholder
  1260: { name: "Elite Kipchak", type: 5, class: 2 }, // Mercenary
  1261: { name: "CUMANDISABLED", type: 5, class: 2 },
  1262: { name: "Tokhtamysh Khan", type: 5, class: 2 },
  1263: { name: "Flaming Camel", type: 5, class: 2 },
  1264: { name: "Shrine", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1265: { name: "Ivaylo", type: 5, class: 2 },
  1266: { name: "Tsar Konstantin", type: 5, class: 2 },
  1267: { name: "Kotyan Khan", type: 5, class: 2 },
  1268: { name: "Cuman Chief", type: 5, class: 2 },
  1269: { name: "Girgen Khan", type: 5, class: 2 },
  1270: { name: "Dismantled Cart", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1271: { name: "Ox Cart", type: 5, class: 2 },
  1272: { name: "Ox Cart (Dead)", type: 0, class: 0 },
  1273: { name: "Ox Wagon", type: 5, class: 2 },
  1274: { name: "Ox Wagon (Dead)", type: 0, class: 0 },
  1275: { name: "Khan", type: 5, class: 2 },
  1276: { name: "Urus Khan", type: 5, class: 2 },
  1277: { name: "Khan (Dead)", type: 0, class: 0 },
  1278: { name: "Vytautas the Great (Dead)", type: 0, class: 0 },
  1279: { name: "Statue", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // Civilization
  1280: { name: "Statue B", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1281: { name: "Vytautas the Great", type: 5, class: 2 },
  1282: { name: "Flag K", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1283: { name: "Flag L", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1284: { name: "Flag M", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1285: { name: "FE Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1286: { name: "Tsar Konstantin (Dead)", type: 0, class: 0 },
  1287: { name: "Kotyan Khan (Dead)", type: 0, class: 0 },
  1288: { name: "Cuman Chief (Dead)", type: 0, class: 0 },
  1289: { name: "Girgen Khan (Dead)", type: 0, class: 0 },
  1290: { name: "Ivaylo", type: 5, class: 2 },
  1291: { name: "Invisible Object", type: 0, class: 0 },
  1292: { name: "Queen", type: 5, class: 2 },
  1293: { name: "Sanyogita", type: 5, class: 2 },
  1294: { name: "Prithvi", type: 5, class: 2 },
  1295: { name: "Chand Bardai", type: 5, class: 2 },
  1296: { name: "Saladin", type: 5, class: 2 },
  1297: { name: "Khosrau", type: 5, class: 2 },
  1298: { name: "Jarl", type: 5, class: 2 },
  1299: { name: "Sogdian Cataphract", type: 5, class: 2 },
  1300: { name: "Alfred the Alpaca", type: 5, class: 2 },
  1301: { name: "Elephant", type: 5, class: 2 },
  1302: { name: "Dragon Ship", type: 5, class: 2 },
  1303: { name: "Osman", type: 5, class: 2 },
  1304: { name: "Relic Cart", type: 5, class: 2 },
  1305: { name: "Vulture", type: 5, class: 2 },
  1306: { name: "Rain", type: 0, class: 0 },
  1307: { name: "Flag F", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1308: { name: "Smoke", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1309: { name: "Wooden Bridge A--Top", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1310: { name: "Wooden Bridge A--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1311: { name: "Wooden Bridge A--Bottom", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1312: { name: "Wooden Bridge B--Top", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1313: { name: "Wooden Bridge B--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1314: { name: "Wooden Bridge B--Bottom", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1315: { name: "Impaled Corpse", type: 0, class: 0 },
  1316: { name: "BGAA", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  1317: { name: "BGAB", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  1318: { name: "BGAC", type: 0, class: 3, footprint: { w: 2, h: 2 } },
  1319: { name: "Quarry", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1320: { name: "Lumber", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1321: { name: "Goods", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1322: { name: "Statue", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // Column
  1323: { name: "Rock 2", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1324: { name: "Amazon Warrior (Dead)", type: 0, class: 0 },
  1325: { name: "Amazon Archer (Dead)", type: 0, class: 0 },
  1326: { name: "Imam (Dead)", type: 0, class: 0 },
  1327: { name: "Monk with Relic", type: 5, class: 2 },
  1328: { name: "Queen (Dead)", type: 0, class: 0 },
  1329: { name: "Monk (Dead)", type: 0, class: 0 },
  1330: { name: "Barrels", type: 0, class: 0 },
  1331: { name: "Alfred the Alpaca (Dead)", type: 0, class: 0 },
  1332: { name: "Elephant (Dead)", type: 0, class: 0 },
  1333: { name: "Flame 1", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1334: { name: "Flame 2", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1335: { name: "Flame 3", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1336: { name: "Flame 4", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1337: { name: "Shaw (Dead)", type: 0, class: 0 },
  1338: { name: "Cart", type: 5, class: 2 },
  1339: { name: "CLF01", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  1340: { name: "CLF02", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  1341: { name: "CLF03", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  1342: { name: "CLF04", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  1343: { name: "Statue", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // Left
  1344: { name: "CLF06", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  1345: { name: "Statue", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // Right
  1346: { name: "CLF08", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  1347: { name: "Cypress Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1348: { name: "Italian Pine Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1349: { name: "Olive Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1350: { name: "Reeds", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1351: { name: "Plant", type: 0, class: 0 }, // Jungle
  1352: { name: "Plant", type: 0, class: 0 }, // Underbrush Tropical
  1353: { name: "Plant", type: 0, class: 0 }, // Underbrush
  1354: { name: "Plant", type: 0, class: 0 }, // Rainforest
  1355: { name: "Plant", type: 0, class: 0 }, // Underbrush Rainforest
  1356: { name: "Horse B", type: 5, class: 2 },
  1357: { name: "Horse Heavy (Dead)", type: 0, class: 0 },
  1358: { name: "Grass, Green", type: 0, class: 0 },
  1359: { name: "Grass, Dry", type: 0, class: 0 },
  1360: { name: "Plant", type: 0, class: 0 }, // Bush, Green
  1361: { name: "Plant", type: 0, class: 0 }, // Bush, Dry
  1362: { name: "Plant", type: 0, class: 0 }, // Shrub, Green
  1363: { name: "Plant", type: 0, class: 0 }, // Shrub, Dry
  1364: { name: "Plant", type: 0, class: 0 }, // Weeds
  1365: { name: "Plant (Dead)", type: 0, class: 0 },
  1366: { name: "Plant", type: 0, class: 0 }, // Flowers
  1367: { name: "Sankore Madrasah", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1368: { name: "Tower of London", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1369: { name: "Dormition Cathedral", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1370: { name: "Steppe Lancer", type: 5, class: 2 },
  1371: { name: "Steppe Lancer (Dead)", type: 0, class: 0 },
  1372: { name: "Elite Steppe Lancer", type: 5, class: 2 },
  1373: { name: "Elite Steppe Lancer (Dead)", type: 0, class: 0 },
  1374: { name: "Iroquois Warrior", type: 5, class: 2 },
  1375: { name: "Iroquois Warrior (Dead)", type: 0, class: 0 },
  1376: { name: "Torch B", type: 0, class: 0 },
  1377: { name: "Torch B", type: 0, class: 0 }, // Convertable
  1378: { name: "Rock Church", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1379: { name: "Sea Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } },
  1380: { name: "Sea Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } },
  1381: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1382: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } },
  1383: { name: "Sea Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } },
  1384: { name: "Sea Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } },
  1385: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1386: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } },
  1387: { name: "Sea Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1388: { name: "Sea Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } },
  1389: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1390: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1391: { name: "Sea Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1392: { name: "Sea Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } },
  1393: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1394: { name: "Sea Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1395: { name: "Sundjata (Dead)", type: 0, class: 0 },
  1396: { name: "Chain", type: 2, class: 5, footprint: { w: 2, h: 1 } },
  1397: { name: "Chain", type: 2, class: 5, footprint: { w: 1, h: 2 } },
  1398: { name: "Chain", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1399: { name: "Chain", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1400: { name: "Priest with Relic", type: 5, class: 2 },
  1401: { name: "Savar (Dead)", type: 0, class: 0 },
  1402: { name: "Barracks DARK", type: 0, class: 0 }, // Rubble
  1403: { name: "House DARK", type: 0, class: 0 }, // Rubble
  1404: { name: "Mill DARK", type: 0, class: 0 }, // Rubble
  1405: { name: "Outpost DARK", type: 0, class: 0 }, // Rubble
  1406: { name: "Gate Foundation", type: 0, class: 0 }, // Rubble
  1407: { name: "PalisadeWall DARK", type: 0, class: 0 }, // Rubble
  1408: { name: "TownCenter DARK", type: 0, class: 0 }, // Rubble
  1409: { name: "LumberCamp", type: 0, class: 0 }, // Rubble
  1410: { name: "MiningCamp", type: 0, class: 0 }, // Rubble
  1411: { name: "Mill Age2", type: 0, class: 0 }, // Rubble
  1412: { name: "Mill Age3", type: 0, class: 0 }, // Rubble
  1413: { name: "Barracks Age2", type: 0, class: 0 }, // Rubble
  1414: { name: "Barracks Age3", type: 0, class: 0 }, // Rubble
  1415: { name: "ArcheryRange Age2", type: 0, class: 0 }, // Rubble
  1416: { name: "ArcheryRange Age3", type: 0, class: 0 }, // Rubble
  1417: { name: "Stable Age2", type: 0, class: 0 }, // Rubble
  1418: { name: "Stable Age3", type: 0, class: 0 }, // Rubble
  1419: { name: "Blacksmith Age2", type: 0, class: 0 }, // Rubble
  1420: { name: "Blacksmith Age3", type: 0, class: 0 }, // Rubble
  1421: { name: "Monastery Age3", type: 0, class: 0 }, // Rubble
  1422: { name: "Market Age2", type: 0, class: 0 }, // Rubble
  1423: { name: "Market Age3", type: 0, class: 0 }, // Rubble
  1424: { name: "Market Age4", type: 0, class: 0 }, // Rubble
  1425: { name: "SiegeWorkshop Age2", type: 0, class: 0 }, // Rubble
  1426: { name: "SiegeWorkshop Age3", type: 0, class: 0 }, // Rubble
  1427: { name: "University Age3", type: 0, class: 0 }, // Rubble
  1428: { name: "University Age4", type: 0, class: 0 }, // Rubble
  1429: { name: "TradeWorkshop Age3", type: 0, class: 0 }, // Rubble
  1430: { name: "Castle Age3", type: 0, class: 0 }, // Rubble
  1431: { name: "TownCenter Age2", type: 0, class: 0 }, // Rubble
  1432: { name: "TownCenter Age3", type: 0, class: 0 }, // Rubble
  1433: { name: "TownCenter Age4", type: 0, class: 0 }, // Rubble
  1434: { name: "House Age2", type: 0, class: 0 }, // Rubble
  1435: { name: "House Age3", type: 0, class: 0 }, // Rubble
  1436: { name: "Tower Age2", type: 0, class: 0 }, // Rubble
  1437: { name: "Tower Age3", type: 0, class: 0 }, // Rubble
  1438: { name: "Tower Age4", type: 0, class: 0 }, // Rubble
  1439: { name: "Tower Bombard", type: 0, class: 0 }, // Rubble
  1440: { name: "PalisadeGate DARK NE", type: 0, class: 0 }, // Rubble
  1441: { name: "PalisadeGate DARK SE", type: 0, class: 0 }, // Rubble
  1442: { name: "PalisadeGate DARK E", type: 0, class: 0 }, // Rubble
  1443: { name: "PalisadeGate DARK N", type: 0, class: 0 }, // Rubble
  1444: { name: "FortifiedTower", type: 0, class: 0 }, // Rubble
  1445: { name: "Wonder", type: 0, class: 0 }, // Rubble
  1446: { name: "Feitoria", type: 0, class: 0 }, // Rubble
  1447: { name: "Yurt A", type: 0, class: 0 }, // Rubble
  1448: { name: "Yurt B", type: 0, class: 0 }, // Rubble
  1449: { name: "Yurt C", type: 0, class: 0 }, // Rubble
  1450: { name: "Yurt D", type: 0, class: 0 }, // Rubble
  1451: { name: "Yurt E", type: 0, class: 0 }, // Rubble
  1452: { name: "Yurt F", type: 0, class: 0 }, // Rubble
  1453: { name: "Yurt G", type: 0, class: 0 }, // Rubble
  1454: { name: "Yurt H", type: 0, class: 0 }, // Rubble
  1455: { name: "Hut A", type: 0, class: 0 }, // Rubble
  1456: { name: "Hut B", type: 0, class: 0 }, // Rubble
  1457: { name: "Hut C", type: 0, class: 0 }, // Rubble
  1458: { name: "Hut D", type: 0, class: 0 }, // Rubble
  1459: { name: "Hut E", type: 0, class: 0 }, // Rubble
  1460: { name: "Hut F", type: 0, class: 0 }, // Rubble
  1461: { name: "Hut G", type: 0, class: 0 }, // Rubble
  1462: { name: "Tent A", type: 0, class: 0 }, // Rubble
  1463: { name: "Tent B", type: 0, class: 0 }, // Rubble
  1464: { name: "Tent C", type: 0, class: 0 }, // Rubble
  1465: { name: "Tent D", type: 0, class: 0 }, // Rubble
  1466: { name: "Tent E", type: 0, class: 0 }, // Rubble
  1467: { name: "ArmyTent A", type: 0, class: 0 }, // Rubble
  1468: { name: "ArmyTent B", type: 0, class: 0 }, // Rubble
  1469: { name: "ArmyTent C", type: 0, class: 0 }, // Rubble
  1470: { name: "ArmyTent D", type: 0, class: 0 }, // Rubble
  1471: { name: "ArmyTent E", type: 0, class: 0 }, // Rubble
  1472: { name: "Barricade A", type: 0, class: 0 }, // Rubble
  1473: { name: "Barricade B", type: 0, class: 0 }, // Rubble
  1474: { name: "Barricade C", type: 0, class: 0 }, // Rubble
  1475: { name: "Barricade D", type: 0, class: 0 }, // Rubble
  1476: { name: "Pavilion A", type: 0, class: 0 }, // Rubble
  1477: { name: "Pavilion B", type: 0, class: 0 }, // Rubble
  1478: { name: "Pavilion C", type: 0, class: 0 }, // Rubble
  1479: { name: "Krepost", type: 0, class: 0 }, // Rubble
  1480: { name: "Cathedral", type: 0, class: 0 }, // Rubble
  1481: { name: "Temple of Heaven", type: 0, class: 0 }, // Rubble
  1482: { name: "DomeOfRock", type: 0, class: 0 }, // Rubble
  1483: { name: "Shrine", type: 0, class: 0 }, // Rubble
  1484: { name: "Storage", type: 0, class: 0 }, // Rubble
  1485: { name: "ArchOfConstantine", type: 0, class: 0 }, // Rubble
  1486: { name: "Fortress", type: 0, class: 0 }, // Rubble
  1487: { name: "GolGumbaz", type: 0, class: 0 }, // Rubble
  1488: { name: "PoenariCastle", type: 0, class: 0 }, // Rubble
  1489: { name: "QuimperCathedral", type: 0, class: 0 }, // Rubble
  1490: { name: "SanchiStupa", type: 0, class: 0 }, // Rubble
  1491: { name: "SankoreMadrasah", type: 0, class: 0 }, // Rubble
  1492: { name: "TowerOfLondon", type: 0, class: 0 }, // Rubble
  1493: { name: "DormitionCathedral", type: 0, class: 0 }, // Rubble
  1494: { name: "TheAccursedTower", type: 0, class: 0 }, // Rubble
  1495: { name: "TheTowerOfFlies", type: 0, class: 0 }, // Rubble
  1496: { name: "Mosque", type: 0, class: 0 }, // Rubble
  1497: { name: "Rubble 4 x 4", type: 0, class: 0 },
  1498: { name: "Rubble 8 x 8", type: 0, class: 0 },
  1499: { name: "Granary", type: 0, class: 0 }, // Rubble
  1500: { name: "StoneGate NE", type: 0, class: 0 }, // Rubble
  1501: { name: "StoneGate SE", type: 0, class: 0 }, // Rubble
  1502: { name: "StoneGate E", type: 0, class: 0 }, // Rubble
  1503: { name: "StoneGate N", type: 0, class: 0 }, // Rubble
  1504: { name: "FortifiedGate NE", type: 0, class: 0 }, // Rubble
  1505: { name: "FortifiedGate SE", type: 0, class: 0 }, // Rubble
  1506: { name: "FortifiedGate E", type: 0, class: 0 }, // Rubble
  1507: { name: "FortifiedGate N", type: 0, class: 0 }, // Rubble
  1508: { name: "StoneWall", type: 0, class: 0 }, // Rubble
  1509: { name: "FortifiedWall", type: 0, class: 0 }, // Rubble
  1510: { name: "CityGate NE", type: 0, class: 0 }, // Rubble
  1511: { name: "CityGate SE", type: 0, class: 0 }, // Rubble
  1512: { name: "CityGate E", type: 0, class: 0 }, // Rubble
  1513: { name: "CityGate N", type: 0, class: 0 }, // Rubble
  1514: { name: "Amphitheatre", type: 0, class: 0 }, // Rubble
  1515: { name: "Pyramid", type: 0, class: 0 }, // Rubble
  1516: { name: "GreatPyramid", type: 0, class: 0 }, // Rubble
  1517: { name: "AachenCathedral", type: 0, class: 0 }, // Rubble
  1518: { name: "StoneGate Corner", type: 0, class: 0 }, // Rubble
  1519: { name: "FortifiedGate Corner", type: 0, class: 0 }, // Rubble
  1520: { name: "Colosseum", type: 0, class: 0 }, // Rubble
  1521: { name: "PalisadeGate Corner", type: 0, class: 0 }, // Rubble
  1522: { name: "Aqueduct", type: 0, class: 0 }, // Rubble
  1523: { name: "CityGate Corner", type: 0, class: 0 }, // Rubble
  1524: { name: "Donjon Age2", type: 0, class: 0 }, // Rubble
  1525: { name: "Folwark Age2", type: 0, class: 0 }, // Rubble
  1526: { name: "PaganShrine", type: 0, class: 0 }, // Rubble
  1527: { name: "Folwark Age3", type: 0, class: 0 }, // Rubble
  1528: { name: "Folwark Age1", type: 0, class: 0 }, // Rubble
  1529: { name: "Caravanserai", type: 0, class: 0 }, // Rubble
  1530: { name: "MinaretOfJam", type: 0, class: 0 }, // Rubble
  1531: { name: "FortifiedChurch Age3", type: 0, class: 0 }, // Rubble
  1532: { name: "Yurt I", type: 0, class: 0 }, // Rubble
  1533: { name: "Yurt J", type: 0, class: 0 }, // Rubble
  1534: { name: "Yurt K", type: 0, class: 0 }, // Rubble
  1535: { name: "Yurt L", type: 0, class: 0 }, // Rubble
  1536: { name: "Bamboo Stump", type: 0, class: 0 },
  1537: { name: "Baobab Stump", type: 0, class: 0 },
  1538: { name: "Lush Bamboo Stump", type: 0, class: 0 },
  1539: { name: "Felled Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1540: { name: "Felled Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Bamboo
  1541: { name: "Felled Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Baobab
  1542: { name: "Felled Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Lush Bamboo
  1543: { name: "PLACEHOLDER", type: 0, class: 0 },
  1544: { name: "PLACEHOLDER", type: 0, class: 0 }, // LAND
  1545: { name: "PLACEHOLDER", type: 0, class: 0 }, // AMPHIBIOUS
  1546: { name: "PLACEHOLDER", type: 0, class: 0 }, // NAVAL
  1547: { name: "PLACEHOLDER", type: 0, class: 0 }, // WATER
  1548: { name: "Projectile CHURCH", type: 0, class: 0 },
  1549: { name: "Forage Bush", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Gurjaras
  1550: { name: "Bridge E--Top", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1551: { name: "Bridge E--Middle", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1552: { name: "Bridge E--Bottom", type: 0, class: 3, footprint: { w: 2, h: 3 } },
  1553: { name: "Bridge F--Top", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1554: { name: "Bridge F--Middle", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1555: { name: "Bridge F--Bottom", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  1556: { name: "Bridge E--Cracked", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1557: { name: "Bridge E--Broken Top", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1558: { name: "Bridge E--Broken Bottom", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  1559: { name: "Bridge F--Cracked", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1560: { name: "Bridge F--Broken Top", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1561: { name: "Bridge F--Broken Bottom", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  1562: { name: "Paifang Gate", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1563: { name: "Nubian Pyramid", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1564: { name: "Target A", type: 0, class: 0 },
  1565: { name: "Target B", type: 0, class: 0 },
  1566: { name: "Temple Ruin", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1567: { name: "Well", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1568: { name: "Mounted Samurai", type: 5, class: 2 },
  1569: { name: "Mounted Samurai (Dead)", type: 0, class: 0 },
  1570: { name: "Xolotl Warrior", type: 5, class: 2 },
  1571: { name: "XolotlWarrior (Dead)", type: 0, class: 0 },
  1572: { name: "Merchant", type: 5, class: 2 },
  1573: { name: "Merchant (Dead)", type: 0, class: 0 },
  1574: { name: "Sosso Guard", type: 5, class: 2 },
  1575: { name: "Sosso Gaurd (Dead)", type: 0, class: 0 },
  1576: { name: "Royal Janissary (Dead)", type: 0, class: 0 },
  1577: { name: "Photon Man", type: 5, class: 2 },
  1578: { name: "Photonman (Dead)", type: 0, class: 0 },
  1579: { name: "City Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } },
  1580: { name: "City Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } },
  1581: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1582: { name: "City Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } },
  1583: { name: "City Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } },
  1584: { name: "City Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } },
  1585: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1586: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } },
  1587: { name: "City Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1588: { name: "City Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } },
  1589: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1590: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1591: { name: "City Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } },
  1592: { name: "City Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } },
  1593: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1594: { name: "City Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  1595: { name: "Projectile Laser", type: 0, class: 0 },
  1596: { name: "Cow", type: 5, class: 2 }, // Black
  1597: { name: "Cow B (Dead)", type: 0, class: 0 },
  1598: { name: "Cow", type: 5, class: 2 }, // Brown & White
  1599: { name: "Cow C (Dead)", type: 0, class: 0 },
  1600: { name: "Cow", type: 5, class: 2 }, // Brown
  1601: { name: "Cow D (Dead)", type: 0, class: 0 },
  1602: { name: "Horse C", type: 5, class: 2 },
  1603: { name: "Horse C (Dead)", type: 0, class: 0 },
  1604: { name: "Horse D", type: 5, class: 2 },
  1605: { name: "Horse D (Dead)", type: 0, class: 0 },
  1606: { name: "Horse E", type: 5, class: 2 },
  1607: { name: "Horse E (Dead)", type: 0, class: 0 },
  1608: { name: "Butterflies1", type: 5, class: 2 },
  1609: { name: "Butterflies2", type: 5, class: 2 },
  1610: { name: "Butterflies3", type: 5, class: 2 },
  1611: { name: "Animal Blood Small", type: 0, class: 0 },
  1612: { name: "Animal Blood Large", type: 0, class: 0 },
  1613: { name: "Terrain blocker", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1614: { name: "Bolt explosion", type: 0, class: 0 },
  1615: { name: "Sforza (Dead)", type: 0, class: 0 },
  1616: { name: "Tariq Ibn Ziyad (Dead)", type: 0, class: 0 },
  1617: { name: "Vlad Dracula (Dead)", type: 0, class: 0 },
  1618: { name: "Subotai (Dead)", type: 0, class: 0 },
  1619: { name: "Attila (Dead)", type: 0, class: 0 },
  1620: { name: "Alaric (Dead)", type: 0, class: 0 },
  1621: { name: "Sumanguru (Dead)", type: 0, class: 0 },
  1622: { name: "Aachen Cathedral", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1623: { name: "Le Loi (Dead)", type: 0, class: 0 },
  1624: { name: "Ataulf (Dead)", type: 0, class: 0 },
  1625: { name: "Yodit (Dead)", type: 0, class: 0 },
  1626: { name: "Cusi Yupanqui (Dead)", type: 0, class: 0 },
  1627: { name: "Prithviraj (Dead)", type: 0, class: 0 },
  1628: { name: "Jarl (Dead)", type: 0, class: 0 },
  1629: { name: "Ivaylo (Dead)", type: 0, class: 0 },
  1630: { name: "Ivaylo Infantry (Dead)", type: 0, class: 0 },
  1631: { name: "The Middlebrook", type: 5, class: 2 },
  1632: { name: "Osman (Dead)", type: 0, class: 0 },
  1633: { name: "Pachacuti (Dead)", type: 0, class: 0 },
  1634: { name: "Baobab Stump", type: 0, class: 0 },
  1635: { name: "Waterfall", type: 0, class: 0 }, // Background
  1636: { name: "Envoy (Dead)", type: 0, class: 0 },
  1637: { name: "Bayinnaung (Dead)", type: 0, class: 0 },
  1638: { name: "Kushluk (Dead)", type: 0, class: 0 },
  1639: { name: "Monument resources enabler", type: 0, class: 0 },
  1640: { name: "Villager building", type: 0, class: 0 }, // Male
  1641: { name: "Villager building", type: 0, class: 0 }, // Female
  1642: { name: "Villager annex", type: 0, class: 0 }, // Chinese
  1643: { name: "Villager building2", type: 0, class: 0 }, // Male
  1644: { name: "Villager annex", type: 0, class: 0 }, // Mayan
  1645: { name: "Villager building2", type: 0, class: 0 }, // Female
  1646: { name: "Market", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  1647: { name: "Trade Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  1648: { name: "Trail Smoke", type: 0, class: 0 }, // Gunpowder
  1649: { name: "Trophy None", type: 0, class: 0 },
  1650: { name: "Trophy Bronze", type: 0, class: 0 },
  1651: { name: "Trophy Silver", type: 0, class: 0 },
  1652: { name: "Trophy Gold", type: 0, class: 0 },
  1653: { name: "Trophy Platinum", type: 0, class: 0 },
  1654: { name: "resources", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1655: { name: "Coustillier", type: 5, class: 2 },
  1656: { name: "Coustillier (Dead)", type: 0, class: 0 },
  1657: { name: "Elite Coustillier", type: 5, class: 2 },
  1658: { name: "Serjeant", type: 5, class: 2 },
  1659: { name: "Elite Serjeant", type: 5, class: 2 },
  1660: { name: "Serjeant", type: 5, class: 2 }, // Donjon
  1661: { name: "Elite Serjeant", type: 5, class: 2 }, // Donjon
  1662: { name: "Serjeant (Dead)", type: 0, class: 0 },
  1663: { name: "Flemish Militia", type: 5, class: 2 }, // Male
  1664: { name: "Flemish Militia Male (Dead)", type: 0, class: 0 },
  1665: { name: "Donjon", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1666: { name: "HPIKL_D", type: 0, class: 0 },
  1667: { name: "Elite Elephant Archer (Dead)", type: 0, class: 0 },
  1668: { name: "Camel Scout (Dead)", type: 0, class: 0 },
  1669: { name: "Edward Longshanks", type: 5, class: 2 },
  1670: { name: "Edward Longshanks (Dead)", type: 0, class: 0 },
  1671: { name: "Gilbert de Clare", type: 5, class: 2 },
  1672: { name: "Gilbert de Clare (Dead)", type: 0, class: 0 },
  1673: { name: "John the Fearless", type: 5, class: 2 },
  1674: { name: "John the Fearless (Dead)", type: 0, class: 0 },
  1675: { name: "Philip the Good", type: 5, class: 2 },
  1676: { name: "Philip the Good (Dead)", type: 0, class: 0 },
  1677: { name: "Robert Guiscard", type: 5, class: 2 },
  1678: { name: "Robert Guiscard (Dead)", type: 0, class: 0 },
  1679: { name: "Roger Bosso", type: 5, class: 2 },
  1680: { name: "Roger Bosso (Dead)", type: 0, class: 0 },
  1681: { name: "Bohemond", type: 5, class: 2 },
  1682: { name: "Bohemond (Dead)", type: 0, class: 0 },
  1683: { name: "Llywelyn ap Gruffydd", type: 5, class: 2 },
  1684: { name: "Llywelyn ap Gruffydd (Dead)", type: 0, class: 0 },
  1685: { name: "Dafydd ap Gruffydd", type: 5, class: 2 },
  1686: { name: "Dafydd ap Gruffydd (Dead)", type: 0, class: 0 },
  1687: { name: "Bernard d'Armagnac", type: 5, class: 2 },
  1688: { name: "Bernard d'Armagnac (Dead)", type: 0, class: 0 },
  1689: { name: "Flare", type: 0, class: 0 }, // Permanent
  1690: { name: "Warwolf Trebuchet", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  1691: { name: "Warwolf Trebuchet", type: 5, class: 2, footprint: { w: 1, h: 1 } }, // Packed
  1692: { name: "Jacqueline of Hainaut", type: 5, class: 2 },
  1693: { name: "Sheep building1", type: 5, class: 2, footprint: { w: 4, h: 4 } },
  1694: { name: "Sheep annex1", type: 5, class: 2 },
  1695: { name: "Sheep building2", type: 5, class: 2, footprint: { w: 4, h: 4 } },
  1696: { name: "Sheep annex2", type: 5, class: 2 },
  1697: { name: "Flemish Militia", type: 5, class: 2 }, // Female
  1698: { name: "Flemish Militia Female (Dead)", type: 0, class: 0 },
  1699: { name: "Flemish Militia", type: 5, class: 2 }, // Train
  1700: { name: "Sheep building3", type: 5, class: 2, footprint: { w: 4, h: 4 } },
  1701: { name: "Obuch", type: 5, class: 2 },
  1702: { name: "Obuch (Dead)", type: 0, class: 0 },
  1703: { name: "Elite Obuch", type: 5, class: 2 },
  1704: { name: "Hussite Wagon", type: 5, class: 2 },
  1705: { name: "Hussite Wagon (Dead)", type: 0, class: 0 },
  1706: { name: "Elite Hussite Wagon", type: 5, class: 2 },
  1707: { name: "Winged Hussar", type: 5, class: 2 },
  1708: { name: "Winged Hussar (Dead)", type: 0, class: 0 },
  1709: { name: "Houfnice", type: 5, class: 2 },
  1710: { name: "Houfnice (Dead)", type: 0, class: 0 },
  1711: { name: "Folwark", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  1712: { name: "Pagan Shrine", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1713: { name: "Jan Zizka", type: 5, class: 2 },
  1714: { name: "Jan Zizka (Dead)", type: 0, class: 0 },
  1715: { name: "Jadwiga", type: 5, class: 2 },
  1716: { name: "Jadwiga (Dead)", type: 0, class: 0 },
  1717: { name: "Birch Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1718: { name: "Jogaila", type: 5, class: 2 },
  1719: { name: "Jogaila (Dead)", type: 0, class: 0 },
  1720: { name: "Folwark", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  1721: { name: "Kestutis", type: 5, class: 2 },
  1722: { name: "Kestutis (Dead)", type: 0, class: 0 },
  1723: { name: "Crusader Knight", type: 5, class: 2 },
  1724: { name: "Crusader Knight (Dead)", type: 0, class: 0 },
  1725: { name: "Algirdas", type: 5, class: 2 },
  1726: { name: "Algirdas (Dead)", type: 0, class: 0 },
  1727: { name: "Ulrich von Jungingen", type: 5, class: 2 },
  1728: { name: "Ulrich von Jungingen (Dead)", type: 0, class: 0 },
  1729: { name: "Emperor Sigismund", type: 5, class: 2 },
  1730: { name: "Dmitri of Moscow", type: 5, class: 2 },
  1731: { name: "Mikhail of Tver", type: 5, class: 2 },
  1732: { name: "Young Jagwiga", type: 5, class: 2 },
  1733: { name: "Projectile Hussite Wagon", type: 0, class: 0 },
  1734: { name: "Folwark", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Dark Age
  1735: { name: "Urumi Swordsman", type: 5, class: 2 },
  1736: { name: "Urumi Swordsman (Dead)", type: 0, class: 0 },
  1737: { name: "Elite Urumi Swordsman", type: 5, class: 2 },
  1738: { name: "Ratha", type: 5, class: 2 }, // Melee
  1739: { name: "Ratha (Dead)", type: 0, class: 0 }, // Melee, Dead
  1740: { name: "Elite Ratha", type: 5, class: 2 }, // Melee
  1741: { name: "Chakram Thrower", type: 5, class: 2 },
  1742: { name: "Chakram Thrower (Dead)", type: 0, class: 0 },
  1743: { name: "Elite Chakram Thrower", type: 5, class: 2 },
  1744: { name: "Armored Elephant", type: 5, class: 2 },
  1745: { name: "Armored Elephant (Dead)", type: 0, class: 0 },
  1746: { name: "Siege Elephant", type: 5, class: 2 },
  1747: { name: "Ghulam", type: 5, class: 2 },
  1748: { name: "Ghulam (Dead)", type: 0, class: 0 },
  1749: { name: "Elite Ghulam", type: 5, class: 2 },
  1750: { name: "Thirisadai", type: 5, class: 2 },
  1751: { name: "Shrivamsha Rider", type: 5, class: 2 },
  1752: { name: "Shrivamsha Rider (Dead)", type: 0, class: 0 },
  1753: { name: "Elite Shrivamsha Rider", type: 5, class: 2 },
  1754: { name: "Caravanserai", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  1755: { name: "Camel Scout", type: 5, class: 2 },
  1756: { name: "Projectile Chakram", type: 0, class: 0 },
  1757: { name: "Siege Elephant (Dead)", type: 0, class: 0 },
  1758: { name: "Gaia transition building", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1759: { name: "Ratha", type: 5, class: 2 }, // Ranged
  1760: { name: "Ratha (Dead)", type: 0, class: 0 }, // Ranged, Dead
  1761: { name: "Elite Ratha", type: 5, class: 2 }, // Ranged
  1762: { name: "Mihira Bhoja", type: 5, class: 2 },
  1763: { name: "Amoghavarsha", type: 5, class: 2 },
  1764: { name: "Rajendra Chola", type: 5, class: 2 },
  1765: { name: "Rajendra Chola (Dead)", type: 0, class: 0 },
  1766: { name: "General Araiyan", type: 5, class: 2 },
  1767: { name: "General Araiyan (Dead)", type: 0, class: 0 },
  1768: { name: "Young Babur", type: 5, class: 2 },
  1769: { name: "Qutlugh", type: 5, class: 2 },
  1770: { name: "Qutlugh (Dead)", type: 0, class: 0 },
  1771: { name: "Ibrahim Lodi", type: 5, class: 2 },
  1772: { name: "Shaybani Khan", type: 5, class: 2 },
  1773: { name: "Minaret of Jam", type: 2, class: 3, footprint: { w: 5, h: 5 } },
  1774: { name: "Map Revealer Medium", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1775: { name: "Map Revealer Giant", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1776: { name: "Blocker", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1777: { name: "Indian Statues", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1778: { name: "Rekha-Deul Temple", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  1779: { name: "Projectile Thirisadai", type: 0, class: 0 },
  1780: { name: "Projectile Thirisadai", type: 0, class: 0 }, // Fire
  1781: { name: "Projectile Elephant Archer", type: 0, class: 0 },
  1782: { name: "Projectile Elephant Archer", type: 0, class: 0 }, // Fire
  1783: { name: "Projectile Elite Chakram", type: 0, class: 0 },
  1784: { name: "Indian Ruins", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1785: { name: "Flare B", type: 0, class: 0 }, // Permanent
  1786: { name: "Spearman", type: 5, class: 2 }, // Donjon
  1787: { name: "Pikeman", type: 5, class: 2 }, // Donjon
  1788: { name: "Halberdier", type: 5, class: 2 }, // Donjon
  1789: { name: "Projectile Organ Gun", type: 0, class: 0 }, // Secondary
  1790: { name: "Centurion", type: 5, class: 2 },
  1791: { name: "Centurion (Dead)", type: 0, class: 0 },
  1792: { name: "Elite Centurion", type: 5, class: 2 },
  1793: { name: "Legionary", type: 5, class: 2 },
  1794: { name: "Legionary (Dead)", type: 0, class: 0 },
  1795: { name: "Dromon", type: 5, class: 2 },
  1796: { name: "Gazelle", type: 5, class: 2 },
  1797: { name: "Gazelle (Dead)", type: 0, class: 0 },
  1798: { name: "Projectile Dromon", type: 0, class: 0 }, // Greek Fire
  1799: { name: "Trail Smoke", type: 0, class: 0 }, // Fire
  1800: { name: "Composite Bowman", type: 5, class: 2 },
  1801: { name: "Composite Bowman (Dead)", type: 0, class: 0 },
  1802: { name: "Elite Composite Bowman", type: 5, class: 2 },
  1803: { name: "Monaspa", type: 5, class: 2 },
  1804: { name: "Monaspa (Dead)", type: 0, class: 0 },
  1805: { name: "Elite Monaspa", type: 5, class: 2 },
  1806: { name: "Fortified Church", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1807: { name: "Svan Tower", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1808: { name: "Mule Cart", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  1809: { name: "Mule Cart (Dead)", type: 0, class: 0 },
  1810: { name: "Villager", type: 5, class: 2 },
  1811: { name: "Warrior Priest", type: 5, class: 2 },
  1812: { name: "Warrior Priest (Dead)", type: 0, class: 0 },
  1813: { name: "Savar", type: 5, class: 2 },
  1814: { name: "Savar", type: 0, class: 0 },
  1815: { name: "Shah Ismail", type: 5, class: 2 },
  1816: { name: "Shah Ismail (Dead)", type: 0, class: 0 },
  1817: { name: "Qizilbash Warrior", type: 5, class: 2 },
  1818: { name: "Qizilbash Warrior (Dead)", type: 0, class: 0 },
  1819: { name: "Ismail", type: 5, class: 2 },
  1820: { name: "Selim the Grim", type: 5, class: 2 },
  1821: { name: "Thoros", type: 5, class: 2 },
  1822: { name: "Tamar", type: 5, class: 2 },
  1823: { name: "Tamar (Dead)", type: 0, class: 0 },
  1824: { name: "Yury", type: 5, class: 2 },
  1825: { name: "Ivane", type: 5, class: 2 },
  1826: { name: "Zakare", type: 5, class: 2 },
  1827: { name: "Stephan", type: 5, class: 2 },
  1828: { name: "Mleh", type: 5, class: 2 },
  1829: { name: "Elite Qizilbash Warrior", type: 5, class: 2 },
  1830: { name: "Projectile Citadels", type: 0, class: 0 },
  1831: { name: "Warrior Priest with Relic", type: 5, class: 2 },
  1832: { name: "Yurt I", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1833: { name: "Yurt J", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1834: { name: "Yurt K", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1835: { name: "Yurt L", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  1836: { name: "Chapel", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1837: { name: "Castle Ruins", type: 2, class: 1, footprint: { w: 4, h: 4 } },
  1838: { name: "Church Ruins", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  1839: { name: "Bridge Piece--End A", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1840: { name: "Bridge Piece--End B", type: 0, class: 3, footprint: { w: 1, h: 2 } },
  1841: { name: "Bridge Piece--End C", type: 0, class: 3, footprint: { w: 2, h: 1 } },
  1842: { name: "Bridge Piece--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1843: { name: "Bridge Piece--Broken A", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1844: { name: "Bridge Piece--Broken B", type: 2, class: 3, footprint: { w: 1, h: 2 } },
  1845: { name: "Bridge Piece--Broken C", type: 2, class: 3, footprint: { w: 2, h: 1 } },
  1846: { name: "Bridge Piece--Cracked", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  1847: { name: "Bridge Piece--Rails", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1848: { name: "Thoros (Dead)", type: 0, class: 0 },
  1849: { name: "Cliff 01", type: 2, class: 6, footprint: { w: 3, h: 3 } }, // Desert
  1850: { name: "Cliff 02", type: 2, class: 6, footprint: { w: 1, h: 3 } }, // Desert
  1851: { name: "Cliff 03", type: 2, class: 6, footprint: { w: 3, h: 1 } }, // Desert
  1852: { name: "Cliff 04", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Desert
  1853: { name: "Cliff 05", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Desert
  1854: { name: "Cliff 06", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Desert
  1855: { name: "Cliff 07", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Desert
  1856: { name: "Cliff 08", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Desert
  1857: { name: "Cliff 09", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Desert
  1858: { name: "Cliff 01", type: 2, class: 6, footprint: { w: 3, h: 3 } }, // Snow
  1859: { name: "Cliff 02", type: 2, class: 6, footprint: { w: 1, h: 3 } }, // Snow
  1860: { name: "Cliff 03", type: 2, class: 6, footprint: { w: 3, h: 1 } }, // Snow
  1861: { name: "Cliff 04", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Snow
  1862: { name: "Cliff 05", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Snow
  1863: { name: "Cliff 06", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Snow
  1864: { name: "Cliff 07", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Snow
  1865: { name: "Cliff 08", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Snow
  1866: { name: "Cliff 09", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Snow
  1867: { name: "Projectile SVT", type: 0, class: 0 },
  1868: { name: "Projectile SVT", type: 0, class: 0 }, // Fire
  1869: { name: "Hunnic Horse", type: 5, class: 2 },
  1870: { name: "Chief's Yurt", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  1871: { name: "ChiefsYurt", type: 0, class: 0 }, // Rubble
  1872: { name: "REVEAL1", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // TEMP
  1873: { name: "REVEAL2", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // TEMP
  1874: { name: "REVEAL3", type: 3, class: 3, footprint: { w: 1, h: 1 } }, // TEMP
  1875: { name: "PLACEHOLDER", type: 0, class: 0 }, // VILL
  1876: { name: "PLACEHOLDER", type: 0, class: 0 }, // VILLF
  1877: { name: "GREN_DELAY_1", type: 0, class: 0 },
  1878: { name: "GREN_DELAY_2", type: 0, class: 0 },
  1879: { name: "Projectile LCHUAN", type: 0, class: 0 }, // Rocket
  1880: { name: "PROJMTREB_D", type: 0, class: 0 },
  1881: { name: "LCHUAN_D0", type: 5, class: 2 },
  1882: { name: "LCHUAN_EXP", type: 0, class: 0 },
  1883: { name: "LCHUAN_DELAY_D", type: 0, class: 0 },
  1884: { name: "LCHUAN_DELAY_EXP", type: 0, class: 0 },
  1885: { name: "Broken Fence A", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1886: { name: "Broken Fence B", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1887: { name: "GREN_DELAY_D", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1888: { name: "Pasture Post", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  1889: { name: "Pasture", type: 13, class: 3, footprint: { w: 4, h: 4 } },
  1890: { name: "Pasture Annex", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1891: { name: "Herder", type: 5, class: 2 }, // Female
  1892: { name: "Herder", type: 5, class: 2 }, // Male
  1893: { name: "Pasture", type: 0, class: 0, footprint: { w: 4, h: 4 } }, // Mangrove
  1894: { name: "Dead Pasture", type: 0, class: 0 },
  1895: { name: "HRCKTCRT_D0", type: 5, class: 2 },
  1896: { name: "Argali", type: 5, class: 2 },
  1897: { name: "Pasture", type: 0, class: 0, footprint: { w: 4, h: 4 } }, // Land
  1898: { name: "Dead Pasture", type: 0, class: 0 },
  1899: { name: "Argali", type: 3, class: 0 }, // Pasture
  1900: { name: "Ibex", type: 3, class: 0 }, // Pasture
  1901: { name: "Fire Lancer", type: 5, class: 2 },
  1902: { name: "PLACEHOLDER2", type: 0, class: 0 },
  1903: { name: "Elite Fire Lancer", type: 5, class: 2 },
  1904: { name: "Rocket Cart", type: 5, class: 2 },
  1905: { name: "PLACEHOLDER2", type: 0, class: 0 }, // LAND
  1906: { name: "Projectile Rocket Cart", type: 0, class: 0 },
  1907: { name: "Heavy Rocket Cart", type: 5, class: 2 },
  1908: { name: "Iron Pagoda", type: 5, class: 2 },
  1909: { name: "PLACEHOLDER2", type: 0, class: 0 }, // AMPHIBIOUS
  1910: { name: "Elite Iron Pagoda", type: 5, class: 2 },
  1911: { name: "Grenadier", type: 5, class: 2 },
  1912: { name: "PLACEHOLDER2", type: 0, class: 0 }, // NAVAL
  1913: { name: "Projectile Grenadier", type: 0, class: 0 },
  1914: { name: "GREN_DELAYANNEX_D", type: 0, class: 0 },
  1915: { name: "GREN_DELAY_EXP", type: 0, class: 0 },
  1916: { name: "GREN_D0", type: 5, class: 2 },
  1917: { name: "GREN_EXP", type: 0, class: 0 },
  1918: { name: "RCKTCRT_D0", type: 5, class: 2 },
  1919: { name: "RCKTCRT_EXP", type: 0, class: 0 },
  1920: { name: "Liao Dao", type: 5, class: 2 },
  1921: { name: "PLACEHOLDER2", type: 0, class: 0 }, // WATER
  1922: { name: "Elite Liao Dao", type: 5, class: 2 },
  1923: { name: "Mounted Trebuchet", type: 5, class: 2 },
  1924: { name: "Walrus", type: 5, class: 2 },
  1925: { name: "Projectile Fire Lancer", type: 0, class: 0 },
  1926: { name: "Projectile Mounted Trebuchet", type: 0, class: 0 },
  1927: { name: "Projectile Mounted Trebuchet", type: 0, class: 0 }, // Fire
  1928: { name: "ROCKET_DELAY_D", type: 0, class: 0 },
  1929: { name: "ROCKET_DELAY_EXP", type: 0, class: 0 },
  1930: { name: "Projectile Crossbowman", type: 0, class: 0 }, // Secondary
  1931: { name: "Projectile ZhouYu", type: 0, class: 0 },
  1932: { name: "Projectile Traction", type: 0, class: 0 },
  1933: { name: "Projectile Traction", type: 0, class: 0 }, // Fire
  1934: { name: "Projectile Traction", type: 0, class: 0 }, // Secondary
  1935: { name: "Projectile Traction", type: 0, class: 0 }, // Secondary Fire
  1936: { name: "Projectile LCHUAN", type: 0, class: 0 }, // Charge
  1937: { name: "Projectile LCHUAN Fire", type: 0, class: 0 }, // Charge
  1938: { name: "Projectile LCHUAN", type: 0, class: 0 },
  1939: { name: "Projectile LCHUAN", type: 0, class: 0 }, // Fire
  1940: { name: "Pagan Priest", type: 5, class: 2 },
  1941: { name: "Pagan Priest with Relic", type: 5, class: 2 },
  1942: { name: "Traction Trebuchet", type: 5, class: 2 },
  1943: { name: "Weapon Stacks B", type: 0, class: 0 },
  1944: { name: "Hei Guang Cavalry", type: 5, class: 2 },
  1945: { name: "Hei Guang Cavalry (Dead)", type: 0, class: 0 },
  1946: { name: "Heavy Hei Guang Cavalry", type: 5, class: 2 },
  1947: { name: "Heavy Hei Guang Cavalry (Dead)", type: 0, class: 0 },
  1948: { name: "Lou Chuan", type: 5, class: 2 },
  1949: { name: "Tiger Cavalry", type: 5, class: 2 },
  1950: { name: "Tiger Cavalry (Dead)", type: 0, class: 0 },
  1951: { name: "Elite Tiger Cavalry", type: 5, class: 2 },
  1952: { name: "Xianbei Raider", type: 5, class: 2 },
  1953: { name: "Xianbei Raider (Dead)", type: 0, class: 0 },
  1954: { name: "Cao Cao", type: 5, class: 2 },
  1955: { name: "Red Fox", type: 5, class: 2 },
  1956: { name: "Dummy Target", type: 5, class: 2 },
  1957: { name: "Projectile War Chariot", type: 0, class: 0 }, // Barrage
  1958: { name: "Arctic Fox", type: 5, class: 2 },
  1959: { name: "White Feather Guard", type: 5, class: 2 },
  1960: { name: "White Feather Guard (Dead)", type: 0, class: 0 },
  1961: { name: "Elite White Feather Guard", type: 5, class: 2 },
  1962: { name: "War Chariot", type: 5, class: 2 }, // Focus Fire
  1963: { name: "Llama B", type: 5, class: 2 },
  1964: { name: "Projectile War Chariot", type: 0, class: 0 }, // Focus Fire
  1965: { name: "Arctic Wolf", type: 5, class: 2 },
  1966: { name: "Liu Bei", type: 5, class: 2 },
  1967: { name: "Rock (Mossy)", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1968: { name: "Fire Archer", type: 5, class: 2 },
  1969: { name: "Fire Archer (Dead)", type: 0, class: 0 },
  1970: { name: "Elite Fire Archer", type: 5, class: 2 },
  1971: { name: "Projectile Fire Archer", type: 0, class: 0 },
  1972: { name: "Projectile Fire Archer", type: 0, class: 0 }, // Red Cliffs
  1973: { name: "Nessie", type: 5, class: 2 },
  1974: { name: "Jian Swordsman", type: 5, class: 2 }, // Healthy
  1975: { name: "Jian Swordsman (Dead)", type: 0, class: 0 },
  1976: { name: "Jian Swordsman", type: 5, class: 2 }, // Injured
  1977: { name: "Jian Swordsman (Dead)", type: 0, class: 0 },
  1978: { name: "Sun Jian", type: 5, class: 2 },
  1979: { name: "Stonehenge", type: 3, class: 3, footprint: { w: 5, h: 5 } },
  1980: { name: "War Chariot", type: 5, class: 2 }, // Barrage
  1981: { name: "Kelp Seaweeds", type: 0, class: 0 },
  1982: { name: "Projectile Xianbei", type: 0, class: 0 },
  1983: { name: "Projectile Xianbei", type: 0, class: 0 }, // Secondary
  1984: { name: "Lush Bamboo Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1985: { name: "Lush Bamboo Stump", type: 0, class: 0 },
  1986: { name: "Paper Lantern", type: 0, class: 0 },
  1987: { name: "Chinese Ruins", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  1988: { name: "Emperor in a Litter", type: 5, class: 2 },
  1989: { name: "Paifang Gate", type: 0, class: 0 }, // Small
  1990: { name: "Paifang Gate", type: 0, class: 0 }, // Large
  1991: { name: "Fountain", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  1992: { name: "Bridge Piece CD--End A", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1993: { name: "Bridge Piece CD--End B", type: 0, class: 3, footprint: { w: 1, h: 2 } },
  1994: { name: "Bridge Piece CD--End C", type: 0, class: 3, footprint: { w: 2, h: 1 } },
  1995: { name: "Bridge Piece CD--Middle A", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  1996: { name: "Bridge Piece CD--Middle B", type: 0, class: 3, footprint: { w: 1, h: 2 } },
  1997: { name: "Bridge Piece CD--Middle C", type: 0, class: 3, footprint: { w: 2, h: 1 } },
  1998: { name: "Bridge Piece CD--Broken A", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  1999: { name: "Bridge Piece CD--Broken B", type: 2, class: 3, footprint: { w: 1, h: 2 } },
  2000: { name: "Bridge Piece CD--Broken C", type: 2, class: 3, footprint: { w: 2, h: 1 } },
  2001: { name: "Bridge Piece CD--Cracked", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  2002: { name: "Bridge Piece CD--Rails A", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2003: { name: "Bridge Piece CD--Rails B", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2004: { name: "Bridge Piece CD--Rails C", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2005: { name: "Pagoda D", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2006: { name: "Pagoda E", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  2007: { name: "Garden Pavilion", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2008: { name: "Rock", type: 2, class: 1, footprint: { w: 2, h: 2 } }, // Pillar
  2009: { name: "Rock", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Limestone
  2010: { name: "Flag N", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2011: { name: "Flag O", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2012: { name: "Flag P", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2013: { name: "Flag Ritual A", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2014: { name: "Flag Ritual B", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2015: { name: "Flag Ritual C", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2016: { name: "Asian Pine Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2017: { name: "Peach Blossom Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2018: { name: "Asian Carts", type: 0, class: 0 },
  2019: { name: "Weapon Stacks", type: 0, class: 0 },
  2020: { name: "Garden Bridge", type: 0, class: 0 },
  2021: { name: "Siege Props", type: 0, class: 0 },
  2022: { name: "Asian Lanterns", type: 0, class: 0 },
  2023: { name: "Burned Building B", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2024: { name: "Asian Market Stalls", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2025: { name: "Willow Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2026: { name: "Red Crown Crane", type: 5, class: 2 },
  2027: { name: "Asian Maple Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Green
  2028: { name: "Asian Maple Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Autumn
  2029: { name: "Fallen Leaves", type: 0, class: 0 }, // Peach Blossom
  2030: { name: "Fallen Leaves", type: 0, class: 0 }, // Maple
  2031: { name: "Fallen Leaves", type: 0, class: 0 }, // Maple, Autumn
  2032: { name: "Lu Bu", type: 5, class: 2 },
  2033: { name: "Yurt M", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  2034: { name: "Guan Yu", type: 5, class: 2 },
  2035: { name: "Burned Building E", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2036: { name: "Zhuge Liang", type: 5, class: 2 },
  2037: { name: "Wooden Bridge Piece--End A", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  2038: { name: "Zhang Fei", type: 5, class: 2 },
  2039: { name: "Wooden Bridge Piece--End B", type: 0, class: 3, footprint: { w: 1, h: 2 } },
  2040: { name: "Sun Ce", type: 5, class: 2 },
  2041: { name: "Wooden Bridge Piece--End C", type: 0, class: 3, footprint: { w: 2, h: 1 } },
  2042: { name: "Sun Quan", type: 5, class: 2 },
  2043: { name: "Wooden Bridge Piece--Middle", type: 0, class: 3, footprint: { w: 1, h: 1 } },
  2044: { name: "Zhou Yu", type: 5, class: 2 },
  2045: { name: "Dong Zhuo", type: 5, class: 2 },
  2046: { name: "Yuan Shao", type: 5, class: 2 },
  2047: { name: "Yu Ji", type: 5, class: 2 },
  2048: { name: "White Tiger Yan", type: 5, class: 2 },
  2049: { name: "Liu Biao", type: 5, class: 2 },
  2050: { name: "Zhang Jue", type: 5, class: 2 },
  2051: { name: "Zhao Yun", type: 5, class: 2 },
  2052: { name: "Cao Cao", type: 5, class: 2 }, // Campaign
  2053: { name: "Liu Bei", type: 5, class: 2 }, // Campaign
  2054: { name: "Sun Jian", type: 5, class: 2 }, // Campaign
  2055: { name: "FIREARCH_EXP", type: 0, class: 0 },
  2056: { name: "Projectile LUBU", type: 0, class: 0 },
  2057: { name: "Projectile GSTRIKE", type: 0, class: 0 },
  2058: { name: "Huabiao Totem", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2059: { name: "Que Tower", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2060: { name: "Hall of Heroes", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2061: { name: "Lu Bu", type: 5, class: 2 },
  2062: { name: "Projectile SUNQUAN", type: 0, class: 0 },
  2063: { name: "Sun Quan", type: 5, class: 2 },
  2064: { name: "Guan Yu", type: 5, class: 2 },
  2065: { name: "Sun Jian", type: 5, class: 2 },
  2066: { name: "Liu Bei", type: 5, class: 2 },
  2067: { name: "Kongming Lantern", type: 0, class: 2 },
  2068: { name: "Kongming Lantern", type: 0, class: 2, footprint: { w: 1, h: 1 } },
  2069: { name: "Cliff 01", type: 2, class: 6, footprint: { w: 3, h: 3 } }, // Limestone
  2070: { name: "Cliff 02", type: 2, class: 6, footprint: { w: 1, h: 3 } }, // Limestone
  2071: { name: "Cliff 03", type: 2, class: 6, footprint: { w: 3, h: 1 } }, // Limestone
  2072: { name: "Cliff 04", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Limestone
  2073: { name: "Cliff 05", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Limestone
  2074: { name: "Cliff 06", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Limestone
  2075: { name: "Cliff 07", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Limestone
  2076: { name: "Cliff 08", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Limestone
  2077: { name: "Cliff 09", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Limestone
  2078: { name: "Pasture Annex Fences", type: 0, class: 0 },
  2079: { name: "Pasture Annex AB", type: 0, class: 0 },
  2080: { name: "Pasture Annex CD", type: 0, class: 0 },
  2081: { name: "Wooden Bridge Piece--Rails", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2082: { name: "Panda Rock", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  2083: { name: "Chicken A", type: 5, class: 2 },
  2084: { name: "Wild Chicken A", type: 5, class: 2 },
  2085: { name: "Chicken B", type: 5, class: 2 },
  2086: { name: "Wild Chicken B", type: 5, class: 2 },
  2087: { name: "Chicken C", type: 5, class: 2 },
  2088: { name: "Wild Chicken C", type: 5, class: 2 },
  2089: { name: "Black Bear", type: 5, class: 2 },
  2090: { name: "Polar Bear", type: 5, class: 2 },
  2091: { name: "Arabian Wolf", type: 5, class: 2 },
  2092: { name: "Wild Horse B", type: 5, class: 2 },
  2093: { name: "Wild Horse C", type: 5, class: 2 },
  2094: { name: "Wild Horse D", type: 5, class: 2 },
  2095: { name: "Wild Horse E", type: 5, class: 2 },
  2096: { name: "Monkey", type: 5, class: 2 },
  2097: { name: "Penguin", type: 5, class: 2 },
  2098: { name: "Hare A", type: 5, class: 2 },
  2099: { name: "Hare B", type: 5, class: 2 },
  2100: { name: "Arctic Hare", type: 5, class: 2 },
  2101: { name: "Immortal", type: 5, class: 2 },
  2102: { name: "Elite Immortal", type: 5, class: 2 },
  2103: { name: "Immortal (Dead)", type: 0, class: 0 },
  2104: { name: "Strategos", type: 5, class: 2 },
  2105: { name: "Elite Strategos", type: 5, class: 2 },
  2106: { name: "Strategos (Dead)", type: 0, class: 0 },
  2107: { name: "Hippeus", type: 5, class: 2 },
  2108: { name: "Elite Hippeus", type: 5, class: 2 },
  2109: { name: "Hippeus (Dead)", type: 0, class: 0 },
  2110: { name: "Hoplite", type: 5, class: 2 },
  2111: { name: "Elite Hoplite", type: 5, class: 2 },
  2112: { name: "Hoplite (Dead)", type: 0, class: 0 },
  2113: { name: "Placeholder", type: 0, class: 0 },
  2114: { name: "Placeholder", type: 0, class: 0 },
  2115: { name: "Placeholder", type: 0, class: 0 },
  2116: { name: "Placeholder", type: 0, class: 0 },
  2117: { name: "Shipyard3", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2118: { name: "Shipyard4", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2119: { name: "Shipyard2", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2120: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2121: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2122: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2123: { name: "Lembos", type: 5, class: 2 },
  2124: { name: "War Lembos", type: 5, class: 2 },
  2125: { name: "Heavy Lembos", type: 5, class: 2 },
  2126: { name: "Elite Lembos", type: 5, class: 2 },
  2127: { name: "Monoreme", type: 5, class: 2 },
  2128: { name: "Bireme", type: 5, class: 2 },
  2129: { name: "Trireme", type: 5, class: 2 },
  2130: { name: "Galley - Antiquity", type: 5, class: 2 },
  2131: { name: "War Galley - Antiquity", type: 5, class: 2 },
  2132: { name: "Elite Galley", type: 5, class: 2 },
  2133: { name: "Incendiary Raft", type: 5, class: 2 },
  2134: { name: "Incendiary Ship", type: 5, class: 2 },
  2135: { name: "Heavy Incendiary Ship", type: 5, class: 2 },
  2136: { name: "Placeholder", type: 0, class: 0 },
  2137: { name: "Placeholder", type: 0, class: 0 },
  2138: { name: "Catapult Ship", type: 5, class: 2 },
  2139: { name: "Onager Ship", type: 5, class: 2 },
  2140: { name: "Leviathan", type: 5, class: 2 },
  2141: { name: "Port 4", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2142: { name: "Port 3", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2143: { name: "Port 2", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2144: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2145: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2146: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2147: { name: "FSHSP", type: 5, class: 2 },
  2148: { name: "XPORT", type: 5, class: 2 },
  2149: { name: "Merchant Ship", type: 5, class: 2 },
  2150: { name: "War Chariot", type: 5, class: 2 },
  2151: { name: "Elite War Chariot", type: 5, class: 2 },
  2152: { name: "Placeholder", type: 0, class: 0 },
  2153: { name: "Placeholder", type: 0, class: 0 },
  2154: { name: "Placeholder", type: 0, class: 0 },
  2155: { name: "Placeholder", type: 0, class: 0 },
  2156: { name: "Placeholder", type: 0, class: 0 },
  2157: { name: "Placeholder", type: 0, class: 0 },
  2158: { name: "Placeholder", type: 0, class: 0 },
  2159: { name: "Placeholder", type: 0, class: 0 },
  2160: { name: "Placeholder", type: 0, class: 0 },
  2161: { name: "Placeholder", type: 0, class: 0 },
  2162: { name: "Polemarch 1", type: 5, class: 2 },
  2163: { name: "Basileus (Dead)", type: 0, class: 0 },
  2164: { name: "Polemarch 2", type: 5, class: 2 },
  2165: { name: "Polemarch 3", type: 5, class: 2 },
  2166: { name: "Polemarch 4", type: 5, class: 2 },
  2167: { name: "Polemarch 3 with Ephorate", type: 5, class: 2 },
  2168: { name: "Hippeus", type: 5, class: 2 },
  2169: { name: "Elite Hippeus", type: 5, class: 2 },
  2170: { name: "Oysters", type: 0, class: 1 },
  2171: { name: "Oystering Ship", type: 5, class: 2 },
  2172: { name: "Port 1", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2173: { name: "Dock", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2174: { name: "Immortal Ranged", type: 5, class: 2 },
  2175: { name: "Elite Immortal Ranged", type: 5, class: 2 },
  2176: { name: "Greek Army Tent A", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  2177: { name: "Greek Army Tent A", type: 0, class: 0 }, // Rubble
  2178: { name: "Marble Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  2179: { name: "Marble Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  2180: { name: "Marble Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  2181: { name: "Marble Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2182: { name: "Marble Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2183: { name: "Marble Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2184: { name: "Marble Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2185: { name: "Marble Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2186: { name: "Marble Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2187: { name: "Hoplite with Xyphos", type: 5, class: 2 },
  2188: { name: "Elite Hoplite with Xyphos", type: 5, class: 2 },
  2189: { name: "Placeholder", type: 0, class: 0 },
  2190: { name: "Short Marble Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  2191: { name: "Short Marble Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  2192: { name: "Short Marble Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  2193: { name: "Short Marble Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2194: { name: "Short Marble Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2195: { name: "Short Marble Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2196: { name: "Short Marble Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2197: { name: "Short Marble Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2198: { name: "Short Marble Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2199: { name: "Short Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  2200: { name: "Short Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  2201: { name: "Short Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  2202: { name: "Short Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2203: { name: "Short Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2204: { name: "Short Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2205: { name: "Short Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2206: { name: "Short Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2207: { name: "Short Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2208: { name: "Short Sand Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  2209: { name: "Short Sand Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  2210: { name: "Short Sand Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  2211: { name: "Short Sand Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2212: { name: "Short Sand Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2213: { name: "Short Sand Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2214: { name: "Short Sand Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2215: { name: "Short Sand Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2216: { name: "Short Sand Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2217: { name: "Short Snow Cliff 1", type: 2, class: 6, footprint: { w: 3, h: 3 } },
  2218: { name: "Short Snow Cliff 2", type: 2, class: 6, footprint: { w: 1, h: 3 } },
  2219: { name: "Short Snow Cliff 3", type: 2, class: 6, footprint: { w: 3, h: 1 } },
  2220: { name: "Short Snow Cliff 4", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2221: { name: "Short Snow Cliff 5", type: 2, class: 6, footprint: { w: 2, h: 3 } },
  2222: { name: "Short Snow Cliff 6", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2223: { name: "Short Snow Cliff 7", type: 2, class: 6, footprint: { w: 3, h: 2 } },
  2224: { name: "Short Snow Cliff 8", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2225: { name: "Short Snow Cliff 9", type: 2, class: 6, footprint: { w: 2, h: 2 } },
  2226: { name: "Projectile Leviathan", type: 0, class: 0 },
  2227: { name: "Strategos with Taxiarchs", type: 5, class: 2 },
  2228: { name: "Elite Strategos with Taxiarchs", type: 5, class: 2 },
  2229: { name: "Government cost change", type: 0, class: 0 },
  2230: { name: "First Government cost change", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2231: { name: "Second Government cost change", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2232: { name: "Third Government cost change", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2233: { name: "Fourth Government cost change", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2234: { name: "Mediterranean Ruins", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2235: { name: "Mediterranean Courtyard Walls", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2236: { name: "Lembos spawner", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2237: { name: "Lembos spawner part 2", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2238: { name: "AI Hint Object", type: 0, class: 0 },
  2239: { name: "Placeholder", type: 0, class: 0 },
  2240: { name: "Placeholder", type: 0, class: 0 },
  2241: { name: "Placeholder", type: 0, class: 0 },
  2242: { name: "Placeholder", type: 0, class: 0 },
  2243: { name: "Placeholder", type: 0, class: 0 },
  2244: { name: "Placeholder", type: 0, class: 0 },
  2245: { name: "Placeholder", type: 0, class: 0 },
  2246: { name: "Placeholder", type: 0, class: 0 },
  2247: { name: "Placeholder", type: 0, class: 0 },
  2248: { name: "Placeholder", type: 0, class: 0 },
  2249: { name: "Placeholder", type: 0, class: 0 },
  2250: { name: "Placeholder", type: 0, class: 0 },
  2251: { name: "Mesopotamian Pillar", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2252: { name: "Mesopotamian Garden", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2253: { name: "Achaemenid Flag 1", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2254: { name: "Achaemenid Flag 2", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2255: { name: "Achaemenid Flag 3", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2256: { name: "Athenian Flag 1", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2257: { name: "Athenian Flag 2", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2258: { name: "Athenian Flag 3", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2259: { name: "Spartan Flag 1", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2260: { name: "Spartan Flag 2", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2261: { name: "Spartan Flag 3", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2262: { name: "Greek Commander Tent A", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  2263: { name: "Greek Commander Tent A", type: 0, class: 0 }, // Rubble
  2264: { name: "Statue Athena Marble", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2265: { name: "Statue Athena Painted", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2266: { name: "Placeholder", type: 0, class: 0 },
  2267: { name: "Placeholder", type: 0, class: 0 },
  2268: { name: "Placeholder", type: 0, class: 0 },
  2269: { name: "Placeholder", type: 0, class: 0 },
  2270: { name: "Polemarch 4 with Ephorate", type: 5, class: 2 },
  2271: { name: "Polemarch 3 with Morai", type: 5, class: 2 },
  2272: { name: "Polemarch 4 with Morai", type: 5, class: 2 },
  2273: { name: "Spawn Basileus", type: 5, class: 2 },
  2274: { name: "Archaic Fence", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2275: { name: "Economic Satrapy", type: 0, class: 0, footprint: { w: 4, h: 4 } },
  2276: { name: "Defensive Satrapy", type: 0, class: 0, footprint: { w: 4, h: 4 } },
  2277: { name: "Military Satrapy", type: 0, class: 0, footprint: { w: 4, h: 4 } },
  2278: { name: "Garden Hedge", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2279: { name: "Statue Ares Marble", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2280: { name: "Statue Ares Painted", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2281: { name: "Sapper Tunnel", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  2282: { name: "Siege Camp Equipment", type: 0, class: 0 },
  2283: { name: "Siege Camp Weapons", type: 0, class: 0 },
  2284: { name: "Market Stall", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2285: { name: "Stake Barricade", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2286: { name: "Tropaion", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2287: { name: "Mesopotamian Tomb", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2288: { name: "Fire Shrine", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2289: { name: "Treasure Chest", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2290: { name: "Grapevine", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2291: { name: "Leatherworking Equipment", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2292: { name: "Antiquity Broken Cart", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2293: { name: "Weapon Rack", type: 0, class: 0 },
  2294: { name: "Sacred Tree", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2295: { name: "Placeholder", type: 0, class: 0 },
  2296: { name: "Placeholder", type: 0, class: 0 },
  2297: { name: "Placeholder", type: 0, class: 0 },
  2298: { name: "Placeholder", type: 0, class: 0 },
  2299: { name: "Placeholder", type: 0, class: 0 },
  2300: { name: "Placeholder", type: 0, class: 0, footprint: { w: 4, h: 4 } },
  2301: { name: "Elite Hoplite (Dead)", type: 0, class: 0 },
  2302: { name: "War Chariot (Dead)", type: 0, class: 0 },
  2303: { name: "Elite War Chariot (Dead)", type: 0, class: 0 },
  2304: { name: "Ranged Immortal (Dead)", type: 0, class: 0 },
  2305: { name: "Placeholder", type: 0, class: 0 },
  2306: { name: "Hero Shrine", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2307: { name: "Projectile Gastraphetes", type: 0, class: 0 },
  2308: { name: "Artaphernes", type: 5, class: 2 },
  2309: { name: "Datis", type: 5, class: 2 },
  2310: { name: "Aristagoras", type: 5, class: 2 },
  2311: { name: "Dionysus", type: 5, class: 2 },
  2312: { name: "Artemisia", type: 5, class: 2 },
  2313: { name: "Aristides", type: 5, class: 2 },
  2314: { name: "Miltiades", type: 5, class: 2 },
  2315: { name: "Themistocles", type: 5, class: 2 },
  2316: { name: "Leonidas", type: 5, class: 2 },
  2317: { name: "Brasidas", type: 5, class: 2 },
  2318: { name: "Lysander", type: 5, class: 2 },
  2319: { name: "The Aeginetan", type: 5, class: 2 },
  2320: { name: "Rhodian Slinger", type: 5, class: 2 },
  2321: { name: "Mercenary Hoplite", type: 5, class: 2 },
  2322: { name: "Elite Greek Cavalry", type: 5, class: 2 },
  2323: { name: "Elite Persian Cavalry", type: 5, class: 2 },
  2324: { name: "Elite Persian Archer", type: 5, class: 2 },
  2325: { name: "Ekdromos", type: 5, class: 2 },
  2326: { name: "Cretan Archer", type: 5, class: 2 },
  2327: { name: "Camel Raider", type: 5, class: 2 },
  2328: { name: "Tarantine Cavalry", type: 5, class: 2 },
  2329: { name: "Sparabara", type: 5, class: 2 },
  2330: { name: "Takabara", type: 5, class: 2 },
  2331: { name: "Sickle Warrior", type: 5, class: 2 },
  2332: { name: "Thracian Peltast", type: 5, class: 2 },
  2333: { name: "Oyster Gatherer", type: 5, class: 2 }, // Male
  2334: { name: "Oyster Gatherer", type: 5, class: 2 }, // Female
  2335: { name: "Placeholder", type: 0, class: 0 },
  2336: { name: "Placeholder", type: 0, class: 0 },
  2337: { name: "Placeholder", type: 0, class: 0 },
  2338: { name: "Placeholder", type: 0, class: 0 },
  2339: { name: "Themistocles Warship", type: 5, class: 2 },
  2340: { name: "Mouflon", type: 5, class: 2 },
  2341: { name: "Mouflon (Dead)", type: 0, class: 0 },
  2342: { name: "Projectile Polycritus", type: 0, class: 0 },
  2343: { name: "Military Satrapy Flag", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2344: { name: "Defensive Satrapy Flag", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2345: { name: "Economic Satrapy Flag", type: 0, class: 0, footprint: { w: 1, h: 1 } },
  2346: { name: "Cleon", type: 5, class: 2 },
  2347: { name: "Darius", type: 5, class: 2 },
  2348: { name: "Oracle Temple", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2349: { name: "Elite Hoplite", type: 5, class: 2 },
  2350: { name: "Mesopotamian Ruins", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2351: { name: "Tholos Shrine", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  2352: { name: "Antiquity Transport Shipwreck", type: 0, class: 0 },
  2353: { name: "Leviathan Shipwreck", type: 0, class: 0 },
  2354: { name: "Galley Shipwreck", type: 0, class: 0 },
  2355: { name: "Catapult Shipwreck", type: 0, class: 0 },
  2356: { name: "Antiquity Mode Fishing Ship", type: 5, class: 2 },
  2357: { name: "Ekdromos (Dead)", type: 0, class: 0 },
  2358: { name: "Sakan Axeman (Dead)", type: 0, class: 0 },
  2359: { name: "Brasidas (Dead)", type: 0, class: 0 },
  2360: { name: "Themistocles (Dead)", type: 0, class: 0 },
  2361: { name: "Mercenary Hoplite (Dead)", type: 0, class: 0 },
  2362: { name: "Sickle Warrior (Dead)", type: 0, class: 0 },
  2363: { name: "Artaphernes (Dead)", type: 0, class: 0 },
  2364: { name: "Datis (Dead)", type: 0, class: 0 },
  2365: { name: "Cretan Archer (Dead)", type: 0, class: 0 },
  2366: { name: "Bactrian Archer (Dead)", type: 0, class: 0 },
  2367: { name: "Rhodian Slinger (Dead)", type: 0, class: 0 },
  2368: { name: "Camel Raider (Dead)", type: 0, class: 0 },
  2369: { name: "Greek Noble Cavalry (Dead)", type: 0, class: 0 },
  2370: { name: "Aristagoras (Dead)", type: 0, class: 0 },
  2371: { name: "Lysander (Dead)", type: 0, class: 0 },
  2372: { name: "Sparabara (Dead)", type: 0, class: 0 },
  2373: { name: "Aura Quest Indicator", type: 0, class: 0 }, // Lavender
  2374: { name: "Scythian Axe Cavalry (Dead)", type: 0, class: 0 },
  2375: { name: "Tarantine Cavalry (Dead)", type: 0, class: 0 },
  2376: { name: "Aristides (Dead)", type: 0, class: 0 },
  2377: { name: "Thracian Peltast (Dead)", type: 0, class: 0 },
  2378: { name: "Aura Quest Indicator", type: 0, class: 0 }, // Shells
  2379: { name: "Aura Quest Indicator", type: 0, class: 0 }, // Coins
  2380: { name: "Aura Quest Indicator", type: 0, class: 0 }, // Gold and Shells
  2381: { name: "GOAT", type: 5, class: 2 },
  2382: { name: "Companion Cavalry", type: 5, class: 2 },
  2383: { name: "Elite Companion Cavalry", type: 5, class: 2 },
  2384: { name: "Phalangite", type: 5, class: 2 },
  2385: { name: "Elite Phalangite", type: 5, class: 2 },
  2386: { name: "Rhomphaia Warrior", type: 5, class: 2 },
  2387: { name: "Elite Rhomphaia Warrior", type: 5, class: 2 },
  2388: { name: "Pattiyodha Longbowman", type: 5, class: 2 },
  2389: { name: "Elite Pattiyodha Longbowman", type: 5, class: 2 },
  2390: { name: "Sannahya", type: 5, class: 2 },
  2391: { name: "Elite Sannahya", type: 5, class: 2 },
  2392: { name: "Companion Cavalry (Dead)", type: 0, class: 0 },
  2393: { name: "Phalangite (Dead)", type: 0, class: 0 },
  2394: { name: "Rhomphaia Warrior (Dead)", type: 0, class: 0 },
  2395: { name: "Pattiyodha Longbowman (Dead)", type: 0, class: 0 },
  2396: { name: "Sannahya (Dead)", type: 0, class: 0 },
  2397: { name: "Alexander Dismounted", type: 5, class: 2 },
  2398: { name: "Alexander", type: 5, class: 2 },
  2399: { name: "Philip", type: 5, class: 2 },
  2400: { name: "Parmenion", type: 5, class: 2 },
  2401: { name: "Cleitus", type: 5, class: 2 },
  2402: { name: "Hephaistion", type: 5, class: 2 },
  2403: { name: "Perdiccas", type: 5, class: 2 },
  2404: { name: "Nearchos", type: 5, class: 2 },
  2405: { name: "Greek Commander Tent Dropsite", type: 2, class: 3, footprint: { w: 2, h: 2 } },
  2406: { name: "Camp Stable Age2", type: 0, class: 0 }, // Rubble
  2407: { name: "Rock 1 Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2408: { name: "Rock 2 Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2409: { name: "Rock Formation 1 Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2410: { name: "Rock Jungle Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2411: { name: "Rock Limestone Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2412: { name: "Full Supply Cart no garrison", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  2413: { name: "Empty Supply Cart no garrison", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  2414: { name: "Macedonian Command Post", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2415: { name: "Fortified Outpost", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  2416: { name: "Second Empty TC annex", type: 5, class: 2 },
  2417: { name: "Fortified Outpost", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  2418: { name: "Castle", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  2419: { name: "Pattiyodha Longbowman", type: 5, class: 2 },
  2420: { name: "Elite Pattiyodha Longbowman", type: 5, class: 2 },
  2421: { name: "Mole under construction", type: 3, class: 3, footprint: { w: 3, h: 1 } },
  2422: { name: "Mole constructed", type: 0, class: 3, footprint: { w: 3, h: 1 } },
  2423: { name: "Blocker 1x3", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2424: { name: "Blocker 3x1", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2425: { name: "Mole annex 1", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2426: { name: "Mole annex 2", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2427: { name: "Mole annex 3", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2428: { name: "Mole annex 4", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2429: { name: "Buildable Blocker 1x3", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2430: { name: "Buildable Blocker 3x1", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2431: { name: "Removed", type: 1, class: 2 },
  2432: { name: "Removed Decay Animation", type: 0, class: 0 },
  2433: { name: "Thin blocker spawner A", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2434: { name: "Thin blocker spawner B", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2435: { name: "Thin blocker", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2436: { name: "Porus", type: 5, class: 2 },
  2437: { name: "Camp Barracks", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2438: { name: "Camp Archery Range", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2439: { name: "Camp Stable", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2440: { name: "Camp Siege Workshop", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  2441: { name: "Camp Blacksmith", type: 2, class: 3, footprint: { w: 3, h: 3 } },
  2442: { name: "Flagship of Nearchos moveable", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  2443: { name: "WCTWX", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  2444: { name: "Helepolis", type: 5, class: 2 },
  2445: { name: "Projectile Helepolis", type: 0, class: 0 },
  2446: { name: "Parmenion Dead", type: 0, class: 0 },
  2447: { name: "Macedonian Commander Dead", type: 0, class: 0 },
  2448: { name: "Flagship of Nearchos moveable docked", type: 5, class: 2, footprint: { w: 1, h: 1 } },
  2449: { name: "Indian Tribesman", type: 5, class: 2 },
  2450: { name: "Indian Tribesman (Dead)", type: 0, class: 0 },
  2451: { name: "Thracian Chieftain", type: 5, class: 2 },
  2452: { name: "Thracian Chieftain (Dead)", type: 0, class: 0 },
  2453: { name: "Hill Tribesman", type: 5, class: 2 },
  2454: { name: "Hill Tribesman (Dead)", type: 0, class: 0 },
  2455: { name: "Perdiccas (Dead)", type: 0, class: 0 },
  2456: { name: "Antiquity Impaled Corpse", type: 0, class: 0 },
  2457: { name: "Beached Whale", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  2458: { name: "Statue Hermes", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2459: { name: "Alexander's Rhomphaia Warrior", type: 5, class: 2 },
  2460: { name: "Alexander's Peltast", type: 5, class: 2 },
  2461: { name: "Alexander's Ekdromos", type: 5, class: 2 },
  2462: { name: "Alexander's Strategos", type: 5, class: 2 },
  2463: { name: "Alexander's Slinger", type: 5, class: 2 },
  2464: { name: "Alexander's Mercenary Archer", type: 5, class: 2 },
  2465: { name: "Alexander's Axe Cavalry", type: 5, class: 2 },
  2466: { name: "Alexander's Axeman", type: 5, class: 2 },
  2467: { name: "Alexander's Immortal", type: 5, class: 2 },
  2468: { name: "Alexander's Immortal Ranged", type: 5, class: 2 },
  2469: { name: "Alexander's War Chariot", type: 5, class: 2 },
  2470: { name: "Alexander's Skirmisher Cavalry", type: 5, class: 2 },
  2471: { name: "Alexander's Heavy Cavalry", type: 5, class: 2 },
  2472: { name: "Alexander's Sannahya", type: 5, class: 2 },
  2473: { name: "Alexander's Longbowman", type: 5, class: 2 },
  2474: { name: "Alexander's Eastern Archer", type: 5, class: 2 },
  2475: { name: "Alexander's Sickle Warrior", type: 5, class: 2 },
  2476: { name: "Macedonian Command Post", type: 0, class: 0 }, // Rubble
  2477: { name: "Ekdromos/Strategos", type: 5, class: 2 },
  2478: { name: "Slinger/Mercenary Archer", type: 5, class: 2 },
  2479: { name: "Axe Cavalry/Axeman", type: 5, class: 2 },
  2480: { name: "Immortal/War Chariot", type: 5, class: 2 },
  2481: { name: "Skirmisher Cav/Heavy Cav", type: 5, class: 2 },
  2482: { name: "Sannahya/Longbowman", type: 5, class: 2 },
  2483: { name: "Eastern Archer/Sickle Warrior", type: 5, class: 2 },
  2484: { name: "Helepolis Dead", type: 0, class: 0 },
  2485: { name: "Scythian Horse Archer", type: 5, class: 2 },
  2486: { name: "Elite Scythian Horse Archer", type: 5, class: 2 },
  2487: { name: "Sacred Band", type: 5, class: 2 },
  2488: { name: "Statue Artemis", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2489: { name: "Fortified Outpost", type: 0, class: 0 }, // Rubble
  2490: { name: "Owl", type: 5, class: 2 },
  2491: { name: "Water Pots", type: 0, class: 0 },
  2492: { name: "Camp Archery Range Age2", type: 0, class: 0 }, // Rubble
  2493: { name: "Porus (Dead)", type: 0, class: 0 },
  2494: { name: "Dismounted Alexander (Dead)", type: 0, class: 0 },
  2495: { name: "Cleitus (Dead)", type: 0, class: 0 },
  2496: { name: "Camp Barracks Age2", type: 0, class: 0 }, // Rubble
  2497: { name: "Scythian Horse Archer (Dead)", type: 0, class: 0 },
  2498: { name: "Macedonian Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2499: { name: "Thracian Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2500: { name: "Puru Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2501: { name: "Grain Storage", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2502: { name: "Mounted Alexander (Dead)", type: 0, class: 0 },
  2503: { name: "Sacred Band (Dead)", type: 0, class: 0 },
  2504: { name: "Burned Building Achaemenid", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2505: { name: "Burned Building Greek", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2506: { name: "Burned Building Greek", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2507: { name: "Statue Sphinx", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2508: { name: "Burned Building Thracian", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2509: { name: "Burned Building Puru", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2510: { name: "Furnace", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2511: { name: "Water Trough", type: 0, class: 0 },
  2512: { name: "Elite Scythian Horse Archer (Dead)", type: 0, class: 0 },
  2513: { name: "Boeotian Flag", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2514: { name: "Puru Ruins", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2515: { name: "Rock 3", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2516: { name: "Rock 3 Hover", type: 4, class: 0, footprint: { w: 1, h: 1 } },
  2517: { name: "Skeleton Civilian", type: 0, class: 0 },
  2518: { name: "Skeleton Soldier", type: 0, class: 0 },
  2519: { name: "Amphorae", type: 0, class: 0 },
  2520: { name: "Construction Crane", type: 0, class: 0 },
  2521: { name: "Mole Top", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  2522: { name: "Mole Bottom", type: 0, class: 3, footprint: { w: 3, h: 2 } },
  2523: { name: "Benches", type: 0, class: 0 }, // Wooden
  2524: { name: "Benches", type: 0, class: 0 }, // Stone
  2525: { name: "Bucephalus", type: 5, class: 2 },
  2526: { name: "Bucephalus (Dead)", type: 0, class: 0 },
  2527: { name: "Scaffolding", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2528: { name: "Fountain Antiquity", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2529: { name: "Cypress Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Decorative
  2530: { name: "Theatre", type: 2, class: 1, footprint: { w: 5, h: 5 } },
  2531: { name: "Statue Alexander", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2532: { name: "Statue Hephaistion", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2533: { name: "Statue Greek Hero", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2534: { name: "Mediterranean Stall", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2535: { name: "Mesopotamian Stall", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2536: { name: "Water Lily", type: 0, class: 0 },
  2537: { name: "Peacock", type: 5, class: 2 },
  2538: { name: "Peacock (Dead)", type: 0, class: 0 },
  2539: { name: "Placeholder", type: 0, class: 0 },
  2540: { name: "Placeholder", type: 0, class: 0 },
  2541: { name: "Placeholder", type: 0, class: 0 },
  2542: { name: "Placeholder", type: 0, class: 0 },
  2543: { name: "Placeholder", type: 0, class: 0 },
  2544: { name: "Placeholder", type: 0, class: 0 },
  2545: { name: "Placeholder", type: 0, class: 0 },
  2546: { name: "Placeholder", type: 0, class: 0 },
  2547: { name: "Placeholder", type: 0, class: 0 },
  2548: { name: "Placeholder", type: 0, class: 0 },
  2549: { name: "Placeholder", type: 0, class: 0 },
  2550: { name: "Champi Scout", type: 5, class: 2 },
  2551: { name: "Invisible object B", type: 0, class: 0 },
  2552: { name: "Champi Warrior", type: 5, class: 2 },
  2553: { name: "Invisible Object C", type: 0, class: 0 },
  2554: { name: "Elite Champi Warrior", type: 5, class: 2 },
  2555: { name: "Invisible Object D", type: 0, class: 0 },
  2556: { name: "Settlement", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Dark Age
  2557: { name: "Missionary with Relic", type: 5, class: 2 },
  2558: { name: "Settlement", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Feudal Age
  2559: { name: "Longhouse A", type: 2, class: 3, footprint: { w: 3, h: 2 } },
  2560: { name: "Settlement", type: 2, class: 3, footprint: { w: 3, h: 3 } }, // Castle Age
  2561: { name: "Longhouse B", type: 2, class: 3, footprint: { w: 2, h: 3 } },
  2562: { name: "Guecha Warrior", type: 5, class: 2 },
  2563: { name: "Invisible Object E", type: 0, class: 0 },
  2564: { name: "Elite Guecha Warrior", type: 5, class: 2 },
  2565: { name: "Guecha Warrior (Dead)", type: 0, class: 0 },
  2566: { name: "Kona", type: 5, class: 2 },
  2567: { name: "Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Oak Green
  2568: { name: "Elite Kona", type: 5, class: 2 },
  2569: { name: "Bolas Rider", type: 5, class: 2 },
  2570: { name: "Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Monkey Puzzle
  2571: { name: "Elite Bolas Rider", type: 5, class: 2 },
  2572: { name: "Projectile Bolas", type: 0, class: 0 },
  2573: { name: "Projectile EliteBolas", type: 0, class: 0 },
  2574: { name: "Projectile Bolas", type: 0, class: 0 }, // Charge
  2575: { name: "Projectile EliteBolas", type: 0, class: 0 }, // Charge
  2576: { name: "Torch C", type: 0, class: 0 },
  2577: { name: "Flotsam", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2578: { name: "Raven", type: 5, class: 2 },
  2579: { name: "Blackwood Archer", type: 5, class: 2 },
  2580: { name: "Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Brazilwood
  2581: { name: "Elite Blackwood Archer", type: 5, class: 2 },
  2582: { name: "Ibirapema Warrior", type: 5, class: 2 },
  2583: { name: "Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } }, // Wax Palm
  2584: { name: "Elite Ibirapema Warrior", type: 5, class: 2 },
  2585: { name: "Howler Monkey", type: 2, class: 1, footprint: { w: 2, h: 2 } },
  2586: { name: "Temple Guard", type: 5, class: 2 },
  2587: { name: "Elite Temple Guard", type: 5, class: 2 },
  2588: { name: "Champi Runner", type: 5, class: 2 },
  2589: { name: "Tapir", type: 5, class: 2 },
  2590: { name: "Capybara", type: 5, class: 2 },
  2591: { name: "Guanaco", type: 5, class: 2 },
  2592: { name: "Snake", type: 5, class: 2 },
  2593: { name: "Condor", type: 5, class: 2 },
  2594: { name: "Caiman", type: 5, class: 2 },
  2595: { name: "Black Panther", type: 5, class: 2 },
  2596: { name: "Flamingo", type: 5, class: 2 },
  2597: { name: "Rhea", type: 5, class: 2 },
  2598: { name: "Small Waterfall", type: 0, class: 0 },
  2599: { name: "Papaya Tree", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2600: { name: "Wooden Fort", type: 2, class: 3, footprint: { w: 4, h: 4 } },
  2601: { name: "Flag Q", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2602: { name: "Flag R", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2603: { name: "Flag S", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2604: { name: "Flag T", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2605: { name: "Flag U", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2606: { name: "Burned Building C", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2607: { name: "Gunpowder Keg", type: 5, class: 2 },
  2608: { name: "Projectile Blackwood Archer", type: 0, class: 0 },
  2609: { name: "Projectile Elite Blackwood Archer", type: 0, class: 0 },
  2610: { name: "Trail Poison", type: 0, class: 0 },
  2611: { name: "Andean Ruins", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2612: { name: "War Dog", type: 5, class: 2 },
  2613: { name: "Elite War Dog", type: 5, class: 2 },
  2614: { name: "Alpaca", type: 5, class: 2 },
  2615: { name: "Wild Alpaca", type: 5, class: 2 },
  2616: { name: "Invisible Spawner A", type: 0, class: 0 },
  2617: { name: "Invisible Spawner B", type: 0, class: 0 },
  2618: { name: "Invisible Spawner C", type: 0, class: 0 },
  2619: { name: "Invisible Spawner D", type: 0, class: 0 },
  2620: { name: "Invisible Spawner E", type: 0, class: 0 },
  2621: { name: "Invisible Spawner F", type: 0, class: 0 },
  2622: { name: "Trail Rope", type: 0, class: 0 },
  2623: { name: "Projectile Harald", type: 0, class: 0 },
  2624: { name: "FIRESHIP_EXP", type: 0, class: 0 },
  2625: { name: "Whale", type: 0, class: 0 },
  2626: { name: "Hulk", type: 5, class: 2 },
  2627: { name: "War Hulk", type: 5, class: 2 },
  2628: { name: "Carrack", type: 5, class: 2 },
  2629: { name: "Projectile Fire Ship", type: 0, class: 0 }, // Charge
  2630: { name: "Whaling Ship", type: 5, class: 2 },
  2631: { name: "Projectile DOCK", type: 0, class: 0 },
  2632: { name: "Projectile DOCK", type: 0, class: 0 }, // Fire
  2633: { name: "Catapult Galleon", type: 5, class: 2 },
  2634: { name: "Placeholder", type: 0, class: 0 },
  2635: { name: "Treasure Chest", type: 5, class: 2 },
  2636: { name: "Projectile Hook", type: 0, class: 0 },
  2637: { name: "Lautaro", type: 5, class: 2 },
  2638: { name: "Galvarino", type: 5, class: 2 },
  2639: { name: "Guacolda", type: 5, class: 2 },
  2640: { name: "Pacanchique", type: 5, class: 2 },
  2641: { name: "Arariboia", type: 5, class: 2 },
  2642: { name: "Arariboia", type: 5, class: 2 },
  2643: { name: "Cunhambebe", type: 5, class: 2 },
  2644: { name: "Scaffolding", type: 0, class: 0 }, // Walkable
  2645: { name: "Invisible Spawner G", type: 0, class: 0 },
  2646: { name: "Invisible Spawner H", type: 0, class: 0 },
  2647: { name: "Invisible Spawner I", type: 0, class: 0 },
  2648: { name: "Invisible Spawner J", type: 0, class: 0 },
  2649: { name: "Placeholder", type: 0, class: 0 },
  2650: { name: "Pineapple Bush", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2651: { name: "Cliff 01", type: 2, class: 6, footprint: { w: 3, h: 3 } }, // Terrace
  2652: { name: "Cliff 02", type: 2, class: 6, footprint: { w: 1, h: 3 } }, // Terrace
  2653: { name: "Cliff 03", type: 2, class: 6, footprint: { w: 3, h: 1 } }, // Terrace
  2654: { name: "Cliff 04", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Terrace
  2655: { name: "Cliff 05", type: 2, class: 6, footprint: { w: 2, h: 3 } }, // Terrace
  2656: { name: "Cliff 06", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Terrace
  2657: { name: "Cliff 07", type: 2, class: 6, footprint: { w: 3, h: 2 } }, // Terrace
  2658: { name: "Cliff 08", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Terrace
  2659: { name: "Cliff 09", type: 2, class: 6, footprint: { w: 2, h: 2 } }, // Terrace
  2660: { name: "Placeholder", type: 0, class: 0 },
  2661: { name: "Placeholder", type: 0, class: 0 },
  2662: { name: "Placeholder", type: 0, class: 0 },
  2663: { name: "Placeholder", type: 0, class: 0 },
  2664: { name: "Placeholder", type: 0, class: 0 },
  2665: { name: "Placeholder", type: 0, class: 0 },
  2666: { name: "Placeholder", type: 0, class: 0 },
  2667: { name: "Placeholder", type: 0, class: 0 },
  2668: { name: "Placeholder", type: 0, class: 0 },
  2669: { name: "Placeholder", type: 0, class: 0 },
  2670: { name: "Placeholder", type: 0, class: 0 },
  2671: { name: "Placeholder", type: 0, class: 0 },
  2672: { name: "Placeholder", type: 0, class: 0 },
  2673: { name: "Placeholder", type: 0, class: 0 },
  2674: { name: "Placeholder", type: 0, class: 0 },
  2675: { name: "Placeholder", type: 0, class: 0 },
  2676: { name: "Placeholder", type: 0, class: 0 },
  2677: { name: "Placeholder", type: 0, class: 0 },
  2678: { name: "Fort Wall", type: 2, class: 4, footprint: { w: 1, h: 1 } },
  2679: { name: "Fort Gate", type: 2, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Closed
  2680: { name: "Fort Gate", type: 0, class: 5, footprint: { w: 2, h: 1 } }, // Ascending Open
  2681: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Ascending Endpieces
  2682: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 4, h: 1 } }, // Ascending Foundation
  2683: { name: "Fort Gate", type: 2, class: 5, footprint: { w: 1, h: 2 } }, // Descending Closed
  2684: { name: "Fort Gate", type: 0, class: 5, footprint: { w: 1, h: 2 } }, // Descending Open
  2685: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Descending Endpieces
  2686: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 4 } }, // Descending Foundation
  2687: { name: "Fort Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Closed
  2688: { name: "Fort Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Horizontal Open
  2689: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Endpieces
  2690: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Horizontal Foundation
  2691: { name: "Fort Gate", type: 2, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Closed
  2692: { name: "Fort Gate", type: 0, class: 5, footprint: { w: 2, h: 2 } }, // Vertical Open
  2693: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Endpieces
  2694: { name: "Fort Gate", type: 2, class: 4, footprint: { w: 1, h: 1 } }, // Vertical Foundation
  2695: { name: "Placeholder", type: 0, class: 0 },
  2696: { name: "Placeholder", type: 0, class: 0 },
  2697: { name: "Placeholder", type: 0, class: 0 },
  2698: { name: "Placeholder", type: 0, class: 0 },
  2699: { name: "Placeholder", type: 0, class: 0 },
  2700: { name: "Mounted Crossbowman", type: 5, class: 2 },
  2701: { name: "Heavy Mounted Crossbowman", type: 5, class: 2 },
  2702: { name: "Projectile Hearth Troop", type: 0, class: 0 },
  2703: { name: "Varangian Guard", type: 5, class: 2 },
  2704: { name: "Elite Varangian Guard", type: 5, class: 2 },
  2705: { name: "Hearth Troop", type: 5, class: 2 },
  2706: { name: "Elite Hearth Troop", type: 5, class: 2 },
  2707: { name: "Projectile Elite Hearth Troop", type: 0, class: 0 },
  2708: { name: "Jarl", type: 5, class: 2 },
  2709: { name: "Elite Jarl", type: 5, class: 2 },
  2710: { name: "Projectile Gothikon", type: 0, class: 0 },
  2711: { name: "Jomsviking", type: 5, class: 2 },
  2712: { name: "Elite Jomsviking", type: 5, class: 2 },
  2713: { name: "Projectile Jomsviking", type: 0, class: 0 },
  2714: { name: "Villager Repairer (Male)", type: 5, class: 2 },
  2715: { name: "Villager Repairer (Female)", type: 5, class: 2 },
  2716: { name: "Castle/TC Infantry Discount Removal", type: 5, class: 2, footprint: { w: 4, h: 4 } },
  2717: { name: "Castle/TC Infantry Discount", type: 0, class: 2, footprint: { w: 1, h: 1 } },
  2718: { name: "Empty Castle Annex", type: 0, class: 2 },
  2719: { name: "Projectile Jarl", type: 0, class: 0 },
  2720: { name: "Projectile EliteJarl", type: 0, class: 0 },
  2721: { name: "Harald", type: 5, class: 2 },
  2722: { name: "Ulf Ospaksson", type: 5, class: 2 },
  2723: { name: "Halldor Snorrason", type: 5, class: 2 },
  2724: { name: "Tostig Godwinson", type: 5, class: 2 },
  2725: { name: "Finn Arnason", type: 5, class: 2 },
  2726: { name: "Kalf Arnason", type: 5, class: 2 },
  2727: { name: "Einar Paunch-Shaker", type: 5, class: 2 },
  2728: { name: "Dreki", type: 5, class: 2 },
  2729: { name: "Legendary Item", type: 5, class: 2 },
  2730: { name: "Wheeled Ship", type: 5, class: 2 },
  2731: { name: "Tree (Spruce)", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2732: { name: "Tree (Spruce Snow)", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2733: { name: "Bush D", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2734: { name: "Rock (Snow)", type: 2, class: 1, footprint: { w: 1, h: 1 } },
  2735: { name: "Seal", type: 5, class: 2 },
  2736: { name: "Lynx", type: 5, class: 2 },
  2737: { name: "Elk", type: 5, class: 2 },
  2738: { name: "Runestones", type: 0, class: 0 },
  2739: { name: "Pheasant", type: 5, class: 2 },
  2740: { name: "Driftwood (Ground)", type: 0, class: 0 },
  2741: { name: "Driftwood (Water)", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2742: { name: "Flaming Bird", type: 5, class: 2 },
  2743: { name: "Plant (Heather)", type: 0, class: 0 },
  2744: { name: "Burned Building D", type: 2, class: 1, footprint: { w: 3, h: 3 } },
  2745: { name: "Army Tent F", type: 2, class: 3, footprint: { w: 1, h: 1 } },
  2746: { name: "Shipwreck C", type: 0, class: 0 },
  2747: { name: "Norse Column", type: 3, class: 3, footprint: { w: 1, h: 1 } },
  2748: { name: "Wooden Road", type: 0, class: 0 },
  2749: { name: "Norse Banner", type: 3, class: 3, footprint: { w: 1, h: 1 } },
};

export const getEntity = (id?: number): Entity | undefined => {
  if (id === undefined) return undefined;
  return ENTITIES[id];
};

export const getEntityFootprint = (id?: number): { w: number; h: number } | undefined => {
  if (id === undefined) return undefined;
  return ENTITIES[id]?.footprint;
};

export const isStaticObstacle = (id?: number): boolean => {
  if (id === undefined) return false;
  const obs = ENTITIES[id];
  return Boolean(obs && obs.type > 0 && obs.type !== 5);
};

export const getEntityName = (id?: number): string | undefined =>
  id !== undefined ? ENTITIES[id]?.name : undefined;

export const getUnitName = (id?: number): string =>
  (id !== undefined ? ENTITIES[id]?.name : undefined) ?? "Unknown Unit";

export const getBuildingName = (id?: number): string =>
  (id !== undefined ? ENTITIES[id]?.name : undefined) ?? "Unknown Building";

export type BuildingFootprint = {
  w: number;
  h: number;
};

export const getBuildingFootprint = (
  buildingTypeId?: number
): BuildingFootprint => {
  if (!buildingTypeId) return { w: 1, h: 1 };
  return ENTITIES[buildingTypeId]?.footprint ?? { w: 1, h: 1 };
};

/**
 * Type 2 entities are static obstacles.
 * Classes 3 (Standard building), 4 (Wall), and 5 (Gate) are considered buildings.
 * Natural obstacles (class 1: trees/rocks/mines) and terrain (class 6: cliffs) are excluded.
 */
export const isBuildingId = (id?: number): boolean => {
  if (id === undefined) return false;
  const entity = ENTITIES[id];
  if (!entity) return false;
  if (entity.name.toLowerCase().includes("reveal")) return false;
  if (isFarmId(id)) return true;
  return entity.class === 3 || entity.class === 4 || entity.class === 5;
};

export const isFarmId = (id?: number): boolean => {
  if (id === undefined) return false;
  return [50, 199, 1187, 1889, 1893, 1897].includes(id);
};

export const isEconomic = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes("villager") ||
    lower.includes("trade cart") ||
    lower.includes("trade cog") ||
    lower.includes("fishing ship") ||
    lower.includes("transport ship") ||
    lower.includes("mule cart")
  );
};
