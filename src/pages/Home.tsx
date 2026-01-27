import { useEffect, useState } from "react";
import { db } from "../db/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLessonProgress } from "../lib/lessonProgress";

type Route = "home" | "list" | "learn" | "exam" | "settings";

interface HomeProps {
  onNavigate?: (route: Route) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [dueCount, setDueCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(30);
  const [learnedToday, setLearnedToday] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lessonProgress, setLessonProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    const run = async () => {
      const now = Date.now();
      const allDue = await db.progress.where("dueAt").belowOrEqual(now).toArray();
      const vocab = await db.vocab.count();
      
      // Read daily limit from localStorage (default: 30)
      const savedLimit = localStorage.getItem("dailyLimit");
      const limit = savedLimit ? parseInt(savedLimit, 10) : 30;
      const validLimit = !isNaN(limit) && limit > 0 ? limit : 30;
      setDailyLimit(validLimit);
      
      // Begrenze auf das gesetzte Limit
      const limited = Math.min(allDue.length, validLimit);
      setDueCount(limited);
      setTotal(vocab);

      // Calculate learned today (cards reviewed today)
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const reviewedToday = await db.progress
        .where("lastReviewed")
        .above(todayStart)
        .count();
      setLearnedToday(reviewedToday);

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
  }, []);

  const progress = dailyLimit > 0 ? Math.min((learnedToday / dailyLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Thai Vokabeltrainer</h1>
        <p className="text-muted-foreground">
          Willkommen zurück! Bereit für deine nächste Lernsession?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Due Cards */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Heute fällig</p>
              <p className="text-3xl font-bold mt-2">{dueCount}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {dueCount > 0 ? "Los geht's!" : "Alles geschafft! 🎉"}
          </p>
        </Card>

        {/* Total Vocabulary */}
        <Card className="p-6">
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
        </Card>

        {/* Learning Streak */}
        <Card className="p-6">
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

      {/* Daily Progress */}
      <Card className="p-6">
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
            {progress >= 100
              ? "🎯 Tagesziel erreicht! Hervorragend!"
              : `Noch ${dailyLimit - learnedToday} Karten bis zum Tagesziel`}
          </p>
        </div>
      </Card>

      {/* Lesson Progress Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Lektionen-Fortschritt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((lesson) => {
            const prog = lessonProgress[lesson] ?? 0;
            let statusIcon = "📖";
            let statusColor = "bg-gray-100 dark:bg-gray-800";

            if (prog >= 100) {
              statusIcon = "✅";
              statusColor = "bg-green-100 dark:bg-green-900";
            } else if (prog >= 75) {
              statusIcon = "🎯";
              statusColor = "bg-blue-100 dark:bg-blue-900";
            }

            return (
              <Card key={lesson} className={`p-4 ${statusColor}`}>
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
                  {prog >= 100
                    ? "✨ Abgeschlossen!"
                    : prog >= 75
                      ? "📝 Exam bereit"
                      : `${Math.round(prog)}% gelernt`}
                </p>
              </Card>
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