import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PotpourriStartDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: string;
  onLimitChange: (value: string) => void;
  onStart: () => void;
};

export function PotpourriStartDialog({
  open,
  onOpenChange,
  limit,
  onLimitChange,
  onStart,
}: PotpourriStartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vokabel-Potpourri</DialogTitle>
          <DialogDescription>
            Die zuletzt gelernten Karten – Text Thai↔Deutsch oder Audio nur Thai→Deutsch, 4
            Antworten, Zähler bis zum Ziel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="potpourriLimit">
              Anzahl Karten
            </label>
            <input
              id="potpourriLimit"
              type="number"
              inputMode="numeric"
              min={1}
              max={200}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="z.B. 20"
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              aria-label="Anzahl der zuletzt gelernten Karten"
            />
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 30].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={limit === String(preset) ? "default" : "outline"}
                  className="h-9"
                  onClick={() => onLimitChange(String(preset))}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Jede Karte 2× (einmal Audio Thai, einmal Text – nicht dieselbe Art). Zielpunkte = 2 ×
            Kartenanzahl. Richtig +1 · Falsch −3 (min. 0). Distraktoren aus gelernten Karten; bei
            Wochentagen/Zahlwörtern möglichst gleiche Gruppe.
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Abbrechen
          </Button>
          <Button onClick={onStart} className="h-11 bg-violet-600 hover:bg-violet-700 text-white">
            Potpourri starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
