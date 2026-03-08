import { useCallback, useState } from "react";
import { db } from "../db/db";

export type RecentActivityDay = {
  key: number;
  label: string;
  active: boolean;
  isToday: boolean;
};

export type LearningStreakStats = {
  streak: number;
  bestStreak: number;
  todayLearned: boolean;
  activeDaysLast7: number;
  reviewedCardsLast7: number;
  masteredCardsLast7: number;
  recentActivityDays: RecentActivityDay[];
};

const EMPTY_STREAK_STATS: LearningStreakStats = {
  streak: 0,
  bestStreak: 0,
  todayLearned: false,
  activeDaysLast7: 0,
  reviewedCardsLast7: 0,
  masteredCardsLast7: 0,
  recentActivityDays: [],
};

export function useLearningStreakStats() {
  const [stats, setStats] = useState<LearningStreakStats>(EMPTY_STREAK_STATS);

  const refreshStreakStats = useCallback(async (nowMs: number = Date.now()) => {
    const reviewed = await db.progress.where("lastReviewed").above(0).toArray();
    const reviewedDayStarts = new Set<number>();
    for (const item of reviewed) {
      if (typeof item.lastReviewed === "number" && item.lastReviewed > 0) {
        reviewedDayStarts.add(new Date(item.lastReviewed).setHours(0, 0, 0, 0));
      }
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const todayStart = new Date(nowMs).setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - oneDayMs;
    const startDay = reviewedDayStarts.has(todayStart)
      ? todayStart
      : reviewedDayStarts.has(yesterdayStart)
        ? yesterdayStart
        : null;

    let computedStreak = 0;
    if (startDay !== null) {
      let cursor = startDay;
      while (reviewedDayStarts.has(cursor)) {
        computedStreak += 1;
        cursor -= oneDayMs;
      }
    }

    const sortedDays = Array.from(reviewedDayStarts).sort((a, b) => a - b);
    let runningBest = 0;
    let runningCurrent = 0;
    let prevDay: number | null = null;
    for (const day of sortedDays) {
      if (prevDay !== null && day - prevDay === oneDayMs) {
        runningCurrent += 1;
      } else {
        runningCurrent = 1;
      }
      runningBest = Math.max(runningBest, runningCurrent);
      prevDay = day;
    }

    const storedBestRaw = localStorage.getItem("bestLearningStreak");
    const storedBest = storedBestRaw ? parseInt(storedBestRaw, 10) : 0;
    const computedBestStreak = Math.max(runningBest, Number.isFinite(storedBest) ? storedBest : 0);

    const weekStart = todayStart - 6 * oneDayMs;
    const recent = Array.from({ length: 7 }, (_, idx): RecentActivityDay => {
      const dayStart = weekStart + idx * oneDayMs;
      const date = new Date(dayStart);
      const weekdayShort = date.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
      return {
        key: dayStart,
        label: weekdayShort,
        active: reviewedDayStarts.has(dayStart),
        isToday: dayStart === todayStart,
      };
    });

    const reviewedInLast7 = reviewed.filter(
      (item) => typeof item.lastReviewed === "number" && item.lastReviewed >= weekStart
    ).length;
    const masteredInLast7 = reviewed.filter(
      (item) =>
        typeof item.lastReviewed === "number" &&
        item.lastReviewed >= weekStart &&
        item.lastGrade === 2 &&
        item.dueAt > nowMs
    ).length;

    const nextStats: LearningStreakStats = {
      streak: computedStreak,
      bestStreak: computedBestStreak,
      todayLearned: reviewedDayStarts.has(todayStart),
      activeDaysLast7: recent.filter((day) => day.active).length,
      reviewedCardsLast7: reviewedInLast7,
      masteredCardsLast7: masteredInLast7,
      recentActivityDays: recent,
    };

    setStats(nextStats);
    localStorage.setItem("learningStreak", String(computedStreak));
    localStorage.setItem("bestLearningStreak", String(computedBestStreak));
    return nextStats;
  }, []);

  return {
    streakStats: stats,
    refreshStreakStats,
  };
}
