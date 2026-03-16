import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Route } from "../types";

type SentencesQuickAccessCardProps = {
  onNavigate?: (route: Route) => void;
  sentenceTotal: number;
  sentenceUnlocked: number;
  sentenceUnlockedLearned: number;
  sentenceBlockTotal: number;
  sentenceBlockUnlocked: number;
  sentenceNextBlockLabel: string | null;
  sentenceNextBlockCurrentPassed: number;
  sentenceNextBlockThreshold: number;
};

export function SentencesQuickAccessCard({
  onNavigate,
  sentenceTotal,
  sentenceUnlocked,
  sentenceUnlockedLearned,
  sentenceBlockTotal,
  sentenceBlockUnlocked,
  sentenceNextBlockLabel,
  sentenceNextBlockCurrentPassed,
  sentenceNextBlockThreshold,
}: SentencesQuickAccessCardProps) {
  return (
    <Card className="p-4 space-y-3 border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20">
      <div>
        <h3 className="text-lg font-semibold">💬 Satzlernen (Pilot)</h3>
        <p className="text-xs text-muted-foreground">
          Satzblöcke werden über „im Test bestanden“ freigeschaltet. Aktuell: Lektion 1, Block
          1-50.
        </p>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Blöcke freigeschaltet: {sentenceBlockUnlocked}/{sentenceBlockTotal}
        </p>
        <p>
          Sätze verfügbar: {sentenceUnlocked}/{sentenceTotal}
        </p>
        <p>
          Bereits gelernt (freigeschaltet): {sentenceUnlockedLearned}/{sentenceUnlocked}
        </p>
        {sentenceNextBlockLabel && sentenceNextBlockThreshold > 0 ? (
          <p>
            Nächster Block ({sentenceNextBlockLabel}) bei {sentenceNextBlockThreshold} Test-bestäten
            Karten: {Math.min(sentenceNextBlockCurrentPassed, sentenceNextBlockThreshold)}/
            {sentenceNextBlockThreshold}
          </p>
        ) : (
          <p>Alle definierten Satzblöcke sind freigeschaltet.</p>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full"
        disabled={sentenceUnlocked <= 0}
        onClick={() => {
          localStorage.setItem("openSentenceLearnSession", "true");
          onNavigate?.("learn");
        }}
      >
        Satzlernen starten
      </Button>
    </Card>
  );
}

