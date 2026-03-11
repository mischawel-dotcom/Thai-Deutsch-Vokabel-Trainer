import type { ConfirmAction } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SessionActionConfirmDialogProps = {
  action: ConfirmAction | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SessionActionConfirmDialog({
  action,
  onCancel,
  onConfirm,
}: SessionActionConfirmDialogProps) {
  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action === "restart" ? "Test neu starten?" : "Test beenden?"}</DialogTitle>
          <DialogDescription>
            {action === "restart"
              ? "Alle Session-Zähler werden zurückgesetzt."
              : "Dein aktueller Fortschritt dieser Session wird beendet."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button variant="destructive" className="h-11" onClick={onConfirm}>
            {action === "restart" ? "Neu starten" : "Beenden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

