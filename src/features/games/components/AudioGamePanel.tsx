import { Button } from "@/components/ui/button";
import type { AnswerFeedback, GameQuestion } from "../types";

type AudioGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  isSpeaking: boolean;
  /** Wenn false: kein Audio-Button (z. B. Deutsch → Thai ohne deutsches TTS). */
  showPromptAudio?: boolean;
  onPlayAudio: () => void;
  onAnswer: (option: string) => void;
};

export default function AudioGamePanel({
  question,
  answerFeedback,
  isSpeaking,
  showPromptAudio = true,
  onPlayAudio,
  onAnswer,
}: AudioGamePanelProps) {
  return (
    <>
      <div className="rounded-md border p-4 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-muted-foreground">
            {showPromptAudio
              ? "Hoere zu und waehle die richtige Uebersetzung:"
              : "Waehle die richtige Uebersetzung (Audio nur bei Thai → Deutsch)."}
          </p>
          {showPromptAudio ? (
            <button
              type="button"
              onClick={onPlayAudio}
              title={isSpeaking ? "Spricht…" : "Thai Wort anhören"}
              aria-label="Thai Wort anhören"
              aria-busy={isSpeaking}
              disabled={isSpeaking}
              className="text-3xl leading-none transition-opacity hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50 sm:text-4xl"
            >
              🔊
            </button>
          ) : null}
        </div>
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
