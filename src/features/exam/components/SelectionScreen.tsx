import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NumberEntry, VocabEntry } from "@/db/db";
import type { ExamDomain } from "@/lib/sessionTypes";
import PageShell from "@/components/PageShell";

type SelectionScreenProps = {
  loading: boolean;
  examDomain: ExamDomain;
  availableLessons: number[];
  vocabByLesson: Record<number, VocabEntry[]>;
  numbersByLesson: Record<number, NumberEntry[]>;
  onDomainChange: (domain: ExamDomain) => void;
  onLessonSelect: (lesson: number) => void;
};

export function SelectionScreen({
  loading,
  examDomain,
  availableLessons,
  vocabByLesson,
  numbersByLesson,
  onDomainChange,
  onLessonSelect,
}: SelectionScreenProps) {
  if (loading) {
    return (
      <PageShell title="Examen">
        <p>Laden...</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Examen">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Wähle zuerst den Prüfungsmodus und dann eine Lektion.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant={examDomain === "vocab" ? "default" : "secondary"}
            className={`h-11 ${examDomain === "vocab" ? "ring-2 ring-primary/30" : ""}`}
            onClick={() => onDomainChange("vocab")}
          >
            📚 Vokabel-Examen
          </Button>
          <Button
            variant={examDomain === "numbers" ? "default" : "secondary"}
            className={`h-11 ${examDomain === "numbers" ? "ring-2 ring-primary/30" : ""}`}
            onClick={() => onDomainChange("numbers")}
          >
            🔢 Zahlenexamen
          </Button>
        </div>

        <div className="grid gap-3">
          {availableLessons.map((lesson) => {
            const cardCount =
              examDomain === "numbers"
                ? (numbersByLesson[lesson]?.length ?? 0)
                : (vocabByLesson[lesson]?.length ?? 0);
            return (
              <Button
                key={lesson}
                onClick={() => onLessonSelect(lesson)}
                className="w-full justify-start h-auto py-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
                variant="outline"
              >
                <div className="text-left">
                  <div className="font-semibold">
                    {examDomain === "numbers" ? `Zahlenlektion ${lesson}` : `Lektion ${lesson}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cardCount} {examDomain === "numbers" ? "Zahlenkarten" : "Vokabeln"}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {availableLessons.length === 0 && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              {examDomain === "numbers"
                ? "Keine Zahlenlektionen verfügbar."
                : "Keine Lektionen verfügbar. Bitte importiere zuerst Vokabeln."}
            </p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}

