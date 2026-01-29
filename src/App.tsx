import { useEffect, useState } from "react";

import Home from "./pages/Home";
import VocabList from "./pages/VocabList";
import Learn from "./pages/Learn";
import Test from "./pages/Test";
import Exam from "./pages/Exam";
import Settings from "./pages/Settings";
import { db } from "./db/db";
import { ensureProgress } from "./db/srs";
import { DEFAULT_VOCAB } from "./data/defaultVocab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Route = "home" | "list" | "learn" | "test" | "exam" | "settings";

function getInitialDarkMode(): boolean {
  // 1) gespeicherte Präferenz
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;

  // 2) fallback: Dark Mode ist Standard
  return true;
}

export default function App() {
  const [route, setRoute] = useState<Route>("home");

  // (Entfernt: Erzwinge Home-Route beim Laden)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showVocabPage, setShowVocabPage] = useState<boolean>(true);
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);

  // Initialize default vocab on app load
  useEffect(() => {
    // Guard to prevent double-execution in StrictMode
    let isMounted = true;
    
    const initDefaultVocab = async () => {
      try {
        console.log(`[App Init] Starting vocab initialization...`);
        const count = await db.vocab.count();
        const expectedCount = DEFAULT_VOCAB.length;
        
        if (!isMounted) return; // Stop if component unmounted
        
        console.log(`[App Init] Current DB count: ${count}, expected: ${expectedCount}`);
        
        // Only load if DB is empty
        if (count === 0) {
          console.log(`[App Init] DB is empty, loading ${expectedCount} entries...`);
          const now = Date.now();
          const entries = DEFAULT_VOCAB.map(v => ({
            ...v,
            createdAt: now,
            updatedAt: now,
          }));
          
          // Use transaction to ensure atomic operation
          await db.transaction('rw', db.vocab, db.progress, async () => {
            // Double-check count inside transaction to prevent race condition
            const countInTx = await db.vocab.count();
            if (countInTx === 0) {
              await db.vocab.bulkAdd(entries);

              // Initialize progress records for all vocab so they're immediately due
              const ids = (await db.vocab.toCollection().primaryKeys()) as number[];
              console.log(`[App Init] Initialized ${ids.length} vocab entries, creating progress records...`);
              for (const id of ids) {
                await ensureProgress(id);
              }
              console.log(`[App Init] Created progress records for ${ids.length} entries`);
            }
          });
          
          // Double-check the count after loading
          const newCount = await db.vocab.count();
          const progressCount = await db.progress.count();
          console.log(`✅ [App Init] Default vocab loaded: ${expectedCount} entries, DB now has ${newCount} total, ${progressCount} progress records`);
        } else if (count > expectedCount * 1.5) {
          // Detect suspicious duplication (more than 150% of expected)
          console.warn(`⚠️ [App Init] POSSIBLE DUPLICATE DETECTED: DB has ${count} entries but expected ~${expectedCount}`);
          console.warn(`[App Init] Clearing database and reloading fresh...`);
          
          // Clear and reload
          await db.transaction('rw', db.vocab, db.progress, async () => {
            await db.vocab.clear();
            await db.progress.clear();
          });
          
          const now = Date.now();
          const entries = DEFAULT_VOCAB.map(v => ({
            ...v,
            createdAt: now,
            updatedAt: now,
          }));
          await db.vocab.bulkAdd(entries);

          const ids = (await db.vocab.toCollection().primaryKeys()) as number[];
          for (const id of ids) {
            await ensureProgress(id);
          }

          const newCount = await db.vocab.count();
          const progressCount = await db.progress.count();
          console.log(`✅ [App Init] Database reset and reloaded: ${newCount} entries, ${progressCount} progress records`);
        } else if (count !== expectedCount) {
          // Warn if count mismatch (possible duplicate loading)
          console.warn(`⚠️ [App Init] Vocab count mismatch: DB has ${count}, expected ${expectedCount}`);
        } else {
          const progressCount = await db.progress.count();
          if (progressCount === 0) {
            const ids = (await db.vocab.toCollection().primaryKeys()) as number[];
            console.log(`[App Init] DB populated but progress empty, creating ${ids.length} progress records...`);
            for (const id of ids) {
              await ensureProgress(id);
            }
            const newProgressCount = await db.progress.count();
            console.log(`✅ [App Init] Progress records created: ${newProgressCount}`);
          } else {
            console.log(`[App Init] DB already populated with ${count} entries, skipping load`);
          }
        }
      } catch (err) {
        console.error("Failed to load default vocab:", err);
      }
    };
    void initDefaultVocab();
    
    return () => {
      isMounted = false; // Cleanup: mark component as unmounted
    };
  }, []);

  // Load showVocabPage from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("showVocabPage");
    if (saved === "true") {
      setShowVocabPage(true);
    }
  }, []);

  // Listen for vocabPageVisibilityChanged event
  useEffect(() => {
    const handleVisibilityChange = (event: any) => {
      setShowVocabPage(event.detail?.visible ?? false);
    };

    window.addEventListener("vocabPageVisibilityChanged", handleVisibilityChange);
    return () => window.removeEventListener("vocabPageVisibilityChanged", handleVisibilityChange);
  }, []);

  // Listen for app navigation events (e.g., from Home lesson cards)
  useEffect(() => {
    const handleAppNavigate = (event: any) => {
      const next = event?.detail;
      if (next === "home" || next === "list" || next === "learn" || next === "test" || next === "exam" || next === "settings") {
        setRoute(next);
      }
    };

    window.addEventListener("appNavigate", handleAppNavigate);
    return () => window.removeEventListener("appNavigate", handleAppNavigate);
  }, []);

  // Sync route with URL hash for reliable navigation
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "home" || hash === "list" || hash === "learn" || hash === "test" || hash === "exam" || hash === "settings") {
        setRoute(hash as Route);
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    if (window.location.hash !== `#${route}`) {
      window.history.replaceState(null, "", `#${route}`);
    }
  }, [route]);

  // Auto-redirect from list route if page is hidden
  useEffect(() => {
    if (route === "list" && !showVocabPage) {
      setRoute("home");
    }
  }, [showVocabPage, route]);

  // Initial lesen + anwenden
  useEffect(() => {
    const initial = getInitialDarkMode();
    setDarkMode(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  // Reagiert auch auf Systemwechsel, solange der User NICHT manuell gewählt hat
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return;

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
      document.documentElement.classList.toggle("dark", e.matches);
    };

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-4">
        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Thai–Deutsch Vokabeltrainer</h2>

            <Button variant="outline" size="sm" onClick={toggleTheme} title="Hell/Dunkel umschalten">
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </Button>
          </div>

          <Tabs value={route} onValueChange={(v) => setRoute(v as Route)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="learn">Lernen</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
              <TabsTrigger value="exam">Examen</TabsTrigger>
              <TabsTrigger value="settings" title="Einstellungen">⚙️</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {route === "home" && <Home onNavigate={setRoute} />}
        {route === "list" && <VocabList />}
        {route === "learn" && <Learn />}
        {route === "test" && <Test />}
        {route === "exam" && <Exam />}
        {route === "settings" && <Settings />}

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
      </div>
    </div>
  );
}