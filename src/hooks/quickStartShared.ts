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

const DAY_MS = 24 * 60 * 60 * 1000;

export type DueFilterBreakdown = {
  learnedCount: number;
  eligibleCount: number;
  /** dueAt <= now und repetitions >= 5 */
  dueMastered: number;
  /** repetitions < 5 und dueAt noch in der Zukunft */
  unfinishedNotDue: number;
  /** repetitions < 5 und dueAt <= now */
  unfinishedAndDue: number;
  /** unter den Auswahlkarten: noch nie bewertet */
  neverReviewed: number;
  /** unter den Auswahlkarten: letzte Bewertung war falsch */
  lastGradeWrong: number;
  /** Median intervalDays der Auswahlkarten (oder null) */
  medianIntervalDays: number | null;
  /** Median ease der Auswahlkarten (oder null) */
  medianEase: number | null;
  /** Median Überfälligkeit in Tagen (nur dueAt <= now), oder null */
  medianDaysOverdue: number | null;
  /** Auswahlkarten mit repetitions >= 5 und intervalDays <= 1 (SRS-Feststecken) */
  stuckDailyInterval: number;
  repsZero: number;
  repsOneToFour: number;
  repsFivePlus: number;
};

function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/**
 * Zerlegt die Quick-Start-Auswahl „fällig oder <5×“ für Diagnose.
 * Betrifft nur gelernte Karten (`learnedIds`).
 */
export async function analyzeDueOrUnfinishedLearned(
  learnedIds: number[],
  progressTable: ProgressTableName = "progress"
): Promise<DueFilterBreakdown> {
  const now = Date.now();
  const learnedSet = new Set(learnedIds);
  const progressRows = await db.table(progressTable).toArray();

  let dueMastered = 0;
  let unfinishedNotDue = 0;
  let unfinishedAndDue = 0;
  let neverReviewed = 0;
  let lastGradeWrong = 0;
  let stuckDailyInterval = 0;
  let repsZero = 0;
  let repsOneToFour = 0;
  let repsFivePlus = 0;
  const intervalSamples: number[] = [];
  const easeSamples: number[] = [];
  const overdueDaySamples: number[] = [];
  const sampleRows: Array<{
    entryId: number;
    repetitions: number;
    intervalDays: number;
    ease: number;
    daysOverdue: number;
    lastGrade: number | null;
    hasReviewed: boolean;
  }> = [];

  for (const row of progressRows) {
    const entryId = row.entryId;
    if (typeof entryId !== "number" || !learnedSet.has(entryId)) continue;

    const dueAt = typeof row.dueAt === "number" ? row.dueAt : Number.POSITIVE_INFINITY;
    const repetitions = typeof row.repetitions === "number" ? row.repetitions : 0;
    const intervalDays = typeof row.intervalDays === "number" ? row.intervalDays : 0;
    const ease = typeof row.ease === "number" ? row.ease : 2.5;
    const isDue = dueAt <= now;
    const unfinished = repetitions < 5;
    if (!isDue && !unfinished) continue;

    if (isDue && !unfinished) dueMastered += 1;
    else if (!isDue && unfinished) unfinishedNotDue += 1;
    else unfinishedAndDue += 1;

    if (repetitions <= 0) repsZero += 1;
    else if (repetitions < 5) repsOneToFour += 1;
    else repsFivePlus += 1;

    if (repetitions >= 5 && intervalDays <= 1) stuckDailyInterval += 1;

    const hasReviewed = typeof row.lastReviewed === "number" && row.lastReviewed > 0;
    if (!hasReviewed) neverReviewed += 1;
    if (row.lastGrade === 0) lastGradeWrong += 1;

    intervalSamples.push(intervalDays);
    easeSamples.push(ease);
    const daysOverdue = isDue ? Math.max(0, (now - dueAt) / DAY_MS) : 0;
    if (isDue) overdueDaySamples.push(daysOverdue);

    sampleRows.push({
      entryId,
      repetitions,
      intervalDays,
      ease,
      daysOverdue,
      lastGrade: typeof row.lastGrade === "number" ? row.lastGrade : null,
      hasReviewed,
    });
  }

  const eligibleCount = dueMastered + unfinishedNotDue + unfinishedAndDue;
  const breakdown: DueFilterBreakdown = {
    learnedCount: learnedIds.length,
    eligibleCount,
    dueMastered,
    unfinishedNotDue,
    unfinishedAndDue,
    neverReviewed,
    lastGradeWrong,
    medianIntervalDays: medianOf(intervalSamples),
    medianEase: medianOf(easeSamples),
    medianDaysOverdue: medianOf(overdueDaySamples),
    stuckDailyInterval,
    repsZero,
    repsOneToFour,
    repsFivePlus,
  };

  const topOverdue = [...sampleRows]
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 8);
  // Für Remote-Diagnose: in DevTools unter „SRS-Diagnose“ sichtbar.
  console.info("[SRS-Diagnose] Fällige-Karten-Aufschlüsselung", {
    ...breakdown,
    topOverdue,
  });

  return breakdown;
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

