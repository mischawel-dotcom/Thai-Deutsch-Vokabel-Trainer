import type { VocabEntry } from "../../db/db";

export type LearnInfoRow = {
  arabic: string;
  thaiDigit: string;
  thaiWord: string;
  transliteration: string;
};

export type LearnCard = VocabEntry & {
  sourceType?: "vocab" | "numbers" | "numbers_info";
  infoRows?: LearnInfoRow[];
  infoNotes?: string[];
};

