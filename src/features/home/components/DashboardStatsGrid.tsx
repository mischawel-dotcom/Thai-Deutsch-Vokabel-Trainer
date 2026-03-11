import { Card } from "@/components/ui/card";
import type { Route } from "../types";
import { getDailyGoalText } from "../metrics";

type DashboardStatsGridProps = {
  dueCount: number;
  dailyGoalReached: boolean;
  learnedToday: number;
  dailyLimit: number;
  progress: number;
  total: number;
  streak: number;
  numbersTotal: number;
  numbersMasteredFive: number;
  numbersExamPassed: boolean;
  numbersExamBestScore: number | null;
  onNavigate?: (route: Route) => void;
  onOpenStreak: () => void;
};

export function DashboardStatsGrid({
  dueCount,
  dailyGoalReached,
  learnedToday,
  dailyLimit,
  progress,
  total,
  streak,
  numbersTotal,
  numbersMasteredFive,
  numbersExamPassed,
  numbersExamBestScore,
  onNavigate,
  onOpenStreak,
}: DashboardStatsGridProps) {
  const numbersProgressPercent =
    numbersTotal > 0 ? Math.round((numbersMasteredFive / numbersTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        className="p-6 cursor-pointer hover:bg-accent transition-colors order-1 md:order-none"
        onClick={() => {
          if (dueCount > 0) {
            localStorage.setItem("autoStartLearnDue", "true");
            localStorage.setItem("autoStartLearnDueCount", String(dueCount));
          } else {
            localStorage.removeItem("autoStartLearnDue");
            localStorage.removeItem("autoStartLearnDueCount");
          }
          onNavigate?.("learn");
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Heute fällig (Tageslimit)</p>
            <p className="text-3xl font-bold mt-2">{dueCount}</p>
          </div>
          <div className="text-4xl">⭐</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {dailyGoalReached ? "Gut gemacht! 🎉" : "Los geht's!"}
        </p>
      </Card>

      <Card className="p-6 order-2 md:order-none">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Heutiges Lernziel</h3>
            <span className="text-sm text-muted-foreground">
              {learnedToday} / {dailyLimit} Karten
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {getDailyGoalText(learnedToday, dailyLimit, progress)}
          </p>
        </div>
      </Card>

      <button
        type="button"
        className="p-6 cursor-pointer hover:bg-accent transition-colors rounded-xl border bg-card text-card-foreground shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-primary order-3 md:order-none"
        onClick={() => onNavigate?.("list")}
        title="Alle Vokabeln anzeigen"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vokabeln</p>
            <p className="text-3xl font-bold mt-2">{total}</p>
          </div>
          <div className="text-4xl">📚</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Insgesamt im Wortschatz</p>
      </button>

      <Card
        className="p-6 order-4 md:order-none cursor-pointer hover:bg-accent transition-colors"
        onClick={onOpenStreak}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Streak</p>
            <p className="text-3xl font-bold mt-2">{streak}</p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {streak > 0 ? "Tage in Folge" : "Starte jetzt!"}
        </p>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:bg-accent transition-colors order-5 md:order-none"
        onClick={() => {
          localStorage.setItem("openNumbersLessonDialog", "true");
          onNavigate?.("learn");
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Zahlenlektion</p>
            <p className="text-3xl font-bold mt-2">🔢</p>
          </div>
          <div className="text-4xl">🧮</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Direkt zu Zahlen lernen</p>
        <div className="mt-3 space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${numbersProgressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {numbersMasteredFive}/{numbersTotal} Karten im Test bestanden
          </p>
          <p
            className={`text-xs font-semibold ${
              numbersExamPassed
                ? "text-green-700 dark:text-green-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {numbersExamPassed
              ? `✅ Zahlenexamen bestanden${
                  numbersExamBestScore !== null ? ` (${numbersExamBestScore}%)` : ""
                }`
              : `📝 Zahlenexamen offen${
                  numbersExamBestScore !== null ? ` (Bestscore ${numbersExamBestScore}%)` : ""
                }`}
          </p>
        </div>
      </Card>
    </div>
  );
}

