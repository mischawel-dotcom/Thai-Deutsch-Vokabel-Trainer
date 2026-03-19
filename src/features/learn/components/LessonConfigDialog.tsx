import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LessonConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: number | null;
  includeViewed: boolean;
  onIncludeViewedChange: (checked: boolean) => void;
  selectedLessonLearnedCount: number;
  cardLimit: string;
  onCardLimitChange: (value: string) => void;
  emptySelectionHint?: string;
  onStartWithViewed?: () => void;
  onStart: () => void;
};

function blurActiveInput() {
  const active = document.activeElement;
  if (active instanceof HTMLInputElement) {
    active.blur();
  }
}

export function LessonConfigDialog({
  open,
  onOpenChange,
  selectedLesson,
  includeViewed,
  onIncludeViewedChange,
  selectedLessonLearnedCount,
  cardLimit,
  onCardLimitChange,
  emptySelectionHint,
  onStartWithViewed,
  onStart,
}: LessonConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lektion {selectedLesson} starten</DialogTitle>
          <DialogDescription>Konfiguriere deine Lernsession</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeViewed"
              checked={includeViewed}
              onChange={(e) => onIncludeViewedChange(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="includeViewed" className="text-sm font-medium cursor-pointer">
              Bereits gelernte Karten anzeigen ({selectedLessonLearnedCount})
            </label>
          </div>

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
              placeholder="z.B. 10"
            />
            <p className="text-xs text-muted-foreground">
              Standard: dein tägliches Lernziel. Leer = alle verfügbaren Karten der Lektion.
            </p>
          </div>

          {emptySelectionHint ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 space-y-2">
              <p>{emptySelectionHint}</p>
              {onStartWithViewed ? (
                <Button
                  onPointerDown={blurActiveInput}
                  onClick={onStartWithViewed}
                  className="h-10 w-full text-sm font-medium rounded-lg border transition-colors bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                >
                  Gelernte Karten einschließen und starten
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onPointerDown={blurActiveInput}
            onClick={() => onOpenChange(false)}
            className="h-11"
          >
            Abbrechen
          </Button>
          <Button
            onPointerDown={blurActiveInput}
            onClick={onStart}
            className="h-11 bg-violet-500 hover:bg-violet-600 text-white"
          >
            Starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

