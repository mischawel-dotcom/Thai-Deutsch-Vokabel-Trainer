import type { VocabEntry } from "../../db/db";
import type { SentenceSegment } from "../sentences/transliteration";

export type LearnInfoRow = {
  arabic: string;
  thaiDigit: string;
  thaiWord: string;
  transliteration: string;
};

export type LearnCard = VocabEntry & {
  sourceType?: "vocab" | "numbers" | "numbers_info" | "sentences";
  infoRows?: LearnInfoRow[];
  infoNotes?: string[];
  sentenceSegments?: SentenceSegment[];
};

