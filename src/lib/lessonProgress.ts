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

// Total vocab cards per lesson (from CSV)
const LESSON_SIZES: Record<number, number> = {
  1: 90,
  2: 78,
  3: 78,
  4: 123,
  5: 131,
};

/**
 * Get progress percentage for a specific lesson (0-100)
 */
export function getLessonProgress(lesson: number): number {
  const progressStr = localStorage.getItem(`lessonProgress_${lesson}`);
  return progressStr ? parseInt(progressStr, 10) : 0;
}

/**
 * Update learning progress for a lesson (max 100%)
 * Called from Learn page when cards are reviewed
 */
export function updateLearningProgress(lesson: number, cardsReviewed: number): void {
  const totalCards = LESSON_SIZES[lesson] ?? 100;
  const currentProgress = getLessonProgress(lesson);
  
  // Calculate progress: (reviewed / total) * 100%
  const learnProgress = Math.min((cardsReviewed / totalCards) * 100, 100);
  const newProgress = Math.max(currentProgress, Math.round(learnProgress));
  
  localStorage.setItem(`lessonProgress_${lesson}`, String(newProgress));
}

/**
 * Increment learning progress by number of cards just reviewed
 * More granular than recalculating from scratch
 * NOTE: This only adds incremental progress for new unique card reviews
 */
export function incrementLearningProgress(lesson: number, cardsJustReviewed: number): void {
  const totalCards = LESSON_SIZES[lesson] ?? 100;
  const currentProgress = getLessonProgress(lesson);
  
  // Add progress for these cards (each card = (1/total) * 100%)
  const increment = (cardsJustReviewed / totalCards) * 100;
  const newProgress = Math.min(Math.round(currentProgress + increment), 100);
  
  localStorage.setItem(`lessonProgress_${lesson}`, String(newProgress));
}

/**
 * Recalculate learning progress based on actual reviewed cards in the DB
 * Use this to verify or fix progress calculations
 */
export function recalculateLearningProgress(lesson: number, reviewedCardsInLesson: number): void {
  const totalCards = LESSON_SIZES[lesson] ?? 100;
  
  // Calculate progress based on actual reviewed cards: (reviewed / total) * 100%
  const progress = Math.round((reviewedCardsInLesson / totalCards) * 100);
  
  localStorage.setItem(`lessonProgress_${lesson}`, String(progress));
}

/**
 * Migrate old cumulative progress to actual progress (one-time fix)
 */
export async function migrateProgressFromDb(): Promise<void> {
  const { db } = await import("../db/db");
  
  const migrationDone = localStorage.getItem("progressMigrationDone_v3");
  if (migrationDone) return; // Already migrated
  
  try {
    for (const lesson of [1, 2, 3, 4, 5]) {
      // Count actual reviewed cards in this lesson
      const viewedCount = await db.vocab
        .where("lesson")
        .equals(lesson)
        .and((v) => v.viewed === true)
        .count();
      
      // Recalculate progress based on actual data
      recalculateLearningProgress(lesson, viewedCount);
    }
    
    localStorage.setItem("progressMigrationDone_v3", "true");
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
 * Check if a specific lesson is completed (100%)
 */
export function isLessonCompleted(lesson: number): boolean {
  return getLessonProgress(lesson) === 100;
}

/**
 * Get exam score for a specific lesson
 */
export function getLessonExamScore(lesson: number): number | null {
  const scoreStr = localStorage.getItem(`lessonExamScore_${lesson}`);
  return scoreStr ? parseInt(scoreStr, 10) : null;
}

/**
 * Check if lesson is ready for exam (= 100% progress)
 */
export function isReadyForExam(lesson: number): boolean {
  return getLessonProgress(lesson) === 100;
}

/**
 * Check if exam has been passed (85%+ score)
 */
export function isExamPassed(lesson: number): boolean {
  const score = getLessonExamScore(lesson);
  return score !== null && score >= 85;
}

/**
 * Check if lesson requires exam (100% progress but exam not passed yet)
 */
export function requiresExam(lesson: number): boolean {
  return isReadyForExam(lesson) && !isExamPassed(lesson);
}

/**
 * Get all lesson progress data
 */
export function getLessonProgressList(): LessonProgress[] {
  const lessons = [1, 2, 3, 4, 5];
  return lessons.map((lesson) => {
    const progress = getLessonProgress(lesson);
    const examScore = getLessonExamScore(lesson);
    const examPassed = examScore !== null && examScore >= 85;
    return {
      lesson,
      progress,
      completed: examPassed, // Only completed if exam passed
      examScore,
      readyForExam: progress === 100,
      requiresExam: progress === 100 && !examPassed,
    };
  });
}

/**
 * Get the next incomplete lesson (first one not fully completed with exam passed)
 * Returns null if all lessons are completed
 */
export function getNextLesson(): number | null {
  const lessons = [1, 2, 3, 4, 5];
  for (const lesson of lessons) {
    const progress = getLessonProgress(lesson);
    const examScore = getLessonExamScore(lesson);
    const examPassed = examScore !== null && examScore >= 85;
    // Not complete if: learning not done OR exam not passed
    if (progress < 100 || !examPassed) {
      return lesson;
    }
  }
  return null; // All lessons completed with exams passed
}

/**
 * Get completion statistics
 */
export function getLessonStats(): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = 5;
  const completed = getLessonProgressList().filter((l) => l.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}
