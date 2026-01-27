/**
 * Lesson progress tracking utilities
 * Progress system:
 * - 0-75%: Learning progress (cards reviewed in Learn page)
 * - 75%: Ready for Exam
 * - 85%+ on Exam: Lesson complete (100%)
 */

export interface LessonProgress {
  lesson: number;
  progress: number; // 0-100%
  completed: boolean; // true if progress = 100%
  examScore: number | null; // Exam score if taken
  readyForExam: boolean; // true if progress >= 75%
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
 * Update learning progress for a lesson (max 75%)
 * Called from Learn page when cards are reviewed
 */
export function updateLearningProgress(lesson: number, cardsReviewed: number): void {
  const totalCards = LESSON_SIZES[lesson] ?? 100;
  const currentProgress = getLessonProgress(lesson);
  
  // Don't update if already at exam level (75%+)
  if (currentProgress >= 75) return;
  
  // Calculate new progress: (reviewed / total) * 75%
  const learnProgress = Math.min((cardsReviewed / totalCards) * 75, 75);
  const newProgress = Math.max(currentProgress, Math.round(learnProgress));
  
  localStorage.setItem(`lessonProgress_${lesson}`, String(newProgress));
}

/**
 * Increment learning progress by number of cards just reviewed
 * More granular than recalculating from scratch
 */
export function incrementLearningProgress(lesson: number, cardsJustReviewed: number): void {
  const totalCards = LESSON_SIZES[lesson] ?? 100;
  const currentProgress = getLessonProgress(lesson);
  
  // Don't update if already at exam level (75%+)
  if (currentProgress >= 75) return;
  
  // Add progress for these cards (each card = (1/total) * 75%)
  const increment = (cardsJustReviewed / totalCards) * 75;
  const newProgress = Math.min(Math.round(currentProgress + increment), 75);
  
  localStorage.setItem(`lessonProgress_${lesson}`, String(newProgress));
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
 * Check if lesson is ready for exam (≥75% progress)
 */
export function isReadyForExam(lesson: number): boolean {
  return getLessonProgress(lesson) >= 75;
}

/**
 * Get all lesson progress data
 */
export function getLessonProgressList(): LessonProgress[] {
  const lessons = [1, 2, 3, 4, 5];
  return lessons.map((lesson) => {
    const progress = getLessonProgress(lesson);
    return {
      lesson,
      progress,
      completed: progress === 100,
      examScore: getLessonExamScore(lesson),
      readyForExam: progress >= 75,
    };
  });
}

/**
 * Get the next incomplete lesson (first one not at 100%)
 * Returns null if all lessons are completed
 */
export function getNextLesson(): number | null {
  const lessons = [1, 2, 3, 4, 5];
  for (const lesson of lessons) {
    if (getLessonProgress(lesson) < 100) {
      return lesson;
    }
  }
  return null; // All lessons completed
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
