import type { VocabEntry } from "../../db/db";

export type ConfirmAction = "restart" | "end";

export type TestCard = VocabEntry & {
  sourceType?: "vocab" | "numbers" | "numbers_generated";
};

