import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "../db/db";
import { speak, stopSpeak } from "../features/tts";
import { generateNumber } from "../lib/number-generator";
import {
  useGamesSetup, type BlitzDurationOption, type GameMode,
} from "../hooks/useGamesSetup";
import AudioGamePanel from "../features/games/components/AudioGamePanel";
import BlitzGamePanel from "../features/games/components/BlitzGamePanel";
import NumberGamePanel from "../features/games/components/NumberGamePanel";
import QuizGamePanel from "../features/games/components/QuizGamePanel";
import {
  buildQuestionOrder,
  createQuestion,
  getValidBaseEntries,
  MODE_CARDS,
  getModeConfig,
  toGameEntries,
  BADGE_LABELS,
  DEFAULT_GAME_STATS,
  getDailyChallenge,
  getDailyChallengeProgress,
  getLevel,
  getTodayKey,
  loadGameStats,
  saveGameStats,
  getGamePoolSource,
  type GameStats,
  type AnswerFeedback,
  type GameEntry,
  type GameQuestion,
} from "../features/games";
import { applyCefrFirstFilter } from "../features/vocab/cefrFirst";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function Games() {
  const {
    mode,
    setMode,
    direction,
    setDirection,
    onlyLearned,
    setOnlyLearned,
    selectedLesson,
    setSelectedLesson,
    setupDialogOpen,
    setSetupDialogOpen,
    selectedQuestionCount,
    allLearnedModeActive,
    blitzDurationSec,
    setBlitzDurationSec,
    setQuizQuestionCount,
    setAudioQuestionCount,
    setNumberQuestionCount,
    numberMaxValue,
    setNumberMaxValue,
  } = useGamesSetup();
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("");
  const [showFilterRelaxAction, setShowFilterRelaxAction] = useState(false);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  const [pool, setPool] = useState<GameEntry[]>([]);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(blitzDurationSec);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [orderCursor, setOrderCursor] = useState<number>(0);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>(DEFAULT_GAME_STATS);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const modeConfig = useMemo(() => getModeConfig(mode), [mode]);
  const source = useMemo(() => getGamePoolSource(mode), [mode]);

  const generatedNumbersPool = useMemo<GameEntry[]>(() => {
    if (mode !== "numbers") return [];
    const maxValue = Math.min(1_000_000, Math.max(100, Math.floor(numberMaxValue)));
    const baseUpper = Math.min(100, maxValue);
    const targetSize = maxValue <= 5000 ? maxValue + 1 : 2000;
    const values = new Set<number>();
    for (let i = 0; i <= baseUpper; i += 1) {
      values.add(i);
    }
    while (values.size < targetSize) {
      values.add(Math.floor(Math.random() * (maxValue + 1)));
    }
    return Array.from(values)
      .sort((a, b) => a - b)
      .map((value) => {
        const generated = generateNumber(value);
        return {
          id: 1_000_000_000 + value,
          viewed: true,
          thPrompt: generated.thaiDigit,
          dePrompt: String(generated.arabic),
          thAnswer: generated.thaiDigit,
          deAnswer: String(generated.arabic),
        } satisfies GameEntry;
      });
  }, [mode, numberMaxValue]);

  const totalQuestions =
    mode === "quiz" || mode === "audio" || mode === "numbers" ? questionOrder.length : Number.POSITIVE_INFINITY;

  const loadFilteredPool = useCallback(async (): Promise<GameEntry[]> => {
    const allEntries = source === "numbers"
      ? generatedNumbersPool
      : toGameEntries(
          "vocab",
          applyCefrFirstFilter(await db.vocab.toArray()).entries
        );

    let filtered = allEntries;
    if (source !== "numbers" && selectedLesson !== undefined) {
      filtered = filtered.filter((entry) => entry.lesson === selectedLesson);
    }

    if (source !== "numbers" && onlyLearned) {
      filtered = filtered.filter((entry) => entry.viewed === true);
    }

    return filtered;
  }, [generatedNumbersPool, onlyLearned, selectedLesson, source]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (source === "numbers") {
        if (active) setLessons([]);
        return;
      }
      const lessonSet = new Set<number>();
      const { entries: vocabEntries } = applyCefrFirstFilter(await db.vocab.toArray());
      for (const entry of vocabEntries) {
        const lesson = Number(entry.lesson);
        if (Number.isFinite(lesson) && lesson > 0) lessonSet.add(lesson);
      }
      const uniqueLessons = Array.from(lessonSet)
        .sort((a, b) => a - b);
      if (active) setLessons(uniqueLessons);
    })();

    return () => {
      active = false;
    };
  }, [source]);

  useEffect(() => {
    setGameStats(loadGameStats());
  }, []);

  useEffect(() => {
    const shouldOpenNumbersSetup = localStorage.getItem("openNumbersGameSetup") === "true";
    if (!shouldOpenNumbersSetup) return;
    setMode("numbers");
    setSetupDialogOpen(true);
    localStorage.removeItem("openNumbersGameSetup");
  }, [setMode, setSetupDialogOpen]);

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

        saveGameStats(next);
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
      if (feedbackTimeoutRef.current != null) {
        window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      stopSpeak();
    };
  }, []);

  const resetGameState = useCallback(() => {
    if (feedbackTimeoutRef.current != null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    stopSpeak();
    setPool([]);
    setQuestion(null);
    setScore(0);
    setAnswered(0);
    setCorrectAnswers(0);
    setQuestionIndex(0);
    setQuestionOrder([]);
    setOrderCursor(0);
    setTimeLeft(blitzDurationSec);
    setGameRunning(false);
    setIsSpeaking(false);
    setAnswerFeedback(null);
  }, [blitzDurationSec]);

  const startGame = useCallback(async (): Promise<boolean> => {
    if (feedbackTimeoutRef.current != null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setStatus("");
    setShowFilterRelaxAction(false);
    setResult(null);
    setAnswerFeedback(null);
    const filtered = await loadFilteredPool();

    if (filtered.length < 4) {
      setStatus(
        mode === "numbers"
          ? "Zu wenige Zahlenkarten im generierten Pool (mind. 4 nötig). Erhoehe die Maximalzahl."
          : "Zu wenige Karten für ein Spiel (mind. 4 nötig). Tipp: Deaktiviere 'nur gelernt' oder erweitere die Lektionsauswahl."
      );
      setShowFilterRelaxAction(mode !== "numbers" && onlyLearned);
      return false;
    }

    const validBases = getValidBaseEntries(filtered, direction);
    if (validBases.length === 0) {
      setStatus("Zu wenig Antwortvielfalt für Multiple-Choice in dieser Auswahl.");
      return false;
    }

    const validBaseIds = validBases.map((entry) => entry.id);
    const desiredQuestionCount =
      mode === "blitz"
        ? validBaseIds.length
        : selectedQuestionCount === "ALL"
          ? validBaseIds.length
          : selectedQuestionCount;

    if (desiredQuestionCount <= 0) {
      setStatus("Keine passenden Karten für die gewählte Spielkonfiguration.");
      return false;
    }

    const order = buildQuestionOrder(validBaseIds, desiredQuestionCount);
    const firstQuestion = createQuestion(filtered, direction, order[0]);
    if (!firstQuestion) {
      setStatus("Start nicht möglich: Frage konnte nicht generiert werden.");
      return false;
    }

    setPool(filtered);
    setQuestionOrder(order);
    setOrderCursor(0);
    setQuestion(firstQuestion);
    setScore(0);
    setAnswered(0);
    setCorrectAnswers(0);
    setQuestionIndex(0);
    setTimeLeft(blitzDurationSec);
    setGameRunning(true);
    return true;
  }, [blitzDurationSec, direction, loadFilteredPool, mode, onlyLearned, selectedQuestionCount]);

  const finishQuiz = useCallback(
    (nextScore: number, nextAnswered: number, nextCorrectAnswers: number) => {
      const finalTotal =
        totalQuestions === Number.POSITIVE_INFINITY ? nextAnswered : totalQuestions;
      finalizeGame(mode, nextScore, nextAnswered, nextCorrectAnswers, finalTotal);
    },
    [finalizeGame, mode, totalQuestions]
  );

  const endCurrentGame = useCallback(() => {
    if (!gameRunning) return;
    if (feedbackTimeoutRef.current != null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    stopSpeak();
    setIsSpeaking(false);
    setAnswerFeedback(null);
    const finalTotal =
      mode === "blitz"
        ? answered
        : totalQuestions === Number.POSITIVE_INFINITY
          ? answered
          : totalQuestions;
    finalizeGame(mode, score, answered, correctAnswers, finalTotal);
    setEndGameDialogOpen(false);
  }, [answered, correctAnswers, finalizeGame, gameRunning, mode, score, totalQuestions]);

  const answerQuestion = useCallback(
    (selected: string) => {
      if (!gameRunning || !question || answerFeedback) return;
      stopSpeak();
      setIsSpeaking(false);

      const isCorrect = selected === question.correctAnswer;
      const nextScore = score + (isCorrect ? 10 : 0);
      const nextAnswered = answered + 1;
      const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);

      setScore(nextScore);
      setAnswered(nextAnswered);
      setCorrectAnswers(nextCorrectAnswers);
      setAnswerFeedback({
        selected,
        correct: question.correctAnswer,
        isCorrect,
      });

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(isCorrect ? 40 : 120);
        } catch {
          // ignore unsupported vibration failures
        }
      }

      feedbackTimeoutRef.current = window.setTimeout(() => {
        feedbackTimeoutRef.current = null;
        setAnswerFeedback(null);

        if (mode === "quiz" || mode === "audio" || mode === "numbers") {
          const nextQuestionIndex = questionIndex + 1;
          const nextCursor = orderCursor + 1;
          setQuestionIndex(nextQuestionIndex);

          if (nextCursor >= questionOrder.length) {
            finishQuiz(nextScore, nextAnswered, nextCorrectAnswers);
            return;
          }

          const next = createQuestion(pool, direction, questionOrder[nextCursor]);
          if (!next) {
            setStatus("Spiel beendet: Keine weiteren Fragen generierbar.");
            finishQuiz(nextScore, nextAnswered, nextCorrectAnswers);
            return;
          }
          setOrderCursor(nextCursor);
          setQuestion(next);
          return;
        }

        let nextCursor = orderCursor + 1;
        let activeOrder = questionOrder;
        if (nextCursor >= activeOrder.length) {
          const validBaseIds = getValidBaseEntries(pool, direction).map((entry) => entry.id);
          if (validBaseIds.length === 0) {
            finalizeGame(mode, nextScore, nextAnswered, nextCorrectAnswers, nextAnswered);
            return;
          }
          activeOrder = buildQuestionOrder(validBaseIds, validBaseIds.length);
          setQuestionOrder(activeOrder);
          nextCursor = 0;
        }

        const next = createQuestion(pool, direction, activeOrder[nextCursor]);
        if (!next) {
          setStatus("Spiel beendet: Keine weiteren Fragen generierbar.");
          finalizeGame(mode, nextScore, nextAnswered, nextCorrectAnswers, nextAnswered);
          return;
        }

        setOrderCursor(nextCursor);
        setQuestion(next);
      }, 450);
    },
    [
      answerFeedback,
      answered,
      correctAnswers,
      direction,
      finalizeGame,
      finishQuiz,
      gameRunning,
      mode,
      orderCursor,
      pool,
      question,
      questionIndex,
      questionOrder,
      score,
    ]
  );

  /** Kein TTS für deutsche Prompts (nur Thai → Deutsch). */
  const canPlayPromptTts = direction === "TH_DE";

  const playQuestionAudio = useCallback(async () => {
    if (!question || !gameRunning || !canPlayPromptTts) return;
    try {
      setIsSpeaking(true);
      await speak(question.prompt, "th-TH");
    } finally {
      setIsSpeaking(false);
    }
  }, [canPlayPromptTts, gameRunning, question]);

  const progressText = useMemo(() => {
    if (!gameRunning || (mode !== "quiz" && mode !== "audio" && mode !== "numbers")) return null;
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
  const modeLabel = modeConfig.resultLabel;
  const resultModeLabel = useMemo(
    () =>
      result
        ? getModeConfig(result.mode).resultLabel
        : null,
    [result]
  );
  const pageTitle = gameRunning ? modeLabel : resultModeLabel ?? "Spiele";
  const pageDescription =
    gameRunning || result
      ? " "
      : "Blitzrunde, 4er-Quiz, Hör-Spiel und Zahlenspiel als spielerische Wiederholung deiner Karten.";
  return (
    <PageShell
      title={pageTitle}
      description={pageDescription}
    >
      {!gameRunning && !result ? (
        <Card className="p-3 space-y-3">
          <div className="rounded-md border bg-muted/30 p-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span>Lv <b>{currentLevel}</b></span>
              <span>XP <b>{gameStats.totalXp}</b> ({xpIntoLevel}/100)</span>
              <span>Badges <b>{gameStats.badges.length}</b></span>
            </div>
          </div>

          <div className={`rounded-md border p-2 text-xs ${
            todayDaily.challengeCompleted
              ? "border-green-500/30 bg-green-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}>
            <p className="font-medium">{dailyChallenge.title}</p>
            <p className="mt-1 text-muted-foreground">
              {Math.min(dailyProgress, dailyChallenge.target)} / {dailyChallenge.target}
              {todayDaily.challengeCompleted ? " · erledigt (+50 XP)" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">1) Modus wählen</p>
            <div className="grid gap-2">
              {MODE_CARDS.map((modeCard) => {
                return (
                  <button
                    key={modeCard.id}
                    type="button"
                    onClick={() => {
                      setMode(modeCard.id);
                      setSetupDialogOpen(true);
                    }}
                    className="w-full min-h-[56px] rounded-lg border border-border bg-card px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`${modeCard.title} konfigurieren und starten`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{modeCard.title}</span>
                      <span className="text-xs text-primary">Starten</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{modeCard.subtitle}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiv:{" "}
              <b>
                {mode === "blitz"
                  ? `Blitzrunde (${blitzDurationSec}s)`
                  : mode === "quiz"
                    ? `4er-Quiz (${selectedQuestionCount === "ALL" ? "Alle gelernten Karten" : `${selectedQuestionCount} Fragen`})`
                    : mode === "audio"
                      ? `Hör-Spiel (${selectedQuestionCount === "ALL" ? "Alle gelernten Karten" : `${selectedQuestionCount} Fragen`})`
                      : `${modeConfig.resultLabel} (${selectedQuestionCount === "ALL" ? "Alle generierten Zahlen" : `${selectedQuestionCount} Fragen`}, 0-${numberMaxValue})`}
              </b>
            </p>
          </div>

          {status ? <div className="text-sm text-red-600">{status}</div> : null}
          {showFilterRelaxAction ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onlyLearned) {
                  setOnlyLearned(false);
                }
                setShowFilterRelaxAction(false);
              }}
            >
              Neue Karten einschließen
            </Button>
          ) : null}

        </Card>
      ) : null}

      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="left-0 right-0 top-auto bottom-0 w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl border-t p-4 sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modeLabel} konfigurieren</DialogTitle>
            <DialogDescription>
              Stelle Setup und Kartenauswahl ein und starte dann das Spiel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Richtung</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={direction === "TH_DE" ? "default" : "secondary"}
                  className={`min-h-[44px] transition-all ${
                    direction === "TH_DE"
                      ? "shadow-sm ring-2 ring-primary/30"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDirection("TH_DE")}
                >
                  {modeConfig.directionThDeLabel}
                </Button>
                <Button
                  size="sm"
                  variant={direction === "DE_TH" ? "default" : "secondary"}
                  className={`min-h-[44px] transition-all ${
                    direction === "DE_TH"
                      ? "shadow-sm ring-2 ring-primary/30"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDirection("DE_TH")}
                >
                  {modeConfig.directionDeThLabel}
                </Button>
              </div>
            </div>

            {mode !== "numbers" ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyLearned}
                  disabled={allLearnedModeActive}
                  onChange={(e) => {
                    if (allLearnedModeActive) return;
                    setOnlyLearned(e.target.checked);
                  }}
                />
                nur gelernte Karten
              </label>
            ) : (
              <p className="text-xs text-muted-foreground">
                Generator-Modus: Zahlen werden dynamisch im Bereich 0 bis {numberMaxValue} erzeugt.
              </p>
            )}

            {mode === "blitz" ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">Zeitlimit</p>
                <div className="flex flex-wrap gap-2">
                  {([60, 90, 120] as BlitzDurationOption[]).map((seconds) => (
                    <Button
                      key={seconds}
                      size="sm"
                      variant={blitzDurationSec === seconds ? "default" : "secondary"}
                      className={`min-h-[44px] transition-all ${
                        blitzDurationSec === seconds
                          ? "shadow-sm ring-2 ring-primary/30"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setBlitzDurationSec(seconds)}
                    >
                      {seconds}s
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">Fragenanzahl</p>
                <div className="flex flex-wrap gap-2">
                  {([10, 15, 20] as const).map((count) => (
                    <Button
                      key={count}
                      size="sm"
                      variant={selectedQuestionCount === count ? "default" : "secondary"}
                      className={`min-h-[44px] transition-all ${
                        selectedQuestionCount === count
                          ? "shadow-sm ring-2 ring-primary/30"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => {
                        if (mode === "quiz") setQuizQuestionCount(count);
                        if (mode === "audio") setAudioQuestionCount(count);
                        if (mode === "numbers") setNumberQuestionCount(count);
                      }}
                    >
                      {count}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant={selectedQuestionCount === "ALL" ? "default" : "secondary"}
                    className={`min-h-[44px] transition-all ${
                      selectedQuestionCount === "ALL"
                        ? "shadow-sm ring-2 ring-primary/30"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      if (mode !== "numbers") {
                        setOnlyLearned(true);
                      }
                      if (mode === "quiz") setQuizQuestionCount("ALL");
                      if (mode === "audio") setAudioQuestionCount("ALL");
                      if (mode === "numbers") setNumberQuestionCount("ALL");
                    }}
                  >
                    {mode === "numbers" ? "Alle generierten Zahlen" : "Alle gelernten Karten"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mode === "numbers"
                    ? "Alle nutzt den kompletten aktuell generierten Zahlenpool."
                    : "Alle nutzt alle aktuell verfügbaren gelernten Karten."}
                </p>
              </div>
            )}

            {mode !== "numbers" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="gameLessonSelect">
                  Lektion
                </label>
                <select
                  id="gameLessonSelect"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={selectedLesson ?? ""}
                  onChange={(e) =>
                    setSelectedLesson(e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <option value="">Alle Lektionen</option>
                  {lessons.map((lesson) => (
                    <option key={lesson} value={lesson}>
                      {`Lektion ${lesson}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="numbersMaxValue">
                  Maximalzahl
                </label>
                <input
                  id="numbersMaxValue"
                  type="number"
                  min={100}
                  max={1_000_000}
                  value={numberMaxValue}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    if (!Number.isFinite(parsed)) return;
                    setNumberMaxValue(Math.max(100, Math.min(1_000_000, parsed)));
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Bereich fuer generierte Zahlen: 0 bis {numberMaxValue}.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {loadingPreview
                ? "Berechne verfügbare Karten..."
                : mode === "numbers"
                  ? `${previewCount} generierte Zahlenkarten verfügbar`
                  : `${previewCount} Karten verfügbar`}
            </p>
            {status ? <div className="text-sm text-red-600">{status}</div> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => setSetupDialogOpen(false)}>
                Zurück
              </Button>
              <Button
                onClick={async () => {
                  const started = await startGame();
                  if (started) setSetupDialogOpen(false);
                }}
                disabled={loadingPreview}
              >
                Spiel starten
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={endGameDialogOpen} onOpenChange={setEndGameDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Spiel beenden?</DialogTitle>
            <DialogDescription>
              Die aktuelle Runde wird beendet und mit dem bisherigen Ergebnis gespeichert.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEndGameDialogOpen(false)}>
              Weiterspielen
            </Button>
            <Button variant="destructive" onClick={endCurrentGame}>
              Spiel jetzt beenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {gameRunning && question ? (
        <Card className="p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setEndGameDialogOpen(true)}
            >
              Spiel beenden
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>Punkte: {score}</span>
            {mode === "blitz" ? <span>Zeit: {timeLeft}s</span> : null}
            {progressText ? <span>{progressText}</span> : null}
          </div>

          {mode === "blitz" ? (
            <BlitzGamePanel
              question={question}
              answerFeedback={answerFeedback}
              onAnswer={answerQuestion}
            />
          ) : null}
          {mode === "quiz" ? (
            <QuizGamePanel
              question={question}
              answerFeedback={answerFeedback}
              showPromptAudio={canPlayPromptTts}
              onPlayAudio={() => void playQuestionAudio()}
              onAnswer={answerQuestion}
            />
          ) : null}
          {mode === "audio" ? (
            <AudioGamePanel
              question={question}
              answerFeedback={answerFeedback}
              isSpeaking={isSpeaking}
              showPromptAudio={canPlayPromptTts}
              onPlayAudio={() => void playQuestionAudio()}
              onAnswer={answerQuestion}
            />
          ) : null}
          {mode === "numbers" ? (
            <NumberGamePanel
              question={question}
              answerFeedback={answerFeedback}
              onAnswer={answerQuestion}
            />
          ) : null}

          {answerFeedback ? (
            <div
              className={`rounded-md border p-2 text-sm ${
                answerFeedback.isCorrect
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
              }`}
            >
              {answerFeedback.isCorrect
                ? "✅ Richtig!"
                : `❌ Falsch. Richtig ist: ${answerFeedback.correct}`}
            </div>
          ) : null}

          {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
        </Card>
      ) : null}

      {result ? (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur animate-in fade-in-0 duration-200">
          <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center p-3">
            <Card className="w-full max-w-md p-4 space-y-4 shadow-xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-lg font-semibold">Ergebnis</h3>
                <p className="text-sm text-muted-foreground">
                  {getModeConfig(result.mode).resultLabel}{" "}
                  abgeschlossen
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border p-2">
                  Punkte
                  <div className="text-lg font-semibold">{result.score}</div>
                </div>
                <div className="rounded-md border p-2">
                  Richtig
                  <div className="text-lg font-semibold">{result.correctAnswers}</div>
                </div>
                <div className="rounded-md border p-2">
                  Fragen
                  <div className="text-lg font-semibold">{result.answered}/{result.totalQuestions}</div>
                </div>
                <div className="rounded-md border p-2">
                  XP
                  <div className="text-lg font-semibold">+{result.xpGained + result.bonusXp}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Level danach: <b>{result.levelAfter}</b>
              </p>
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
                <Button onClick={startGame} className="flex-1 min-w-[160px]">
                  Nochmal spielen
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-w-[160px]"
                  onClick={() => {
                    setResult(null);
                    resetGameState();
                  }}
                >
                  Zurück zur Auswahl
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
