#!/usr/bin/env python3
"""Audit building footprints against the installed AoE2 DE game data.

Requires genieutils-py. See building-footprints.md for the verified workflow.
"""

import argparse
import csv
import re
import sys
from collections import defaultdict
from pathlib import Path

# Allow the local workspace target used for this audit; normal Python installs
# still work without this directory.
LOCAL_DEPENDENCIES = Path(__file__).resolve().parents[2] / ".codex-tmp-genieutils"
if LOCAL_DEPENDENCIES.is_dir():
    sys.path.insert(0, str(LOCAL_DEPENDENCIES))

from genieutils.datfile import DatFile

ROOT = Path(__file__).resolve().parents[2]
DAT_DEFAULT = Path(
    r"C:\Program Files (x86)\Steam\steamapps\common\AoE2DE\resources\_common\dat\empires2_x2_p1.dat"
)
MAP_PATH = ROOT / "src/lib/buildingMappings.ts"
ENTITY_PATH = ROOT / "src/lib/entityMappings.ts"
CSV_PATH = ROOT / "src/debug/de.csv"
REPORT_PATH = ROOT / "src/debug/building-footprint-audit.csv"
# This object's DAT clearance is 0x0, so its inferred tile size is only the
# script's renderable fallback and is not useful for footprint review.
SKIP_IDS = {
    888, 890, 1118, 1640, 1641, 1642, 1643, 1644, 1645,
    1649, 1650, 1651, 1652, 1653,
}
CITY_GATE_PATTERN = {
    1579: (2, 1), 1580: (2, 1), 1581: (1, 1), 1582: (4, 1),
    1583: (1, 2), 1584: (1, 2), 1585: (1, 1), 1586: (1, 4),
    1587: (2, 2), 1588: (2, 2), 1589: (1, 1), 1590: (1, 1),
    1591: (2, 2), 1592: (2, 2), 1593: (1, 1), 1594: (1, 1),
}


def read_names():
    names = {}
    entity_text = ENTITY_PATH.read_text(encoding="utf-8-sig")
    names.update(
        (int(i), value)
        for i, value in re.findall(r'^\s*(\d+):\s*"([^"]+)"', entity_text, re.M)
    )
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.reader(f):
            if row and row[0].isdigit() and len(row) > 2 and row[2]:
                names.setdefault(int(row[0]), row[2])
    return names


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dat", nargs="?", type=Path, default=DAT_DEFAULT)
    parser.add_argument(
        "--apply-missing",
        action="store_true",
        help="add missing DAT building IDs using inferred tile dimensions",
    )
    args = parser.parse_args()

    dat = DatFile.parse(str(args.dat))
    records = defaultdict(list)
    for civ in dat.civs:
        for unit in civ.units:
            if unit is not None and unit.type == 80:
                records[unit.id].append(unit)

    source = MAP_PATH.read_text(encoding="utf-8-sig")
    lines = source.splitlines()
    object_start = next(
        i for i, line in enumerate(lines)
        if line == "const FOOTPRINTS: Record<number, BuildingFootprint> = {"
    )
    object_end = next(i for i in range(object_start + 1, len(lines)) if lines[i] == "};")
    type_body = lines[:object_start]
    if any(re.match(r"\s*\d+: \{", line) for line in type_body):
        raise ValueError("Building ID entries found outside the FOOTPRINTS object")
    mapped = {
        int(i): (int(w), int(h))
        for i, w, h in re.findall(
            r"^\s*(\d+): \{ w: (\d+), h: (\d+) \}",
            "\n".join(lines[object_start + 1:object_end]), re.M
        )
    }
    names = read_names()
    report_rows = []
    suggested = {}

    for building_id, variants in sorted(records.items()):
        sizes = sorted({tuple(u.clearance_size) for u in variants})
        raw_x, raw_y = sizes[0]
        # The engine's clearance size is stored in half-tile increments.
        # Minimum one tile keeps zero/tiny scenario helper entries renderable.
        inferred = (max(1, round(raw_x * 2)), max(1, round(raw_y * 2)))
        existing = mapped.get(building_id)
        status = "missing" if existing is None else (
            "matches inferred" if existing == inferred else "review custom footprint"
        )
        if building_id in CITY_GATE_PATTERN and existing == CITY_GATE_PATTERN[building_id]:
            status = "matches gate pattern"
        if len(sizes) > 1:
            status = "inconsistent across civ records"
        report_rows.append(
            [building_id, names.get(building_id, variants[0].name),
             "; ".join(f"{x:g}x{y:g}" for x, y in sizes),
             f"{inferred[0]}x{inferred[1]}",
             f"{existing[0]}x{existing[1]}" if existing else "", status]
        )
        if existing is None and building_id not in SKIP_IDS:
            suggested[building_id] = inferred

    with REPORT_PATH.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "name", "DAT clearance size(s)", "inferred footprint",
            "mapped footprint", "status",
        ])
        # Keep the checked-in report focused on gaps and nonstandard mappings.
        writer.writerows(
            row for row in report_rows
            if row[5] not in {"matches inferred", "matches gate pattern"}
            and row[0] not in SKIP_IDS
            and not re.search(r"\bgate\b", row[1], re.IGNORECASE)
        )

    if args.apply_missing and suggested:
        insertion = []
        for building_id, (width, height) in suggested.items():
            label = names.get(building_id, records[building_id][0].name)
            label = label.replace("*/", "* /").replace("\n", " ")
            insertion.append(
                f"  {building_id}: {{ w: {width}, h: {height} }}, // {label}"
            )
        lines[object_end:object_end] = insertion
        # Keep the dictionary in numeric order, retaining all existing comments.
        start = object_start + 1
        end = next(i for i in range(start, len(lines)) if lines[i] == "};")
        entries = lines[start:end]
        entries.sort(key=lambda line: int(re.match(r"\s*(\d+):", line).group(1)))
        lines[start:end] = entries
        MAP_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    mapped_mismatches = sum(
        1 for row in report_rows
        if row[5] == "review custom footprint"
    )
    pattern_matches = sum(1 for row in report_rows if row[5] == "matches gate pattern")
    unmapped_ids = set(records) - set(mapped)
    print(
        f"DAT building IDs: {len(records)}; mapped: {len(set(records) & set(mapped))}; "
        f"unmapped (excluding skipped IDs): {len(unmapped_ids - SKIP_IDS)}; "
        f"skipped: {len(unmapped_ids & SKIP_IDS)}; "
        f"custom footprints to review: {mapped_mismatches}; "
        f"City Gate pattern matches: {pattern_matches}"
    )
    print(f"Report: {REPORT_PATH}")
    if args.apply_missing:
        print(f"Added missing IDs: {len(suggested)}")


if __name__ == "__main__":
    main()
