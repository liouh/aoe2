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
  42: { w: 1, h: 1 }, // Trebuchet
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
  110: { w: 4, h: 4 }, // Trade Workshop
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
  179: { w: 4, h: 4 }, // Trade Workshop
  182: { w: 5, h: 5 }, // WNDR
  183: { w: 2, h: 2 }, // TMISB
  190: { w: 1, h: 1 }, // Fire Tower
  191: { w: 2, h: 2 }, // House
  192: { w: 2, h: 2 }, // House
  199: { w: 1, h: 1 }, // Fish Trap
  208: { w: 1, h: 1 }, // TWAL
  209: { w: 4, h: 4 }, // University, Castle Age
  210: { w: 4, h: 4 }, // University, Imperial Age
  231: { w: 1, h: 1 }, // Aqueduct
  234: { w: 1, h: 1 }, // Guard Tower
  235: { w: 1, h: 1 }, // Keep
  236: { w: 1, h: 1 }, // Bombard Tower
  241: { w: 1, h: 1 }, // Cracks
  251: { w: 5, h: 5 }, // Amphitheatre
  263: { w: 8, h: 8 }, // Colosseum
  276: { w: 5, h: 5 }, // Wonder
  // 278: { w: 1, h: 1 }, // Fish Trap (Dead)
  308: { w: 1, h: 1 }, // Indestructible Outpost
  331: { w: 1, h: 1 }, // Trebuchet
  345: { w: 3, h: 3 }, // Ruins
  // 357: { w: 3, h: 3 }, // Farm (Dead)
  370: { w: 1, h: 1 }, // City Wall
  444: { w: 1, h: 1 }, // Town Center, Packed
  445: { w: 4, h: 4 }, // Poenari Castle
  446: { w: 4, h: 4 }, // Port
  463: { w: 2, h: 2 }, // House, Feudal Age
  464: { w: 2, h: 2 }, // House, Castle Age
  465: { w: 2, h: 2 }, // House, Imperial Age
  479: { w: 1, h: 1 }, // Packed Mangonel
  // 481: { w: 2, h: 2 }, // Town Center, Annex 1, Castle Age
  // 482: { w: 3, h: 3 }, // Town Center, Annex 2, Castle Age
  // 483: { w: 2, h: 2 }, // Town Center, Annex 3, Castle Age
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
  599: { w: 8, h: 8 }, // Cathedral
  605: { w: 2, h: 3 }, // Bridge A--Top
  606: { w: 2, h: 3 }, // Bridge A--Middle
  607: { w: 2, h: 3 }, // Bridge A--Bottom
  608: { w: 3, h: 2 }, // Bridge B--Top
  609: { w: 3, h: 2 }, // Bridge B--Middle
  610: { w: 3, h: 2 }, // Bridge B--Bottom
  // 611: { w: 2, h: 2 }, // Town Center, Annex 1, Imperial Age
  // 612: { w: 3, h: 3 }, // Town Center, Annex 2, Castle Age
  // 613: { w: 2, h: 2 }, // Town Center, Annex 3, Imperial Age
  // 614: { w: 2, h: 2 }, // Town Center, Annex 1, Feudal Age
  // 615: { w: 3, h: 3 }, // Town Center, Annex 2, Feudal Age
  // 616: { w: 2, h: 2 }, // Town Center, Annex 3, Feudal Age
  617: { w: 4, h: 4 }, // Town Center
  // 618: { w: 2, h: 2 }, // Town Center, Annex 1, Dark Age
  // 619: { w: 3, h: 3 }, // Town Center, Annex 2, Dark Age
  // 620: { w: 2, h: 2 }, // Town Center, Annex 3, Dark Age
  621: { w: 4, h: 4 }, // Town Center, Foundation
  624: { w: 2, h: 2 }, // Pavilion A
  625: { w: 1, h: 1 }, // Pavilion C
  626: { w: 1, h: 1 }, // Pavilion B
  635: { w: 3, h: 3 }, // Burned Building
  637: { w: 8, h: 8 }, // Temple of Heaven
  655: { w: 5, h: 5 }, // Mosque
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
  682: { w: 1, h: 1 }, // Bad Neighbor
  683: { w: 1, h: 1 }, // God's Own Sling
  684: { w: 1, h: 1 }, // The Accursed Tower
  685: { w: 1, h: 1 }, // The Tower of Flies
  689: { w: 5, h: 5 }, // Pyramid
  690: { w: 5, h: 5 }, // Dome of the Rock
  696: { w: 8, h: 8 }, // Great Pyramid
  712: { w: 3, h: 3 }, // Yurt A
  713: { w: 2, h: 2 }, // Yurt B
  714: { w: 2, h: 2 }, // Yurt C
  715: { w: 2, h: 2 }, // Yurt D
  716: { w: 2, h: 2 }, // Yurt E
  717: { w: 2, h: 2 }, // Yurt F
  718: { w: 2, h: 2 }, // Yurt G
  719: { w: 3, h: 3 }, // Yurt H
  729: { w: 1, h: 1 }, // God's Own Sling
  730: { w: 1, h: 1 }, // Bad Neighbor
  738: { w: 2, h: 3 }, // Bridge A--Cracked
  739: { w: 2, h: 3 }, // Bridge A--Broken Top
  740: { w: 2, h: 3 }, // Bridge A--Broken Bottom
  741: { w: 3, h: 2 }, // Bridge B--Cracked
  742: { w: 3, h: 2 }, // Bridge B--Broken Top
  743: { w: 3, h: 2 }, // Bridge B--Broken Bottom
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
  826: { w: 5, h: 5 }, // Monument
  872: { w: 5, h: 5 }, // Quimper Cathedral
  // 888 Llama building omitted: DAT clearance is 0x0; footprint unverified.
  // 889: { w: 1, h: 1 }, // Disable llama building
  // 890: { w: 1, h: 1 }, // Empty llama annex
  899: { w: 5, h: 5 }, // Arch of Constantine
  904: { w: 1, h: 1 }, // Wooden Bridge A--Top
  905: { w: 1, h: 1 }, // Wooden Bridge A--Middle
  906: { w: 1, h: 1 }, // Wooden Bridge A--Bottom
  907: { w: 1, h: 1 }, // Wooden Bridge B--Top
  908: { w: 1, h: 1 }, // Wooden Bridge B--Middle
  909: { w: 1, h: 1 }, // Wooden Bridge B--Bottom
  911: { w: 2, h: 2 }, // BGAA
  912: { w: 2, h: 2 }, // BGAB
  913: { w: 2, h: 2 }, // BGAC
  1021: { w: 5, h: 5 }, // Feitoria
  1062: { w: 1, h: 1 }, // Fence
  1081: { w: 2, h: 2 }, // Storage
  1082: { w: 2, h: 2 }, // Hut A
  1083: { w: 2, h: 2 }, // Hut B
  1084: { w: 2, h: 2 }, // Hut C
  1085: { w: 2, h: 2 }, // Hut D
  1086: { w: 2, h: 2 }, // Hut E
  1087: { w: 2, h: 2 }, // Hut F
  1088: { w: 2, h: 2 }, // Hut G
  1090: { w: 2, h: 2 }, // Barricade A
  1096: { w: 5, h: 5 }, // Palace
  1097: { w: 3, h: 3 }, // Tent A
  1098: { w: 2, h: 2 }, // Tent B
  1099: { w: 2, h: 2 }, // Tent C
  1100: { w: 2, h: 2 }, // Tent D
  1101: { w: 2, h: 2 }, // Tent E
  1102: { w: 1, h: 1 }, // Fortified Tower
  // 1118: { w: 1, h: 1 }, // Inca llama annex
  1187: { w: 3, h: 3 }, // Rice Farm
  //1188: { w: 3, h: 3 }, // Rice Farm (Dead)
  1189: { w: 3, h: 3 }, // Harbor
  1192: { w: 1, h: 1 }, // Gate
  1193: { w: 3, h: 3 }, // FARMDROP
  1194: { w: 3, h: 3 }, // FARMSTACK
  1195: { w: 3, h: 3 }, // RFARMDROP
  1196: { w: 2, h: 2 }, // Army Tent A
  1197: { w: 2, h: 2 }, // Army Tent B
  1198: { w: 1, h: 1 }, // Army Tent C
  1199: { w: 1, h: 1 }, // Army Tent D
  1200: { w: 1, h: 1 }, // Army Tent E
  1204: { w: 2, h: 3 }, // Bridge C--Top
  1205: { w: 2, h: 3 }, // Bridge C--Middle
  1206: { w: 2, h: 3 }, // Bridge C--Bottom
  1207: { w: 3, h: 2 }, // Bridge D--Top
  1208: { w: 3, h: 2 }, // Bridge D--Middle
  1209: { w: 3, h: 2 }, // Bridge D--Bottom
  1210: { w: 2, h: 3 }, // Bridge C--Cracked
  1211: { w: 2, h: 3 }, // Bridge C--Broken Top
  1212: { w: 2, h: 3 }, // Bridge C--Broken Bottom
  1213: { w: 3, h: 2 }, // Bridge D--Cracked
  1214: { w: 3, h: 2 }, // Bridge D--Broken Top
  1215: { w: 3, h: 2 }, // Bridge D--Broken Bottom
  1216: { w: 8, h: 8 }, // Sanchi Stupa
  1217: { w: 5, h: 5 }, // Gol Gumbaz
  1218: { w: 2, h: 2 }, // Barricade B
  1219: { w: 2, h: 2 }, // Barricade C
  1220: { w: 2, h: 2 }, // Barricade D
  1251: { w: 3, h: 3 }, // Krepost
  1264: { w: 3, h: 3 }, // Shrine
  1309: { w: 1, h: 1 }, // Wooden Bridge A--Top
  1310: { w: 1, h: 1 }, // Wooden Bridge A--Middle
  1311: { w: 1, h: 1 }, // Wooden Bridge A--Bottom
  1312: { w: 1, h: 1 }, // Wooden Bridge B--Top
  1313: { w: 1, h: 1 }, // Wooden Bridge B--Middle
  1314: { w: 1, h: 1 }, // Wooden Bridge B--Bottom
  1316: { w: 2, h: 2 }, // BGAA
  1317: { w: 2, h: 2 }, // BGAB
  1318: { w: 2, h: 2 }, // BGAC
  1367: { w: 5, h: 5 }, // Sankore Madrasah
  1368: { w: 5, h: 5 }, // Tower of London
  1369: { w: 5, h: 5 }, // Dormition Cathedral
  1378: { w: 5, h: 5 }, // Rock Church
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
  1396: { w: 2, h: 1 }, // Chain
  1397: { w: 1, h: 2 }, // Chain
  1398: { w: 2, h: 2 }, // Chain
  1399: { w: 2, h: 2 }, // Chain
  1550: { w: 2, h: 3 }, // Bridge E--Top
  1551: { w: 2, h: 3 }, // Bridge E--Middle
  1552: { w: 2, h: 3 }, // Bridge E--Bottom
  1553: { w: 3, h: 2 }, // Bridge F--Top
  1554: { w: 3, h: 2 }, // Bridge F--Middle
  1555: { w: 3, h: 2 }, // Bridge F--Bottom
  1556: { w: 2, h: 3 }, // Bridge E--Cracked
  1557: { w: 2, h: 3 }, // Bridge E--Broken Top
  1558: { w: 2, h: 3 }, // Bridge E--Broken Bottom
  1559: { w: 3, h: 2 }, // Bridge F--Cracked
  1560: { w: 3, h: 2 }, // Bridge F--Broken Top
  1561: { w: 3, h: 2 }, // Bridge F--Broken Bottom
  1579: { w: 2, h: 1 }, // City Gate, Ascending Closed
  1580: { w: 2, h: 1 }, // City Gate, Ascending Open
  1581: { w: 1, h: 1 }, // City Gate, Ascending Endpieces
  1582: { w: 4, h: 1 }, // City Gate, Ascending Foundation
  1583: { w: 1, h: 2 }, // City Gate, Descending Closed
  1584: { w: 1, h: 2 }, // City Gate, Descending Open
  1585: { w: 1, h: 1 }, // City Gate, Descending Endpieces
  1586: { w: 1, h: 4 }, // City Gate, Descending Foundation
  1587: { w: 2, h: 2 }, // City Gate, Horizontal Closed
  1588: { w: 2, h: 2 }, // City Gate, Horizontal Open
  1589: { w: 1, h: 1 }, // City Gate, Horizontal Endpieces
  1590: { w: 1, h: 1 }, // City Gate, Horizontal Foundation
  1591: { w: 2, h: 2 }, // City Gate, Vertical Closed
  1592: { w: 2, h: 2 }, // City Gate, Vertical Open
  1593: { w: 1, h: 1 }, // City Gate, Vertical Endpieces
  1594: { w: 1, h: 1 }, // City Gate, Vertical Foundation
  1622: { w: 5, h: 5 }, // Aachen Cathedral
  1639: { w: 1, h: 1 }, // Monument resources enabler
  // 1640: { w: 1, h: 1 }, // Villager building
  // 1641: { w: 1, h: 1 }, // Villager building
  // 1642: { w: 1, h: 1 }, // Villager annex
  // 1643: { w: 1, h: 1 }, // Villager building2
  // 1644: { w: 1, h: 1 }, // Villager annex
  // 1645: { w: 1, h: 1 }, // Villager building2
  1646: { w: 4, h: 4 }, // Market
  1647: { w: 4, h: 4 }, // Trade Workshop
  // 1649: { w: 1, h: 1 }, // Trophy None
  // 1650: { w: 1, h: 1 }, // Trophy Bronze
  // 1651: { w: 1, h: 1 }, // Trophy Silver
  // 1652: { w: 1, h: 1 }, // Trophy Gold
  // 1653: { w: 1, h: 1 }, // Trophy Platinum
  1654: { w: 1, h: 1 }, // resources
  1665: { w: 2, h: 2 }, // Donjon
  1690: { w: 1, h: 1 }, // Warwolf Trebuchet
  1691: { w: 1, h: 1 }, // Warwolf Trebuchet
  1693: { w: 4, h: 4 }, // Sheep building1
  // 1694: { w: 1, h: 1 }, // Sheep annex1
  1695: { w: 4, h: 4 }, // Sheep building2
  // 1696: { w: 1, h: 1 }, // Sheep annex2
  1700: { w: 4, h: 4 }, // Sheep building3
  1711: { w: 3, h: 3 }, // Folwark, Feudal Age
  1712: { w: 3, h: 3 }, // Pagan Shrine
  1720: { w: 3, h: 3 }, // Folwark, Castle Age
  1734: { w: 3, h: 3 }, // Folwark, Dark Age
  1754: { w: 4, h: 4 }, // Caravanserai
  1758: { w: 1, h: 1 }, // Gaia transition building
  1773: { w: 5, h: 5 }, // Minaret of Jam
  1806: { w: 3, h: 3 }, // Fortified Church
  1807: { w: 1, h: 1 }, // Svan Tower
  1808: { w: 1, h: 1 }, // Mule Cart
  1832: { w: 2, h: 2 }, // Yurt I
  1833: { w: 2, h: 2 }, // Yurt J
  1834: { w: 2, h: 2 }, // Yurt K
  1835: { w: 3, h: 3 }, // Yurt L
  1836: { w: 3, h: 3 }, // Chapel
  1839: { w: 1, h: 1 }, // Bridge Piece--End A
  1840: { w: 1, h: 2 }, // Bridge Piece--End B
  1841: { w: 2, h: 1 }, // Bridge Piece--End C
  1842: { w: 1, h: 1 }, // Bridge Piece--Middle
  1843: { w: 1, h: 1 }, // Bridge Piece--Broken A
  1844: { w: 1, h: 2 }, // Bridge Piece--Broken B
  1845: { w: 2, h: 1 }, // Bridge Piece--Broken C
  1846: { w: 2, h: 2 }, // Bridge Piece--Cracked
  1847: { w: 1, h: 1 }, // Bridge Piece--Rails
  1870: { w: 4, h: 4 }, // Chief's Yurt
  1885: { w: 1, h: 1 }, // Broken Fence A
  1886: { w: 1, h: 1 }, // Broken Fence B
  1887: { w: 1, h: 1 }, // GREN_DELAY_D
  1888: { w: 1, h: 1 }, // Pasture Post
  1889: { w: 4, h: 4 }, // Pasture
  // 1890: { w: 1, h: 1 }, // Pasture Annex
  1893: { w: 4, h: 4 }, // Pasture, Mangrove
  // 1894: { w: 4, h: 4 }, // Dead Pasture
  1897: { w: 4, h: 4 }, // Pasture, Land
  // 1898: { w: 4, h: 4 }, // Dead Pasture
  1992: { w: 1, h: 1 }, // Bridge Piece CD--End A
  1993: { w: 1, h: 2 }, // Bridge Piece CD--End B
  1994: { w: 2, h: 1 }, // Bridge Piece CD--End C
  1995: { w: 1, h: 1 }, // Bridge Piece CD--Middle A
  1996: { w: 1, h: 2 }, // Bridge Piece CD--Middle B
  1997: { w: 2, h: 1 }, // Bridge Piece CD--Middle C
  1998: { w: 1, h: 1 }, // Bridge Piece CD--Broken A
  1999: { w: 1, h: 2 }, // Bridge Piece CD--Broken B
  2000: { w: 2, h: 1 }, // Bridge Piece CD--Broken C
  2001: { w: 2, h: 2 }, // Bridge Piece CD--Cracked
  2002: { w: 1, h: 1 }, // Bridge Piece CD--Rails A
  2003: { w: 1, h: 1 }, // Bridge Piece CD--Rails B
  2004: { w: 1, h: 1 }, // Bridge Piece CD--Rails C
  2033: { w: 2, h: 2 }, // Yurt M
  2037: { w: 1, h: 1 }, // Wooden Bridge Piece--End A
  2039: { w: 1, h: 2 }, // Wooden Bridge Piece--End B
  2041: { w: 2, h: 1 }, // Wooden Bridge Piece--End C
  2043: { w: 1, h: 1 }, // Wooden Bridge Piece--Middle
  2060: { w: 3, h: 3 }, // Hall of Heroes
  2068: { w: 1, h: 1 }, // Kongming Lantern
  // 2078: { w: 1, h: 1 }, // Pasture Annex Fences
  // 2079: { w: 1, h: 1 }, // Pasture Annex AB
  // 2080: { w: 1, h: 1 }, // Pasture Annex CD
  2081: { w: 1, h: 1 }, // Wooden Bridge Piece--Rails
  2117: { w: 3, h: 3 }, // Shipyard3
  2118: { w: 3, h: 3 }, // Shipyard4
  2119: { w: 3, h: 3 }, // Shipyard
  2120: { w: 3, h: 3 }, // Dock
  2121: { w: 3, h: 3 }, // Dock
  2122: { w: 3, h: 3 }, // Dock
  2141: { w: 3, h: 3 }, // Port 4
  2142: { w: 3, h: 3 }, // Port 3
  2143: { w: 3, h: 3 }, // Port 2
  2144: { w: 3, h: 3 }, // Dock
  2145: { w: 3, h: 3 }, // Dock
  2146: { w: 3, h: 3 }, // Dock
  2172: { w: 3, h: 3 }, // Port
  2173: { w: 3, h: 3 }, // Dock
  2176: { w: 1, h: 1 }, // Greek Army Tent A
  2230: { w: 1, h: 1 }, // First Government cost change
  2231: { w: 1, h: 1 }, // Second Government cost change
  2232: { w: 1, h: 1 }, // Third Government cost change
  2233: { w: 1, h: 1 }, // Fourth Government cost change
  2236: { w: 1, h: 1 }, // Lembos spawner
  2237: { w: 1, h: 1 }, // Lembos spawner part 2
  2262: { w: 2, h: 2 }, // Greek Commander Tent A
  2275: { w: 4, h: 4 }, // Economic Satrapy
  2276: { w: 4, h: 4 }, // Defensive Satrapy
  2277: { w: 4, h: 4 }, // Military Satrapy
  2281: { w: 2, h: 2 }, // Sapper Tunnel
  2300: { w: 4, h: 4 }, // Castle
  2343: { w: 1, h: 1 }, // Military Satrapy Flag
  2344: { w: 1, h: 1 }, // Defensive Satrapy Flag
  2345: { w: 1, h: 1 }, // Economic Satrapy Flag
  2348: { w: 3, h: 3 }, // Oracle Temple
  2405: { w: 2, h: 2 }, // Greek Commander Tent Dropsite
  2412: { w: 1, h: 1 }, // Full Supply Cart no garrison
  2413: { w: 1, h: 1 }, // Empty Supply Cart no garrison
  2414: { w: 3, h: 3 }, // Macedonian Command Post
  2415: { w: 1, h: 1 }, // Fortified Outpost
  // 2416: { w: 1, h: 1 }, // Second Empty TC annex
  2417: { w: 1, h: 1 }, // Fortified Outpost
  2418: { w: 4, h: 4 }, // Castle
  2421: { w: 3, h: 1 }, // Mole under construction
  2422: { w: 3, h: 1 }, // Mole constructed
  // 2425: { w: 1, h: 1 }, // Mole annex 1
  // 2426: { w: 1, h: 1 }, // Mole annex 2
  // 2427: { w: 1, h: 1 }, // Mole annex 3
  // 2428: { w: 1, h: 1 }, // Mole annex 4
  2433: { w: 1, h: 1 }, // Thin blocker spawner A
  2434: { w: 1, h: 1 }, // Thin blocker spawner B
  2437: { w: 3, h: 3 }, // Camp Barracks
  2438: { w: 3, h: 3 }, // Camp Archery Range
  2439: { w: 3, h: 3 }, // Camp Stable
  2440: { w: 4, h: 4 }, // Camp Siege Workshop
  2441: { w: 3, h: 3 }, // Camp Blacksmith
  2442: { w: 1, h: 1 }, // Flagship of Nearchos moveable
  2443: { w: 1, h: 1 }, // WCTWX
  2448: { w: 1, h: 1 }, // Flagship of Nearchos moveable docked
  2521: { w: 3, h: 2 }, // Mole Top
  2522: { w: 3, h: 2 }, // Mole Bottom
  2556: { w: 3, h: 3 }, // Settlement, Dark Age
  2558: { w: 3, h: 3 }, // Settlement, Feudal Age
  2559: { w: 3, h: 2 }, // Longhouse A
  2560: { w: 3, h: 3 }, // Settlement, Castle Age
  2561: { w: 2, h: 3 }, // Longhouse B
  2600: { w: 4, h: 4 }, // Wooden Fort
  // 2616: { w: 1, h: 1 }, // Invisible Spawner A
  // 2617: { w: 1, h: 1 }, // Invisible Spawner B
  // 2618: { w: 1, h: 1 }, // Invisible Spawner C
  // 2619: { w: 1, h: 1 }, // Invisible Spawner D
  // 2620: { w: 1, h: 1 }, // Invisible Spawner E
  // 2621: { w: 1, h: 1 }, // Invisible Spawner F
  // 2645: { w: 1, h: 1 }, // Invisible Spawner G
  // 2646: { w: 1, h: 1 }, // Invisible Spawner H
  // 2647: { w: 1, h: 1 }, // Invisible Spawner I
  // 2648: { w: 1, h: 1 }, // Invisible Spawner J
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
  2716: { w: 4, h: 4 }, // Castle/TC Infantry Discount Removal
  2717: { w: 1, h: 1 }, // Castle/TC Infantry Discount
  // 2718: { w: 1, h: 1 }, // Empty Castle Annex
  2745: { w: 1, h: 1 }, // Army Tent F
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
  return [50, 1187, 1889, 1893, 1897].includes(id);
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
  else if (name.includes("Fish")) icon = "🐟";
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
