import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speak } from "@/features/tts";
import { buildVowelHeroDisplay } from "./buildVowelHeroText";
import type { ThaiVowelEntry } from "./vowelsContent";

type Props = {
  entries: ThaiVowelEntry[];
  sessionTitle: string;
  ariaTitleId: string;
  onExitFullscreen: () => void;
};

/**
 * Vollbild-Karten für Vokal-Phase (analog Konsonanten-Session).
 */
export function VowelPhaseSession({
  entries,
  sessionTitle,
  ariaTitleId,
  onExitFullscreen,
}: Props) {
  const total = entries.length;
  const [index, setIndex] = useState(0);
  const [ttsBusy, setTtsBusy] = useState(false);

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

  const row = entries[index]!;
  /** Thai-Schulweise: „สระ อา“, „สระ อิ“ … (oberer Lautsprecher am großen Zeichen) */
  const vowelNameTts = row.ttsVowelNameThai ?? row.nameThai;
  const {
    heroText: vowelHeroText,
    sublabelDe: vowelHeroSublabelDe,
    heroSegments: vowelHeroSegments,
  } = buildVowelHeroDisplay(row.vowelDisplay);

  const playVowelNameTts = useCallback(async () => {
    if (ttsBusy) return;
    setTtsBusy(true);
    try {
      await speak(vowelNameTts, "th-TH");
    } finally {
      setTtsBusy(false);
    }
  }, [vowelNameTts, ttsBusy]);

  const bottomChrome = "pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+5.25rem)]";

  return (
    <div
      className={`fixed inset-0 z-50 m-0 flex h-[100dvh] max-h-[100dvh] w-screen flex-col items-center overflow-hidden bg-background px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3 ${bottomChrome}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaTitleId}
    >
      <div className="w-full max-w-2xl shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div id={ariaTitleId} className="text-sm font-semibold text-muted-foreground">
            {sessionTitle}
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
          Vokal:{" "}
          <b className="text-foreground">{index + 1}</b> / <b className="text-foreground">{total}</b>
        </span>
        <span className="rounded-full bg-muted/70 px-2 py-1">
          <span className="text-foreground" lang="th">
            {row.nameThai}
          </span>
        </span>
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
          className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col overflow-hidden p-3 shadow-lg sm:max-w-md sm:p-4 md:max-w-2xl md:p-5"
          aria-live="polite"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-1.5 sm:py-2">
              <div
                className="flex w-full min-h-[4.5rem] items-center justify-center sm:min-h-[5.25rem] md:min-h-[6.25rem]"
                lang="th"
                title={`Notation in der App: ${row.vowelDisplay}`}
                aria-label={`Großdarstellung des Vokals (Notation ${row.vowelDisplay}), Silbe ${vowelHeroText}`}
              >
                {vowelHeroSegments?.length ? (
                  <span className="inline-flex flex-wrap items-baseline justify-center gap-0 text-center text-5xl font-normal leading-none tracking-normal text-foreground sm:text-6xl md:text-7xl">
                    {vowelHeroSegments.map((seg, i) => (
                      <span
                        key={`${seg.text}-${i}`}
                        className={
                          seg.muted
                            ? "text-muted-foreground/70 dark:text-muted-foreground/65"
                            : undefined
                        }
                        lang="th"
                      >
                        {seg.text}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-center text-5xl font-normal leading-none tracking-normal text-foreground sm:text-6xl md:text-7xl">
                    {vowelHeroText}
                  </span>
                )}
              </div>
              {vowelHeroSublabelDe ? (
                <p className="max-w-sm px-2 text-center text-[11px] leading-snug text-muted-foreground sm:max-w-md sm:text-xs">
                  {vowelHeroSublabelDe}
                </p>
              ) : null}
              <button
                type="button"
                lang="th"
                onClick={() => void playVowelNameTts()}
                title={`Vokalnamen abspielen: ${vowelNameTts}`}
                aria-label={`Thailändischen Vokalnamen abspielen: ${vowelNameTts}`}
                disabled={ttsBusy}
                className="text-2xl leading-none transition-opacity hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50 sm:text-3xl"
              >
                🔊
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center space-y-3 border-t border-border pt-4 sm:space-y-3.5 sm:pt-5">
              <div className="space-y-1 text-center">
                <p className="text-lg font-medium text-foreground sm:text-xl md:text-2xl" lang="th">
                  {row.nameThai}
                </p>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {row.nameRtgs} · {row.nameDe}
                </p>
                <div className="flex justify-center pt-1">
                  <span className="rounded bg-violet-600/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-violet-800 dark:text-violet-200 sm:text-xs">
                    Vokal
                  </span>
                </div>
              </div>

              <p className="text-center text-sm leading-snug text-muted-foreground sm:text-base md:text-lg">
                <span className="font-semibold text-foreground">Position: </span>
                {row.positionDe}
              </p>

              {row.hintDe ? (
                <p className="rounded-md border border-blue-200/60 bg-blue-50/80 px-3 py-2 text-center text-sm leading-snug text-muted-foreground dark:border-blue-900/40 dark:bg-blue-950/25 sm:text-base">
                  {row.hintDe}
                </p>
              ) : null}

              <div className="rounded-md bg-muted/40 px-3 py-3 text-center sm:px-4 sm:py-4">
                <div className="text-sm font-semibold text-foreground sm:text-base">Beispiel</div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span
                    lang="th"
                    className="text-3xl font-normal leading-none text-foreground sm:text-4xl"
                  >
                    {row.exampleThai}
                  </span>
                  <button
                    type="button"
                    lang="th"
                    onClick={() => void speak(row.exampleThai, "th-TH")}
                    title={`Vorlesen: ${row.exampleThai}`}
                    aria-label={`Thailändisches Wort vorlesen: ${row.exampleThai}`}
                    className="shrink-0 text-3xl leading-none transition-opacity hover:opacity-80 active:opacity-60 sm:text-4xl"
                  >
                    🔊
                  </button>
                </div>
                <p className="mt-2 text-base italic text-muted-foreground sm:text-lg">
                  {row.exampleTransliteration}
                </p>
                <p className="mt-1 text-lg font-semibold leading-snug text-foreground sm:text-xl">
                  {row.exampleGerman}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <div className="mx-auto w-full max-w-xs rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur sm:max-w-md md:max-w-2xl">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={goPrev}
              variant="outline"
              className="h-11 min-w-[120px] flex-1 border-transparent bg-background px-5 text-foreground hover:bg-muted sm:flex-none"
            >
              Zurück
            </Button>
            <Button
              type="button"
              onClick={goNext}
              className="h-11 min-w-[120px] flex-1 bg-primary px-5 text-primary-foreground hover:bg-primary/90 sm:flex-none"
            >
              Weiter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
