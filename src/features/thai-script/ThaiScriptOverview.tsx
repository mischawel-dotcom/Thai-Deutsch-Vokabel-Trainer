import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  onOpenMidClass: () => void;
  onOpenHighClass: () => void;
  onOpenLowClass: () => void;
  onOpenVowelsPhase1: () => void;
};

/**
 * Erste Ebene unter „Thai Schrift lernen“: Einleitung + Button wie bei Zahlen/Vokabeln.
 */
export function ThaiScriptOverview({
  onOpenMidClass,
  onOpenHighClass,
  onOpenLowClass,
  onOpenVowelsPhase1,
}: Props) {
  return (
    <div className="space-y-4 w-full">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Hier lernst du die thailändische Schrift systematisch – unabhängig von deinen
        Vokabel-Lektionen. Thai ist eine{" "}
        <strong className="text-foreground">Silbenschrift (Abugida)</strong>: Ein Konsonant
        bildet mit Vokalzeichen und ggf. Tonzeichen eine lesbare Silbe.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-semibold">Phase 1 (aktuell)</h3>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
            <li>Alle drei Konsonantenklassen: Karten mit Pfeilen / Tastatur</li>
            <li>Vokale Teil 1: า ิ ี ุ ู ะ, เ/แ/โ, ใ/ไ, ำ</li>
            <li>Bald: mehr Vokale & einfache Leseübungen</li>
          </ul>
        </Card>
        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-semibold">Was du später üben wirst</h3>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
            <li>Tonregeln (Klasse + Silbenlänge + Tonzeichen)</li>
            <li>Vokalzeichen rund um den Konsonanten</li>
            <li>Häufige Silben und kurze Texte</li>
          </ul>
        </Card>
      </div>

      <div className="w-full space-y-2 px-1">
        <Button
          type="button"
          onClick={onOpenMidClass}
          className="h-12 w-full text-base font-medium justify-center bg-amber-600 hover:bg-amber-700 text-white"
          title="Neun Konsonanten der Mittelklasse"
        >
          Mittelklasse-Konsonanten (9)
        </Button>
        <Button
          type="button"
          onClick={onOpenHighClass}
          className="h-12 w-full text-base font-medium justify-center bg-teal-700 hover:bg-teal-800 text-white"
          title="Elf Konsonanten der Hochklasse"
        >
          Hochklasse-Konsonanten (11)
        </Button>
        <Button
          type="button"
          onClick={onOpenLowClass}
          className="h-12 w-full text-base font-medium justify-center bg-slate-700 hover:bg-slate-800 text-white"
          title="Zweiundzwanzig Konsonanten der Tiefklasse"
        >
          Tiefklasse-Konsonanten (22)
        </Button>
        <Button
          type="button"
          onClick={onOpenVowelsPhase1}
          className="h-12 w-full text-base font-medium justify-center bg-violet-700 hover:bg-violet-800 text-white"
          title="Grundvokale mit Beispielwörtern"
        >
          Vokale Teil 1 (12)
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tipp: Nutze parallel „Vokabeln lernen“ – viele Beispielwörter kennst du dort schon.
      </p>
    </div>
  );
}
