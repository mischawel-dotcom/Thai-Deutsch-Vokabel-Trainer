import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { speak } from "@/features/tts";
import { CONSONANT_CATALOG } from "./consonantCatalog";

type Props = {
  onExitFullscreen: () => void;
};

/**
 * Vollbild-Referenz: alle Konsonanten, jeweils eine Viewport-Höhe, vertikal scrollbar.
 * Kein Gelernt-Status – Thai, Lautschrift/Mnemonik und TTS.
 */
export function ConsonantCatalogSection({ onExitFullscreen }: Props) {
  const [ttsBusy, setTtsBusy] = useState(false);
  const total = CONSONANT_CATALOG.length;

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

  return (
    <div
      className="fixed inset-0 z-50 m-0 flex h-[100dvh] max-h-[100dvh] w-screen flex-col bg-[#f4f6f9] dark:bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thai-consonant-catalog-title"
    >
      <div className="shrink-0 border-b border-border/60 bg-background/95 px-2 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2">
          <div>
            <div
              id="thai-consonant-catalog-title"
              className="text-sm font-semibold text-muted-foreground"
            >
              ✏️ Thai Schrift – Konsonanten (Liste)
            </div>
            <p className="text-xs text-muted-foreground">{total} Zeichen · nach unten scrollen</p>
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

      <div
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {CONSONANT_CATALOG.map((entry, index) => (
          <section
            key={`${entry.thai}-${index}`}
            className="flex h-[calc(100dvh-4.5rem)] min-h-[calc(100dvh-4.5rem)] w-full snap-start snap-always items-center justify-center px-4 py-6 sm:px-6"
            aria-label={`Konsonant ${index + 1} von ${total}: ${entry.romanization}`}
          >
            <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-border/50 bg-card px-6 py-10 text-center shadow-md sm:max-w-md sm:px-10 sm:py-14">
              <p className="text-sm font-medium text-muted-foreground">#{index + 1}</p>
              <p
                lang="th"
                className="mt-4 text-6xl font-bold leading-none text-[#2b6cb0] dark:text-sky-400 sm:text-7xl md:text-8xl"
              >
                {entry.thai}
              </p>
              <p lang="th" className="mt-4 text-lg text-foreground sm:text-xl">
                {entry.mnemonicThai}
              </p>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">{entry.romanization}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {entry.classLabelDe}
              </p>
              <button
                type="button"
                lang="th"
                onClick={() => void play(entry.ttsThai)}
                disabled={ttsBusy}
                title={`Anhören: ${entry.ttsThai}`}
                aria-label={`Konsonant anhören: ${entry.romanization}`}
                className="mt-8 flex h-12 w-full max-w-[14rem] items-center justify-center gap-2 rounded-md bg-[#3182ce] text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-600"
              >
                <span aria-hidden="true">🔊</span>
                Anhören
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
