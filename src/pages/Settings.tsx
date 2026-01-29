import { useEffect, useState } from "react";
import { importCsv, exportCsv } from "../features/vocab/csv";
import { db } from "../db/db";
import { DEFAULT_VOCAB } from "../data/defaultVocab";
import { listVoices, hasThaiVoice } from "../features/tts";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LearnDirection = "TH_DE" | "DE_TH";

export default function Settings() {
  const [msg, setMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<number>(30);
  const [inputValue, setInputValue] = useState<string>("30");
  const [showVocabPage, setShowVocabPage] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [learnDirection, setLearnDirection] = useState<LearnDirection>("TH_DE");
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);

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

    // Load learnDirection from localStorage
    const savedDirection = localStorage.getItem("learnDirection");
    if (savedDirection === "TH_DE" || savedDirection === "DE_TH") {
      setLearnDirection(savedDirection);
    }

    // Load showVocabPage from localStorage
    const savedVocabPage = localStorage.getItem("showVocabPage");
    if (savedVocabPage === "true") {
      setShowVocabPage(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
      setDebugInfo("✅ beforeinstallprompt Event empfangen!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowInstallButton(false);
      setDebugInfo("ℹ️ App ist bereits installiert (standalone mode)");
    } else {
      setDebugInfo("⏳ Warte auf beforeinstallprompt Event...");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  function saveDailyLimit() {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) {
      setMsg("❌ Bitte geben Sie eine Zahl größer als 0 ein");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    
    // Visual feedback: Button zeigt "Gespeichert"
    setIsSaving(true);
    setDailyLimit(num);
    localStorage.setItem("dailyLimit", String(num));
    setMsg(`✅ Tägliches Limit gespeichert: ${num} Karten`);
    
    // Reset nach 1.5 Sekunden
    setTimeout(() => {
      setIsSaving(false);
      setMsg("");
    }, 1500);
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

  async function installApp() {
    if (!deferredPrompt) {
      setMsg("⚠️ Installation nicht verfügbar. Öffnen Sie die App im Browser.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setMsg("✅ App wird installiert...");
      setShowInstallButton(false);
    } else {
      setMsg("ℹ️ Installation abgebrochen");
    }
    
    setDeferredPrompt(null);
    setTimeout(() => setMsg(""), 3000);
  }

  function resetDailyLimit() {
    setDailyLimit(30);
    setInputValue("30");
    localStorage.setItem("dailyLimit", "30");
    setMsg("✅ Limit zurückgesetzt auf 30");
    setTimeout(() => setMsg(""), 3000);
  }

  function changeLearnDirection(direction: LearnDirection) {
    setLearnDirection(direction);
    localStorage.setItem("learnDirection", direction);
    const dirText = direction === "TH_DE" ? "Thai → Deutsch" : "Deutsch → Thai";
    setMsg(`✅ Lernrichtung: ${dirText}`);
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
                Tägliches Lernziel
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximale Karten, die täglich als "Heute fällig" angezeigt werden (Standard: 30)
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min="1"
                  className="w-full sm:w-32 px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="z.B. 30"
                />
                <Button 
                  onClick={saveDailyLimit} 
                  className="w-full sm:flex-1 bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                  disabled={isSaving}
                  variant={isSaving ? "default" : "default"}
                >
                  {isSaving ? "✓ Gespeichert" : "Speichern"}
                </Button>
                <Button 
                  onClick={resetDailyLimit} 
                  variant="default"
                  className="w-full sm:flex-1 bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                >
                  Zurücksetzen
                </Button>
              </div>
              {isSaving && (
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md text-sm text-green-800 dark:text-green-200 animate-in fade-in duration-200">
                  ✓ Erfolgreich gespeichert!
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Aktuell eingestellt: <span className="font-semibold">{dailyLimit}</span> Karten
              </p>
            </div>

            {/* Lernrichtung */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium block mb-2">
                Lernrichtung (für Tests)
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Standardrichtung für neue Abfragen
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => changeLearnDirection("TH_DE")}
                  variant={learnDirection === "TH_DE" ? "default" : "outline"}
                  className={learnDirection === "TH_DE" ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow" : ""}
                >
                  🇹🇭 Thai → Deutsch
                </Button>
                <Button 
                  onClick={() => changeLearnDirection("DE_TH")}
                  variant={learnDirection === "DE_TH" ? "default" : "outline"}
                  className={learnDirection === "DE_TH" ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow" : ""}
                >
                  🇩🇪 Deutsch → Thai
                </Button>
              </div>
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

        {/* PWA Installation */}
        <Card className="p-4 space-y-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">📱 Als App installieren</h3>

          <div className="space-y-3">
            {showInstallButton ? (
              <>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Installieren Sie die App auf Ihrem Gerät für schnelleren Zugriff.
                </p>
                <Button 
                  onClick={installApp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  📲 Jetzt installieren
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  So installieren Sie die App auf Ihrem Gerät:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded">
                    <strong>🤖 Android (Chrome):</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Öffnen Sie das Browser-Menü (⋮)</li>
                      <li>Tippen Sie auf "Zum Startbildschirm hinzufügen"</li>
                      <li>Bestätigen Sie mit "Hinzufügen"</li>
                    </ol>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded">
                    <strong>🍎 iOS (Safari):</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Tippen Sie auf den Teilen-Button (⎙)</li>
                      <li>Scrollen Sie zu "Zum Home-Bildschirm"</li>
                      <li>Tippen Sie auf "Hinzufügen"</li>
                    </ol>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded">
                    <strong>💻 Desktop (Chrome/Edge):</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Klicken Sie auf das ⊕ Symbol in der Adressleiste</li>
                      <li>Oder: Menü → "App installieren"</li>
                    </ol>
                  </div>
                </div>
              </>
            )}
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

        {/* Developer Debug - Lesson Progress Cheater */}
        <Card className="p-4 space-y-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100">🛠️ Entwickler Debug</h3>
          <p className="text-xs text-purple-800 dark:text-purple-200">
            Setze Lektionen-Fortschritt zum schnellen Testen (100% = Exam erforderlich)
          </p>
          
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lesson) => (
              <Button 
                key={lesson}
                onClick={() => {
                  localStorage.setItem(`lessonProgress_${lesson}`, "100");
                  setMsg(`✅ Lektion ${lesson} auf 100% gesetzt`);
                  setTimeout(() => setMsg(""), 2000);
                  window.location.reload();
                }}
                variant="outline"
                className="text-xs h-auto py-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                L{lesson} → 100%
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Exam-Score setzen (85%+ = bestanden)</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => {
                  const lesson = prompt("Lektion (1-5):", "1");
                  if (lesson && [1,2,3,4,5].includes(Number(lesson))) {
                    localStorage.setItem(`lessonExamScore_${lesson}`, "85");
                    setMsg(`✅ Lektion ${lesson} Exam mit 85% bestanden`);
                    setTimeout(() => setMsg(""), 2000);
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="text-xs bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                85% Bestanden
              </Button>
              <Button 
                onClick={() => {
                  const lesson = prompt("Lektion (1-5):", "1");
                  if (lesson && [1,2,3,4,5].includes(Number(lesson))) {
                    localStorage.removeItem(`lessonExamScore_${lesson}`);
                    localStorage.removeItem(`lessonProgress_${lesson}`);
                    setMsg(`✅ Lektion ${lesson} komplett zurückgesetzt`);
                    setTimeout(() => setMsg(""), 2000);
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="text-xs bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                Komplett Reset
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

        {/* PWA Debug Info */}
        <Card className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
          <h3 className="font-semibold text-lg">🔧 PWA Debug Info</h3>
          <div className="text-xs space-y-2">
            <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {debugInfo || "Keine Informationen verfügbar"}
            </p>
            <p className="text-muted-foreground">
              Service Worker: {('serviceWorker' in navigator) ? '✅ Unterstützt' : '❌ Nicht unterstützt'}
            </p>
            <p className="text-muted-foreground">
              beforeinstallprompt: {deferredPrompt ? '✅ Verfügbar' : '❌ Nicht verfügbar'}
            </p>
            <p className="text-muted-foreground">
              Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? '📱 Standalone (installiert)' : '🌐 Browser'}
            </p>
          </div>
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

        {/* Help Button */}
        <Card className="p-4 space-y-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Button 
            onClick={() => setShowHelpDialog(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            ❓ Benutzer-Anleitung
          </Button>
        </Card>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">📱 Thai Vocab Trainer - Benutzer Anleitung</DialogTitle>
            <DialogDescription>Hier findest du eine Übersicht aller Funktionen</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pr-4">
            {/* Home Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🏠 Home Seite (Startseite)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Die Home Seite zeigt dir einen Überblick über denen Lernfortschritt mit vier Haupt-Indikatoren:
              </p>
              <ul className="space-y-2 text-sm">
                <li><strong>Heute fällig (⭐):</strong> Zeigt wie viele Karten heute zur Wiederholung fällig sind. Klick auf die Karte zum automatischen Starten!</li>
                <li><strong>Vokabeln (📚):</strong> Gesamtanzahl aller Vokabeln in deinem Wortschatz</li>
                <li><strong>Streak (🔥):</strong> Deine aktuelle Lern-Serie (Tage hintereinander)</li>
                <li><strong>Heutiges Lernziel:</strong> Fortschrittsbalken für deine tägliche Lernquote</li>
              </ul>
            </div>

            {/* Learn Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">📚 Learn (Lernen)</h3>
              <ul className="space-y-2 text-sm">
                <li>Neue Karten kennenlernen oder Karten wiederholen</li>
                <li>Klick "Markiere als gelernt" wenn du die Karte beherrschst</li>
                <li>Die App merkt sich deine Lernfortschritte (Spaced Repetition)</li>
              </ul>
            </div>

            {/* Test Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🧪 Test (Abfrage)</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Lernrichtung:</strong> Wird automatisch aus deinen Einstellungen übernommen</li>
                <li><strong>Quick-Start - Gelernte Karten:</strong> Testet deine gelernten Karten</li>
                <li><strong>Custom Test:</strong> Wähle eine genaue Anzahl von Karten</li>
                <li><strong>Lektionen-Tests (L1-L4):</strong> Tests für spezifische Lektionen</li>
                <li><strong>Navigation:</strong> Mit Pfeilen ⬅️➡️ zwischen Karten navigieren</li>
                <li><strong>Richtung ändern:</strong> In den Einstellungen konfigurieren</li>
              </ul>
            </div>

            {/* Exam Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">📊 Exam (Prüfung)</h3>
              <ul className="space-y-2 text-sm">
                <li>Formale Prüfung mit Bestehensgrenze (85% richtig = bestanden)</li>
                <li>Detailliertes Ergebnis am Ende</li>
                <li>Nutze das für realistische Lernzielkontrolle</li>
              </ul>
            </div>

            {/* Settings Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">⚙️ Einstellungen (Settings)</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Tägliches Lernziel:</strong> Maximale Karten pro Tag (Standard: 30)</li>
                <li><strong>Lernrichtung:</strong> Standard für Tests (Thai→Deutsch oder Deutsch→Thai)</li>
                <li><strong>Vokabeln-Seite:</strong> Zusätzlicher Tab zum Durchsuchen aller Vokabeln</li>
                <li><strong>Daten zurücksetzen:</strong> Alle Lernfortschritte löschen</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
