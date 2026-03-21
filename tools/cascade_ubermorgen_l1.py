#!/usr/bin/env python3
"""Move มะรืนนี้ to L1, then cascade the 201st row (CSV top-to-bottom) of L1→L2→L3→L4.

Idempotent if counts are already 200/200/200/200/Rest.

Expected victims (when starting from prior state with มะรืนนี้ in L5):
  L1→L2: มืด | L2→L3: เนื้อ | L3→L4: ของขวัญ | L4→L5: ช่วง
"""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "thai-de-vocab_Ver_2.csv"

UBERMORGEN = "มะรืนนี้"


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fieldnames = list(rows[0].keys())

    for r in rows:
        if r["thai"].strip() == UBERMORGEN:
            r["lesson"] = "1"
            break

    for L in (1, 2, 3, 4):
        indices = [i for i, r in enumerate(rows) if int(r["lesson"]) == L]
        if len(indices) <= 200:
            continue
        victim_i = indices[200]  # 201st in file order (0-based index 200)
        r = rows[victim_i]
        r["lesson"] = str(L + 1)

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    from collections import Counter

    c = Counter(int(r["lesson"]) for r in rows)
    print("Per lesson:", dict(sorted(c.items())))
    print("total", len(rows))


if __name__ == "__main__":
    main()
