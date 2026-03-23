import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameDirection } from "../../../hooks/useGamesSetup";
import type { AnswerFeedback, GameQuestion } from "../types";

type QuizGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  direction: GameDirection;
  /** Wenn false: kein Vorlesen-Button (z. B. Deutsch → Thai ohne deutsches TTS). */
  showPromptAudio?: boolean;
  /** Während TTS: Lautsprecher deaktiviert (wie Testkarten). */
  isSpeaking?: boolean;
  onPlayAudio: () => void;
  onAnswer: (option: string) => void;
};

export default function QuizGamePanel({
  question,
  answerFeedback,
  direction,
  showPromptAudio = true,
  isSpeaking = false,
  onPlayAudio,
  onAnswer,
}: QuizGamePanelProps) {
  const promptIsThai = direction === "TH_DE";

  return (
    <>
      <div className="rounded-md border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Uebersetze:</p>
        {showPromptAudio ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="text-center text-4xl font-semibold leading-snug sm:text-5xl"
              lang="th"
            >
              {question.prompt}
            </div>
            <button
              type="button"
              onClick={onPlayAudio}
              title={isSpeaking ? "Spricht…" : "Thai Wort vorlesen"}
              aria-label={`Thai Wort vorlesen: ${question.prompt}`}
              aria-busy={isSpeaking}
              disabled={isSpeaking}
              className="text-3xl leading-none transition-opacity hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50 sm:text-4xl"
            >
              🔊
            </button>
          </div>
        ) : (
          <p
            className={cn(
              "font-semibold leading-snug",
              promptIsThai
                ? "text-3xl sm:text-4xl md:text-5xl"
                : "text-2xl sm:text-3xl text-blue-600 dark:text-blue-400"
            )}
            lang={promptIsThai ? "th" : undefined}
          >
            {question.prompt}
          </p>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => {
          const feedbackClass = answerFeedback
            ? option === answerFeedback.correct
              ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
              : option === answerFeedback.selected
                ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                : ""
            : "";
          return (
            <Button
              key={option}
              variant="outline"
              onClick={() => onAnswer(option)}
              disabled={Boolean(answerFeedback)}
              className={feedbackClass}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </>
  );
}
