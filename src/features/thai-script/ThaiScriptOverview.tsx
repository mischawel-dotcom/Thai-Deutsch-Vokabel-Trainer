import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onOpenMidClass: () => void;
  onOpenHighClass: () => void;
  onOpenLowClass: () => void;
  onOpenConsonantCatalog: () => void;
  onOpenVowelCatalog: () => void;
  onOpenVowelsPhase1: () => void;
  onOpenVowelsPhase2: () => void;
  onOpenReadingPractice: () => void;
  onOpenToneExplain: () => void;
  onOpenToneQuiz: () => void;
};

type MenuView = "root" | "consonants" | "vowels" | "tones";

/**
 * Thai-Schrift-Übersicht im Stil von Tests: Kapitel-Kacheln → Unterkapitel mit „Zurück“.
 */
export function ThaiScriptOverview({
  onOpenMidClass,
  onOpenHighClass,
  onOpenLowClass,
  onOpenConsonantCatalog,
  onOpenVowelCatalog,
  onOpenVowelsPhase1,
  onOpenVowelsPhase2,
  onOpenReadingPractice,
  onOpenToneExplain,
  onOpenToneQuiz,
}: Props) {
  const [menuView, setMenuView] = useState<MenuView>("root");

  if (menuView === "consonants") {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-muted-foreground">📚 Konsonanten</div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMenuView("root")}>
            Zurück
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            onClick={onOpenConsonantCatalog}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800"
            title="Alle Konsonanten als scrollbare Liste"
          >
            Konsonanten – Liste (42)
          </Button>
          <Button
            type="button"
            onClick={onOpenMidClass}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            title="Neun Konsonanten der Mittelklasse"
          >
            Mittelklasse-Konsonanten (9)
          </Button>
          <Button
            type="button"
            onClick={onOpenHighClass}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
            title="Elf Konsonanten der Hochklasse"
          >
            Hochklasse-Konsonanten (11)
          </Button>
          <Button
            type="button"
            onClick={onOpenLowClass}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
            title="Zweiundzwanzig Konsonanten der Tiefklasse"
          >
            Tiefklasse-Konsonanten (22)
          </Button>
        </div>
      </div>
    );
  }

  if (menuView === "vowels") {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-muted-foreground">🔤 Vokale</div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMenuView("root")}>
            Zurück
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            onClick={onOpenVowelCatalog}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800"
            title="Alle 32 Vokalformen als scrollbare Liste"
          >
            Vokale – Liste (32)
          </Button>
          <Button
            type="button"
            onClick={onOpenVowelsPhase1}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
            title="Grundvokale mit Beispielwörtern"
          >
            Vokale Teil 1 (12)
          </Button>
          <Button
            type="button"
            onClick={onOpenVowelsPhase2}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-violet-800 to-violet-900 hover:from-violet-900 hover:to-violet-950"
            title="Weitere Vokale und mehrteilige Schreibungen"
          >
            Vokale Teil 2 (11)
          </Button>
        </div>
      </div>
    );
  }

  if (menuView === "tones") {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-muted-foreground">🎵 Töne</div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMenuView("root")}>
            Zurück
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            onClick={onOpenToneExplain}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
            title="Kurze Einführung in die Tonregeln"
          >
            Tonregeln – Erklärung (12)
          </Button>
          <Button
            type="button"
            onClick={onOpenToneQuiz}
            size="lg"
            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            title="Ton einer Silbe erkennen"
          >
            Tonregeln – Übung (21)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Systematisch Thai lesen: Konsonanten, Vokale, Leseübungen und Töne.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <Button
          type="button"
          onClick={() => setMenuView("consonants")}
          variant="outline"
          className="h-[4.75rem] flex-col items-start justify-center gap-0.5 px-3 py-2 text-left sm:h-24 sm:gap-1 sm:py-0"
        >
          <span className="text-sm font-semibold sm:text-base">📚 Konsonanten</span>
          <span className="text-xs text-muted-foreground">Liste &amp; drei Klassen</span>
        </Button>
        <Button
          type="button"
          onClick={() => setMenuView("vowels")}
          variant="outline"
          className="h-[4.75rem] flex-col items-start justify-center gap-0.5 px-3 py-2 text-left sm:h-24 sm:gap-1 sm:py-0"
        >
          <span className="text-sm font-semibold sm:text-base">🔤 Vokale</span>
          <span className="text-xs text-muted-foreground">Liste &amp; Teil 1 / 2</span>
        </Button>
        <Button
          type="button"
          onClick={onOpenReadingPractice}
          variant="outline"
          className="h-[4.75rem] flex-col items-start justify-center gap-0.5 px-3 py-2 text-left sm:h-24 sm:gap-1 sm:py-0"
        >
          <span className="text-sm font-semibold sm:text-base">📖 Leseübungen</span>
          <span className="text-xs text-muted-foreground">20 Silben &amp; Wörter</span>
        </Button>
        <Button
          type="button"
          onClick={() => setMenuView("tones")}
          variant="outline"
          className="h-[4.75rem] flex-col items-start justify-center gap-0.5 px-3 py-2 text-left sm:h-24 sm:gap-1 sm:py-0"
        >
          <span className="text-sm font-semibold sm:text-base">🎵 Töne</span>
          <span className="text-xs text-muted-foreground">Erklärung &amp; Übung</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tipp: Nutze parallel „Vokabeln lernen“ – viele Beispielwörter kennst du dort schon.
      </p>
    </div>
  );
}
