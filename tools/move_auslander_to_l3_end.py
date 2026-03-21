#!/usr/bin/env python3
"""Move คนต่างชาติ from L1 to end of L3 block (CSV order); cascade L2→L1 then L3→L2 (first in file order).

Expected cascade (depends on current file): first L2 row → L1 (e.g. สวัสดี), first L3 row → L2 (e.g. มะม่วง).
"""
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "thai-de-vocab_Ver_2.csv"
TARGET_THAI = "คนต่างชาติ"


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fieldnames = list(rows[0].keys())

    aus: dict | None = None
    rest: list[dict] = []
    for r in rows:
        if r["thai"].strip() == TARGET_THAI:
            aus = dict(r)
            aus["lesson"] = "3"
        else:
            rest.append(r)

    if aus is None:
        raise SystemExit(f"Row not found: {TARGET_THAI}")

    last_l3 = -1
    for i, r in enumerate(rest):
        if int(r["lesson"]) == 3:
            last_l3 = i

    if last_l3 < 0:
        raise SystemExit("No L3 rows in file")

    new_rows = rest[: last_l3 + 1] + [aus] + rest[last_l3 + 1 :]

    # L1=199, L3=201 → first L2→L1, first L3→L2 (scan top to bottom)
    moved_l2_to_l1 = False
    moved_l3_to_l2 = False
    for r in new_rows:
        if not moved_l2_to_l1 and int(r["lesson"]) == 2:
            r["lesson"] = "1"
            moved_l2_to_l1 = True
            continue
    for r in new_rows:
        if not moved_l3_to_l2 and int(r["lesson"]) == 3:
            r["lesson"] = "2"
            moved_l3_to_l2 = True
            break

    if not moved_l2_to_l1 or not moved_l3_to_l2:
        raise SystemExit("Cascade failed")

    c = Counter(int(r["lesson"]) for r in new_rows)
    if dict(sorted(c.items())) != {1: 200, 2: 200, 3: 200, 4: 200, 5: 274}:
        raise SystemExit(f"Unexpected counts: {dict(sorted(c.items()))}")

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(new_rows)

    print("OK:", dict(sorted(c.items())), "total", len(new_rows))


if __name__ == "__main__":
    main()
