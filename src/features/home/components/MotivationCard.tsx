import { Card } from "@/components/ui/card";

type MotivationCardProps = {
  dueCount: number;
};

export function MotivationCard({ dueCount }: MotivationCardProps) {
  if (dueCount <= 0) return null;

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <p className="text-sm text-center">
        💪 <strong>Tipp:</strong> Kurze, regelmäßige Sessions sind effektiver als lange Pausen!
      </p>
    </Card>
  );
}

