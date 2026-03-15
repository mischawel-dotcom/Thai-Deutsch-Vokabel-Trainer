import type { VocabEntry } from "../../db/db";
import type { SentenceSegment } from "../sentences/transliteration";

export type ConfirmAction = "restart" | "end";

export type TestCard = VocabEntry & {
  sentenceSegments?: SentenceSegment[];
  sourceType?:
    | "vocab"
    | "numbers"
    | "numbers_generated"
    | "sentences"
    | "sentences_important";
};

