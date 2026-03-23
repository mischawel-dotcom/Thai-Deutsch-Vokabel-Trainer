import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameDirection } from "../../../hooks/useGamesSetup";
import type { AnswerFeedback, GameQuestion } from "../types";

type BlitzGamePanelProps = {
  question: GameQuestion;
  answerFeedback: AnswerFeedback | null;
  onAnswer: (option: string) => void;
  direction: GameDirection;
};

export default function BlitzGamePanel({
  question,
  answerFeedback,
  onAnswer,
  direction,
}: BlitzGamePanelProps) {
  const promptIsThai = direction === "TH_DE";

  return (
    <>
      <div className="rounded-md border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Uebersetze:</p>
        <p
          className={cn(
            "font-semibold leading-snug",
            promptIsThai
              ? "text-3xl sm:text-4xl md:text-5xl"
              : "text-2xl sm:text-3xl"
          )}
          lang={promptIsThai ? "th" : undefined}
        >
          {question.prompt}
        </p>
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
