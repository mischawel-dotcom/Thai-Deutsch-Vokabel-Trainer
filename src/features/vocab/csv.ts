import Papa from "papaparse";
import { db } from "../../db/db";
import type { VocabEntry } from "../../db/db";
import { ensureProgressForEntries } from "../../db/srs";


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

type ImportMode = "append" | "replace";
const VOCAB_DATA_SOURCE_KEY = "vocabDataSource";
const CUSTOM_CSV_SOURCE = "custom_csv";

type ImportCsvOptions = {
  mode?: ImportMode;
};

export type ImportCsvResult = {
  added: number;
  duplicates: number;
  replaced: boolean;
  preservedProgress: number;
  removed: number;
};

function buildEntryKey(entry: Pick<VocabEntry, "thai" | "transliteration">): string {
  const safeThai = entry.thai.trim();
  const safeTransliteration = (entry.transliteration ?? "").trim().toLowerCase();
  return `${safeThai}__${safeTransliteration}`;
}

export async function importCsv(file: File, options: ImportCsvOptions = {}): Promise<ImportCsvResult> {
  const text = await file.text();
  const mode: ImportMode = options.mode ?? "append";

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error(parsed.errors.map(e => e.message).join("; "));
  }

  const now = Date.now();
  const preparedEntries: VocabEntry[] = (parsed.data ?? [])
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
    .filter(e => e.thai && e.german);

  // Always de-duplicate the incoming CSV payload itself.
  const uniqueByKey = new Map<string, VocabEntry>();
  for (const entry of preparedEntries) {
    const key = buildEntryKey(entry);
    if (!uniqueByKey.has(key)) {
      uniqueByKey.set(key, entry);
    }
  }
  const dedupedEntries = Array.from(uniqueByKey.values());
  const duplicatesInFile = Math.max(0, preparedEntries.length - dedupedEntries.length);

  if (mode === "replace") {
    let addedCount = 0;
    let preservedCount = 0;
    let removedCount = 0;

    await db.transaction("rw", db.vocab, db.progress, async () => {
      const existing = await db.vocab.toArray();
      const existingByKey = new Map<string, VocabEntry[]>();
      for (const entry of existing) {
        const key = buildEntryKey(entry);
        const list = existingByKey.get(key);
        if (list) list.push(entry);
        else existingByKey.set(key, [entry]);
      }

      const keepIds = new Set<number>();
      const idsToDelete = new Set<number>();
      const idsToEnsureProgress = new Set<number>();
      const toAdd: VocabEntry[] = [];
      const nowTs = Date.now();

      for (const entry of dedupedEntries) {
        const key = buildEntryKey(entry);
        const matches = existingByKey.get(key) ?? [];
        const canonical = matches.find((candidate) => candidate.id != null) ?? matches[0];

        if (canonical?.id != null) {
          await db.vocab.update(canonical.id, {
            thai: entry.thai,
            german: entry.german,
            transliteration: entry.transliteration,
            pos: entry.pos,
            lesson: entry.lesson,
            tags: entry.tags,
            exampleThai: entry.exampleThai,
            exampleGerman: entry.exampleGerman,
            updatedAt: nowTs,
          });
          keepIds.add(canonical.id);
          idsToEnsureProgress.add(canonical.id);
          preservedCount += 1;

          for (const duplicate of matches) {
            if (duplicate.id == null || duplicate.id === canonical.id) continue;
            idsToDelete.add(duplicate.id);
          }
        } else {
          toAdd.push(entry);
        }
      }

      for (const oldEntry of existing) {
        if (oldEntry.id == null) continue;
        if (!keepIds.has(oldEntry.id)) {
          idsToDelete.add(oldEntry.id);
        }
      }

      if (idsToDelete.size > 0) {
        const deleteIds = Array.from(idsToDelete);
        await db.vocab.bulkDelete(deleteIds);
        await db.progress.bulkDelete(deleteIds);
        removedCount = deleteIds.length;
      }

      if (toAdd.length > 0) {
        const insertedIds = await db.vocab.bulkAdd(toAdd, { allKeys: true });
        const normalizedIds = insertedIds
          .map((id) => Number(id))
          .filter((id): id is number => Number.isFinite(id) && id > 0);
        for (const id of normalizedIds) idsToEnsureProgress.add(id);
        addedCount = normalizedIds.length;
      }

      await ensureProgressForEntries(Array.from(idsToEnsureProgress));
    });

    try {
      localStorage.setItem(VOCAB_DATA_SOURCE_KEY, CUSTOM_CSV_SOURCE);
    } catch {
      // ignore storage errors
    }

    return {
      added: addedCount,
      duplicates: duplicatesInFile,
      replaced: true,
      preservedProgress: preservedCount,
      removed: removedCount,
    };
  }

  // Append mode: skip rows that already exist in DB (by Thai+Transliteration key).
  const existingVocab = await db.vocab.toArray();
  const existingKeys = new Set(existingVocab.map((entry) => buildEntryKey(entry)));
  const entriesToAdd = dedupedEntries.filter((entry) => !existingKeys.has(buildEntryKey(entry)));

  if (entriesToAdd.length === 0) {
    return {
      added: 0,
      duplicates: (parsed.data ?? []).length,
      replaced: false,
      preservedProgress: 0,
      removed: 0,
    };
  }

  const insertedIds = await db.vocab.bulkAdd(entriesToAdd, { allKeys: true });
  const normalizedIds = insertedIds
    .map((id) => Number(id))
    .filter((id): id is number => Number.isFinite(id) && id > 0);
  await ensureProgressForEntries(normalizedIds);

  try {
    localStorage.setItem(VOCAB_DATA_SOURCE_KEY, CUSTOM_CSV_SOURCE);
  } catch {
    // ignore storage errors
  }

  const duplicates = Math.max(0, (parsed.data ?? []).length - entriesToAdd.length);
  return { 
    added: entriesToAdd.length, 
    duplicates,
    replaced: false,
    preservedProgress: 0,
    removed: 0,
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