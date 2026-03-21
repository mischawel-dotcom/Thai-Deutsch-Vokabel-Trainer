import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speak } from "@/features/tts";
import type { ThaiConsonantEntry } from "./content";

export type ConsonantSessionClassLabel = "Mitte" | "Hoch" | "Tief";

type Props = {
  entries: ThaiConsonantEntry[];
  /** Kurz-Badge unter dem Namen (Mitte / Hoch / Tief) */
  classLabelDe: ConsonantSessionClassLabel;
  /** Kopfzeile, z. B. „✏️ Thai Schrift – Hochklasse“ */
  sessionTitle: string;
  /** Eindeutige ID für aria-labelledby */
  ariaTitleId: string;
  onExitFullscreen: () => void;
};

/**
 * Vollbild-Karten für eine Konsonantenklasse (Mittel-, Hoch- oder Tiefklasse).
 */
export function ConsonantClassSession({
  entries,
  classLabelDe,
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

  const playLetterName = useCallback(async () => {
    if (ttsBusy) return;
    setTtsBusy(true);
    try {
      await speak(row.ttsPhraseThai, "th-TH");
    } finally {
      setTtsBusy(false);
    }
  }, [row.ttsPhraseThai, ttsBusy]);

  /** Platz für fixierte Nav (h-11 + Rahmen + Padding) + Safe Area – ohne große Lücke zur Karte */
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
          Buchstabe:{" "}
          <b className="text-foreground">{index + 1}</b> / <b className="text-foreground">{total}</b>
        </span>
        <span className="rounded-full bg-muted/70 px-2 py-1">
          <span className="text-foreground" lang="th">
            {row.mnemonicThai}
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
            {/* Nur Inhaltshöhe – Zeichen + 🔊 Größe unverändert */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-1.5 sm:py-2">
              <div
                className="text-center text-5xl font-normal leading-none text-foreground sm:text-6xl md:text-7xl"
                lang="th"
              >
                {row.char}
              </div>
              <button
                type="button"
                lang="th"
                onClick={() => void playLetterName()}
                title={`Buchstabennamen (Thai) abspielen: ${row.ttsPhraseThai}`}
                aria-label={`Thailändischen Buchstabennamen abspielen: ${row.ttsPhraseThai}`}
                disabled={ttsBusy}
                className="text-2xl leading-none transition-opacity hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50 sm:text-3xl"
              >
                🔊
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center space-y-3 border-t border-border pt-4 sm:space-y-3.5 sm:pt-5">
              <div className="space-y-1 text-center">
                <p className="text-lg font-medium text-foreground sm:text-xl md:text-2xl" lang="th">
                  {row.mnemonicThai}
                </p>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {row.mnemonicRtgs} · {row.mnemonicDe}
                </p>
                <div className="flex justify-center pt-1">
                  <span className="rounded bg-muted/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    {classLabelDe}
                  </span>
                </div>
              </div>

              <p className="text-center text-sm leading-snug text-muted-foreground sm:text-base md:text-lg">
                <span className="font-semibold text-foreground">Anlaut: </span>
                {row.initialSoundDe}
              </p>

              {row.exampleFromVocab ? (
                <div className="rounded-md bg-muted/40 px-3 py-3 text-center sm:px-4 sm:py-4">
                  <div className="text-sm font-semibold text-foreground sm:text-base">Beispiel</div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span
                      lang="th"
                      className="text-3xl font-normal leading-none text-foreground sm:text-4xl"
                    >
                      {row.exampleFromVocab.thai}
                    </span>
                    <button
                      type="button"
                      lang="th"
                      onClick={() => void speak(row.exampleFromVocab!.thai, "th-TH")}
                      title={`Beispielwort vorlesen: ${row.exampleFromVocab.thai}`}
                      aria-label={`Thailändisches Beispielwort vorlesen: ${row.exampleFromVocab.thai}`}
                      className="shrink-0 text-3xl leading-none transition-opacity hover:opacity-80 active:opacity-60 sm:text-4xl"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="mt-2 text-base italic text-muted-foreground sm:text-lg">
                    {row.exampleFromVocab.transliteration}
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-snug text-foreground sm:text-xl">
                    {row.exampleFromVocab.german}
                  </p>
                </div>
              ) : null}
              {row.exampleNoteDe ? (
                <p className="rounded-md border border-amber-200/50 bg-amber-50/80 px-3 py-2 text-sm leading-snug text-muted-foreground dark:border-amber-900/40 dark:bg-amber-950/25 sm:text-base">
                  {row.exampleNoteDe}
                </p>
              ) : null}
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
