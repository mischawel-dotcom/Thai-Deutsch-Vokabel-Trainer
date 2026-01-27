import { useEffect, useState } from "react";
import { importCsv, exportCsv } from "../features/vocab/csv";
import { db } from "../db/db";
import { DEFAULT_VOCAB } from "../data/defaultVocab";
import { listVoices, hasThaiVoice } from "../features/tts";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Settings() {
  const [msg, setMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<number>(30);
  const [inputValue, setInputValue] = useState<string>("30");
  const [showVocabPage, setShowVocabPage] = useState<boolean>(false);

  // Load daily limit from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyLimit");
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0) {
        setDailyLimit(num);
        setInputValue(String(num));
      }
    }

    // Load showVocabPage from localStorage
    const savedVocabPage = localStorage.getItem("showVocabPage");
    if (savedVocabPage === "true") {
      setShowVocabPage(true);
    }
  }, []);

  function saveDailyLimit() {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) {
      setMsg("❌ Bitte geben Sie eine Zahl größer als 0 ein");
      return;
    }
    setDailyLimit(num);
    localStorage.setItem("dailyLimit", String(num));
    setMsg(`✅ Tägliches Limit gespeichert: ${num} Karten`);
    setTimeout(() => setMsg(""), 3000);
  }

  function toggleVocabPage() {
    const newValue = !showVocabPage;
    setShowVocabPage(newValue);
    localStorage.setItem("showVocabPage", String(newValue));
    
    // Dispatch event for immediate UI update
    window.dispatchEvent(new CustomEvent("vocabPageVisibilityChanged", { detail: { visible: newValue } }));
    
    setMsg(newValue ? "✅ Vokabeln-Seite eingeblendet" : "✅ Vokabeln-Seite ausgeblendet");
    setTimeout(() => setMsg(""), 3000);
  }

  function resetDailyLimit() {
    setDailyLimit(30);
    setInputValue("30");
    localStorage.setItem("dailyLimit", "30");
    setMsg("✅ Limit zurückgesetzt auf 30");
    setTimeout(() => setMsg(""), 3000);
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const result = await importCsv(file);
      if (result.added === 0 && result.duplicates > 0) {
        setMsg(`⚠️ Keine neuen Einträge: ${result.duplicates} Duplikate gefunden`);
      } else {
        setMsg(`✅ Importiert: ${result.added} Einträge${result.duplicates > 0 ? `, ${result.duplicates} Duplikate übersprungen` : ''}`);
      }
    } catch (err: any) {
      setMsg(`❌ Fehler: ${err?.message ?? String(err)}`);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  }

  async function onExport() {
    try {
      const blob = await exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thai-de-vocab.csv";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("✅ Export erfolgreich");
      setTimeout(() => setMsg(""), 2000);
    } catch (err: any) {
      setMsg(`❌ Export-Fehler: ${err?.message ?? String(err)}`);
    }
  }

  async function showVoiceDebug() {
    try {
      const voices = await listVoices();
      const thai = await hasThaiVoice();

      const info = thai ? "✅ Thai-Stimme gefunden." : "⚠️ Keine Thai-Stimme gefunden.";

      alert(
        info + "\n\n" +
        voices
          .slice(0, 25)
          .map((v) => `${v.lang} — ${v.name}${v.default ? " (default)" : ""}`)
          .join("\n")
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? String(e));
    }
  }

  async function resetDatabase() {
    if (!window.confirm("⚠️ WARNUNG: Dies löscht ALLE Vokabeln und Lernfortschritt!\n\nNur die Standard-Vokabeln (38) bleiben erhalten.\n\nWirklich fortfahren?")) {
      return;
    }

    try {
      setIsLoading(true);
      // Delete all vocab
      await db.vocab.clear();
      // Delete all progress
      await db.progress.clear();
      
      // Reload default vocab
      const now = Date.now();
      const entries = DEFAULT_VOCAB.map(v => ({
        ...v,
        createdAt: now,
        updatedAt: now,
      }));
      await db.vocab.bulkAdd(entries);
      
      setMsg("✅ Datenbank zurückgesetzt. Nur Standard-Vokabeln enthalten.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) {
      setMsg(`❌ Fehler beim Zurücksetzen: ${err?.message ?? String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell title="Einstellungen">
      <div className="space-y-6">
        {/* Daily Limit Setting */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">Lern-Einstellungen</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Maximale Karten pro Sitzung (heute Fällig)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Standard: 30 Karten
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min="1"
                  className="w-32 px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="z.B. 30"
                />
                <Button onClick={saveDailyLimit} className="flex-1">
                  Speichern
                </Button>
                <Button 
                  onClick={resetDailyLimit} 
                  variant="outline"
                >
                  Zurücksetzen
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Aktuell eingestellt: <span className="font-semibold">{dailyLimit}</span> Karten
              </p>
            </div>

            {/* Vokabeln-Seite Toggle */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVocabPage}
                  onChange={toggleVocabPage}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium">Vokabeln-Seite anzeigen</span>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Wenn aktiviert, wird ein "Vokabeln" Tab im Hauptmenü angezeigt, um alle Vokabeln zu durchsuchen.
              </p>
            </div>
          </div>
        </Card>

        {/* CSV Import/Export */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">Vokabeln verwalten</h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">CSV Import</label>
              <p className="text-xs text-muted-foreground mb-2">
                Lade neue Vokabeln aus einer CSV-Datei. Duplikate werden automatisch erkannt.
              </p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">⏳ Lade Vokabeln...</p>
              ) : (
                <input 
                  type="file" 
                  accept=".csv,text/csv" 
                  onChange={onImport}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900 dark:file:text-blue-200
                    dark:hover:file:bg-blue-800"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">CSV Export</label>
              <p className="text-xs text-muted-foreground mb-2">
                Speichere alle Vokabeln als CSV-Datei.
              </p>
              <Button 
                onClick={onExport} 
                variant="outline"
                className="w-full"
              >
                📥 Export herunterladen
              </Button>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>CSV Format:</strong> <code className="bg-muted px-2 py-1 rounded">
                  thai, german, transliteration, pos, tags, lesson, exampleThai, exampleGerman
                </code>
              </p>
            </div>
          </div>
        </Card>

        {/* Database Management */}
        <Card className="p-4 space-y-4 border-red-200 dark:border-red-800">
          <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">⚠️ Gefährliche Aktion</h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">Datenbank zurücksetzen</label>
              <p className="text-xs text-muted-foreground mb-3">
                Löscht alle importierten Vokabeln und deinen Lernfortschritt. Nur die Standard-Vokabeln (38) bleiben erhalten.
              </p>
              <Button 
                onClick={resetDatabase}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Alle Daten löschen
              </Button>
            </div>
          </div>
        </Card>

        {/* Voice Debug */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">🔊 Text-to-Speech Debug</h3>
          <p className="text-xs text-muted-foreground">
            Zeige alle verfügbaren Sprach-Stimmen und prüfe auf Thai-Unterstützung.
          </p>
          <Button 
            onClick={showVoiceDebug}
            variant="outline"
            className="w-full"
          >
            Stimmen Debug
          </Button>
        </Card>

        {/* Status Message */}
        {msg && (
          <Card className={`p-3 text-sm ${
            msg.startsWith("✅") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
            msg.startsWith("⚠️") ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" :
            "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}>
            {msg}
          </Card>
        )}
      </div>
    </PageShell>
  );
}
