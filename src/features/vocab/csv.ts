import Papa from "papaparse";
import { db } from "../../db/db";
import type { VocabEntry } from "../../db/db";


type CsvRow = {
  thai?: string;
  german?: string;
  transliteration?: string;
  pos?: string;
  tags?: string;
  exampleThai?: string;
  exampleGerman?: string;
};

export async function importCsv(file: File) {
  const text = await file.text();

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error(parsed.errors.map(e => e.message).join("; "));
  }

  const now = Date.now();
  const entries: VocabEntry[] = (parsed.data ?? [])
    .map(r => ({
      thai: (r.thai ?? "").trim(),
      german: (r.german ?? "").trim(),
      transliteration: (r.transliteration ?? "").trim() || undefined,
      pos: (r.pos ?? "").trim() || undefined,
      tags: (r.tags ?? "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      exampleThai: (r.exampleThai ?? "").trim() || undefined,
      exampleGerman: (r.exampleGerman ?? "").trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }))
    .filter(e => e.thai && e.german);

  await db.vocab.bulkAdd(entries);
  return entries.length;
}

export async function exportCsv(): Promise<Blob> {
  const all = await db.vocab.toArray();

  const rows = all.map(e => ({
    thai: e.thai,
    german: e.german,
    transliteration: e.transliteration ?? "",
    pos: e.pos ?? "",
    tags: (e.tags ?? []).join(","),
    exampleThai: e.exampleThai ?? "",
    exampleGerman: e.exampleGerman ?? "",
  }));

  const csv = Papa.unparse(rows, { quotes: true });
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}