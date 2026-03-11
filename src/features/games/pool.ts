import type { NumberEntry, VocabEntry } from "../../db/db";
import type { GamePoolSource } from "./types";
import type { GameEntry } from "./types";

type VocabWithId = VocabEntry & { id: number };
type NumberWithId = NumberEntry & { id: number };

function asVocabWithId(entries: VocabEntry[]): VocabWithId[] {
  return entries.filter((entry): entry is VocabWithId => typeof entry.id === "number");
}

function asNumberWithId(entries: NumberEntry[]): NumberWithId[] {
  return entries.filter((entry): entry is NumberWithId => typeof entry.id === "number");
}

function mapVocabToGameEntry(entry: VocabWithId): GameEntry {
  return {
    id: entry.id,
    lesson: entry.lesson,
    viewed: entry.viewed,
    thPrompt: entry.thai,
    dePrompt: entry.german,
    thAnswer: entry.thai,
    deAnswer: entry.german,
  };
}

function mapNumberToGameEntry(entry: NumberWithId): GameEntry {
  return {
    id: entry.id,
    lesson: entry.lesson,
    viewed: entry.viewed,
    thPrompt: entry.thaiDigit,
    dePrompt: String(entry.arabic),
    thAnswer: entry.thaiDigit,
    deAnswer: String(entry.arabic),
  };
}

export function toGameEntries(
  source: GamePoolSource,
  entries: VocabEntry[] | NumberEntry[]
): GameEntry[] {
  if (source === "numbers") {
    return asNumberWithId(entries as NumberEntry[]).map(mapNumberToGameEntry);
  }
  return asVocabWithId(entries as VocabEntry[]).map(mapVocabToGameEntry);
}
