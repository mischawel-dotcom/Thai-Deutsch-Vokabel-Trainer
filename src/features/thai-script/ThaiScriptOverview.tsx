import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  onOpenMidClass: () => void;
};

/**
 * Erste Ebene unter „Thai Schrift lernen“: Einleitung + Button wie bei Zahlen/Vokabeln.
 */
export function ThaiScriptOverview({ onOpenMidClass }: Props) {
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
            <li>Mittelklasse: eine Karte pro Buchstabe (Pfeile / Tastatur)</li>
            <li>Bald: Hoch- und Tiefklasse, erste Vokale</li>
            <li>Bald: einfache Leseübungen</li>
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
          Mittelklasse-Konsonanten
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tipp: Nutze parallel „Vokabeln lernen“ – viele Beispielwörter kennst du dort schon.
      </p>
    </div>
  );
}
