import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VocabEntry } from "@/db/db";
import PageShell from "@/components/PageShell";

export type ExamBrowseStep = "root" | "vocabLessons";

type SelectionScreenProps = {
  loading: boolean;
  browseStep: ExamBrowseStep;
  onBrowseStepChange: (step: ExamBrowseStep) => void;
  availableLessons: number[];
  vocabByLesson: Record<number, VocabEntry[]>;
  /** Pro Lektion: Kartenanzahl wie auf Home (volle DB); Exam-Fragen kommen aus dem Übungspool */
  vocabDisplayCountByLesson: Record<number, number>;
  onVocabCategoryClick: () => void;
  onNumbersExamClick: () => void;
  onLessonSelect: (lesson: number) => void;
};

export function SelectionScreen({
  loading,
  browseStep,
  onBrowseStepChange,
  availableLessons,
  vocabByLesson,
  vocabDisplayCountByLesson,
  onVocabCategoryClick,
  onNumbersExamClick,
  onLessonSelect,
}: SelectionScreenProps) {
  if (loading) {
    return (
      <PageShell title="Examen" compactNarrow>
        <p className="text-sm text-muted-foreground">Laden...</p>
      </PageShell>
    );
  }

  if (browseStep === "root") {
    return (
      <PageShell title="Examen" compactNarrow>
        <div className="space-y-2 sm:space-y-4">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Wähle, ob du ein Vokabel- oder ein Zahlenexamen machen möchtest.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <Button
              className="h-auto min-h-[4rem] flex-col justify-center gap-0.5 py-3 text-center sm:min-h-[5rem] sm:gap-1 sm:py-4"
              onClick={() => {
                onVocabCategoryClick();
                onBrowseStepChange("vocabLessons");
              }}
            >
              <span className="text-sm font-semibold sm:text-base">📚 Vokabel Examen</span>
              <span className="text-[11px] font-normal text-muted-foreground sm:text-xs">
                Pro Lektion wählbar
              </span>
            </Button>
            <Button
              className="h-auto min-h-[4rem] flex-col justify-center gap-0.5 py-3 text-center sm:min-h-[5rem] sm:gap-1 sm:py-4"
              variant="secondary"
              onClick={onNumbersExamClick}
            >
              <span className="text-sm font-semibold sm:text-base">🔢 Zahlen Examen</span>
              <span className="text-[11px] font-normal text-muted-foreground sm:text-xs">
                Generator (100 Fragen)
              </span>
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Examen" compactNarrow>
      <div className="space-y-2 sm:space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-1 h-8 w-fit px-2 text-xs sm:h-9 sm:text-sm"
          onClick={() => onBrowseStepChange("root")}
        >
          ← Zurück
        </Button>
        <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
          Wähle die Lektion für dein Vokabel-Examen.
        </p>

        <div className="grid gap-2 sm:gap-3">
          {availableLessons.map((lesson) => {
            const poolCount = vocabByLesson[lesson]?.length ?? 0;
            const cardCount = vocabDisplayCountByLesson[lesson] ?? poolCount;
            return (
              <Button
                key={lesson}
                onClick={() => onLessonSelect(lesson)}
                className="h-auto w-full justify-start py-2.5 shadow-md transition-all duration-150 hover:shadow-lg active:shadow-sm sm:py-4 sm:shadow-lg sm:hover:-translate-y-1 sm:hover:shadow-2xl sm:active:translate-y-0 sm:active:shadow-md"
                variant="outline"
              >
                <div className="text-left">
                  <div className="text-sm font-semibold sm:text-base">{`Lektion ${lesson}`}</div>
                  <div className="text-[11px] text-muted-foreground sm:text-xs">{cardCount} Vokabeln</div>
                </div>
              </Button>
            );
          })}
        </div>

        {availableLessons.length === 0 ? (
          <Card className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Keine Lektionen verfügbar. Bitte importiere zuerst Vokabeln.
            </p>
          </Card>
        ) : null}
      </div>
    </PageShell>
  );
}
