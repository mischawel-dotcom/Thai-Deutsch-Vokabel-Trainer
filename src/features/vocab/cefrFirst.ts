import type { VocabEntry } from "../../db/db";
import { isVocabExcludedFromPractice } from "./practiceExclusions";

type CefrLevel = "A1" | "A2" | "OTHER";

function getCefrLevel(entry: Pick<VocabEntry, "tags">): CefrLevel {
  const tags = entry.tags ?? [];
  const lowered = tags.map((tag) => tag.trim().toLowerCase());
  if (lowered.includes("a1")) return "A1";
  if (lowered.includes("a2")) return "A2";
  return "OTHER";
}

export function applyCefrFirstFilter(entries: VocabEntry[]): {
  entries: VocabEntry[];
  activeGate: "A1" | null;
} {
  const nonExcluded = entries.filter((entry) => !isVocabExcludedFromPractice(entry));

  const hasPendingA1 = nonExcluded.some(
    (entry) => getCefrLevel(entry) === "A1" && entry.viewed !== true
  );

  if (!hasPendingA1) {
    return { entries: nonExcluded, activeGate: null };
  }

  return {
    entries: nonExcluded.filter((entry) => getCefrLevel(entry) !== "A2"),
    activeGate: "A1",
  };
}
