import { Button } from "@/components/ui/button";
import type { AnswerFeedback, GameQuestion } from "../types";

type BlitzGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  onAnswer: (option: string) => void;
};

export default function BlitzGamePanel({ question, answerFeedback, onAnswer }: BlitzGamePanelProps) {
  return (
    <>
      <div className="rounded-md border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Uebersetze:</p>
        <p className="text-2xl font-semibold">{question.prompt}</p>
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
