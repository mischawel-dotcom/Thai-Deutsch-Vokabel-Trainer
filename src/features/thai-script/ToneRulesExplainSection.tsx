import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speak } from "@/features/tts";
import { TONE_EXPLAIN_CARDS } from "./toneRulesContent";

type Props = {
  onExitFullscreen: () => void;
};

export function ToneRulesExplainSection({ onExitFullscreen }: Props) {
  const total = TONE_EXPLAIN_CARDS.length;
  const [index, setIndex] = useState(0);
  const [ttsBusy, setTtsBusy] = useState(false);
  const row = TONE_EXPLAIN_CARDS[index]!;

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= total - 1 ? 0 : i + 1));
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const play = useCallback(
    async (ttsThai: string) => {
      if (ttsBusy) return;
      setTtsBusy(true);
      try {
        await speak(ttsThai, "th-TH");
      } finally {
        setTtsBusy(false);
      }
    },
    [ttsBusy]
  );

  const bottomChrome =
    "pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+5.25rem)]";

  return (
    <div
      className={`fixed inset-0 z-50 m-0 flex h-[100dvh] max-h-[100dvh] w-screen flex-col items-center overflow-hidden bg-background px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3 ${bottomChrome}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="thai-tone-explain-title"
    >
      <div className="w-full max-w-2xl shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div id="thai-tone-explain-title" className="text-sm font-semibold text-muted-foreground">
            ✏️ Thai Schrift – Töne (Erklärung)
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

      <div className="mt-2 flex w-full max-w-2xl justify-center text-xs text-muted-foreground">
        <span className="rounded-full bg-muted/70 px-2 py-1">
          Karte: <b className="text-foreground">{index + 1}</b> /{" "}
          <b className="text-foreground">{total}</b>
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
        <Card className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col overflow-y-auto p-4 shadow-lg sm:max-w-md sm:p-6 md:max-w-2xl">
          <div className="flex flex-1 flex-col justify-center gap-4 text-center">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{row.titleDe}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {row.bodyDe}
            </p>
            {row.examplesThai ? (
              <p
                lang="th"
                className="text-5xl font-bold leading-none text-[#2b6cb0] dark:text-sky-400 sm:text-6xl md:text-7xl"
              >
                {row.examplesThai}
              </p>
            ) : null}
            {row.audioExamples && row.audioExamples.length > 0 ? (
              <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
                {row.audioExamples.map((example) => (
                  <div
                    key={`${example.thai}-${example.labelDe ?? ""}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="min-w-0 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span
                          lang="th"
                          className="inline-flex items-baseline text-6xl font-bold leading-none sm:text-7xl md:text-8xl"
                        >
                          {example.highlight ? (
                            <>
                              <span className="text-[#2b6cb0] dark:text-sky-400">
                                {example.highlight.before}
                              </span>
                              <span className="relative -mx-1 scale-125 text-rose-600 dark:text-rose-400">
                                {example.highlight.mark}
                              </span>
                              <span className="text-[#2b6cb0] dark:text-sky-400">
                                {example.highlight.after}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#2b6cb0] dark:text-sky-400">{example.thai}</span>
                          )}
                        </span>
                        <button
                          type="button"
                          lang="th"
                          onClick={() => void play(example.ttsThai)}
                          disabled={ttsBusy}
                          title={`Vorlesen: ${example.ttsThai}`}
                          aria-label={`Thailändisches Beispiel vorlesen: ${example.thai}`}
                          className="shrink-0 text-4xl leading-none transition-opacity hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50 sm:text-5xl"
                        >
                          🔊
                        </button>
                      </div>
                      {example.labelDe ? (
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                          {example.labelDe}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
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
