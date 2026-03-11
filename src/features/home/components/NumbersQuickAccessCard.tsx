import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Route } from "../types";

type NumbersQuickAccessCardProps = {
  onNavigate?: (route: Route) => void;
};

export function NumbersQuickAccessCard({ onNavigate }: NumbersQuickAccessCardProps) {
  return (
    <Card className="p-4 space-y-3 border-indigo-200/70 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20">
      <div>
        <h3 className="text-lg font-semibold">🔢 Zahlenmodule</h3>
        <p className="text-xs text-muted-foreground">
          Zahlen sind von normalen Vokabeln getrennt (eigener Lernfortschritt, Tests, Examen,
          Spiele).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            localStorage.setItem("openNumbersLessonDialog", "true");
            onNavigate?.("learn");
          }}
        >
          Lernen
        </Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            localStorage.setItem("openNumberQuickStartDialog", "true");
            onNavigate?.("test");
          }}
        >
          Test
        </Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            localStorage.setItem("openNumbersExamMode", "true");
            onNavigate?.("exam");
          }}
        >
          Examen
        </Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            localStorage.setItem("openNumbersGameSetup", "true");
            onNavigate?.("games");
          }}
        >
          Spiel
        </Button>
      </div>
    </Card>
  );
}

