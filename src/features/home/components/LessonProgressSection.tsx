import { Card } from "@/components/ui/card";
import { getLessonExamScore } from "@/lib/lessonProgress";
import { getLessonStatus } from "../metrics";

type LessonProgressSectionProps = {
  lessons: number[];
  lessonProgress: Record<number, number>;
  onLessonClick: (lesson: number, requiresExam: boolean) => void;
};

export function LessonProgressSection({
  lessons,
  lessonProgress,
  onLessonClick,
}: LessonProgressSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Lektionen-Fortschritt</h3>
      {lessons.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Keine Lektionen vorhanden.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lessons.map((lesson) => {
            const progress = lessonProgress[lesson] ?? 0;
            const status = getLessonStatus(progress, getLessonExamScore(lesson));

            return (
              <button
                key={lesson}
                type="button"
                className={`p-4 ${status.statusColor} transition-all cursor-pointer hover:shadow-md rounded-xl border bg-card text-card-foreground shadow-sm text-left`}
                onClick={() => onLessonClick(lesson, status.requiresExam)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Lektion {lesson}</h4>
                  <span className="text-2xl">{status.statusIcon}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{status.statusText}</p>
                {status.requiresExam && (
                  <p className="text-xs text-amber-700 dark:text-amber-200 mt-2 font-semibold">
                    👉 Klicken zum Examen starten
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

