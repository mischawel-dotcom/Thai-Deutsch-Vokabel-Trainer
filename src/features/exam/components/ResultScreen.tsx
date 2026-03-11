import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExamDomain } from "@/lib/sessionTypes";

type ResultScreenProps = {
  examDomain: ExamDomain;
  score: number;
  totalQuestions: number;
  onReset: () => void;
  onRepeat: () => void;
};

export function ResultScreen({
  examDomain,
  score,
  totalQuestions,
  onReset,
  onRepeat,
}: ResultScreenProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 85;
  let resultColor = "text-red-600 dark:text-red-400";
  if (percentage >= 50) resultColor = "text-yellow-600 dark:text-yellow-400";
  if (percentage >= 75) resultColor = "text-green-600 dark:text-green-400";

  return (
    <PageShell title="Examen - Ergebnis">
      <div className="space-y-4 sm:space-y-6">
        <Card className="space-y-3 p-4 text-center sm:space-y-4 sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">Gratuliere!</h2>

          <div className={`text-4xl font-bold sm:text-5xl ${resultColor}`}>
            {score}/{totalQuestions}
          </div>

          <div className="text-base font-semibold text-muted-foreground sm:text-lg">
            {percentage}% korrekt
          </div>

          {examDomain === "numbers" && (
            <div
              className={`inline-flex mx-auto rounded-full px-3 py-1 text-sm font-semibold ${
                passed
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
              }`}
            >
              {passed ? "✅ Bestanden (ab 85%)" : "❌ Nicht bestanden (unter 85%)"}
            </div>
          )}

          <p className="mt-3 text-sm text-muted-foreground sm:mt-4">
            {percentage >= 85 &&
              (examDomain === "numbers"
                ? "Ausgezeichnet! 🎉 Zahlenexamen bestanden."
                : "Ausgezeichnet! 🎉 Lektion abgeschlossen!")}
            {percentage >= 70 &&
              percentage < 85 &&
              "Gute Leistung! 👍 Bitte versuchen Sie es nochmal für eine bessere Note."}
            {percentage >= 50 && percentage < 70 && "Noch etwas üben! 📚"}
            {percentage < 50 && "Viel Erfolg beim nächsten Mal! 💪"}
          </p>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            onClick={onReset}
            className="h-11 flex-1 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
          >
            Neue Lektion wählen
          </Button>
          <Button
            onClick={onRepeat}
            variant="outline"
            className="h-11 flex-1 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
          >
            Wiederholen
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

