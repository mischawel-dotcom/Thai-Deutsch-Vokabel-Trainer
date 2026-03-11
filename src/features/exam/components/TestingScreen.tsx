import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { speak, stopSpeak } from "@/features/tts";
import { getSpeakableText } from "@/features/exam/helpers";
import type { Question } from "@/features/exam/types";
import type { ExamDirection, ExamDomain } from "@/lib/sessionTypes";

type TestingScreenProps = {
  examDomain: ExamDomain;
  direction: ExamDirection;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answered: Record<number, string>;
  confirmEndExamOpen: boolean;
  onAnswer: (option: string) => void;
  onContinue: () => void;
  onConfirmDialogChange: (open: boolean) => void;
  onEndRequest: () => void;
  onCancelEnd: () => void;
  onConfirmEnd: () => void;
};

export function TestingScreen({
  examDomain,
  direction,
  questions,
  currentQuestionIndex,
  score,
  answered,
  confirmEndExamOpen,
  onAnswer,
  onContinue,
  onConfirmDialogChange,
  onEndRequest,
  onCancelEnd,
  onConfirmEnd,
}: TestingScreenProps) {
  const question = questions[currentQuestionIndex];
  const userAnswer = answered[currentQuestionIndex];
  const isAnswered = userAnswer !== undefined;

  return (
    <PageShell title="Examen">
      <div className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-end">
            <Button
              onClick={onEndRequest}
              variant="outline"
              size="sm"
              className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Examen beenden
            </Button>
          </div>
        </div>

        <div className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted/70 px-2 py-1">
            Frage <b className="text-foreground">{currentQuestionIndex + 1}</b> von{" "}
            <b className="text-foreground">{questions.length}</b>
          </span>
          <span className="rounded-full bg-muted/70 px-2 py-1">
            Punkte: <b className="text-foreground">{score}</b>
          </span>
        </div>

        <div className="mx-auto mt-2 w-full max-w-2xl">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300 dark:bg-blue-600"
              style={{
                width: `${Math.max(1, ((currentQuestionIndex + 1) / questions.length) * 100)}%`,
                minWidth: "2px",
              }}
            />
          </div>
        </div>

        <Card className="mx-auto mt-3 flex w-full min-h-0 max-w-xs flex-col overflow-y-auto p-4 shadow-lg sm:max-w-md md:max-w-2xl">
          <div className="space-y-3">
            <div className="text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-semibold leading-snug text-primary">
                {question.questionText}
              </div>
              <Button
                onClick={() => {
                  const textToSpeak = getSpeakableText(
                    direction === "TH_DE" ? question.thai : question.german
                  );
                  const lang = direction === "TH_DE" ? "th-TH" : "de-DE";
                  void speak(textToSpeak, lang);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  stopSpeak();
                }}
                variant="outline"
                size="sm"
                className="mx-auto min-h-[44px] shadow-md"
                title="Klick = Abspielen, Rechtsklick = Stoppen"
              >
                🔊 Vorlesen
              </Button>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Wähle die richtige Antwort
              </p>
            </div>

            <div className="grid gap-2">
              {question.options.map((option, idx) => {
                const isSelected = userAnswer === option;
                const isCorrect = option === question.correctAnswer;

                const alignmentClass =
                  examDomain === "numbers"
                    ? "justify-center text-center"
                    : "justify-start px-3 text-left";
                let buttonClassName = `h-11 text-sm ${alignmentClass}`;
                if (isAnswered) {
                  if (isCorrect) {
                    buttonClassName +=
                      " bg-green-100 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-900 text-foreground";
                  } else if (isSelected && !isCorrect) {
                    buttonClassName +=
                      " bg-red-100 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-900 text-foreground";
                  }
                }

                return (
                  <Button
                    key={idx}
                    onClick={() => !isAnswered && onAnswer(option)}
                    variant={isSelected ? "default" : "outline"}
                    className={buttonClassName}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>

            {isAnswered ? (
              <div className="mt-2 rounded-lg bg-muted p-2 animate-in fade-in" aria-live="polite">
                {userAnswer === question.correctAnswer ? (
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    ✓ Richtig!
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">✗ Falsch</p>
                    <p className="text-xs text-foreground">
                      Richtige Antwort: {question.correctAnswer}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">(Nächste Frage in Kürze...)</p>
              </div>
            ) : null}
          </div>
        </Card>

        {isAnswered ? (
          <div className="mt-2 w-full max-w-2xl shrink-0 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
            <div className="rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur">
              <Button onClick={onContinue} className="h-11 w-full" variant="outline" size="sm">
                Jetzt weiter →
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <Dialog open={confirmEndExamOpen} onOpenChange={onConfirmDialogChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Examen beenden?</DialogTitle>
            <DialogDescription>
              Dein aktuelles Examen wird beendet und du kehrst zur Auswahl zurück.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="h-11" onClick={onCancelEnd}>
              Abbrechen
            </Button>
            <Button variant="destructive" className="h-11" onClick={onConfirmEnd}>
              Beenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

