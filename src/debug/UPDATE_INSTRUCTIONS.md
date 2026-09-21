# Age of Empires II ID Mappings: Update Instructions

This document explains how to update the internal ID mappings for civilizations, maps, entities/units, technologies, and buildings whenever a new Age of Empires II: Definitive Edition DLC or balance patch is released.

---

## 1. Quick Automated Check

Run the built-in update script to fetch the latest community entity spreadsheet, update `src/debug/de.csv`, and compare against `src/lib/entityNames.ts`:

```bash
node src/debug/update-mappings.js
```

The script will:
1. Download the latest CSV export from the authoritative community spreadsheet.
2. Update the local `src/debug/de.csv` snapshot.
3. Compare all entries against `src/lib/entityNames.ts`.
4. Output any newly added or missing entity IDs along with their names and descriptions.
5. Check `AoE2ScenarioParser` for any new civilization constants.

---

## 2. Primary Upstream Sources

Keep these references handy when investigating new DLCs, expansions, or patch IDs:

| Data Category | Primary Source | URL / Repository |
| :--- | :--- | :--- |
| **Entities / Units / Objects** | Community Object Spreadsheet | [Google Sheets Link](https://docs.google.com/spreadsheets/d/1llyn7FWKEtmss_WE-6hinMItpsV-h-6qsY8xBlkxUzw/edit?gid=193837369#gid=193837369) |
| **Entities & Techs Reference** | AoE2 AI Scripting Encyclopedia | [airef.github.io/tables](https://airef.github.io/tables/tables-index.html) |
| **Scenario Data & Civs** | AoE2ScenarioParser Datasets | [KSneijders/AoE2ScenarioParser (`dev` branch)](https://github.com/KSneijders/AoE2ScenarioParser/tree/dev/AoE2ScenarioParser/datasets) |
| **Replay & Map Enums** | aoc-mgz constants | [happyleavesaoc/aoc-mgz (`const.py`)](https://github.com/happyleavesaoc/aoc-mgz/blob/master/mgz/const.py) |
| **Definitive Edition Reference Data** | Siege Engineers `aocref` datasets | [siegeengineers/aoc-reference-data](https://github.com/siegeengineers/aoc-reference-data) |
| **Terrain Datasets** | AoE2ScenarioParser Terrains | [KSneijders/AoE2ScenarioParser (`terrains.py`)](https://github.com/KSneijders/AoE2ScenarioParser/blob/dev/AoE2ScenarioParser/datasets/terrains.py) |
| **Companion App Data** | AoE2 Companion Data Repo | [denniske/aoe2companion](https://github.com/denniske/aoe2companion) |

---

## 3. Step-by-Step Update Guide

### A. Civilizations (`src/lib/civMappings.ts`)
1. Check `AoE2ScenarioParser/datasets/object_support.py` (`CivilizationOld` enum) or the latest DLC patch notes for newly added civilization names.
2. Append the new civilization ID and name to `CIV_NAMES`:
   ```typescript
   export const CIV_NAMES: Record<number, string> = {
     // ...
     60: "Danes",
     61: "Saxons",
     62: "Varangians",
     // 63: "<NextCiv>",
     65537: "Random",
     65539: "Full Random",
   };
   ```

### B. Maps & Sizes (`src/lib/gameMappings.ts`)
1. For new standard, tournament, or real-world maps, check `mgz/const.py` (`DE_MAP_NAMES`) in `aoc-mgz` or `data/src/helper/maps.ts` in `aoe2companion`.
2. Add the numeric ID and friendly name to `MAP_TYPES`:
   ```typescript
   export const MAP_TYPES: Record<number, string> = {
     // ...
     174: "Wade",
     // 175: "<NewMap>",
   };
   ```
3. If new map dimensions or game sizes are added, update `MAP_SIZES`.

### C. Entities, Units, & Scenery (`src/lib/entityNames.ts`)
1. Run `node src/debug/update-mappings.js` to see all IDs present in the spreadsheet that are missing in `src/lib/entityNames.ts`.
2. Add the new entries into `ENTITY_NAMES` in numerical order:
   ```typescript
   2700: "Mounted Crossbowman",
   2701: "Heavy Mounted Crossbowman",
   2703: "Varangian Guard",
   // ...
   ```
3. Note that projectiles, corpses, and decorative props are also tracked here so replay actions and scenarios can identify every object ID without returning `undefined`.

### D. Technologies (`src/lib/techMappings.ts`)
1. Check `AoE2ScenarioParser/datasets/techs.py` and `airef.github.io/tables/techs.html`.
2. For any new civilization:
   - Add the civilization identifier tech (e.g. `1405: "Danes"`).
   - Add the unique technologies (Castle Age and Imperial Age).
   - Add elite unit upgrade technologies.
3. Add entries to `TECH_NAMES`:
   ```typescript
   1413: "Hamask",
   1414: "Northmen's Fury",
   1415: "Clerical Recruitment",
   1416: "Shield Wall",
   1417: "Vendel Legacy",
   1418: "Gothikon",
   ```

### E. Building Footprints (`src/lib/buildingFootprints.ts`)
1. If new constructible buildings, forts, or unique structures are introduced, determine their tile dimensions (`w` and `h`):
   - Typical houses/tents/annexes: `{ w: 2, h: 2 }`
   - Typical military production / monasteries / camps: `{ w: 3, h: 3 }`
   - Castles, wonders, wooden forts, ports, shipyards, town centers: `{ w: 4, h: 4 }` or `{ w: 5, h: 5 }`
   - Walls: `{ w: 1, h: 1 }`
   - Gates: `{ w: 2, h: 1 }` or `{ w: 1, h: 2 }` depending on orientation
2. Add the building ID to `FOOTPRINTS`:
   ```typescript
   2600: { w: 4, h: 4 }, // Wooden Fort
   2678: { w: 1, h: 1 }, // Fort Wall
   2745: { w: 2, h: 2 }, // Army Tent F
   ```

### F. Building Minimap Icons (`src/lib/buildingIcons.ts`)
1. If the building belongs to a new type or uses a unique naming scheme, add a substring rule to `getBuildingIcon`:
   ```typescript
   else if (name.includes("Castle")) icon = "🏰";
   else if (name.includes("Tower") || name.includes("Donjon") || name.includes("Krepost") || name.includes("Fort")) icon = "♜";
   ```

### G. Terrain Palette (`src/lib/terrainPalette.ts`)
1. In the Genie engine, terrain IDs currently span from `0` to `130` (e.g. `0: Grass 1`, `32: Snow`, `35: Ice`, `104: Forest Autumn`, `117: Pasture`, `130: Water Weeds`).
2. When new expansion biomes or map terrains are added, check `AoE2ScenarioParser/datasets/terrains.py` (`TerrainId` enum) and `siegeengineers/aoc-reference-data` (`data/datasets/100.json` under `"terrain"`).
3. Ensure colors match standard minimap conventions:
   - Grass / land: `#00a900`
   - Forest / woods: `#257439`
   - Sand / beach: `#f8c98a`
   - Dirt / mud / roads: `#f3aa5c`
   - Water / deep ocean: `#305db6` / `#004aa1`
   - Shallows / swamp: `#5492b0`
   - Snow: `#f0f4f8` / `#e2ebf2` / `#ffffff`
   - Ice: `#98c0f0`
   - Farms / pastures: `#8a8b57` / `#00a900`

---

## 4. Verification

After editing the mappings:

1. **Run the update script to verify zero missing entities:**
   ```bash
   node src/debug/update-mappings.js
   ```

2. **Verify TypeScript compilation and Next.js build:**
   ```bash
   npm run build
   ```

3. **Verify sample lookups with Node:**
   ```bash
   node -e "
   const { getCivName } = require('./src/lib/civMappings.ts');
   const { getMapName } = require('./src/lib/gameMappings.ts');
   const { getUnitName } = require('./src/lib/entityNames.ts');
   const { getTechName } = require('./src/lib/techMappings.ts');
   console.log('Civ 60:', getCivName(60));
   console.log('Map 174:', getMapName(174));
   console.log('Unit 2711:', getUnitName(2711));
   console.log('Tech 1413:', getTechName(1413));
   "
   ```
