# Building footprint verification

`buildingMappings.ts` is checked against every unit record with DAT unit type
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
   the equivalent gate-family pattern in `buildingMappings.ts`.

4. To add IDs with no mapping, run:

   ```powershell
   python src/debug/audit-building-footprints.py --apply-missing
   ```

   This appends missing DAT building IDs in numeric order to
   `src/lib/buildingMappings.ts` and regenerates the CSV. It does not replace
   existing footprint values. IDs 888, 890, 1118, 1640–1645, and 1649–1653
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
after updating the game data or changing `buildingMappings.ts`.
