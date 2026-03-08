import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Home as HomeIcon,
  MoreHorizontal,
  NotebookTabs,
  Settings as SettingsIcon,
} from "lucide-react";

const Home = lazy(() => import("./pages/Home"));
const VocabList = lazy(() => import("./pages/VocabList"));
const Learn = lazy(() => import("./pages/Learn"));
const Test = lazy(() => import("./pages/Test"));
const Exam = lazy(() => import("./pages/Exam"));
const Games = lazy(() => import("./pages/Games"));
const Settings = lazy(() => import("./pages/Settings"));
import { db } from "./db/db";
import { ensureProgressForEntries } from "./db/srs";
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

type Route = "home" | "list" | "learn" | "test" | "exam" | "games" | "settings";
const ROUTES: Route[] = ["home", "list", "learn", "test", "exam", "games", "settings"];

function buildDefaultVocabKey(thai: string, transliteration?: string): string {
  const safeThai = thai.trim();
  const safeTransliteration = (transliteration ?? "").trim().toLowerCase();
  return `${safeThai}__${safeTransliteration}`;
}

function isRoute(value: string): value is Route {
  return ROUTES.includes(value as Route);
}

function readPersistedRoute(): Route | null {
  try {
    const fromSession = sessionStorage.getItem("lastRoute");
    if (fromSession && isRoute(fromSession)) return fromSession;
  } catch {
    // ignore
  }

  try {
    const fromLocal = localStorage.getItem("lastRoute");
    if (fromLocal && isRoute(fromLocal)) return fromLocal;
  } catch {
    // ignore
  }

  return null;
}

function getInitialRoute(): Route {
  if (typeof window === "undefined") return "home";

  const hash = window.location.hash.replace("#", "");
  if (isRoute(hash)) return hash;

  return readPersistedRoute() ?? "home";
}

function getInitialDarkMode(): boolean {
  // 1) gespeicherte Präferenz
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;

  // 2) fallback: Dark Mode ist Standard
  return true;
}

