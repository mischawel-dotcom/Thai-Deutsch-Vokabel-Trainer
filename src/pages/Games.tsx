import { useCallback, useEffect, useMemo, useState } from "react";
import { db, type VocabEntry } from "../db/db";
import { speak, stopSpeak } from "../features/tts";
import { shuffle } from "../lib/shuffle";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GameMode = "blitz" | "quiz" | "audio";
type GameDirection = "TH_DE" | "DE_TH";

type VocabWithId = VocabEntry & { id: number };

type GameQuestion = {
  entryId: number;
  prompt: string;
  correctAnswer: string;
  options: string[];
};

type GameResult = {
  mode: GameMode;
  score: number;
  answered: number;
  correctAnswers: number;
  totalQuestions: number;
  xpGained: number;
  bonusXp: number;
  unlockedBadges: string[];
  levelAfter: number;
  dailyChallengeCompletedNow: boolean;
  dailyChallengeTitle: string;
};

type DailyChallengeMetric = "games" | "correctAnswers" | "bestScore";

type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  metric: DailyChallengeMetric;
  target: number;
};

type GameStats = {
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

const BADGE_LABELS: Record<string, string> = {
  first_game: "Erstes Spiel",
  score_100: "100+ Punkte",
  audio_pro: "Audio-Profi",
  daily_3: "Tages-Triplet (3 Spiele)",
};

const DEFAULT_GAME_STATS: GameStats = {
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

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDailyChallenge(dateKey: string): DailyChallenge {
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

function getDailyChallengeProgress(challenge: DailyChallenge, daily: GameStats["daily"]): number {
  if (challenge.metric === "games") return daily.games;
  if (challenge.metric === "correctAnswers") return daily.correctAnswers;
  return daily.bestScore;
}

function loadGameStats(): GameStats {
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

function getLevel(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / 100) + 1;
}

function asVocabWithId(entries: VocabEntry[]): VocabWithId[] {
  return entries.filter((entry): entry is VocabWithId => typeof entry.id === "number");
}

function createQuestion(
  pool: VocabWithId[],
  direction: GameDirection,
  previousEntryId?: number
): GameQuestion | null {
  const candidatePool = previousEntryId
    ? pool.filter((entry) => entry.id !== previousEntryId)
    : pool;
  const effectiveCandidates = candidatePool.length > 0 ? candidatePool : pool;

  // Only pick entries that can actually produce 3 distinct distractors.
  const validBases = effectiveCandidates.filter((baseEntry) => {
    const correct = direction === "TH_DE" ? baseEntry.german : baseEntry.thai;
    const distractors = new Set(
      pool
        .filter((entry) => entry.id !== baseEntry.id)
        .map((entry) => (direction === "TH_DE" ? entry.german : entry.thai))
        .filter((value) => value && value !== correct)
    );
    return distractors.size >= 3;
  });

  const baseList = validBases.length > 0 ? validBases : effectiveCandidates;
  const base = baseList[Math.floor(Math.random() * baseList.length)];
  if (!base) return null;

  const correctAnswer = direction === "TH_DE" ? base.german : base.thai;
  const prompt = direction === "TH_DE" ? base.thai : base.german;

  const answerCandidates = Array.from(
    new Set(
      pool
        .filter((entry) => entry.id !== base.id)
        .map((entry) => (direction === "TH_DE" ? entry.german : entry.thai))
        .filter((value) => value && value !== correctAnswer)
    )
  );

  if (answerCandidates.length < 3) return null;

  const options = shuffle([correctAnswer, ...shuffle(answerCandidates).slice(0, 3)]);
  return {
    entryId: base.id,
    prompt,
    correctAnswer,
    options,
  };
}

export default function Games() {
  const [mode, setMode] = useState<GameMode>("blitz");
  const [direction, setDirection] = useState<GameDirection>("TH_DE");
  const [onlyLearned, setOnlyLearned] = useState(true);
  const [onlyDue, setOnlyDue] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>(undefined);
  const [lessons, setLessons] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("");
  const [showFilterRelaxAction, setShowFilterRelaxAction] = useState(false);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  const [pool, setPool] = useState<VocabWithId[]>([]);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>(DEFAULT_GAME_STATS);

  const totalQuestions =
    mode === "quiz" || mode === "audio" ? Math.min(10, pool.length) : Number.POSITIVE_INFINITY;

  const loadFilteredPool = useCallback(async (): Promise<VocabWithId[]> => {
    const allEntries = asVocabWithId(await db.vocab.toArray());

    let filtered = allEntries;
    if (selectedLesson !== undefined) {
      filtered = filtered.filter((entry) => entry.lesson === selectedLesson);
    }

    if (onlyDue) {
      const dueProgress = await db.progress.where("dueAt").belowOrEqual(Date.now()).toArray();
      const dueIds = new Set(
        dueProgress
          .map((progress) => progress.entryId)
          .filter((id): id is number => typeof id === "number")
      );
      filtered = filtered.filter((entry) => dueIds.has(entry.id));
    }

    if (onlyLearned) {
      filtered = filtered.filter((entry) => entry.viewed === true);
    }

    return filtered;
  }, [onlyDue, onlyLearned, selectedLesson]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const lessonKeys = await db.vocab.orderBy("lesson").uniqueKeys();
      const uniqueLessons = lessonKeys
        .map((lesson) => Number(lesson))
        .filter((lesson) => Number.isFinite(lesson) && lesson > 0)
        .sort((a, b) => a - b);
      if (active) setLessons(uniqueLessons);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setGameStats(loadGameStats());
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingPreview(true);
    setStatus("");
    setShowFilterRelaxAction(false);
    void (async () => {
      const filtered = await loadFilteredPool();
      if (!active) return;
      setPreviewCount(filtered.length);
      setLoadingPreview(false);
    })();

    return () => {
      active = false;
    };
  }, [loadFilteredPool]);

  const finalizeGame = useCallback(
    (modeToSave: GameMode, finalScore: number, finalAnswered: number, finalCorrect: number, finalTotalQuestions: number) => {
      const xpGained = Math.max(10, finalCorrect * 5 + Math.max(0, finalScore));
      const today = getTodayKey();
      const challenge = getDailyChallenge(today);

      let unlockedBadges: string[] = [];
      let levelAfter = 1;
      let bonusXp = 0;
      let dailyChallengeCompletedNow = false;
      let dailyChallengeTitle = challenge.title;

      setGameStats((prev) => {
        const dailyBase = prev.daily.date === today
          ? prev.daily
          : { date: today, games: 0, correctAnswers: 0, bestScore: 0, challengeCompleted: false };
        const nextDaily = {
          date: today,
          games: dailyBase.games + 1,
          correctAnswers: dailyBase.correctAnswers + finalCorrect,
          bestScore: Math.max(dailyBase.bestScore, finalScore),
          challengeCompleted: dailyBase.challengeCompleted,
        };
        const challengeProgress = getDailyChallengeProgress(challenge, nextDaily);
        if (!nextDaily.challengeCompleted && challengeProgress >= challenge.target) {
          nextDaily.challengeCompleted = true;
          dailyChallengeCompletedNow = true;
          bonusXp = 50;
        }
        const next: GameStats = {
          totalXp: prev.totalXp + xpGained + bonusXp,
          totalGames: prev.totalGames + 1,
          totalCorrect: prev.totalCorrect + finalCorrect,
          bestScore: Math.max(prev.bestScore, finalScore),
          badges: [...prev.badges],
          daily: nextDaily,
        };

        const maybeAddBadge = (id: string, condition: boolean) => {
          if (!condition || next.badges.includes(id)) return;
          next.badges.push(id);
          unlockedBadges.push(id);
        };

        maybeAddBadge("first_game", next.totalGames >= 1);
        maybeAddBadge("score_100", finalScore >= 100);
        maybeAddBadge("audio_pro", modeToSave === "audio" && finalCorrect >= 8);
        maybeAddBadge("daily_3", next.daily.games >= 3);

        localStorage.setItem(GAME_STATS_KEY, JSON.stringify(next));
        levelAfter = getLevel(next.totalXp);
        return next;
      });

      setGameRunning(false);
      setResult({
        mode: modeToSave,
        score: finalScore,
        answered: finalAnswered,
        correctAnswers: finalCorrect,
        totalQuestions: finalTotalQuestions,
        xpGained,
        bonusXp,
        unlockedBadges,
        levelAfter,
        dailyChallengeCompletedNow,
        dailyChallengeTitle,
      });
    },
    []
  );

  useEffect(() => {
    if (!gameRunning || mode !== "blitz") return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          finalizeGame("blitz", score, answered, correctAnswers, answered);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [answered, correctAnswers, finalizeGame, gameRunning, mode, score]);

  useEffect(() => {
    return () => {
      stopSpeak();
    };
  }, []);

  const resetGameState = useCallback(() => {
    stopSpeak();
    setPool([]);
    setQuestion(null);
    setScore(0);
    setAnswered(0);
    setCorrectAnswers(0);
    setQuestionIndex(0);
    setTimeLeft(60);
    setGameRunning(false);
    setIsSpeaking(false);
  }, []);

  const startGame = useCallback(async () => {
    setStatus("");
    setShowFilterRelaxAction(false);
    setResult(null);
    const filtered = await loadFilteredPool();

    if (filtered.length < 4) {
      setStatus(
        "Zu wenige Karten für ein Spiel (mind. 4 nötig). Tipp: Deaktiviere 'nur gelernt' oder 'nur fällige Karten'."
      );
      setShowFilterRelaxAction(onlyLearned || onlyDue);
      return;
    }

    const firstQuestion = createQuestion(filtered, direction);
    if (!firstQuestion) {
      setStatus("Zu wenig Antwortvielfalt für Multiple-Choice in dieser Auswahl.");
      return;
    }

    setPool(filtered);
    setQuestion(firstQuestion);
    setScore(0);
    setAnswered(0);
    setCorrectAnswers(0);
    setQuestionIndex(0);
    setTimeLeft(60);
    setGameRunning(true);
  }, [direction, loadFilteredPool, onlyDue, onlyLearned]);

  const finishQuiz = useCallback(
    (nextScore: number, nextAnswered: number, nextCorrectAnswers: number) => {
      const finalTotal =
        totalQuestions === Number.POSITIVE_INFINITY ? nextAnswered : totalQuestions;
      finalizeGame(mode, nextScore, nextAnswered, nextCorrectAnswers, finalTotal);
    },
    [finalizeGame, mode, totalQuestions]
  );

  const answerQuestion = useCallback(
    (selected: string) => {
      if (!gameRunning || !question) return;
      stopSpeak();
      setIsSpeaking(false);

      const isCorrect = selected === question.correctAnswer;
      const nextScore = score + (isCorrect ? 10 : -3);
      const nextAnswered = answered + 1;
      const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);

      setScore(nextScore);
      setAnswered(nextAnswered);
      setCorrectAnswers(nextCorrectAnswers);

      if (mode === "quiz" || mode === "audio") {
        const nextQuestionIndex = questionIndex + 1;
        setQuestionIndex(nextQuestionIndex);

        if (nextQuestionIndex >= totalQuestions) {
          finishQuiz(nextScore, nextAnswered, nextCorrectAnswers);
          return;
        }
      }

      const next = createQuestion(pool, direction, question.entryId);
      if (!next) {
        setStatus("Spiel beendet: Keine weiteren Fragen generierbar.");
        const finalTotal =
          (mode === "quiz" || mode === "audio") && totalQuestions !== Number.POSITIVE_INFINITY
            ? totalQuestions
            : nextAnswered;
        finalizeGame(mode, nextScore, nextAnswered, nextCorrectAnswers, finalTotal);
        return;
      }

      setQuestion(next);
    },
    [
      answered,
      correctAnswers,
      direction,
      finalizeGame,
      finishQuiz,
      gameRunning,
      mode,
      pool,
      question,
      questionIndex,
      score,
      totalQuestions,
    ]
  );

  const playQuestionAudio = useCallback(async () => {
    if (!question || !gameRunning || mode !== "audio") return;
    try {
      setIsSpeaking(true);
      const lang = direction === "TH_DE" ? "th-TH" : "de-DE";
      await speak(question.prompt, lang);
    } finally {
      setIsSpeaking(false);
    }
  }, [direction, gameRunning, mode, question]);

  const progressText = useMemo(() => {
    if (!gameRunning || (mode !== "quiz" && mode !== "audio")) return null;
    return `Frage ${Math.min(questionIndex + 1, totalQuestions)} / ${totalQuestions}`;
  }, [gameRunning, mode, questionIndex, totalQuestions]);

  const currentLevel = useMemo(() => getLevel(gameStats.totalXp), [gameStats.totalXp]);
  const xpIntoLevel = gameStats.totalXp % 100;
  const todayKey = useMemo(() => getTodayKey(), []);
  const dailyChallenge = useMemo(() => getDailyChallenge(todayKey), [todayKey]);
  const todayDaily = useMemo(
    () =>
      gameStats.daily.date === todayKey
        ? gameStats.daily
        : { date: todayKey, games: 0, correctAnswers: 0, bestScore: 0, challengeCompleted: false },
    [gameStats.daily, todayKey]
  );
  const dailyProgress = useMemo(
    () => getDailyChallengeProgress(dailyChallenge, todayDaily),
    [dailyChallenge, todayDaily]
  );

  return (
    <PageShell
      title="Spiele"
      description="Blitzrunde, 4er-Quiz und Hör-Spiel als spielerische Wiederholung deiner Karten."
    >
      {!gameRunning && !result ? (
        <Card className="p-4 space-y-4">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                Level: <b>{currentLevel}</b>
              </span>
              <span>
                XP: <b>{gameStats.totalXp}</b> ({xpIntoLevel}/100)
              </span>
              <span>
                Badges: <b>{gameStats.badges.length}</b>
              </span>
            </div>
          </div>
          <div
            className={`rounded-md border p-3 text-sm ${
              todayDaily.challengeCompleted
                ? "border-green-500/30 bg-green-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            <p className="font-medium">{dailyChallenge.title}</p>
            <p className="text-muted-foreground">{dailyChallenge.description}</p>
            <p className="mt-1">
              Fortschritt: <b>{Math.min(dailyProgress, dailyChallenge.target)}</b> /{" "}
              <b>{dailyChallenge.target}</b>
              {todayDaily.challengeCompleted ? " · erledigt (+50 XP)" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Modus</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === "blitz" ? "default" : "outline"}
                onClick={() => setMode("blitz")}
                aria-pressed={mode === "blitz"}
              >
                {mode === "blitz" ? "✓ Blitzrunde (60s)" : "Blitzrunde (60s)"}
              </Button>
              <Button
                variant={mode === "quiz" ? "default" : "outline"}
                onClick={() => setMode("quiz")}
                aria-pressed={mode === "quiz"}
              >
                {mode === "quiz" ? "✓ 4er-Quiz (10 Fragen)" : "4er-Quiz (10 Fragen)"}
              </Button>
              <Button
                variant={mode === "audio" ? "default" : "outline"}
                onClick={() => setMode("audio")}
                aria-pressed={mode === "audio"}
              >
                {mode === "audio" ? "✓ Hör-Spiel (10 Fragen)" : "Hör-Spiel (10 Fragen)"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiv:{" "}
              <b>
                {mode === "blitz" ? "Blitzrunde" : mode === "quiz" ? "4er-Quiz" : "Hör-Spiel"}
              </b>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Richtung</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={direction === "TH_DE" ? "default" : "outline"}
                onClick={() => setDirection("TH_DE")}
                aria-pressed={direction === "TH_DE"}
              >
                {direction === "TH_DE" ? "✓ Thai → Deutsch" : "Thai → Deutsch"}
              </Button>
              <Button
                variant={direction === "DE_TH" ? "default" : "outline"}
                onClick={() => setDirection("DE_TH")}
                aria-pressed={direction === "DE_TH"}
              >
                {direction === "DE_TH" ? "✓ Deutsch → Thai" : "Deutsch → Thai"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiv: <b>{direction === "TH_DE" ? "Thai → Deutsch" : "Deutsch → Thai"}</b>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Filter</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyLearned}
                  onChange={(e) => setOnlyLearned(e.target.checked)}
                />
                nur gelernte Karten
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyDue}
                  onChange={(e) => setOnlyDue(e.target.checked)}
                />
                nur fällige Karten
              </label>

              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={selectedLesson ?? ""}
                onChange={(e) =>
                  setSelectedLesson(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">Alle Lektionen</option>
                {lessons.map((lesson) => (
                  <option key={lesson} value={lesson}>
                    Lektion {lesson}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiv: {onlyLearned ? "nur gelernt" : "gelernt + neue"} ·{" "}
              {onlyDue ? "nur fällig" : "fällig + nicht fällig"}
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {loadingPreview ? "Berechne verfügbare Karten..." : `${previewCount} Karten verfügbar`}
          </div>

          {status ? <div className="text-sm text-red-600">{status}</div> : null}
          {showFilterRelaxAction ? (
            <Button
              variant="outline"
              onClick={() => {
                if (onlyLearned) {
                  setOnlyLearned(false);
                } else if (onlyDue) {
                  setOnlyDue(false);
                }
                setShowFilterRelaxAction(false);
              }}
            >
              Neue Karten einschließen
            </Button>
          ) : null}

          <Button onClick={startGame} disabled={loadingPreview}>
            Spiel starten
          </Button>
        </Card>
      ) : null}

      {gameRunning && question ? (
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>Punkte: {score}</span>
            {mode === "blitz" ? <span>Zeit: {timeLeft}s</span> : null}
            {progressText ? <span>{progressText}</span> : null}
          </div>

          <div className="rounded-md border p-4">
            {mode === "audio" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Höre zu und wähle die richtige Übersetzung:
                </p>
                <Button
                  variant="outline"
                  onClick={() => void playQuestionAudio()}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? "Spielt..." : "🔊 Audio abspielen"}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">Übersetze:</p>
                <p className="text-2xl font-semibold">{question.prompt}</p>
              </>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => (
              <Button key={option} variant="outline" onClick={() => answerQuestion(option)}>
                {option}
              </Button>
            ))}
          </div>

          {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
        </Card>
      ) : null}

      {result ? (
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Ergebnis</h3>
            <p className="text-sm text-muted-foreground">
              {result.mode === "blitz"
                ? "Blitzrunde"
                : result.mode === "quiz"
                  ? "4er-Quiz"
                  : "Hör-Spiel"}{" "}
              abgeschlossen
            </p>
          </div>
          <div className="text-sm space-y-1">
            <p>
              Punkte: <b>{result.score}</b>
            </p>
            <p>
              Beantwortet: <b>{result.answered}</b>
            </p>
            <p>
              Richtig: <b>{result.correctAnswers}</b>
            </p>
            <p>
              Umfang: <b>{result.totalQuestions}</b>
            </p>
            <p>
              XP erhalten: <b>+{result.xpGained}</b> (Level {result.levelAfter})
            </p>
            {result.bonusXp > 0 ? (
              <p>
                Daily-Bonus: <b>+{result.bonusXp} XP</b>
              </p>
            ) : null}
          </div>
          {result.dailyChallengeCompletedNow ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium">🎯 Tagesaufgabe geschafft</p>
              <p className="text-muted-foreground">
                {result.dailyChallengeTitle} abgeschlossen (+50 XP).
              </p>
            </div>
          ) : null}
          {result.unlockedBadges.length > 0 ? (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
              <p className="font-medium">Neue Badges freigeschaltet:</p>
              <p className="text-muted-foreground">
                {result.unlockedBadges.map((id) => BADGE_LABELS[id] ?? id).join(" · ")}
              </p>
            </div>
          ) : null}
          {gameStats.badges.length > 0 ? (
            <div className="text-xs text-muted-foreground">
              Gesamt-Badges:{" "}
              {gameStats.badges.map((id) => BADGE_LABELS[id] ?? id).join(" · ")}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={startGame}>Nochmal spielen</Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                resetGameState();
              }}
            >
              Zurück zur Auswahl
            </Button>
          </div>
        </Card>
      ) : null}
    </PageShell>
  );
}
