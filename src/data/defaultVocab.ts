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

function parseLesson(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitTags(value: string | undefined): string[] | undefined {
  const tags = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

function normalizeEntry(row: CsvRow): VocabEntry | null {
  const thai = (row.thai ?? "").trim();
  const german = (row.german ?? "").trim();
  if (!thai || !german) return null;

  const now = Date.now();
  return {
    thai,
    german,
    transliteration: (row.transliteration ?? "").trim() || undefined,
    pos: (row.pos ?? "").trim() || undefined,
    lesson: parseLesson(row.lesson),
    tags: splitTags(row.tags),
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

  return (parsed.data ?? [])
    .map(normalizeEntry)
    .filter((entry): entry is VocabEntry => entry !== null);
}

export const DEFAULT_VOCAB: VocabEntry[] = createDefaultVocab();
