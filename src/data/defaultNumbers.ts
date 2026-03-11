import type { NumberEntry } from "../db/db";
import { generateNumber } from "../lib/number-generator";

const EXTRA_NUMBERS = [1000, 10_000, 100_000, 1_000_000] as const;

export const DEFAULT_NUMBERS: NumberEntry[] = [
  ...Array.from({ length: 101 }, (_, n) => n),
  ...EXTRA_NUMBERS,
].map((value) => ({
  ...generateNumber(value),
  lesson: 1,
  tags: ["Numbers", "A1", "Kardinalzahlen"],
  createdAt: 0,
  updatedAt: 0,
}));
