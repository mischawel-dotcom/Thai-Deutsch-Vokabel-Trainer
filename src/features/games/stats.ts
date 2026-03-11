export type DailyChallengeMetric = "games" | "correctAnswers" | "bestScore";

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  metric: DailyChallengeMetric;
  target: number;
};

export type GameStats = {
  totalXp: number;
  totalGames: number;
  totalCorrect: number;
  bestScore: number;
  badges: string[];
  daily: {
    date: string;
    games: number;
    correctAnswers: number;
    bestScore: number;
    challengeCompleted: boolean;
  };
};

const GAME_STATS_KEY = "gamesStats";

export const BADGE_LABELS: Record<string, string> = {
  first_game: "Erstes Spiel",
  score_100: "100+ Punkte",
  audio_pro: "Audio-Profi",
  daily_3: "Tages-Triplet (3 Spiele)",
};

export const DEFAULT_GAME_STATS: GameStats = {
  totalXp: 0,
  totalGames: 0,
  totalCorrect: 0,
  bestScore: 0,
  badges: [],
  daily: {
    date: "",
    games: 0,
    correctAnswers: 0,
    bestScore: 0,
    challengeCompleted: false,
  },
};

export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDailyChallenge(dateKey: string): DailyChallenge {
  const [, monthStr = "1", dayStr = "1"] = dateKey.split("-");
  const month = Number(monthStr) || 1;
  const day = Number(dayStr) || 1;
  const seed = (month * 31 + day) % 3;

  if (seed === 0) {
    return {
      id: "daily_games_2",
      title: "Tagesaufgabe: 2 Spiele",
      description: "Spiele heute 2 beliebige Runden.",
      metric: "games",
      target: 2,
    };
  }
  if (seed === 1) {
    return {
      id: "daily_correct_15",
      title: "Tagesaufgabe: 15 richtige",
      description: "Erreiche heute insgesamt 15 richtige Antworten.",
      metric: "correctAnswers",
      target: 15,
    };
  }
  return {
    id: "daily_score_80",
    title: "Tagesaufgabe: 80 Punkte",
    description: "Schaffe in einer Runde mindestens 80 Punkte.",
    metric: "bestScore",
    target: 80,
  };
}

export function getDailyChallengeProgress(challenge: DailyChallenge, daily: GameStats["daily"]): number {
  if (challenge.metric === "games") return daily.games;
  if (challenge.metric === "correctAnswers") return daily.correctAnswers;
  return daily.bestScore;
}

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(GAME_STATS_KEY);
    if (!raw) return DEFAULT_GAME_STATS;
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return {
      totalXp: Number(parsed.totalXp) || 0,
      totalGames: Number(parsed.totalGames) || 0,
      totalCorrect: Number(parsed.totalCorrect) || 0,
      bestScore: Number(parsed.bestScore) || 0,
      badges: Array.isArray(parsed.badges) ? parsed.badges.filter((b): b is string => typeof b === "string") : [],
      daily: {
        date: parsed.daily?.date ?? "",
        games: Number(parsed.daily?.games) || 0,
        correctAnswers: Number(parsed.daily?.correctAnswers) || 0,
        bestScore: Number(parsed.daily?.bestScore) || 0,
        challengeCompleted: Boolean(parsed.daily?.challengeCompleted),
      },
    };
  } catch {
    return DEFAULT_GAME_STATS;
  }
}

export function saveGameStats(stats: GameStats): void {
  localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
}

export function getLevel(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / 100) + 1;
}
