export function getInitialDailyLimit(): number {
  const saved = localStorage.getItem("dailyLimit");
  if (!saved) return 10;
  const parsed = parseInt(saved, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

export function parseDailyLimit(rawValue: string | null): number {
  const parsed = rawValue ? parseInt(rawValue, 10) : 10;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

export function getDailyGoalProgress(learnedToday: number, dailyLimit: number): number {
  if (dailyLimit <= 0) return 0;
  return Math.min((learnedToday / dailyLimit) * 100, 100);
}

export function getDailyGoalText(
  learnedToday: number,
  dailyLimit: number,
  progress: number
): string {
  if (learnedToday > dailyLimit) return "💪 Extra-Meile gegangen! Top!";
  if (progress >= 100) return "🎯 Tagesziel erreicht! Hervorragend!";
  return `Noch ${dailyLimit - learnedToday} Karten bis zum Tagesziel`;
}

export function getStreakFooterText(
  todayLearned: boolean,
  learnedToday: number,
  dailyLimit: number
): string {
  if (todayLearned) return "Stark! Heute ist erledigt, deine Serie bleibt aktiv.";
  if (learnedToday >= dailyLimit) return "Tagesziel erreicht. Deine Serie bleibt heute gesichert.";
  return `Noch ${Math.max(0, dailyLimit - learnedToday)} Karte(n) bis zum heutigen Lernziel.`;
}

export function getLessonStatus(progress: number, examScore: number | null) {
  const examPassed = examScore !== null && examScore >= 85;
  const requiresExam = progress === 100 && !examPassed;

  if (examPassed) {
    return {
      statusIcon: "✅",
      statusColor: "bg-green-100 dark:bg-green-900",
      statusText: "🎓 Bestanden!",
      requiresExam,
    };
  }
  if (requiresExam) {
    return {
      statusIcon: "⚠️",
      statusColor: "bg-amber-100 dark:bg-amber-900",
      statusText: "📝 Examen erforderlich!",
      requiresExam,
    };
  }
  if (progress === 100) {
    return {
      statusIcon: "🎯",
      statusColor: "bg-blue-100 dark:bg-blue-900",
      statusText: "100% gelernt",
      requiresExam,
    };
  }

  return {
    statusIcon: "📖",
    statusColor: "bg-gray-100 dark:bg-gray-800",
    statusText: `${Math.round(progress)}% gelernt`,
    requiresExam,
  };
}