export default function App() {
  const [route, setRoute] = useState<Route>(getInitialRoute);

  // (Entfernt: Erzwinge Home-Route beim Laden)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showVocabPage, setShowVocabPage] = useState<boolean>(true);
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);
  const [isLearnSessionActive, setIsLearnSessionActive] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const mobileMoreRef = useRef<HTMLDivElement | null>(null);

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
              await ensureProgressForEntries(ids);
              console.log(`[App Init] Created progress records for ${ids.length} entries`);
            }
          });
          
          // Double-check the count after loading
          const newCount = await db.vocab.count();
          const progressCount = await db.progress.count();
          console.log(`✅ [App Init] Default vocab loaded: ${expectedCount} entries, DB now has ${newCount} total, ${progressCount} progress records`);
        } else {
          // Never auto-delete user data. If data exists, we only repair missing progress records.
          const progressCount = await db.progress.count();
          if (progressCount < count) {
            const ids = (await db.vocab.toCollection().primaryKeys()) as number[];
            console.log(
              `[App Init] DB populated (${count} entries), repairing progress records (${progressCount} -> ${ids.length})...`
            );
            await ensureProgressForEntries(ids);
            const newProgressCount = await db.progress.count();
            console.log(`✅ [App Init] Progress records repaired: ${newProgressCount}`);
          } else {
            console.log(
              `[App Init] DB already populated with ${count} entries and ${progressCount} progress records, skipping load`
            );
          }
        }

        // Data hotfix: normalize german translation for "ไม่" from "no/nicht" -> "nein/nicht".
        const corrected = await db.vocab
          .where("thai")
          .equals("ไม่")
          .and((entry) => entry.german === "no/nicht")
          .modify((entry) => {
            entry.german = "nein/nicht";
            entry.updatedAt = Date.now();
          });
        if (corrected > 0) {
          console.log(`[App Init] Corrected ${corrected} vocab entry/entries: no/nicht -> nein/nicht`);
        }

        // Data migration: keep DB in sync when new default vocab entries are added.
        const existingEntries = await db.vocab.toArray();
        const defaultByKey = new Map(
          DEFAULT_VOCAB.map((entry) => [
            buildDefaultVocabKey(entry.thai, entry.transliteration),
            entry,
          ])
        );
        const existingByKey = new Map<string, typeof existingEntries>();
        for (const entry of existingEntries) {
          const key = buildDefaultVocabKey(entry.thai, entry.transliteration);
          const list = existingByKey.get(key);
          if (list) {
            list.push(entry);
          } else {
            existingByKey.set(key, [entry]);
          }
        }

        const idsToRemove: number[] = [];
        const idsToEnsureProgress = new Set<number>();

        for (const [key, defaultsEntry] of defaultByKey.entries()) {
          const matches = existingByKey.get(key) ?? [];
          if (matches.length === 0) continue;

          // Keep one canonical row per default key and remove the rest.
          const canonical =
            matches.find((entry) => Number(entry.lesson) === Number(defaultsEntry.lesson)) ??
            matches[0];

          if (canonical.id != null) {
            await db.vocab.update(canonical.id, {
              thai: defaultsEntry.thai,
              german: defaultsEntry.german,
              transliteration: defaultsEntry.transliteration,
              pos: defaultsEntry.pos,
              lesson: defaultsEntry.lesson,
              tags: defaultsEntry.tags,
              exampleThai: defaultsEntry.exampleThai,
              exampleGerman: defaultsEntry.exampleGerman,
              updatedAt: Date.now(),
            });
            idsToEnsureProgress.add(canonical.id);
          }

          for (const duplicate of matches) {
            if (duplicate.id == null || duplicate.id === canonical.id) continue;
            idsToRemove.push(duplicate.id);
          }
        }

        if (idsToRemove.length > 0) {
          await db.transaction("rw", db.vocab, db.progress, async () => {
            await db.vocab.bulkDelete(idsToRemove);
            await db.progress.bulkDelete(idsToRemove);
          });
          console.log(`[App Init] Removed ${idsToRemove.length} duplicate default vocab entries`);
        }

        if (idsToEnsureProgress.size > 0) {
          await ensureProgressForEntries(Array.from(idsToEnsureProgress));
        }

        const existingKeys = new Set(
          (await db.vocab.toArray()).map((entry) =>
            buildDefaultVocabKey(entry.thai, entry.transliteration)
          )
        );
        const missingDefaults = DEFAULT_VOCAB.filter(
          (entry) =>
            !existingKeys.has(
              buildDefaultVocabKey(entry.thai, entry.transliteration)
            )
        );

        if (missingDefaults.length > 0) {
          const now = Date.now();
          const toAdd = missingDefaults.map((entry) => ({
            ...entry,
            createdAt: now,
            updatedAt: now,
          }));
          const insertedIds = await db.vocab.bulkAdd(toAdd, { allKeys: true });
          const normalizedIds = insertedIds
            .map((id) => Number(id))
            .filter((id): id is number => Number.isFinite(id) && id > 0);
          await ensureProgressForEntries(normalizedIds);
          console.log(`[App Init] Added ${toAdd.length} missing default vocab entries`);
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

  useEffect(() => {
    const handleLearnSessionVisibility = (event: Event) => {
      const custom = event as CustomEvent<{ active?: boolean }>;
      setIsLearnSessionActive(Boolean(custom.detail?.active));
    };
    window.addEventListener("learnSessionVisibilityChanged", handleLearnSessionVisibility);
    return () =>
      window.removeEventListener("learnSessionVisibilityChanged", handleLearnSessionVisibility);
  }, []);

  // Listen for app navigation events (e.g., from Home lesson cards)
  useEffect(() => {
    const handleAppNavigate = (event: any) => {
      const next = event?.detail;
      if (typeof next === "string" && isRoute(next)) {
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
      if (isRoute(hash)) {
        setRoute(hash);
        return;
      }

      const persisted = readPersistedRoute();
      if (persisted) setRoute(persisted);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    if (window.location.hash !== `#${route}`) {
      window.history.replaceState(null, "", `#${route}`);
    }

    try {
      sessionStorage.setItem("lastRoute", route);
      localStorage.setItem("lastRoute", route);
    } catch {
      // ignore storage write errors
    }
  }, [route]);

  useEffect(() => {
    setIsMobileMoreOpen(false);
  }, [route]);

  useEffect(() => {
    if (!isMobileMoreOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(event.target as Node)) {
        setIsMobileMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isMobileMoreOpen]);

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

  const mobileMoreActive = route === "exam" || route === "settings" || route === "list";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-4 pb-24 md:pb-4">
        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Thai–Deutsch Vokabeltrainer</h2>

            <Button variant="outline" size="sm" onClick={toggleTheme} title="Hell/Dunkel umschalten">
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </Button>
          </div>

          <Tabs value={route} onValueChange={(v) => setRoute(v as Route)} className="hidden md:block">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="learn">Lernen</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
              <TabsTrigger value="exam">Examen</TabsTrigger>
              <TabsTrigger value="games">Spiele</TabsTrigger>
              <TabsTrigger value="settings" title="Einstellungen">⚙️</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <Suspense
          fallback={
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Lade Seite...
            </div>
          }
        >
          {route === "home" && <Home onNavigate={setRoute} />}
          {route === "list" && <VocabList />}
          {route === "learn" && <Learn />}
          {route === "test" && <Test />}
          {route === "exam" && <Exam />}
          {route === "games" && <Games />}
          {route === "settings" && <Settings />}
        </Suspense>

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

              {/* Games Section */}
              <div>
                <h3 className="font-bold text-lg mb-3">🎮 Spiele</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Blitzrunde:</strong> 60 Sekunden, so viele Antworten wie möglich</li>
                  <li><strong>4er-Quiz:</strong> 10 Multiple-Choice-Fragen mit Punktewertung</li>
                  <li><strong>Hör-Spiel:</strong> Audio abspielen und passende Übersetzung wählen</li>
                  <li><strong>Filter:</strong> Spiele optional nur mit fälligen Karten oder pro Lektion</li>
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

      {!isLearnSessionActive ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden [padding-bottom:env(safe-area-inset-bottom)]"
          aria-label="Mobile Navigation"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1 p-1">
          <button
            type="button"
            onClick={() => setRoute("home")}
            className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              route === "home"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
            aria-current={route === "home" ? "page" : undefined}
          >
            <HomeIcon className={`h-4 w-4 ${route === "home" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
            Home
          </button>
          <button
            type="button"
            onClick={() => setRoute("learn")}
            className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              route === "learn"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
            aria-current={route === "learn" ? "page" : undefined}
          >
            <GraduationCap className={`h-4 w-4 ${route === "learn" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
            Lernen
          </button>
          <button
            type="button"
            onClick={() => setRoute("test")}
            className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              route === "test"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
            aria-current={route === "test" ? "page" : undefined}
          >
            <FlaskConical className={`h-4 w-4 ${route === "test" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
            Tests
          </button>
          <button
            type="button"
            onClick={() => setRoute("games")}
            className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              route === "games"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
            aria-current={route === "games" ? "page" : undefined}
          >
            <Gamepad2 className={`h-4 w-4 ${route === "games" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
            Spiele
          </button>

          <div className="relative" ref={mobileMoreRef}>
            <button
              type="button"
              onClick={() => setIsMobileMoreOpen((prev) => !prev)}
              className={`relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                mobileMoreActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
              aria-expanded={isMobileMoreOpen}
              aria-controls="mobile-more-menu"
            >
              <MoreHorizontal className={`h-4 w-4 ${mobileMoreActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
              Mehr
            </button>

            {isMobileMoreOpen ? (
              <div
                id="mobile-more-menu"
                className="absolute bottom-full right-0 mb-2 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-border bg-background py-2 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setRoute("exam")}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    route === "exam"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <NotebookTabs className="h-4 w-4" />
                  Examen
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("settings")}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    route === "settings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Einstellungen
                </button>
              </div>
            ) : null}
          </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}