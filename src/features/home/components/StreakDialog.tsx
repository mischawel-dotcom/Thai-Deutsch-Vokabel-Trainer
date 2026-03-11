import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LearningStreakStats } from "@/hooks/useLearningStreakStats";
import { getStreakFooterText } from "../metrics";

type StreakDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streakStats: LearningStreakStats;
  learnedToday: number;
  dailyLimit: number;
};

export function StreakDialog({
  open,
  onOpenChange,
  streakStats,
  learnedToday,
  dailyLimit,
}: StreakDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Streak</DialogTitle>
          <DialogDescription>Deine Lernserie und Erfolge auf einen Blick.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Aktuelle Streak</div>
              <div className="text-2xl font-bold">{streakStats.streak}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Beste Streak</div>
              <div className="text-2xl font-bold">{streakStats.bestStreak}</div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground mb-2">Letzte 7 Tage</div>
            <div className="grid grid-cols-7 gap-1">
              {streakStats.recentActivityDays.map((day) => (
                <div
                  key={day.key}
                  className={`rounded-md border p-1 text-center text-[10px] ${
                    day.active
                      ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                      : "border-border bg-muted/40 text-muted-foreground"
                  } ${day.isToday ? "ring-1 ring-primary/60" : ""}`}
                  title={day.active ? "Lerntag" : "Kein Lerntag"}
                >
                  <div className="font-medium">{day.label}</div>
                  <div>{day.active ? "OK" : "-"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md border p-2">
              <div className="text-muted-foreground">Aktive Tage</div>
              <div className="text-base font-semibold">{streakStats.activeDaysLast7}/7</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-muted-foreground">Wiederholt</div>
              <div className="text-base font-semibold">{streakStats.reviewedCardsLast7}</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-muted-foreground">Gelernt</div>
              <div className="text-base font-semibold">{streakStats.masteredCardsLast7}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {getStreakFooterText(streakStats.todayLearned, learnedToday, dailyLimit)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

