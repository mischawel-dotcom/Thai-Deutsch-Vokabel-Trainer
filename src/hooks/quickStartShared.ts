import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { shuffle } from "../lib/shuffle";

type ProgressTableName = "progress" | "numbersProgress";

export function normalizeOptionalLimit(limit: number | undefined): number | undefined {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return undefined;
  }
  return Math.floor(limit);
}

export async function filterDueOrUnfinishedLearnedIds(
  learnedIds: number[],
  progressTable: ProgressTableName
): Promise<number[]> {
  const progressRows = await db.table(progressTable).toArray();
  const eligibleIds = new Set(
    progressRows
      .filter((row) => {
        const entryId = row.entryId;
        if (typeof entryId !== "number") return false;
        const dueAt = typeof row.dueAt === "number" ? row.dueAt : Number.POSITIVE_INFINITY;
        const repetitions = typeof row.repetitions === "number" ? row.repetitions : 0;
        return dueAt <= Date.now() || repetitions < 5;
      })
      .map((row) => row.entryId)
      .filter((id): id is number => typeof id === "number")
  );
  return learnedIds.filter((id) => eligibleIds.has(id));
}

/**
 * Zeitpunkt „als gelernt markiert“ unter Lernen (`learnedAt`).
 * Kein Test-Fortschritt, kein generisches `updatedAt` (wird u.a. bei Sync überschrieben).
 */
export function vocabLearnedRecencyScore(entry: VocabEntry): number {
  return typeof entry.learnedAt === "number" && entry.learnedAt > 0 ? entry.learnedAt : 0;
}

/**
 * Vokabeln nach Learn-Markierung, neueste zuerst, begrenzt auf `limit`.
 * Nur Karten mit `learnedAt` (unter Lernen als gelernt markiert).
 */
export async function selectRecentlyLearnedVocabIds(
  vocab: VocabEntry[],
  limit: number
): Promise<number[]> {
  const learned = vocab.filter(
    (entry) =>
      typeof entry.id === "number" &&
      typeof entry.learnedAt === "number" &&
      entry.learnedAt > 0
  );
  if (learned.length === 0) return [];

  const ranked = [...learned].sort((a, b) => {
    const scoreA = vocabLearnedRecencyScore(a);
    const scoreB = vocabLearnedRecencyScore(b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.id as number) - (a.id as number);
  });

  const safeLimit = Math.max(1, Math.floor(limit));
  return ranked.slice(0, safeLimit).map((entry) => entry.id as number);
}

export function buildQuickStartSessionPayload(ids: number[]) {
  const currentRound = shuffle(ids);
  return {
    sessionActive: true,
    queue: ids,
    currentRound,
    roundIndex: 0,
    currentId: currentRound[0] ?? null,
    flipped: false,
    streaks: new Map(ids.map((id) => [id, 0])),
    doneIds: new Set<number>(),
  };
}

