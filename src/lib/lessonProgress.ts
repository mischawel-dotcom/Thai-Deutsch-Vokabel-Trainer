/**
 * Lesson progress tracking utilities
 * Progress system:
 * - 0-100%: Learning progress (cards reviewed in Learn page / Test page)
 * - 100%: Ready for Exam
 * - 85%+ on Exam: Lesson fully completed and passed
 */

export interface LessonProgress {
  lesson: number;
  progress: number; // 0-100%
  completed: boolean; // true if exam passed with 85%+
  examScore: number | null; // Exam score if taken
  readyForExam: boolean; // true if progress = 100%
  requiresExam: boolean; // true if progress = 100% but exam not passed yet
}

/**
 * Get progress percentage for a specific lesson (0-100)
 * Calculated dynamically from DB (viewed / total in lesson).
 */
export async function getLessonProgress(lesson: number): Promise<number> {
  const { db } = await import("../db/db");
  const totalCards = await db.vocab.where("lesson").equals(lesson).count();
  if (totalCards === 0) return 0;

  const viewedCards = await db.vocab
    .where("lesson")
    .equals(lesson)
    .and((v) => v.viewed === true)
    .count();

  return Math.round((viewedCards / totalCards) * 100);
}

/**
 * Recalculate learning progress based on actual reviewed cards in the DB
 * Use this to verify or fix progress calculations
 */
export async function recalculateLearningProgress(
  lesson: number,
  reviewedCardsInLesson: number
): Promise<void> {
  const { db } = await import("../db/db");
  const totalCards = await db.vocab.where("lesson").equals(lesson).count();
  if (totalCards === 0) {
    localStorage.setItem(`lessonProgress_${lesson}`, "0");
    return;
  }

  // Keep cached value for legacy/debug screens; source of truth is DB.
  const progress = Math.round((reviewedCardsInLesson / totalCards) * 100);
  localStorage.setItem(`lessonProgress_${lesson}`, String(progress));
}

/**
 * Migrate old cumulative progress to actual progress (one-time fix)
 */
export async function migrateProgressFromDb(): Promise<void> {
  const { db } = await import("../db/db");

  try {
    for (const lesson of [1, 2, 3, 4, 5]) {
      // Count actual reviewed cards in this lesson
      const viewedCount = await db.vocab
        .where("lesson")
        .equals(lesson)
        .and((v) => v.viewed === true)
        .count();
      
      // Recalculate progress based on actual data
      await recalculateLearningProgress(lesson, viewedCount);
    }
  } catch (err) {
    console.error("Progress migration failed:", err);
  }
}

/**
 * Complete lesson via Exam (set to 100%)
 * Only if exam score >= 85%
 */
export function completeLessonViaExam(lesson: number, examScore: number): void {
  if (examScore >= 85) {
    localStorage.setItem(`lessonProgress_${lesson}`, "100");
    localStorage.setItem(`lessonCompleted_${lesson}`, "true");
    localStorage.setItem(`lessonExamScore_${lesson}`, String(examScore));
  }
}

/**
 * Get exam score for a specific lesson
 */
export function getLessonExamScore(lesson: number): number | null {
  const scoreStr = localStorage.getItem(`lessonExamScore_${lesson}`);
  return scoreStr ? parseInt(scoreStr, 10) : null;
}

