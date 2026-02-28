import { useCallback, useEffect, useMemo, useState } from "react";
import { db, type VocabEntry } from "../db/db";
import { shuffle } from "../lib/shuffle";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GameMode = "blitz" | "quiz";
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
  totalQuestions: number;
};

function asVocabWithId(entries: VocabEntry[]): VocabWithId[] {
  return entries.filter((entry): entry is VocabWithId => typeof entry.id === "number");
}

function createQuestion(
  pool: VocabWithId[],
  direction: GameDirection,
  previousEntryId?: number
): GameQuestion | null {
  const candidates = previousEntryId
    ? pool.filter((entry) => entry.id !== previousEntryId)
    : pool;
  const base = (candidates.length > 0 ? candidates : pool)[Math.floor(Math.random() * pool.length)];
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
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const totalQuestions = mode === "quiz" ? Math.min(10, pool.length) : Number.POSITIVE_INFINITY;

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

  useEffect(() => {
    if (!gameRunning || mode !== "blitz") return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setGameRunning(false);
          setResult({
            mode: "blitz",
            score,
            answered,
            totalQuestions: answered,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameRunning, mode, score, answered]);

  const resetGameState = useCallback(() => {
    setPool([]);
    setQuestion(null);
    setScore(0);
    setAnswered(0);
    setQuestionIndex(0);
    setTimeLeft(60);
    setGameRunning(false);
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
    setQuestionIndex(0);
    setTimeLeft(60);
    setGameRunning(true);
  }, [direction, loadFilteredPool, onlyDue, onlyLearned]);

  const finishQuiz = useCallback(
    (nextScore: number, nextAnswered: number) => {
      setGameRunning(false);
      setResult({
        mode: "quiz",
        score: nextScore,
        answered: nextAnswered,
        totalQuestions: totalQuestions === Number.POSITIVE_INFINITY ? nextAnswered : totalQuestions,
      });
    },
    [totalQuestions]
  );

  const answerQuestion = useCallback(
    (selected: string) => {
      if (!gameRunning || !question) return;

      const isCorrect = selected === question.correctAnswer;
      const nextScore = score + (isCorrect ? 10 : -3);
      const nextAnswered = answered + 1;

      setScore(nextScore);
      setAnswered(nextAnswered);

      if (mode === "quiz") {
        const nextQuestionIndex = questionIndex + 1;
        setQuestionIndex(nextQuestionIndex);

        if (nextQuestionIndex >= totalQuestions) {
          finishQuiz(nextScore, nextAnswered);
          return;
        }
      }

      const next = createQuestion(pool, direction, question.entryId);
      if (!next) {
        setStatus("Spiel beendet: Keine weiteren Fragen generierbar.");
        setGameRunning(false);
        setResult({
          mode,
          score: nextScore,
          answered: nextAnswered,
          totalQuestions:
            mode === "quiz" && totalQuestions !== Number.POSITIVE_INFINITY
              ? totalQuestions
              : nextAnswered,
        });
        return;
      }

      setQuestion(next);
    },
    [
      answered,
      direction,
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

  const progressText = useMemo(() => {
    if (!gameRunning || mode !== "quiz") return null;
    return `Frage ${Math.min(questionIndex + 1, totalQuestions)} / ${totalQuestions}`;
  }, [gameRunning, mode, questionIndex, totalQuestions]);

  return (
    <PageShell
      title="Spiele"
      description="Phase 1: Blitzrunde und 4er-Quiz als spielerische Wiederholung deiner Karten."
    >
      {!gameRunning && !result ? (
        <Card className="p-4 space-y-4">
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
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiv: <b>{mode === "blitz" ? "Blitzrunde" : "4er-Quiz"}</b>
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
            <p className="text-xs text-muted-foreground mb-2">Übersetze:</p>
            <p className="text-2xl font-semibold">{question.prompt}</p>
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
              {result.mode === "blitz" ? "Blitzrunde" : "4er-Quiz"} abgeschlossen
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
              Umfang: <b>{result.totalQuestions}</b>
            </p>
          </div>
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
