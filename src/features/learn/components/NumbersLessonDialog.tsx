import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NumbersLessonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numbersIncludeViewed: boolean;
  onNumbersIncludeViewedChange: (checked: boolean) => void;
  numbersLearnedCount: number;
  numbersCardLimit: string;
  onNumbersCardLimitChange: (value: string) => void;
  onStart: () => void;
};

export function NumbersLessonDialog({
  open,
  onOpenChange,
  numbersIncludeViewed,
  onNumbersIncludeViewedChange,
  numbersLearnedCount,
  numbersCardLimit,
  onNumbersCardLimitChange,
  onStart,
}: NumbersLessonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zahlenlektion starten</DialogTitle>
          <DialogDescription>Konfiguriere deine Zahlen-Lernsession (0-100)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeViewedNumbers"
              checked={numbersIncludeViewed}
              onChange={(e) => onNumbersIncludeViewedChange(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="includeViewedNumbers" className="text-sm font-medium cursor-pointer">
              Bereits gelernte Zahlen anzeigen ({numbersLearnedCount})
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="numbersCardLimit" className="text-sm font-medium">
              Anzahl der Karten
            </label>
            <input
              type="number"
              id="numbersCardLimit"
              value={numbersCardLimit}
              onChange={(e) => onNumbersCardLimitChange(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="z.B. 10"
            />
            <p className="text-xs text-muted-foreground">
              Standard: dein tägliches Lernziel. Leer = alle verfügbaren Zahlenkarten.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Abbrechen
          </Button>
          <Button onClick={onStart} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white">
            Starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

