#!/usr/bin/env python3
"""One-off: move selected L1 words to L4, swap in shorter L4 words, rebalance L1 count to 200."""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "thai-de-vocab_Ver_2.csv"

L1_TO_L4 = {"พยาบาล", "พนักงาน", "เจ้านาย", "ลูกค้า", "นักท่องเที่ยว"}
L4_TO_L1 = {"ขา", "ขวด", "แก้ว", "ผัด", "มืด"}
L1_TO_L5 = {"มะรืนนี้"}  # balances L1 from 201 to 200 after 5↔5 swap


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fieldnames = list(rows[0].keys()) if rows else []

    thai_to_new: dict[str, int] = {}
    for t in L1_TO_L4:
        thai_to_new[t] = 4
    for t in L4_TO_L1:
        thai_to_new[t] = 1
    for t in L1_TO_L5:
        thai_to_new[t] = 5

    for row in rows:
        thai = row["thai"].strip()
        if thai in thai_to_new:
            row["lesson"] = str(thai_to_new[thai])

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
