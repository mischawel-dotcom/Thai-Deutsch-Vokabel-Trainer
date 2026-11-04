import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { speak } from "../tts";
import {
  createPotpourriQuestionWithRetry,
  isPotpourriWon,
  nextPotpourriScore,
} from "./engine";
import type { PotpourriCard, PotpourriFeedback, PotpourriQuestion } from "./types";

const FEEDBACK_MS_CORRECT = 650;
const FEEDBACK_MS_WRONG = 1400;

type PotpourriSessionViewProps = {
  pool: PotpourriCard[];
  learnedPool: PotpourriCard[];
  catalogPool: PotpourriCard[];
  target: number;
  onExit: () => void;
};

export function PotpourriSessionView({
  pool,
  learnedPool,
  catalogPool,
  target,
  onExit,
}: PotpourriSessionViewProps) {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<PotpourriQuestion | null>(null);
  const [feedback, setFeedback] = useState<PotpourriFeedback | null>(null);
  const [won, setWon] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const autoSpeakRef = useRef(false);

  function clearFeedbackTimer() {
    if (feedbackTimerRef.current != null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }

  function loadNextQuestion() {
    const next = createPotpourriQuestionWithRetry(pool, learnedPool, catalogPool);
    if (!next) {
      setError("Konnte keine Frage mit 4 Antwortmöglichkeiten erzeugen.");
      setQuestion(null);
      return;
    }
    setError("");
    setFeedback(null);
    setQuestion(next);
    autoSpeakRef.current = next.mode.startsWith("AUDIO_");
  }

  useEffect(() => {
    loadNextQuestion();
    return () => clearFeedbackTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!question || !autoSpeakRef.current) return;
    autoSpeakRef.current = false;
    void playPrompt(question);
  }, [question]);

  async function playPrompt(q: PotpourriQuestion = question!) {
    if (!q?.speakText) return;
    setIsSpeaking(true);
    try {
      await speak(q.speakText, q.speakLang);
    } finally {
      setIsSpeaking(false);
    }
  }

  function handleAnswer(option: string) {
    if (!question || feedback || won) return;
    const isCorrect = option === question.correctAnswer;
    const nextScore = nextPotpourriScore(score, isCorrect);
    setScore(nextScore);
    setFeedback({
      selected: option,
      correct: question.correctAnswer,
      isCorrect,
    });

    clearFeedbackTimer();
    const delay = isCorrect ? FEEDBACK_MS_CORRECT : FEEDBACK_MS_WRONG;
    feedbackTimerRef.current = window.setTimeout(() => {
      if (isPotpourriWon(nextScore, target)) {
        setWon(true);
        setFeedback(null);
        return;
      }
      loadNextQuestion();
    }, delay);
  }

  const isAudio = question?.mode.startsWith("AUDIO_") ?? false;
  const modeLabel = question
    ? {
        TH_DE: "Thai → Deutsch",
        DE_TH: "Deutsch → Thai",
        AUDIO_TH_DE: "Audio Thai → Deutsch",
        AUDIO_DE_TH: "Audio Deutsch → Thai",
      }[question.mode]
    : "";

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">🔀 Vokabel-Potpourri</div>
          <div className="text-xs text-muted-foreground">
            Zähler {score} / {target}
            {modeLabel ? ` · ${modeLabel}` : ""}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onExit}>
          Beenden
        </Button>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-violet-600 transition-all"
          style={{ width: `${Math.min(100, Math.round((score / Math.max(1, target)) * 100))}%` }}
        />
      </div>

      {error ? <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p> : null}

      {won ? (
        <div className="space-y-3 text-center py-6">
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Potpourri geschafft!
          </p>
          <p className="text-sm text-muted-foreground">
            Ziel erreicht: {score} / {target}
          </p>
          <Button type="button" onClick={onExit} className="h-11">
            Zurück zu den Tests
          </Button>
        </div>
      ) : question ? (
        <>
          <div className="rounded-md border p-4 text-center space-y-3">
            {isAudio ? (
              <p className="text-xs text-muted-foreground">Hör zu und wähle die Übersetzung</p>
            ) : (
              <p className="text-xs text-muted-foreground">Übersetze</p>
            )}

            {!isAudio && question.promptText ? (
              <p
                className={cn(
                  "font-semibold leading-snug",
                  question.mode === "TH_DE"
                    ? "text-3xl sm:text-4xl"
                    : "text-2xl sm:text-3xl text-blue-600 dark:text-blue-400"
                )}
                lang={question.mode === "TH_DE" ? "th" : undefined}
              >
                {question.promptText}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void playPrompt()}
              title={isSpeaking ? "Spricht…" : "Vorlesen"}
              aria-label="Vorlesen"
              aria-busy={isSpeaking}
              disabled={isSpeaking}
              className="text-3xl leading-none transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              🔊
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => {
              const feedbackClass = feedback
                ? option === feedback.correct
                  ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
                  : option === feedback.selected
                    ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                    : ""
                : "";
              return (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  disabled={Boolean(feedback)}
                  className={cn(
                    "h-auto min-h-11 whitespace-normal py-2",
                    question.answerIsThai ? "text-lg" : "text-sm",
                    feedbackClass
                  )}
                  lang={question.answerIsThai ? "th" : undefined}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {feedback && !feedback.isCorrect ? (
            <p className="text-sm text-center text-muted-foreground">
              Richtig:{" "}
              <span
                className="font-medium text-foreground"
                lang={question.answerIsThai ? "th" : undefined}
              >
                {feedback.correct}
              </span>
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
