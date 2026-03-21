import { useState } from "react";
import { getLastBackupTime } from "../features/vocab/backup";
import { useSettingsDataHandlers } from "../features/settings/hooks/useSettingsDataHandlers";
import { useSettingsMaintenance } from "../features/settings/hooks/useSettingsMaintenance";
import { useSettingsPreferences } from "../features/settings/hooks/useSettingsPreferences";
import { useSettingsPwaInstall } from "../features/settings/hooks/useSettingsPwaInstall";
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

type SettingsSectionId =
  | "learn"
  | "install"
  | "backup"
  | "danger"
  | "debugLesson";

export type SettingsPageProps = {
  darkMode: boolean;
  onThemeChange: (dark: boolean) => void;
};

export default function Settings({ darkMode, onThemeChange }: SettingsPageProps) {
  const [msg, setMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SettingsSectionId | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<number | null>(null);
  const [renderNow] = useState<number>(() => Date.now());
  const settingsSections: Array<{
    id: SettingsSectionId;
    title: string;
    description: string;
  }> = [
    {
      id: "learn",
      title: "App Einstellungen",
      description: "Erscheinungsbild, Tagesziel, Lernrichtung und Sound.",
    },
    {
      id: "install",
      title: "Als App installieren",
      description: "PWA-Installation auf Android, iOS und Desktop.",
    },
    {
      id: "backup",
      title: "Backup & Restore",
      description: "Komplette App-Daten sichern und wiederherstellen.",
    },
    {
      id: "danger",
      title: "Datenbank-Wartung",
      description: "Zurücksetzen oder Lernfortschritt reparieren.",
    },
    {
      id: "debugLesson",
      title: "Entwickler-Debug",
      description: "Lektionsfortschritt und Exam-Status für Tests setzen.",
    },
  ];

  /** Wird nach Backup-Import und DB-Wartung von Hooks aufgerufen (keine Anzeige mehr in Settings). */
  async function refreshVocabCount() {
    await Promise.resolve();
  }

  function refreshBackupTime() {
    setLastBackupTime(getLastBackupTime());
  }

  function openSection(section: SettingsSectionId) {
    setActiveSection(section);
    if (section === "danger") {
      void refreshVocabCount();
    }
    if (section === "backup") {
      refreshBackupTime();
    }
  }

  const { onBackupExport, onBackupImport } = useSettingsDataHandlers({
    setMsg,
    setIsLoading,
    refreshVocabCount,
    refreshBackupTime,
    latestCsvUrls: [],
  });
  const {
    dailyLimit,
    inputValue,
    setInputValue,
    isSaving,
    learnDirection,
    soundEnabled,
    saveDailyLimit,
    resetDailyLimit,
    changeLearnDirection,
    toggleSoundEnabled,
  } = useSettingsPreferences({ setMsg });
  const { showInstallButton, installApp } = useSettingsPwaInstall({
    setMsg,
  });
  const {
    resetDatabase,
    repairProgressRecords,
    debugSetLessonReadyForExam,
    debugSetLessonExamPassed,
    debugResetLesson,
  } = useSettingsMaintenance({
    setMsg,
    setIsLoading,
    refreshVocabCount,
  });

  function formatBackupTime(timestamp: number | null): string {
    if (!timestamp) return "Noch kein Backup gespeichert";
    return new Date(timestamp).toLocaleString("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getBackupReminderText(timestamp: number | null): string | null {
    if (!timestamp) {
      return "Noch kein Backup vorhanden. Erstelle ein Backup, bevor du App-Daten löschst, das Gerät wechselst oder die App neu installierst.";
    }
    const ageMs = renderNow - timestamp;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    if (ageDays >= 14) {
      return `Dein letztes Backup ist ${ageDays} Tage alt. Für mehr Sicherheit bitte ein neues Backup erstellen.`;
    }
    return null;
  }

  function getSectionTitle(section: SettingsSectionId | null): string {
    return settingsSections.find((item) => item.id === section)?.title ?? "Einstellungen";
  }

  function renderSectionContent(section: SettingsSectionId | null) {
    switch (section) {
      case "learn":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">Erscheinungsbild</label>
              <p className="text-xs text-muted-foreground mb-3">
                Hell- oder Dunkelmodus für die gesamte App (wird auf diesem Gerät gespeichert).
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={() => onThemeChange(false)}
                  variant={!darkMode ? "default" : "outline"}
                  className={
                    !darkMode
                      ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                      : ""
                  }
                >
                  ☀️ Hell
                </Button>
                <Button
                  type="button"
                  onClick={() => onThemeChange(true)}
                  variant={darkMode ? "default" : "outline"}
                  className={
                    darkMode
                      ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                      : ""
                  }
                >
                  🌙 Dunkel
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium">Tägliches Lernziel</label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximale Karten, die täglich als "Heute fällig" angezeigt werden (Standard: 10)
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min="1"
                  className="w-full sm:w-32 px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="z.B. 10"
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
              {isSaving ? (
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md text-sm text-green-800 dark:text-green-200 animate-in fade-in duration-200">
                  ✓ Erfolgreich gespeichert!
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground mt-2">
                Aktuell eingestellt: <span className="font-semibold">{dailyLimit}</span> Karten
              </p>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium block mb-2">Lernrichtung (für Tests)</label>
              <p className="text-xs text-muted-foreground mb-3">
                Standardrichtung für neue Abfragen
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => changeLearnDirection("TH_DE")}
                  variant={learnDirection === "TH_DE" ? "default" : "outline"}
                  className={
                    learnDirection === "TH_DE"
                      ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                      : ""
                  }
                >
                  🇹🇭 Thai → Deutsch
                </Button>
                <Button
                  onClick={() => changeLearnDirection("DE_TH")}
                  variant={learnDirection === "DE_TH" ? "default" : "outline"}
                  className={
                    learnDirection === "DE_TH"
                      ? "bg-primary text-primary-foreground border border-primary/80 shadow-sm hover:shadow hover:bg-primary/90 transition-shadow"
                      : ""
                  }
                >
                  🇩🇪 Deutsch → Thai
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={toggleSoundEnabled}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium">Sound-Effekte aktivieren</span>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Deaktiviere Soundeffekte, wenn du lieber ohne Audio lernen möchtest.
              </p>
            </div>
          </div>
        );
      case "install":
        return (
          <div className="space-y-3">
            {showInstallButton ? (
              <>
                <p className="text-sm">Installieren Sie die App auf Ihrem Gerät für schnelleren Zugriff.</p>
                <Button
                  onClick={installApp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  📲 Jetzt installieren
                </Button>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="bg-muted/40 p-3 rounded">
                  <strong>🤖 Android (Chrome):</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Browser-Menü (⋮) öffnen</li>
                    <li>"Zum Startbildschirm hinzufügen" wählen</li>
                    <li>Mit "Hinzufügen" bestätigen</li>
                  </ol>
                </div>
                <div className="bg-muted/40 p-3 rounded">
                  <strong>🍎 iOS (Safari):</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Teilen-Button (⎙) tippen</li>
                    <li>"Zum Home-Bildschirm" wählen</li>
                    <li>Mit "Hinzufügen" bestätigen</li>
                  </ol>
                </div>
                <div className="bg-muted/40 p-3 rounded">
                  <strong>💻 Desktop (Chrome/Edge):</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>⊕ in der Adressleiste nutzen</li>
                    <li>oder Menü → "App installieren"</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        );
      case "backup":
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Sichert Vokabeln, Zahlen, Sätze, Lernfortschritte und wichtige Einstellungen.
            </p>
            <p className="text-xs text-muted-foreground">
              Letztes Backup: <span className="font-semibold">{formatBackupTime(lastBackupTime)}</span>
            </p>
            {getBackupReminderText(lastBackupTime) ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {getBackupReminderText(lastBackupTime)}
              </div>
            ) : null}
            <Button onClick={onBackupExport} variant="outline" className="w-full" disabled={isLoading}>
              💾 Komplettes Backup herunterladen
            </Button>
            <div>
              <label className="text-sm font-medium block mb-2">Restore durchführen</label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={onBackupImport}
                disabled={isLoading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-200 dark:hover:file:bg-emerald-800"
              />
            </div>
          </div>
        );
      case "danger":
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Löscht Daten oder repariert fehlende Fortschritts-Einträge.
            </p>
            <Button
              onClick={resetDatabase}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              🗑️ Alle Daten löschen
            </Button>
            <Button
              onClick={repairProgressRecords}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              🔧 Fortschritt reparieren
            </Button>
          </div>
        );
      case "debugLesson":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lesson) => (
                <Button
                  key={lesson}
                  onClick={() => void debugSetLessonReadyForExam(lesson)}
                  disabled={isLoading}
                  variant="outline"
                  className="text-xs h-auto py-2"
                >
                  L1-L{lesson}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  const lesson = prompt("Lektion (1-5):", "1");
                  if (lesson && [1, 2, 3, 4, 5].includes(Number(lesson))) {
                    debugSetLessonExamPassed(Number(lesson));
                  }
                }}
                disabled={isLoading}
                variant="outline"
                className="text-xs"
              >
                85% Bestanden
              </Button>
              <Button
                onClick={() => {
                  const lesson = prompt("Lektion (1-5):", "1");
                  if (lesson && [1, 2, 3, 4, 5].includes(Number(lesson))) {
                    void debugResetLesson(Number(lesson));
                  }
                }}
                disabled={isLoading}
                variant="outline"
                className="text-xs"
              >
                Komplett Reset
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <PageShell title="Einstellungen">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bereiche</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Öffne einen Bereich per Klick, um die jeweiligen Einstellungen in einem Dialog zu bearbeiten.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => openSection(section.id)}
                className="text-left rounded-xl border bg-card p-4 hover:bg-accent/40 transition-colors"
              >
                <div className="font-medium">{section.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{section.description}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowHelpDialog(true)}
              className="text-left rounded-xl border bg-card p-4 hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium">Benutzer-Anleitung</div>
              <div className="text-xs text-muted-foreground mt-1">
                Übersicht aller App-Funktionen mit Hinweisen zu Lernen, Test, Exam und Spiele.
              </div>
            </button>
          </div>
        </div>

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

      <Dialog open={activeSection !== null} onOpenChange={(open) => setActiveSection(open ? activeSection : null)}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{getSectionTitle(activeSection)}</DialogTitle>
            <DialogDescription>
              Passe diesen Bereich an. Änderungen werden wie bisher direkt gespeichert bzw. ausgeführt.
            </DialogDescription>
          </DialogHeader>
          <div className="pr-2 space-y-4">
            {renderSectionContent(activeSection)}
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setActiveSection(null)}>
              ← Zurück
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">📱 Thai-Deutsch Vokabel Trainer Benutzeranleitung</DialogTitle>
            <DialogDescription>Hier findest du eine Übersicht aller Funktionen</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pr-4">
            {/* Home Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🏠 Home Seite (Startseite)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Die Home-Seite zeigt dir einen Überblick über deinen Lernfortschritt:
              </p>
              <ul className="space-y-2 text-sm">
                <li><strong>Heute fällig (⭐):</strong> Anzahl Karten für heute (gemäß Tageslimit), Klick startet direkt Lernen.</li>
                <li><strong>Vokabeln (📚):</strong> Gesamtanzahl aller Vokabeln in deinem Wortschatz</li>
                <li><strong>Streak (🔥):</strong> Aktuelle und beste Lernserie inkl. 7-Tage-Übersicht im Dialog</li>
                <li><strong>Heutiges Lernziel:</strong> Fortschrittsbalken basierend auf deinem Tagesziel</li>
              </ul>
            </div>

            {/* Learn Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">📚 Learn (Lernen)</h3>
              <ul className="space-y-2 text-sm">
                <li>Lektion wählen, Session konfigurieren und Karten Schritt für Schritt lernen</li>
                <li><strong>Zahlenlektion (🔢):</strong> Eigener Lernbereich mit DB-Zahlenkarten (inkl. SRS-Fortschritt), getrennt von normalen Vokabeln</li>
                <li><strong>Markiere als gelernt/ungelernt:</strong> Setzt den Lernstatus der aktuellen Karte</li>
                <li>Audio für Thai/Deutsch und Beispielsätze direkt auf der Karte</li>
              </ul>
            </div>

            {/* Test Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🧪 Test (Abfrage)</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Lernrichtung:</strong> Startwert aus Einstellungen; in den Test-Dialogen (Vokabeln, Zahlen, Sätze) und bei erweiterten Filtern anpassbar und wird mitgespeichert</li>
                <li><strong>Satztest (💬):</strong> Richtung Thai→Deutsch oder Deutsch→Thai im Dialog „Sätze testen“ wählbar</li>
                <li><strong>Fällige Karten testen:</strong> Standardmäßig nur SRS-fällige gelernte Karten, optional alle gelernten</li>
                <li><strong>Lektions-Tests:</strong> Direktstart pro Lektion mit optionalem Kartenlimit (DB/SRS-basiert)</li>
                <li><strong>Zahlentest (🔢):</strong> Wahl zwischen SRS-Mode (DB-Zahlen) und Generator-Mode (von-bis Bereich)</li>
                <li><strong>Bewertung:</strong> Karte umdrehen, dann Falsch/Richtig tippen (5x richtig = Karte erledigt)</li>
                <li><strong>Filter:</strong> Optional nach Lektion, Tags, nur gelernt und nur fällig</li>
              </ul>
            </div>

            {/* Games Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🎮 Spiele</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Modi:</strong> Blitzrunde, 4er-Quiz, Hör-Spiel und Zahlenspiel</li>
                <li><strong>Setup-Dialog:</strong> Modus antippen, dann Richtung, Fragenanzahl/Zeitlimit und Lektion wählen</li>
                <li><strong>Audio/TTS:</strong> Vorlesen nur bei Richtung Thai → Deutsch; bei Deutsch → Thai ohne Sprachausgabe</li>
                <li><strong>Fragenlogik:</strong> Verfügbare Karten kommen zuerst einmal dran, Wiederholungen danach in zufälliger Reihenfolge</li>
                <li><strong>Zahlenspiel (🔢):</strong> Verwendet nur Zahlenkarten (Thai-Ziffern ⇄ Arabische Ziffern)</li>
                <li><strong>Gamification:</strong> XP, Level, Tagesaufgabe und Badges werden pro Runde aktualisiert</li>
              </ul>
            </div>

            {/* Exam Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">📊 Exam (Prüfung)</h3>
              <ul className="space-y-2 text-sm">
                <li>Formale Prüfung mit Bestehensgrenze (85% richtig = bestanden)</li>
                <li><strong>Zahlenexamen (🔢):</strong> Läuft als Generator-Examen mit 100 Fragen (gewichtete Bereiche) und eigener Bestehensanzeige</li>
                <li>Pro Frage eine Auswahlantwort, danach Auswertung mit Punkten und Ergebnis</li>
                <li><strong>Vorlesen:</strong> Nur bei Richtung Thai → Deutsch; bei Deutsch → Thai keine Sprachausgabe</li>
                <li>Nutze das für realistische Lernzielkontrolle pro Lektion</li>
              </ul>
            </div>

            {/* Numbers Separation Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">🔢 Zahlenmodul (wichtig)</h3>
              <ul className="space-y-2 text-sm">
                <li>Zahlen und normale Vokabeln sind technisch und didaktisch getrennt.</li>
                <li>SRS-Faelligkeit und Lernstatus gelten nur fuer DB-Karten; Generator-Modi schreiben keinen SRS-Fortschritt.</li>
                <li>Gelernt-Status und Ergebnisse werden pro Modul separat gespeichert.</li>
                <li>Eine gelernte Zahl taucht nicht im normalen Vokabeltest auf (und umgekehrt).</li>
              </ul>
            </div>

            {/* Settings Section */}
            <div>
              <h3 className="font-bold text-lg mb-3">⚙️ Einstellungen (Settings)</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Erscheinungsbild:</strong> Hell- oder Dunkelmodus</li>
                <li><strong>Tägliches Lernziel:</strong> Maximale Karten pro Tag (Standard: 10)</li>
                <li><strong>Lernrichtung:</strong> Standard für neue Test-Abfragen (Thai→Deutsch oder Deutsch→Thai)</li>
                <li><strong>Sound:</strong> Effekte aktivieren/deaktivieren</li>
                <li><strong>Backup & Restore:</strong> Komplette App-Daten sichern und wiederherstellen</li>
                <li><strong>Datenbank zurücksetzen:</strong> Löscht importierte Daten und Fortschritt (nur Standarddaten bleiben)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
