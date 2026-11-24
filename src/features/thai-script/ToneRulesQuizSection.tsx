import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speak } from "@/features/tts";
import {
  THAI_TONE_LABELS_DE,
  TONE_QUIZ_ENTRIES,
  TONE_QUIZ_OPTIONS,
  TONE_QUIZ_PART_LABELS,
  type ThaiToneId,
} from "./toneRulesContent";

type Props = {
  onExitFullscreen: () => void;
};

export function ToneRulesQuizSection({ onExitFullscreen }: Props) {
  const total = TONE_QUIZ_ENTRIES.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ThaiToneId | null>(null);
  const [ttsBusy, setTtsBusy] = useState(false);
  const row = TONE_QUIZ_ENTRIES[index]!;
  const answered = selected !== null;
  const isCorrect = selected === row.tone;

  const resetForIndex = useCallback(() => {
    setSelected(null);
  }, []);

  const goPrev = useCallback(() => {
    resetForIndex();
    setIndex((i) => (i <= 0 ? total - 1 : i - 1));
  }, [total, resetForIndex]);

  const goNext = useCallback(() => {
    resetForIndex();
    setIndex((i) => (i >= total - 1 ? 0 : i + 1));
  }, [total, resetForIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const play = useCallback(async () => {
    if (ttsBusy) return;
    setTtsBusy(true);
    try {
      await speak(row.ttsThai, "th-TH");
    } finally {
      setTtsBusy(false);
    }
  }, [row.ttsThai, ttsBusy]);

  const bottomChrome =
    "pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+5.25rem)]";

  return (
    <div
      className={`fixed inset-0 z-50 m-0 flex h-[100dvh] max-h-[100dvh] w-screen flex-col items-center overflow-hidden bg-background px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3 ${bottomChrome}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="thai-tone-quiz-title"
    >
      <div className="w-full max-w-2xl shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div id="thai-tone-quiz-title" className="text-sm font-semibold text-muted-foreground">
            ✏️ Thai Schrift – Töne (Übung)
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            onClick={onExitFullscreen}
          >
            Zurück zur Übersicht
          </Button>
        </div>
      </div>

      <div className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted/70 px-2 py-1">
          Frage: <b className="text-foreground">{index + 1}</b> /{" "}
          <b className="text-foreground">{total}</b>
        </span>
        <span
          className={`rounded-full px-2 py-1 font-medium ${
            row.part === 1
              ? "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200"
              : row.part === 2
                ? "bg-teal-100 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
                : "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          }`}
        >
          {TONE_QUIZ_PART_LABELS[row.part]}
        </span>
      </div>

      <div className="mx-auto mt-1 w-full max-w-2xl shrink-0">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:h-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto mt-2 flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <Card className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col overflow-y-auto p-3 shadow-lg sm:max-w-md sm:p-5 md:max-w-2xl">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-1 py-3 text-center">
            <p className="text-sm text-muted-foreground">Welcher Ton?</p>
            <p
              lang="th"
              className="text-6xl font-bold leading-none text-[#2b6cb0] dark:text-sky-400 sm:text-7xl"
            >
              {row.thai}
            </p>
            <button
              type="button"
              onClick={() => void play()}
              disabled={ttsBusy}
              className="flex h-11 w-full max-w-[12rem] items-center justify-center gap-2 rounded-md bg-[#3182ce] text-sm font-semibold text-white disabled:opacity-50 dark:bg-sky-600"
            >
              <span aria-hidden="true">🔊</span>
              Anhören
            </button>

            <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
              {TONE_QUIZ_OPTIONS.map((toneId) => {
                const chosen = selected === toneId;
                const showCorrect = answered && toneId === row.tone;
                const showWrong = answered && chosen && !isCorrect;
                return (
                  <Button
                    key={toneId}
                    type="button"
                    variant="outline"
                    disabled={answered}
                    className={`h-11 ${
                      showCorrect
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : showWrong
                          ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                          : ""
                    }`}
                    onClick={() => setSelected(toneId)}
                  >
                    {THAI_TONE_LABELS_DE[toneId]}
                  </Button>
                );
              })}
            </div>

            {answered ? (
              <div className="w-full max-w-sm space-y-1 rounded-lg bg-muted/40 px-3 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {isCorrect ? "Richtig." : `Lösung: ${THAI_TONE_LABELS_DE[row.tone]}`}
                </p>
                <p className="text-muted-foreground">
                  {row.romanization} · {row.german}
                </p>
                {row.hintDe ? <p className="text-xs text-muted-foreground">{row.hintDe}</p> : null}
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/60 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3">
          <Button type="button" variant="outline" className="h-11 min-w-[7rem]" onClick={goPrev}>
            ← Zurück
          </Button>
          <Button type="button" variant="outline" className="h-11 min-w-[7rem]" onClick={goNext}>
            Weiter →
          </Button>
        </div>
      </div>
    </div>
  );
}
