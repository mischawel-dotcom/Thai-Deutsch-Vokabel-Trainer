import Papa from "papaparse";
import type { VocabEntry } from "../db/db";
import csvText from "../../data/thai-de-vocab_Ver_2.csv?raw";

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

function parseStrictLesson(value: string | number | undefined): number | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function splitTags(value: string | undefined): string[] | undefined {
  const tags = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

function hasCefrTag(tags: string[] | undefined): boolean {
  if (!tags || tags.length === 0) return false;
  const lowered = tags.map((tag) => tag.trim().toLowerCase());
  return lowered.includes("a1") || lowered.includes("a2");
}

function normalizeEntry(row: CsvRow): VocabEntry | null {
  const thai = (row.thai ?? "").trim();
  const german = (row.german ?? "").trim();
  if (!thai || !german) return null;
  const lesson = parseStrictLesson(row.lesson);
  const tags = splitTags(row.tags);
  if (lesson === null || !hasCefrTag(tags)) return null;

  const now = Date.now();
  return {
    thai,
    german,
    transliteration: (row.transliteration ?? "").trim() || undefined,
    pos: (row.pos ?? "").trim() || undefined,
    lesson,
    tags,
    exampleThai: (row.exampleThai ?? "").trim() || undefined,
    exampleGerman: (row.exampleGerman ?? "").trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function createDefaultVocab(): VocabEntry[] {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const fatalErrors = parsed.errors.filter((error) => {
    const code = String(error.code ?? "");
    // Be tolerant for occasional malformed rows with extra separators.
    // We still keep valid columns and avoid crashing app startup.
    return code !== "TooManyFields" && code !== "TooFewFields";
  });

  if (fatalErrors.length > 0) {
    throw new Error(
      `DEFAULT_VOCAB parse error: ${fatalErrors[0]?.message ?? "unknown error"}`
    );
  }

  if (parsed.errors.length > 0) {
    console.warn(
      `[DEFAULT_VOCAB] Non-fatal CSV parse warnings: ${parsed.errors.length}. Continuing with parsed rows.`
    );
  }

  const normalizedEntries = (parsed.data ?? [])
    .map(normalizeEntry)
    .filter((entry): entry is VocabEntry => entry !== null);

  const invalidCount = (parsed.data ?? []).length - normalizedEntries.length;
  if (invalidCount > 0) {
    console.warn(`[DEFAULT_VOCAB] Ignored ${invalidCount} invalid CSV row(s).`);
  }

  return normalizedEntries;
}

export const DEFAULT_VOCAB: VocabEntry[] = createDefaultVocab();
