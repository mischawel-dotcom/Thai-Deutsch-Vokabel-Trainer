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
  const { streakStats, refreshStreakStats } = useLearningStreakStats();

  async function refreshDashboardStats() {
    const now = Date.now();
    const vocab = await db.vocab.count();

    const validLimit = parseDailyLimit(localStorage.getItem("dailyLimit"));
    setDailyLimit(validLimit);

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const masteredToday = await db.progress
      .where("lastReviewed")
      .above(todayStart)
      .and((p) => p.dueAt > now && p.lastGrade === 2)
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
    const lessonKeys = await db.vocab.orderBy("lesson").uniqueKeys();
    const dynamicLessons = lessonKeys
      .map((l) => Number(l))
      .filter((l) => Number.isFinite(l) && l > 0)
      .sort((a, b) => a - b);

    setLessons(dynamicLessons);
    if (dynamicLessons.length === 0) {
      setLessonProgress({});
      return;
    }

    const progressEntries = await Promise.all(
      dynamicLessons.map(async (lesson) => [lesson, await getLessonProgress(lesson)] as const)
    );
    setLessonProgress(Object.fromEntries(progressEntries) as Record<number, number>);
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
    numbersTotal,
    numbersMasteredFive,
    numbersExamPassed,
    numbersExamBestScore,
    streakStats,
    progress,
    dailyGoalReached,
  };
}

