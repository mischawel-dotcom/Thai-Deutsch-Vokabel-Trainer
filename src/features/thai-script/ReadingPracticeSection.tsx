import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speak } from "@/features/tts";
import { READING_PRACTICE_ENTRIES } from "./readingPracticeContent";

type Props = {
  onExitFullscreen: () => void;
};

/**
 * Einfache Leseübungen: Thai zuerst, Lösung (Lautschrift/Bedeutung) auf Knopfdruck.
 */
export function ReadingPracticeSection({ onExitFullscreen }: Props) {
  const total = READING_PRACTICE_ENTRIES.length;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ttsBusy, setTtsBusy] = useState(false);

  const row = READING_PRACTICE_ENTRIES[index]!;

  const goPrev = useCallback(() => {
    setRevealed(false);
    setIndex((i) => (i <= 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setRevealed(false);
    setIndex((i) => (i >= total - 1 ? 0 : i + 1));
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      }
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
      aria-labelledby="thai-reading-practice-title"
    >
      <div className="w-full max-w-2xl shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div
            id="thai-reading-practice-title"
            className="text-sm font-semibold text-muted-foreground"
          >
            ✏️ Thai Schrift – Leseübungen
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
          Karte: <b className="text-foreground">{index + 1}</b> /{" "}
          <b className="text-foreground">{total}</b>
        </span>
        <span className="rounded-full bg-muted/70 px-2 py-1">Erst lesen, dann Lösung</span>
      </div>

      <div className="mx-auto mt-1 w-full max-w-2xl shrink-0">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:h-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
            aria-label={`Fortschritt ${Math.round(((index + 1) / total) * 100)} Prozent`}
          />
        </div>
      </div>

      <div className="mx-auto mt-2 flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <Card
          className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col overflow-hidden p-3 shadow-lg sm:max-w-md sm:p-5 md:max-w-2xl md:p-6"
          aria-live="polite"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5 px-2 py-4 text-center">
            <p
              lang="th"
              className="text-6xl font-bold leading-none text-[#2b6cb0] dark:text-sky-400 sm:text-7xl md:text-8xl"
            >
              {row.thai}
            </p>

            <button
              type="button"
              lang="th"
              onClick={() => void play()}
              disabled={ttsBusy}
              title={`Anhören: ${row.ttsThai}`}
              aria-label={`Vorlesen: ${row.thai}`}
              className="flex h-11 w-full max-w-[12rem] items-center justify-center gap-2 rounded-md bg-[#3182ce] text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-600"
            >
              <span aria-hidden="true">🔊</span>
              Anhören
            </button>

            {!revealed ? (
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full max-w-[14rem]"
                onClick={() => setRevealed(true)}
              >
                Lösung zeigen
              </Button>
            ) : (
              <div className="w-full max-w-sm space-y-2 rounded-lg bg-muted/40 px-4 py-4">
                <p className="text-xl font-medium text-foreground sm:text-2xl">{row.romanization}</p>
                <p className="text-base text-muted-foreground sm:text-lg">{row.german}</p>
                {row.hintDe ? (
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {row.hintDe}
                  </p>
                ) : null}
              </div>
            )}
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
