# Building footprint verification

`entityMappings.ts` is checked against every unit record with DAT unit type
80 in the installed Definitive Edition data file. This includes scenario-only
building objects. They are intentionally mapped because the Starting Buildings
list may display them.

## Reproduce the audit

1. Install Python 3 and the DAT reader used for this audit:

   ```powershell
   python -m pip install genieutils-py==0.1.2
   ```

2. Run the audit with the game's default data file location:

   ```powershell
   python src/debug/audit-building-footprints.py
   ```

   Or pass another `empires2_x2_p1.dat` path as the first argument:

   ```powershell
   python src/debug/audit-building-footprints.py "D:\path\to\empires2_x2_p1.dat"
   ```

3. Inspect `building-footprint-audit.csv`. The script walks each civilization's
   unit table and checks every deduplicated building ID. The CSV lists only IDs
   with missing mappings or custom footprints that differ from the DAT-based
   estimate, so it stays focused on items needing review. ID 888 (Llama
   building) is omitted because its zero clearance makes the inferred 1x1 a
   fallback rather than useful evidence. Gate-family rows are excluded from
   the review CSV. Llama annexes, villager buildings/annexes, and trophy IDs
   are intentionally unmapped. City Gate IDs 1579–1594 are checked against
   the equivalent gate-family pattern in `entityMappings.ts`.

4. To add IDs with no mapping, run:

   ```powershell
   python src/debug/audit-building-footprints.py --apply-missing
   ```

   This identifies missing DAT building IDs and regenerates the CSV.
   IDs 888, 890, 1118, 1640–1645, and 1649–1653
   remain intentionally unmapped and are skipped by this command.

## How to interpret the comparison

For ordinary footprints, the candidate tile dimensions are twice the DAT
`clearance_size` values. Values are rounded to the nearest whole tile, with a
minimum of 1x1 so scenario helper objects with zero or sub-tile clearance still
have a renderable mapping. The longhouse records are useful orientation checks:
Longhouse A resolves to 3x2 and Longhouse B to 2x3. This agrees with the
distinct X/Y dimensions in the DAT.

Clearance is not always the same as the displayed footprint. Gates, foundations,
Town Center annexes, packed states, and some oversized scenario structures use
special mapping values because their clearance describes pathing, placement, or
part of a composite structure. The audit therefore reports those rows as
`review custom footprint` and retains their existing values instead of
overwriting them with a blanket formula. Compare these cases with the in-game
scenario editor's tile grid before changing an established custom value. The
report is an exhaustive source-data check; a clearance mismatch by itself is
not proof that a custom rendered footprint is wrong.

## Sources and local data

- The audited game data is `empires2_x2_p1.dat` from the installed AoE2 DE
  directory shown above.
