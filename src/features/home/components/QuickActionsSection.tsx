import { Button } from "@/components/ui/button";
import type { Route } from "../types";

type QuickActionsSectionProps = {
  dueCount: number;
  onNavigate?: (route: Route) => void;
};

export function QuickActionsSection({ dueCount, onNavigate }: QuickActionsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Button
        size="lg"
        className="h-20 text-lg font-semibold"
        disabled={dueCount === 0}
        onClick={() => onNavigate?.("learn")}
      >
        🎯 Jetzt lernen ({dueCount})
      </Button>
    </div>
  );
}

