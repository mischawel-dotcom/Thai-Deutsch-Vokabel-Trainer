import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VocabEntry } from "@/db/db";
import type { ExamDomain } from "@/lib/sessionTypes";
import PageShell from "@/components/PageShell";

type SelectionScreenProps = {
  loading: boolean;
  examDomain: ExamDomain;
  availableLessons: number[];
  vocabByLesson: Record<number, VocabEntry[]>;
  onDomainChange: (domain: ExamDomain) => void;
  onStartGeneratedNumbers: () => void;
  onLessonSelect: (lesson: number) => void;
};

export function SelectionScreen({
  loading,
  examDomain,
  availableLessons,
  vocabByLesson,
  onDomainChange,
  onStartGeneratedNumbers,
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

        {examDomain === "numbers" && (
          <Card className="p-4 space-y-3 border-indigo-200/70 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <h3 className="text-sm font-semibold">Generator-Zahlenexamen (100 Fragen)</h3>
            <p className="text-xs text-muted-foreground">
              Fester Mix: 60% aus 0-100, 20% aus 101-1.000, 15% aus 1.001-100.000, 5% aus
              100.001-9.999.999.
            </p>
            <Button className="w-full h-11" onClick={onStartGeneratedNumbers}>
              Zahlenexamen starten
            </Button>
          </Card>
        )}

        {examDomain !== "numbers" && (
        <div className="grid gap-3">
          {availableLessons.map((lesson) => {
            const cardCount = vocabByLesson[lesson]?.length ?? 0;
            return (
              <Button
                key={lesson}
                onClick={() => onLessonSelect(lesson)}
                className="w-full justify-start h-auto py-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
                variant="outline"
              >
                <div className="text-left">
                  <div className="font-semibold">{`Lektion ${lesson}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {cardCount} Vokabeln
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        )}

        {availableLessons.length === 0 && examDomain !== "numbers" && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Keine Lektionen verfügbar. Bitte importiere zuerst Vokabeln.
            </p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}

