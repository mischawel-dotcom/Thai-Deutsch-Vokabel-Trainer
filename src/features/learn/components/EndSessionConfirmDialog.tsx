import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EndSessionConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function EndSessionConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: EndSessionConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Lektion beenden?</DialogTitle>
          <DialogDescription>Du kannst später jederzeit eine neue Lernsession starten.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="destructive" className="h-11" onClick={onConfirm}>
            Beenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

