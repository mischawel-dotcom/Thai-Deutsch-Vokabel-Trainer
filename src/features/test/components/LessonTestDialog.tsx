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

type LessonTestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: number | null;
  direction: LearnDirection;
  onDirectionChange: (direction: LearnDirection) => void;
  showTransliteration: boolean;
  onShowTransliterationChange: (checked: boolean) => void;
  cardLimit: string;
  onCardLimitChange: (value: string) => void;
  includeLearnedInDialog: boolean;
  onIncludeLearnedInDialogChange: (checked: boolean) => void;
  onStart: () => void;
};

function blurActiveInput() {
  const active = document.activeElement;
  if (active instanceof HTMLInputElement) {
    active.blur();
  }
}

export function LessonTestDialog({
  open,
  onOpenChange,
  selectedLesson,
  direction,
  onDirectionChange,
  showTransliteration,
  onShowTransliterationChange,
  cardLimit,
  onCardLimitChange,
  includeLearnedInDialog,
  onIncludeLearnedInDialogChange,
  onStart,
}: LessonTestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm max-h-[85dvh] overflow-y-auto"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Lektion {selectedLesson} testen</DialogTitle>
          <DialogDescription>Konfiguriere deine Test-Session</DialogDescription>
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
                aria-label="Richtung im Testdialog: Thai nach Deutsch"
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
                aria-label="Richtung im Testdialog: Deutsch nach Thai"
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
              aria-label="Lautschrift im Lektionstest anzeigen"
            />
            Lautschrift anzeigen
          </label>

          <div className="space-y-2">
            <label htmlFor="cardLimit" className="text-sm font-medium">
              Anzahl der Karten
            </label>
            <input
              type="number"
              id="cardLimit"
              value={cardLimit}
              onChange={(e) => onCardLimitChange(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Alle Karten"
              aria-describedby="cardLimit-description"
            />
            <p className="text-xs text-muted-foreground" id="cardLimit-description">
              Standard: alle verfügbaren Karten der Lektion
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeLearnedInDialog"
              checked={includeLearnedInDialog}
              onChange={(e) => onIncludeLearnedInDialogChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="includeLearnedInDialog"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Bereits bestandene Karten einschließen
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onPointerDown={blurActiveInput}
            onClick={() => onOpenChange(false)}
            className="h-11 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
          >
            Abbrechen
          </Button>
          <Button
            onPointerDown={blurActiveInput}
            onClick={onStart}
            className="h-11 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Test starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

