import { db } from "../db/db";
import type { SrsProgress, VocabEntry } from "../db/db";
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

/** Neueste Aktivität: Lernen (updatedAt) oder letzter Test (lastReviewed). */
export function vocabRecencyScore(entry: VocabEntry, progress?: SrsProgress): number {
  const updatedAt = typeof entry.updatedAt === "number" ? entry.updatedAt : 0;
  const lastReviewed = typeof progress?.lastReviewed === "number" ? progress.lastReviewed : 0;
  const progressUpdated = typeof progress?.updatedAt === "number" ? progress.updatedAt : 0;
  return Math.max(updatedAt, lastReviewed, progressUpdated);
}

/**
 * Gelernte Vokabeln nach letzter Aktivität, neueste zuerst, begrenzt auf `limit`.
 */
export async function selectRecentlyLearnedVocabIds(
  vocab: VocabEntry[],
  limit: number
): Promise<number[]> {
  const learned = vocab.filter((entry) => entry.viewed === true && typeof entry.id === "number");
  if (learned.length === 0) return [];

  const ids = learned.map((entry) => entry.id as number);
  const progressRows = await db.progress.bulkGet(ids);
  const progressById = new Map<number, SrsProgress>();
  progressRows.forEach((row, index) => {
    const id = ids[index];
    if (row && typeof id === "number") progressById.set(id, row);
  });

  const ranked = [...learned].sort((a, b) => {
    const scoreA = vocabRecencyScore(a, progressById.get(a.id as number));
    const scoreB = vocabRecencyScore(b, progressById.get(b.id as number));
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

