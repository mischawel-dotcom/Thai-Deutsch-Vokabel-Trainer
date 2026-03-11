import type { NumberEntry } from "../../db/db";
import { generateNumber, MAX_GENERATED_NUMBER } from "../../lib/number-generator";
import type { TestCard } from "./types";

export type NumberGeneratorRange = {
  fromValue: number;
  toValue: number;
  rangeSize: number;
};

export function mapNumberEntryToTestCard(entry: NumberEntry): TestCard {
  return {
    id: entry.id,
    thai: `${entry.thaiWord} (${entry.thaiDigit})`,
    german: `${entry.german} (${entry.arabic})`,
    transliteration: entry.transliteration,
    lesson: entry.lesson,
    tags: entry.tags,
    viewed: entry.viewed,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    sourceType: "numbers",
  };
}

export function normalizeNumberGeneratorRange(fromRaw: string, toRaw: string): NumberGeneratorRange {
  const parsedFrom = fromRaw.trim() ? Number.parseInt(fromRaw, 10) : NaN;
  const parsedTo = toRaw.trim() ? Number.parseInt(toRaw, 10) : NaN;
  const safeFrom = Number.isFinite(parsedFrom)
    ? Math.max(0, Math.min(MAX_GENERATED_NUMBER, parsedFrom))
    : 0;
  const safeTo = Number.isFinite(parsedTo)
    ? Math.max(0, Math.min(MAX_GENERATED_NUMBER, parsedTo))
    : 100;
  const fromValue = Math.min(safeFrom, safeTo);
  const toValue = Math.max(safeFrom, safeTo);
  return {
    fromValue,
    toValue,
    rangeSize: toValue - fromValue + 1,
  };
}

export function buildGeneratedNumberTestCards(range: NumberGeneratorRange): TestCard[] {
  const targetSize = range.rangeSize <= 5000 ? range.rangeSize : 2000;
  const values = new Set<number>();
  for (let i = range.fromValue; i <= Math.min(range.toValue, range.fromValue + 100); i += 1) {
    values.add(i);
  }
  while (values.size < targetSize) {
    values.add(range.fromValue + Math.floor(Math.random() * range.rangeSize));
  }
  return Array.from(values)
    .sort((a, b) => a - b)
    .map((value) => {
      const generated = generateNumber(value);
      return {
        id: 2_000_000_000 + value,
        thai: `${generated.thaiWord} (${generated.thaiDigit})`,
        german: `${generated.german} (${generated.arabic})`,
        transliteration: generated.transliteration,
        lesson: 1,
        tags: ["Numbers", "Generated", "Kardinalzahlen"],
        viewed: true,
        createdAt: 0,
        updatedAt: 0,
        sourceType: "numbers_generated",
      } satisfies TestCard;
    });
}