- The DAT field reference describes unit size and clearance as separate
  attributes: [AoE2 UGC attributes reference](https://ugc.aoe2.rocks/general/attributes/attributes/).
- The parser is [genieutils-py](https://pypi.org/project/genieutils-py/).

The checked-in CSV is the audit output from the installed DAT. Regenerate it
after updating the game data or changing `entityMappings.ts`.

## Type 10 Scenario Structures (The Type 80 Blind Spot)

The original audit script filters strictly on `unit.type == 80` (Genie Engine `Building` class). In AoE2 DE—especially in DLC campaigns such as *Three Kingdoms*, *Victors and Vanquished*, and *Return of Rome*—numerous structures, ruins, pavilions, pagodas, shrines, fountains, and market stalls were authored under **Unit Type 10** (`Scenery` / `Ambient` / `Other`) rather than **Unit Type 80**.

Because `isBuildingId(id)` in `src/lib/entityMappings.ts` classifies static buildings based on obstruction properties (`type === 2` and `class` 3, 4, or 5), omitting these Type 10 objects prevents them from being recognized as starting buildings or drawn on the minimap for Gaia starting layouts.

### Prominent Type 10 Scenario Buildings

| ID | Name in `entityMappings.ts` | DAT Name | Clearance Size | Inferred Footprint | Category / Origin |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1987** | Chinese Ruins | `CHINESERUINS` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **1989** | Paifang Gate (Small) | `PAIFANGS` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **1990** | Paifang Gate (Large) | `PAIFANGL` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **1991** | Fountain | `FOUNTAIN` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2005** | Pagoda D | `PAGODA4` | `1.5 × 1.5` | `3 × 3` | Three Kingdoms / Asian |
| **2006** | Pagoda E | `PAGODA5` | `1.0 × 1.0` | `2 × 2` | Three Kingdoms / Asian |
| **2007** | Garden Pavilion | `GARDENPAVILION` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2020** | Garden Bridge | `GARDENBRIDGE` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2023** | Burned Building B | `BBURNEDB` | `1.5 × 1.5` | `3 × 3` | Three Kingdoms / Asian |
| **2024** | Asian Market Stalls | `ASIANMARKETSTALLS` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2035** | Burned Building E | `BBURNEDE` | `1.5 × 1.5` | `3 × 3` | Three Kingdoms / Asian |
| **2058** | Huabiao Totem | `HUABIAOTOTEM` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2059** | Que Tower | `QUETOWER` | `0.5 × 0.5` | `1 × 1` | Three Kingdoms / Asian |
| **2234** | Mediterranean Ruins | `Mediterranean Ruins` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2235** | Mediterranean Courtyard Walls | `Mediterranean Courtyard Walls` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2284** | Market Stall | `Market Stall` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2285** | Stake Barricade | `Stake Barricade` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2288** | Fire Shrine | `Fire Shrine` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2306** | Hero Shrine | `Hero Shrine` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2350** | Mesopotamian Ruins | `Mesopotamian Ruins` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2351** | Tholos Shrine | `Tholos Shrine` | `1.0 × 1.0` | `2 × 2` | Victors & Vanquished |
| **2501** | Grain Storage | `Grain Storage` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2504** | Burned Building Achaemenid | `Burned Building Achaemenid` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **2505** | Burned Building Greek | `Burned Building Greek` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **2506** | Statue Bendis | `Statue Bendis` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2508** | Burned Building Thracian | `Burned Building Thracian` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **2509** | Burned Building Puru | `Burned Building Puru` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **2510** | Furnace | `Furnace` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2514** | Puru Ruins | `Puru Ruins` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2528** | Fountain Antiquity | `Fountain Antiquity` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2530** | Theatre | `Theatre` | `2.5 × 2.5` | `5 × 5` | Victors & Vanquished |
| **2534** | Mediterranean Stall | `Mediterranean Stall` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2535** | Mesopotamian Stall | `Mesopotamian Stall` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2606** | Burned Building C | `BBURNEDB` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **2611** | Andean Ruins | `ANDEANRUINS` | `0.5 × 0.5` | `1 × 1` | Victors & Vanquished |
| **2744** | Burned Building D | `BBURNEDD` | `1.5 × 1.5` | `3 × 3` | Victors & Vanquished |
| **758** | Burned building | `BBURNED` | `1.5 × 1.5` | `3 × 3` | Base Game |
| **856** | Roman Ruins | `RUINS` | `1.0 × 1.0` | `2 × 2` | Conquerors / Classic |
| **1089** | Granary | `GRANARY` | `0.5 × 0.5` | `1 × 1` | Return of Rome |
| **1176** | Trowulan Gate | `TROWUG` | `1.5 × 1.5` | `3 × 3` | Rise of the Rajas |
| **1201** | Pagoda A | `PAGODA1` | `1.0 × 1.0` | `2 × 2` | Rise of the Rajas |
| **1202** | Pagoda B | `PAGODA2` | `1.0 × 1.0` | `2 × 2` | Rise of the Rajas |
| **1203** | Pagoda C | `PAGODA3` | `0.5 × 0.5` | `1 × 1` | Rise of the Rajas |
| **1562** | Paifang Gate | `PAGODA1` | `0.5 × 0.5` | `1 × 1` | Definitive Edition |
| **1563** | Nubian Pyramid | `PAGODA1` | `1.5 × 1.5` | `3 × 3` | Definitive Edition |
| **1566** | Temple Ruin | `RUINS` | `1.5 × 1.5` | `3 × 3` | Definitive Edition |
| **1567** | Well | `PAGODA1` | `0.5 × 0.5` | `1 × 1` | Definitive Edition |
| **1778** | Rekha-Deul Temple | `REKHADEUL` | `1.0 × 1.0` | `2 × 2` | Dynasties of India |
| **1784** | Indian Ruins | `INDIANRUINS` | `0.5 × 0.5` | `1 × 1` | Dynasties of India |
| **1837** | Castle Ruins | `CastleRuins` | `2.0 × 2.0` | `4 × 4` | Mountain Royals |
| **1838** | Church Ruins | `ChurchRuins` | `1.5 × 1.5` | `3 × 3` | Mountain Royals |

---

## Pathing Obstruction & Collision Data

The Genie engine determines whether an object blocks unit navigation through four primary attributes on the unit record:

1. **`obstruction_type`**: The fundamental collision behavior:
   - **`0` (No Obstruction)**: Walkable / sailable. Units pass straight through (projectiles, corpses, flares, revealer, ambient sea rocks).
   - **`2` (Standard Block)**: Solid static obstacle. Units cannot enter and must path around (buildings, trees, land rocks, cliffs).
   - **`3` (Special Block)**: Static obstacle with custom collision (ruins, loot, bonfires).
   - **`4` (Hover Block)**: Water / amphibious obstacle (hover rocks).
   - **`5` (Unit Obstacle)**: Dynamic unit collision (military units, villagers).
   - **`10` (Mountain Block)**: Absolute mountain obstacle (assigned exclusively to the 11 mountain objects).
2. **`obstruction_class`**: Category grouping used for collision rules and pathing checks:
   - `0`: None (passable)
   - `1`: Resource / Natural Scenery / Terrain Obstacle (Trees, Rocks, Mines, Stalls)
   - `3`: Standard Building (Barracks, Monasteries, Ruins)
   - `4`: Wall
   - `5`: Gate
   - `6`: Cliff
3. **`clearance_size`**: Half-tile bounding radii `(x, y)`. If `> (0.0, 0.0)` with a blocking `obstruction_type`, it occupies `round(x * 2) × round(y * 2)` cells on the navigation grid.
4. **`collision_size_x` / `collision_size_y`**: The floating-point physical bounding box used by the pathfinder for clearance distances.

---

## Mountains, Rocks, and Boulders

### 1. Mountains (IDs 310, 311, 744, 745, 1041–1047)
- **Engine Attributes**:
  - `obstruction_type`: `10`
  - `obstruction_class`: `1`
  - `clearance_size`: `(2.0, 2.0)` $\rightarrow$ **`4 × 4` tile footprint**
  - `collision_size`: `(3.0, 3.0)`
- **Pathing Behavior**: **100% pathing blockers**. Units cannot enter or traverse mountain tiles.
- **List of IDs**:
  - `310`: Mountain 1
  - `311`: Mountain 2
  - `744`: Mountain 3
  - `745`: Mountain 4
  - `1041`: Mountain 5
  - `1042`: Mountain 6
  - `1043`: Mountain 7
  - `1044`: Mountain 8
  - `1045`: Snow Mountain 1
  - `1046`: Snow Mountain 2
  - `1047`: Snow Mountain 3

### 2. Land Rocks & Formations
- **Engine Attributes**:
  - `obstruction_type`: `2` (or `4` for hover rocks)
  - `obstruction_class`: `1`
  - `clearance_size`: Non-zero
- **Pathing Behavior**: **100% pathing blockers**. Units path around them.
- **Footprints**:
  - **1 × 1**: `623` (Rock 1), `839` & `841` (Rock), `918` & `1323` (Rock 2), `1048` & `1049` (Rock Formation 1 & 2), `1149` (Jungle Rock), `1967` (Mossy Rock), `2009` (Limestone Rock), `2407`–`2411` (Hover Rocks / Formations), `2515` & `2516` (Rock 3 / Hover), `2734` (Snow Rock).
  - **2 × 2**: `1148` (Rock Boulder), `2008` (Rock Pillar), `2082` (Panda Rock).
  - **3 × 3**: `1050` (Rock Formation 3).

### 3. Sea Rocks (IDs 389, 396)
- **Engine Attributes**:
  - `obstruction_type`: `0`
  - `obstruction_class`: `0`
  - `clearance_size`: `(0.0, 0.0)`
  - `collision_size`: `(0.0, 0.0)`
- **Pathing Behavior**: **Passable**. Ships sail directly through them without obstacle collision.
