import { db } from "../db/db";
import { shuffle } from "../lib/shuffle";

type ProgressTableName = "progress" | "numbersProgress";

export function normalizeOptionalLimit(limit: number | undefined): number | undefined {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return undefined;
  }
  return Math.floor(limit);
}

export async function filterDueLearnedIds(
  learnedIds: number[],
  progressTable: ProgressTableName
): Promise<number[]> {
  const dueProgress = await db.table(progressTable).where("dueAt").belowOrEqual(Date.now()).toArray();
  const dueIds = new Set(
    dueProgress.map((p) => p.entryId).filter((id): id is number => typeof id === "number")
  );
  return learnedIds.filter((id) => dueIds.has(id));
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

