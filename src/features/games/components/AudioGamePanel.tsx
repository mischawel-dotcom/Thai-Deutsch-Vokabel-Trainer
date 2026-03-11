import { Button } from "@/components/ui/button";
import type { AnswerFeedback, GameQuestion } from "../types";

type AudioGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  isSpeaking: boolean;
  onPlayAudio: () => void;
  onAnswer: (option: string) => void;
};

export default function AudioGamePanel({
  question,
  answerFeedback,
  isSpeaking,
  onPlayAudio,
  onAnswer,
}: AudioGamePanelProps) {
  return (
    <>
      <div className="rounded-md border p-4">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Hoere zu und waehle die richtige Uebersetzung:
          </p>
          <Button variant="outline" onClick={onPlayAudio} disabled={isSpeaking}>
            {isSpeaking ? "Spielt..." : "🔊 Audio abspielen"}
          </Button>
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
