import { useEffect, useState } from "react";
import type { LearnDirection } from "../../../lib/sessionTypes";
import { db } from "../../../db/db";
import {
  analyzeDueOrUnfinishedLearned,
  type DueFilterBreakdown,
} from "../../../hooks/quickStartShared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuickStartDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: LearnDirection;
  onDirectionChange: (direction: LearnDirection) => void;
  showTransliteration: boolean;
  onShowTransliterationChange: (checked: boolean) => void;
  includeAllLearned: boolean;
  onIncludeAllLearnedChange: (checked: boolean) => void;
  limit: string;
  onLimitChange: (value: string) => void;
  onStart: () => void;
};

function formatMedian(value: number | null, suffix: string): string {
  if (value === null) return "–";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}${suffix}`;
}

export function QuickStartDialog({
  open,
  onOpenChange,
  direction,
  onDirectionChange,
  showTransliteration,
  onShowTransliterationChange,
  includeAllLearned,
  onIncludeAllLearnedChange,
  limit,
  onLimitChange,
  onStart,
}: QuickStartDialogProps) {
  const [breakdown, setBreakdown] = useState<DueFilterBreakdown | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setBreakdown(null);
      return;
    }

    let cancelled = false;
    setBreakdownLoading(true);

    void (async () => {
      try {
        const vocab = await db.vocab.toArray();
        const learnedIds = vocab
          .filter((entry) => entry.viewed === true && typeof entry.id === "number")
          .map((entry) => entry.id as number);
        const next = await analyzeDueOrUnfinishedLearned(learnedIds, "progress");
        if (!cancelled) setBreakdown(next);
      } catch (error) {
        console.warn("[SRS-Diagnose] Aufschlüsselung fehlgeschlagen", error);
        if (!cancelled) setBreakdown(null);
      } finally {
        if (!cancelled) setBreakdownLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fällige Karten testen</DialogTitle>
          <DialogDescription>Konfiguriere deinen Schnellstart-Test</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Richtung</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={direction === "TH_DE" ? "default" : "secondary"}
                className={`min-h-[44px] transition-all ${
                  direction === "TH_DE"
                    ? "shadow-sm ring-2 ring-primary/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onDirectionChange("TH_DE")}
                aria-pressed={direction === "TH_DE"}
                aria-label="Schnellstart-Richtung: Thai nach Deutsch"
              >
                Thai → Deutsch
              </Button>
              <Button
                type="button"
                size="sm"
                variant={direction === "DE_TH" ? "default" : "secondary"}
                className={`min-h-[44px] transition-all ${
                  direction === "DE_TH"
                    ? "shadow-sm ring-2 ring-primary/30"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onDirectionChange("DE_TH")}
                aria-pressed={direction === "DE_TH"}
                aria-label="Schnellstart-Richtung: Deutsch nach Thai"
              >
                Deutsch → Thai
              </Button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={showTransliteration}
              onChange={(e) => onShowTransliterationChange(e.target.checked)}
              aria-label="Lautschrift im Schnellstart anzeigen"
            />
            Lautschrift anzeigen
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={includeAllLearned}
              onChange={(e) => onIncludeAllLearnedChange(e.target.checked)}
              aria-label="Alle gelernten Karten statt nur fällige Karten testen"
            />
            Alle gelernten Karten (statt nur fällige)
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="quickStartLimit">
              Kartenlimit (optional)
            </label>
            <input
              id="quickStartLimit"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="z.B. 20"
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              aria-label="Optionales Kartenlimit für Schnellstart"
            />
          </div>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Diagnose (aktueller Stand)</p>
            {breakdownLoading ? (
              <p>Zähle Karten…</p>
            ) : breakdown ? (
              <>
                <p>
                  Gelernt: {breakdown.learnedCount} · in Auswahl:{" "}
                  <span className="text-foreground font-medium">{breakdown.eligibleCount}</span>
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>
                    SRS-fällig (≥5×):{" "}
                    <span className="text-foreground font-medium">{breakdown.dueMastered}</span>
                  </li>
                  <li>
                    noch &lt;5× (nicht fällig):{" "}
                    <span className="text-foreground font-medium">{breakdown.unfinishedNotDue}</span>
                  </li>
                  <li>
                    &lt;5× und fällig:{" "}
                    <span className="text-foreground font-medium">{breakdown.unfinishedAndDue}</span>
                  </li>
                </ul>
                <p>
                  Wiederholungen: 0× {breakdown.repsZero} · 1–4× {breakdown.repsOneToFour} · ≥5×{" "}
                  {breakdown.repsFivePlus}
                </p>
                <p>
                  nie bewertet: {breakdown.neverReviewed} · zuletzt falsch:{" "}
                  {breakdown.lastGradeWrong} · Intervall≤1 bei ≥5×:{" "}
                  {breakdown.stuckDailyInterval}
                </p>
                <p>
                  Median Intervall: {formatMedian(breakdown.medianIntervalDays, " Tage")} · Median
                  Ease: {formatMedian(breakdown.medianEase, "")} · Median überfällig:{" "}
                  {formatMedian(breakdown.medianDaysOverdue, " Tage")}
                </p>
              </>
            ) : (
              <p>Diagnose nicht verfügbar.</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Ohne Haken: nur fällige / noch nicht 5× richtige Karten, Session bis 5× richtig. Mit
            „Alle gelernten“: ein Durchgang (1× pro Karte) zur regelmäßigen Wiederholung — falsche
            Karten holst du danach ohne Haken auf 5× nach.
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Abbrechen
          </Button>
          <Button onClick={onStart} className="h-11 bg-blue-600 hover:bg-blue-700 text-white">
            Test starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
