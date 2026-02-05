import { useEffect, useState } from "react";
import { db } from "../db/db";
import { ensureProgress } from "../db/srs";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLessonProgress, getLessonExamScore, migrateProgressFromDb } from "../lib/lessonProgress";

type Route = "home" | "list" | "learn" | "test" | "exam" | "settings";

interface HomeProps {
  onNavigate?: (route: Route) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  // Initialize dailyLimit from localStorage for better initial state
  const getInitialDailyLimit = (): number => {
    const saved = localStorage.getItem("dailyLimit");
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0) return num;
    }
    return 30;
  };

  const initialDailyLimit = getInitialDailyLimit();
  const [dueCount, setDueCount] = useState<number>(initialDailyLimit);
  const [total, setTotal] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(initialDailyLimit);
  const [learnedToday, setLearnedToday] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lessonProgress, setLessonProgress] = useState<Record<number, number>>({});
  const [streakDialogOpen, setStreakDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      // Migration: Neu-berechne alte Fortschrittswerte
      await migrateProgressFromDb();
      
      // Ensure all vocab has progress records before querying
      const allVocab = await db.vocab.toArray();
      for (const v of allVocab) {
        if (v.id) {
          await ensureProgress(v.id);
        }
      }
      
      const now = Date.now();
      const vocab = await db.vocab.count();
      
      // Read daily limit from localStorage (default: 30)
      const savedLimit = localStorage.getItem("dailyLimit");
      const limit = savedLimit ? parseInt(savedLimit, 10) : 30;
      const validLimit = !isNaN(limit) && limit > 0 ? limit : 30;
      setDailyLimit(validLimit);

      // Calculate learned today: only cards mastered (dueAt moved to future after correct streak)
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const masteredToday = await db.progress
        .where("lastReviewed")
        .above(todayStart)
        .and((p) => p.dueAt > now && p.lastGrade === 2)
        .count();
      setLearnedToday(masteredToday);
      
      // Heute fällig: gleicher Countdown wie Heutiges Lernziel
      const remainingToday = Math.max(0, validLimit - masteredToday);
      setDueCount(remainingToday);
      setTotal(vocab);

      // Calculate streak (consecutive days with reviews)
      const lastStreak = localStorage.getItem("learningStreak");
      setStreak(lastStreak ? parseInt(lastStreak, 10) : 0);

      // Load lesson progress for all lessons
      const progress: Record<number, number> = {};
      for (let i = 1; i <= 5; i++) {
        progress[i] = getLessonProgress(i);
      }
      setLessonProgress(progress);

    };
    run();

    // Aktualisiere Lektionen-Fortschritt regelmäßig (z.B. wenn User von Test zurück kommt)
    const interval = setInterval(async () => {
      const progress: Record<number, number> = {};
      for (let i = 1; i <= 5; i++) {
        progress[i] = getLessonProgress(i);
      }
      setLessonProgress(progress);
    }, 1000); // Alle 1 Sekunde

    return () => clearInterval(interval);
  }, []);

  const progress = dailyLimit > 0 ? Math.min((learnedToday / dailyLimit) * 100, 100) : 0;
  const dailyGoalReached = learnedToday >= dailyLimit;

  return (


    <div className="space-y-6">
      {/* Version-Check Indicator */}
      <div className="text-3xl font-bold text-red-600">66</div>
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Thai Vokabeltrainer</h1>
        <p className="text-muted-foreground">
          Willkommen zurück! Bereit für deine nächste Lernsession?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heute fällig */}
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
              <p className="text-sm font-medium text-muted-foreground">Heute fällig</p>
              <p className="text-3xl font-bold mt-2">{dueCount}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {dailyGoalReached ? "Gut gemacht! 🎉" : "Los geht's!"}
          </p>
        </Card>

        {/* Heutiges Lernziel */}
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
              {learnedToday > dailyLimit
                ? "💪 Extra-Meile gegangen! Top!"
                : progress >= 100
                  ? "🎯 Tagesziel erreicht! Hervorragend!"
                  : `Noch ${dailyLimit - learnedToday} Karten bis zum Tagesziel`}
            </p>
          </div>
        </Card>

        {/* Vokabeln */}
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
          <p className="text-xs text-muted-foreground mt-3">
            Insgesamt im Wortschatz
          </p>
        </button>

        {/* Streak */}
        <Card
          className="p-6 order-4 md:order-none cursor-pointer hover:bg-accent transition-colors"
          onClick={() => setStreakDialogOpen(true)}
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
      </div>

      <Dialog open={streakDialogOpen} onOpenChange={setStreakDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Streak</DialogTitle>
            <DialogDescription>
              Deine aktuelle Lernserie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Aktuelle Streak</div>
              <div className="text-2xl font-bold">{streak} Tage</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Lerne täglich, um deine Serie zu halten.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Progress Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Lektionen-Fortschritt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((lesson) => {
            const prog = lessonProgress[lesson] ?? 0;
            const examScore = getLessonExamScore(lesson);
            const examPassed = examScore !== null && examScore >= 85;
            const requiresExam = prog === 100 && !examPassed;

            let statusIcon = "📖";
            let statusColor = "bg-gray-100 dark:bg-gray-800";
            let statusText = `${Math.round(prog)}% gelernt`;

            if (examPassed) {
              // Exam passed - fully completed
              statusIcon = "✅";
              statusColor = "bg-green-100 dark:bg-green-900";
              statusText = "🎓 Bestanden!";
            } else if (requiresExam) {
              // Learning complete - exam required
              statusIcon = "⚠️";
              statusColor = "bg-amber-100 dark:bg-amber-900";
              statusText = `📝 Examen erforderlich!`;
            } else if (prog === 100) {
              // Learning complete
              statusIcon = "🎯";
              statusColor = "bg-blue-100 dark:bg-blue-900";
              statusText = "100% gelernt";
            }

            return (
              <button
                key={lesson}
                type="button"
                className={`p-4 ${statusColor} transition-all cursor-pointer hover:shadow-md rounded-xl border bg-card text-card-foreground shadow-sm text-left`}
                onClick={() => {
                  // Prüfe, ob es ungelernte Karten in dieser Lektion gibt
                  import("../db/db").then(async ({ db }) => {
                    const total = await db.vocab.where("lesson").equals(lesson).count();
                    const learned = await db.vocab.where("lesson").equals(lesson).and(v => v.viewed === true).count();
                    if (learned < total) {
                      // Es gibt noch ungelernte Karten → Weiterleitung zu Lernen/Lektion X
                      localStorage.setItem("selectedLessonForLearn", String(lesson));
                      onNavigate?.("learn");
                      window.location.hash = `#learn`;
                      window.dispatchEvent(new CustomEvent("appNavigate", { detail: "learn" }));
                    } else {
                      // Alles gelernt → Weiterleitung zu Test/Lektion X oder Examen
                      const target = requiresExam ? "exam" : "test";
                      if (!requiresExam) {
                        localStorage.setItem("selectedLessonForTest", String(lesson));
                      }
                      onNavigate?.(target);
                      window.location.hash = `#${target}`;
                      window.dispatchEvent(new CustomEvent("appNavigate", { detail: target }));
                    }
                  });
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Lektion {lesson}</h4>
                  <span className="text-2xl">{statusIcon}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${prog}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {statusText}
                </p>
                {requiresExam && (
                  <p className="text-xs text-amber-700 dark:text-amber-200 mt-2 font-semibold">
                    👉 Klicken zum Examen starten
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          size="lg"
          className="h-20 text-lg font-semibold"
          disabled={dueCount === 0}
          onClick={() => onNavigate?.("learn")}
        >
          🎯 Jetzt lernen ({dueCount})
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-20 text-lg font-semibold"
          onClick={() => onNavigate?.("list")}
        >
          📝 Alle Vokabeln anzeigen
        </Button>
      </div>

      {/* Motivation Message */}
      {dueCount > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-center">
            💪 <strong>Tipp:</strong> Kurze, regelmäßige Sessions sind
            effektiver als lange Pausen!
          </p>
        </Card>
      )}
    </div>
  );
}