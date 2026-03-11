import { Button } from "@/components/ui/button";
import type { AnswerFeedback, GameQuestion } from "../types";

type NumberGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  onAnswer: (option: string) => void;
};

export default function NumberGamePanel({ question, answerFeedback, onAnswer }: NumberGamePanelProps) {
  return (
    <>
      <div className="rounded-md border p-4">
        <p className="text-xs text-muted-foreground mb-2">Ordne die Zahl zu:</p>
        <p className="text-center text-4xl sm:text-5xl leading-tight font-semibold">{question.prompt}</p>
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
              className={`justify-center text-center min-h-[56px] text-2xl font-semibold ${feedbackClass}`.trim()}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </>
  );
}
