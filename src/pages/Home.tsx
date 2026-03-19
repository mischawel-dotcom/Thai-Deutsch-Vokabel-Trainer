import { useState } from "react";
import {
  DashboardStatsGrid,
  StreakDialog,
  LessonProgressSection,
  MotivationCard,
  useHomeDashboardData,
  useHomeLessonNavigation,
} from "../features/home";
import type { HomeProps } from "../features/home";

export default function Home({ onNavigate }: HomeProps) {
  const [streakDialogOpen, setStreakDialogOpen] = useState<boolean>(false);
  const {
    dueCount,
    total,
    dailyLimit,
    learnedToday,
    lessons,
    lessonProgress,
    lessonTotalCounts,
    lessonTestPassedCounts,
    numbersTotal,
    numbersMasteredFive,
    numbersExamPassed,
    numbersExamBestScore,
    sentenceTotal,
    sentenceUnlocked,
    sentenceUnlockedLearned,
    streakStats,
    progress,
    dailyGoalReached,
  } = useHomeDashboardData();
  const { handleLessonClick } = useHomeLessonNavigation({ onNavigate });

  return (


    <div className="space-y-6">
      {/* Version-Check Indicator */}
      <div className="text-3xl font-bold text-red-600">323</div>
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Thai Vokabeltrainer</h1>
        <p className="text-muted-foreground">
          Willkommen zurück! Bereit für deine nächste Lernsession?
        </p>
      </div>

      <DashboardStatsGrid
        dueCount={dueCount}
        dailyGoalReached={dailyGoalReached}
        learnedToday={learnedToday}
        dailyLimit={dailyLimit}
        progress={progress}
        total={total}
        streak={streakStats.streak}
        numbersTotal={numbersTotal}
        numbersMasteredFive={numbersMasteredFive}
        numbersExamPassed={numbersExamPassed}
        numbersExamBestScore={numbersExamBestScore}
        sentenceUnlocked={sentenceUnlocked}
        sentenceTotal={sentenceTotal}
        sentenceUnlockedLearned={sentenceUnlockedLearned}
        onNavigate={onNavigate}
        onOpenStreak={() => setStreakDialogOpen(true)}
      />

      <StreakDialog
        open={streakDialogOpen}
        onOpenChange={setStreakDialogOpen}
        streakStats={streakStats}
        learnedToday={learnedToday}
        dailyLimit={dailyLimit}
      />

      <LessonProgressSection
        lessons={lessons}
        lessonProgress={lessonProgress}
        lessonTotalCounts={lessonTotalCounts}
        lessonTestPassedCounts={lessonTestPassedCounts}
        onLessonClick={handleLessonClick}
      />

      <MotivationCard dueCount={dueCount} />
    </div>
  );
}