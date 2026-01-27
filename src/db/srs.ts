import { db } from "./db";

export type Grade = 0 | 1 | 2 | 3;

type SrsProgress = {
  entryId: number;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number;
  lastGrade?: number;
  lastReviewed?: number;
  updatedAt: number;
};

const DAY = 24 * 60 * 60 * 1000;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function nextProgress(prev: SrsProgress | undefined, grade: Grade): SrsProgress {
  const now = Date.now();
  const p: SrsProgress = prev ?? {
    entryId: -1,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
    updatedAt: now,
  };

  let ease = p.ease;
  let repetitions = p.repetitions;
  let intervalDays = p.intervalDays;

  if (grade === 0) {
    repetitions = 0;
    intervalDays = 0;
    ease = clamp(ease - 0.2, 1.3, 3.0);
    return { ...p, ease, repetitions, intervalDays, dueAt: now + 10 * 60 * 1000, lastGrade: grade, updatedAt: now };
  }

  repetitions += 1;
  if (grade === 1) ease = clamp(ease - 0.05, 1.3, 3.0);
  if (grade === 3) ease = clamp(ease + 0.05, 1.3, 3.0);

  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = grade === 3 ? 4 : 3;
  else {
    const mult = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3;
    intervalDays = Math.max(1, Math.round(intervalDays * mult));
  }

  return { ...p, ease, repetitions, intervalDays, dueAt: now + intervalDays * DAY, lastGrade: grade, updatedAt: now };
}

export async function ensureProgress(entryId: number) {
  const existing = await db.table<SrsProgress, number>("progress").get(entryId);
  if (existing) return;
  const now = Date.now();
  await db.table<SrsProgress, number>("progress").put({
    entryId,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
    updatedAt: now,
  });
}

export async function gradeCard(entryId: number, grade: Grade) {
  const table = db.table<SrsProgress, number>("progress");
  const prev = await table.get(entryId);
  const next = nextProgress(prev, grade);
  next.entryId = entryId;
  next.lastReviewed = Date.now();
  await table.put(next);
}
