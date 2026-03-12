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

type NumberQuickStartDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: LearnDirection;
  onDirectionChange: (direction: LearnDirection) => void;
  showNumberTransliteration: boolean;
  onShowNumberTransliterationChange: (checked: boolean) => void;
  includeAllLearned: boolean;
  onIncludeAllLearnedChange: (checked: boolean) => void;
  generatorMode: boolean;
  onGeneratorModeChange: (checked: boolean) => void;
  generatorFrom: string;
  onGeneratorFromChange: (value: string) => void;
  generatorTo: string;
  onGeneratorToChange: (value: string) => void;
  maxGeneratedNumber: number;
  limit: string;
  onLimitChange: (value: string) => void;
  onStart: () => void;
};

export function NumberQuickStartDialog({
  open,
  onOpenChange,
  direction,
  onDirectionChange,
  showNumberTransliteration,
  onShowNumberTransliterationChange,
  includeAllLearned,
  onIncludeAllLearnedChange,
  generatorMode,
  onGeneratorModeChange,
  generatorFrom,
  onGeneratorFromChange,
  generatorTo,
  onGeneratorToChange,
  maxGeneratedNumber,
  limit,
  onLimitChange,
  onStart,
}: NumberQuickStartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zahlentest</DialogTitle>
          <DialogDescription>Konfiguriere deinen Zahlen-Schnellstart</DialogDescription>
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
                aria-label="Zahlentest-Richtung: Thai nach Deutsch"
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
                aria-label="Zahlentest-Richtung: Deutsch nach Thai"
              >
                Deutsch → Thai
              </Button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={showNumberTransliteration}
              onChange={(e) => onShowNumberTransliterationChange(e.target.checked)}
              aria-label="Lautschrift im Zahlentest anzeigen"
            />
            Lautschrift anzeigen
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={includeAllLearned}
              onChange={(e) => onIncludeAllLearnedChange(e.target.checked)}
              disabled={generatorMode}
              aria-label="Alle gelernten Zahlen statt nur fällige Zahlen testen"
            />
            Alle gelernten Zahlen (statt nur fällige)
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={generatorMode}
              onChange={(e) => onGeneratorModeChange(e.target.checked)}
              aria-label="Zahlen von bis testen aktivieren"
            />
            Zahlen von-bis testen
          </label>

          {generatorMode ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="numberGeneratorFrom">
                    Von
                  </label>
                  <input
                    id="numberGeneratorFrom"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxGeneratedNumber}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="z.B. 850"
                    value={generatorFrom}
                    onChange={(e) => onGeneratorFromChange(e.target.value)}
                    aria-label="Von Zahl fuer Generator-Zahlentest"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="numberGeneratorTo">
                    Bis
                  </label>
                  <input
                    id="numberGeneratorTo"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxGeneratedNumber}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="z.B. 950"
                    value={generatorTo}
                    onChange={(e) => onGeneratorToChange(e.target.value)}
                    aria-label="Bis Zahl fuer Generator-Zahlentest"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Zahlen werden dynamisch im gewählten Bereich erzeugt (z. B. 850 bis 950).
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="numberQuickStartLimit">
              Kartenlimit (optional)
            </label>
            <input
              id="numberQuickStartLimit"
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="z.B. 20"
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              aria-label="Optionales Kartenlimit für Zahlentest"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {generatorMode
              ? "Von-bis-Test ignoriert SRS-Faelligkeit und erstellt einen dynamischen Zahlenpool."
                : "Standard zeigt fällige oder noch nicht 5x richtig beantwortete gelernte Zahlen. Für Voll-Review optional \"Alle gelernten Zahlen\" aktivieren."}
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Abbrechen
          </Button>
          <Button onClick={onStart} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white">
            Zahlentest starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

