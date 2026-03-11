import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import type { ExamDomain, ExamDirection } from "@/lib/sessionTypes";

type DirectionScreenProps = {
  examDomain: ExamDomain;
  selectedLesson: number | null;
  numberGeneratorMode?: boolean;
  onStart: (direction: ExamDirection) => void;
  onBack: () => void;
};

export function DirectionScreen({
  examDomain,
  selectedLesson,
  numberGeneratorMode = false,
  onStart,
  onBack,
}: DirectionScreenProps) {
  const title =
    examDomain === "numbers"
      ? numberGeneratorMode
        ? "Zahlenexamen - Generator"
        : `Zahlenexamen - Lektion ${selectedLesson ?? ""}`
      : `Examen - Lektion ${selectedLesson ?? ""}`;

  return (
    <PageShell title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Wähle die Richtung für deinen Test:</p>

        <div className="grid gap-3">
          <Button
            onClick={() => onStart("TH_DE")}
            className="w-full justify-start h-auto py-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
            variant="outline"
          >
            <div className="text-left">
              <div className="font-semibold">Thai → Deutsch</div>
              <div className="text-xs text-muted-foreground">
                {examDomain === "numbers"
                  ? "Sehe Thai-Zahl, wähle deutsche Zahl"
                  : "Sehe Thai-Wort, wähle deutsche Übersetzung"}
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onStart("DE_TH")}
            className="w-full justify-start h-auto py-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
            variant="outline"
          >
            <div className="text-left">
              <div className="font-semibold">Deutsch → Thai</div>
              <div className="text-xs text-muted-foreground">
                {examDomain === "numbers"
                  ? "Sehe deutsche Zahl, wähle Thai-Zahl"
                  : "Sehe deutsches Wort, wähle Thai-Übersetzung"}
              </div>
            </div>
          </Button>
        </div>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full mt-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
        >
          ← Zurück
        </Button>
      </div>
    </PageShell>
  );
}

