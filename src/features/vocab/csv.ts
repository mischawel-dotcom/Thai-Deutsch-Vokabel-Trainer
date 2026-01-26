import Papa from "papaparse";
import { db } from "../../db/db";
import type { VocabEntry } from "../../db/db";


type CsvRow = {
  thai?: string;
  german?: string;
  transliteration?: string;
  pos?: string;
  tags?: string;
  lesson?: string | number;
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

  // Get existing vocab to check for duplicates
  const existingVocab = await db.vocab.toArray();
  const existingThaiSet = new Set(existingVocab.map(v => v.thai));
  const existingGermanSet = new Set(existingVocab.map(v => v.german));

  const now = Date.now();
  const entries: VocabEntry[] = (parsed.data ?? [])
    .map(r => ({
      thai: (r.thai ?? "").trim(),
      german: (r.german ?? "").trim(),
      transliteration: (r.transliteration ?? "").trim() || undefined,
      pos: (r.pos ?? "").trim() || undefined,
      lesson: r.lesson ? parseInt(String(r.lesson), 10) || undefined : undefined,
      tags: (r.tags ?? "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      exampleThai: (r.exampleThai ?? "").trim() || undefined,
      exampleGerman: (r.exampleGerman ?? "").trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }))
    .filter(e => e.thai && e.german)
    // Filter out duplicates (check both Thai and German)
    .filter(e => !existingThaiSet.has(e.thai) && !existingGermanSet.has(e.german));

  if (entries.length === 0) {
    return { added: 0, duplicates: (parsed.data ?? []).length };
  }

  await db.vocab.bulkAdd(entries);
  return { 
    added: entries.length, 
    duplicates: Math.max(0, (parsed.data ?? []).length - entries.length)
  };
}

export async function exportCsv(): Promise<Blob> {
  const all = await db.vocab.toArray();

  const rows = all.map(e => ({
    thai: e.thai,
    german: e.german,
    transliteration: e.transliteration ?? "",
    pos: e.pos ?? "",
    tags: (e.tags ?? []).join(","),
    lesson: e.lesson ?? "",
    exampleThai: e.exampleThai ?? "",
    exampleGerman: e.exampleGerman ?? "",
  }));

  const csv = Papa.unparse(rows, { quotes: true });
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}