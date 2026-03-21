#!/usr/bin/env python3
"""Normalize tags in data/thai-de-vocab_Ver_2.csv (DE nouns capitalized, EN→DE, dedupe)."""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "thai-de-vocab_Ver_2.csv"

TAG_MAP: dict[str, str] = {
    "A1": "A1",
    "A2": "A2",
    "abstrakt": "Abstrakt",
    "Adjektive": "Adjektive",
    "Alltag": "Alltag",
    "Animals": "Tiere",
    "arbeit": "Arbeit",
    "Basics": "Grundlagen",
    "Berufe": "Berufe",
    "bildung": "Bildung",
    "Clothes": "Kleidung",
    "Denken": "Denken",
    "Education": "Bildung",
    "eigenschaften": "Eigenschaften",
    "Einkaufen": "Einkaufen",
    "einkaufen": "Einkaufen",
    "Erfahrung": "Erfahrung",
    "Essen": "Essen",
    "essen": "Essen",
    "Familie": "Familie",
    "familie": "Familie",
    "Farben": "Farben",
    "finanzen": "Finanzen",
    "Food": "Essen",
    "Fragen": "Fragen",
    "Freizeit": "Freizeit",
    "freizeit": "Freizeit",
    "gefuehle": "Gefühle",
    "Gefühle": "Gefühle",
    "gesellschaft": "Gesellschaft",
    "Gesundheit": "Gesundheit",
    "gesundheit": "Gesundheit",
    "grammatik": "Grammatik",
    "Grundwortschatz": "Grundwortschatz",
    "Haus": "Haus",
    "haus": "Haus",
    "haushalt": "Haushalt",
    "Health": "Gesundheit",
    "Home": "Zuhause",
    "Höflichkeit": "Höflichkeit",
    "Kleidung": "Kleidung",
    "kleidung": "Kleidung",
    "koerper": "Körper",
    "kultur": "Kultur",
    "Körper": "Körper",
    "Leisure": "Freizeit",
    "material": "Material",
    "Medien": "Medien",
    "medien": "Medien",
    "Monate": "Monate",
    "Nationalitäten": "Nationalitäten",
    "Natur": "Natur",
    "natur": "Natur",
    "Notfall": "Notfall",
    "Obst": "Obst",
    "Orte": "Orte",
    "orte": "Orte",
    "Personen": "Personen",
    "personen": "Personen",
    "Phone": "Telefon",
    "ProperName": "Eigenname",
    "reise": "Reisen",
    "Reisen": "Reisen",
    "Richtung": "Richtung",
    "School": "Schule",
    "Schule": "Schule",
    "Shopping": "Einkaufen",
    "sinne": "Sinne",
    "soziales": "Soziales",
    "sprache": "Sprache",
    "stadt": "Stadt",
    "technik": "Technik",
    "tiere": "Tiere",
    "Time": "Zeit",
    "Transport": "Transport",
    "transport": "Transport",
    "Travel": "Reisen",
    "Trinken": "Trinken",
    "Verben": "Verben",
    "verben": "Verben",
    "verkehr": "Verkehr",
    "Weather": "Wetter",
    "werkzeug": "Werkzeug",
    "Wetter": "Wetter",
    "wetter": "Wetter",
    "Work": "Arbeit",
    "Zeit": "Zeit",
    "zeit": "Zeit",
}


def normalize_tags_field(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        return raw
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    mapped: list[str] = []
    for p in parts:
        if p not in TAG_MAP:
            raise KeyError(f"Unmapped tag: {p!r}")
        mapped.append(TAG_MAP[p])
    # preserve order, dedupe
    out: list[str] = []
    seen: set[str] = set()
    for t in mapped:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return ",".join(out)


def main() -> None:
    rows: list[dict[str, str]] = []
    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if not fieldnames or "tags" not in fieldnames:
            raise SystemExit("CSV must have header with 'tags' column")
        for row in reader:
            row["tags"] = normalize_tags_field(row.get("tags", ""))
            rows.append(row)

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Updated {len(rows)} rows in {CSV_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
