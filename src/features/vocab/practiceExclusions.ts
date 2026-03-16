import type { VocabEntry } from "../../db/db";

const PRACTICE_EXCLUSION_TAGS = new Set(["propername"]);

export function isVocabExcludedFromPractice(
  entry: Pick<VocabEntry, "tags">
): boolean {
  const tags = entry.tags ?? [];
  for (const tag of tags) {
    if (PRACTICE_EXCLUSION_TAGS.has(tag.trim().toLowerCase())) {
      return true;
    }
  }
  return false;
}
