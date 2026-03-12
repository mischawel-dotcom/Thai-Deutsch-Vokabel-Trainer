import { db } from "../db/db";
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

