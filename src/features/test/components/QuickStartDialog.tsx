import type { LearnDirection } from "../../../lib/sessionTypes";
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
  limit: string;
  onLimitChange: (value: string) => void;
  onStart: () => void;
};

export function QuickStartDialog({
  open,
  onOpenChange,
  direction,
  onDirectionChange,
  showTransliteration,
  onShowTransliterationChange,
  limit,
  onLimitChange,
  onStart,
}: QuickStartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fällige Karten testen</DialogTitle>
          <DialogDescription>
            Gelernte Karten, die noch nicht 5× richtig beantwortet wurden — bis 5× richtig.
          </DialogDescription>
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

          <p className="text-xs text-muted-foreground">
            Für 1×-Wiederholung (auch alle gelernten) nutze „Zuletzt gelernt testen“.
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
