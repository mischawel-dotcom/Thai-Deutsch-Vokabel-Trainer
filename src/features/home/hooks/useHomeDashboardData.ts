import { useEffect, useMemo, useState } from "react";
import { db } from "@/db/db";
import { ensureProgressForEntries } from "@/db/srs";
import { getLessonProgress, migrateProgressFromDb } from "@/lib/lessonProgress";
import { useLearningStreakStats } from "@/hooks/useLearningStreakStats";
import {
  getDailyGoalProgress,
  getInitialDailyLimit,
  parseDailyLimit,
} from "../metrics";

export function useHomeDashboardData() {
  const initialDailyLimit = getInitialDailyLimit();
  const [dueCount, setDueCount] = useState<number>(initialDailyLimit);
  const [total, setTotal] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(initialDailyLimit);
  const [learnedToday, setLearnedToday] = useState<number>(0);
  const [numbersTotal, setNumbersTotal] = useState<number>(0);
  const [numbersMasteredFive, setNumbersMasteredFive] = useState<number>(0);
  const [numbersExamPassed, setNumbersExamPassed] = useState<boolean>(false);
  const [numbersExamBestScore, setNumbersExamBestScore] = useState<number | null>(null);
  const [lessons, setLessons] = useState<number[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<number, number>>({});
  const [lessonTotalCounts, setLessonTotalCounts] = useState<Record<number, number>>({});
  const [lessonTestPassedCounts, setLessonTestPassedCounts] = useState<Record<number, number>>({});
  const { streakStats, refreshStreakStats } = useLearningStreakStats();

  async function refreshDashboardStats() {
    const now = Date.now();
    const vocab = await db.vocab.count();

    const validLimit = parseDailyLimit(localStorage.getItem("dailyLimit"));
    setDailyLimit(validLimit);

    const todayStart = new Date().setHours(0, 0, 0, 0);
    // "Heutiges Lernziel" soll nur Karten zaehlen, die wirklich abgeschlossen sind (>=5 richtige Wiederholungen),
    // nicht bereits nach dem ersten richtigen Treffer.
    const masteredToday = await db.progress
      .where("lastReviewed")
      .above(todayStart)
      .and((p) => p.dueAt > now && p.lastGrade === 2 && p.repetitions >= 5)
      .count();
    setLearnedToday(masteredToday);

    const realDueCount = await db.progress.where("dueAt").belowOrEqual(now).count();
    const remainingDailyBudget = Math.max(0, validLimit - masteredToday);
    const dueToday = Math.min(realDueCount, remainingDailyBudget);
    setDueCount(dueToday);
    setTotal(vocab);

    const numberEntries = await db.numbersVocab.toArray();
    const numberIds = numberEntries
      .map((entry) => entry.id)
      .filter((id): id is number => typeof id === "number");
    setNumbersTotal(numberIds.length);
    if (numberIds.length > 0) {
      const numberProgress = await db.numbersProgress.bulkGet(numberIds);
      const masteredFive = numberProgress.filter(
        (progressItem) => progressItem && progressItem.repetitions >= 5
      ).length;
      setNumbersMasteredFive(masteredFive);
    } else {
      setNumbersMasteredFive(0);
    }

    const examPassed = localStorage.getItem("numbersExamPassed") === "true";
    const bestScoreRaw = localStorage.getItem("numbersExamBestScore");
    const bestScore = bestScoreRaw ? Number.parseInt(bestScoreRaw, 10) : NaN;
    setNumbersExamPassed(examPassed);
    setNumbersExamBestScore(Number.isFinite(bestScore) ? bestScore : null);

    await refreshStreakStats(now);
  }

  async function refreshLessonProgress() {
    const allVocab = await db.vocab.toArray();
    const groupedIdsByLesson: Record<number, number[]> = {};
    for (const entry of allVocab) {
      const lesson = entry.lesson ?? 0;
      const id = entry.id;
      if (!Number.isFinite(lesson) || lesson <= 0 || typeof id !== "number") continue;
      if (!groupedIdsByLesson[lesson]) groupedIdsByLesson[lesson] = [];
      groupedIdsByLesson[lesson].push(id);
    }
    const dynamicLessons = Object.keys(groupedIdsByLesson).map(Number).sort((a, b) => a - b);

    setLessons(dynamicLessons);
    if (dynamicLessons.length === 0) {
      setLessonProgress({});
      setLessonTotalCounts({});
      setLessonTestPassedCounts({});
      return;
    }

    const progressEntries = await Promise.all(
      dynamicLessons.map(async (lesson) => [lesson, await getLessonProgress(lesson)] as const)
    );
    setLessonProgress(Object.fromEntries(progressEntries) as Record<number, number>);

    const totalCountsByLesson: Record<number, number> = {};
    const testPassedByLesson: Record<number, number> = {};
    for (const lesson of dynamicLessons) {
      const ids = groupedIdsByLesson[lesson] ?? [];
      totalCountsByLesson[lesson] = ids.length;
      if (ids.length === 0) {
        testPassedByLesson[lesson] = 0;
        continue;
      }
      const progressRows = await db.progress.bulkGet(ids);
      testPassedByLesson[lesson] = progressRows.filter(
        (row) => row && typeof row.repetitions === "number" && row.repetitions >= 5
      ).length;
    }
    setLessonTotalCounts(totalCountsByLesson);
    setLessonTestPassedCounts(testPassedByLesson);
  }

  useEffect(() => {
    const run = async () => {
      await migrateProgressFromDb();

      const allVocab = await db.vocab.toArray();
      const allIds = allVocab
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(allIds);

      await refreshDashboardStats();
      await refreshLessonProgress();
    };
    void run();

    const refreshOnFocus = () => {
      void refreshDashboardStats();
      void refreshLessonProgress();
    };
    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshDashboardStats();
        void refreshLessonProgress();
      }
    };

    const interval = setInterval(() => {
      void refreshDashboardStats();
      void refreshLessonProgress();
    }, 15000);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisibility);
    };
  }, []);

  const progress = useMemo(
    () => getDailyGoalProgress(learnedToday, dailyLimit),
    [learnedToday, dailyLimit]
  );
  const dailyGoalReached = learnedToday >= dailyLimit;

  return {
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
    streakStats,
    progress,
    dailyGoalReached,
  };
}

