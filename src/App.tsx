import { useEffect, useState } from "react";

import Home from "./pages/Home";
import VocabList from "./pages/VocabList";
import Learn from "./pages/Learn";
import Exam from "./pages/Exam";
import Settings from "./pages/Settings";
import { db } from "./db/db";
import { DEFAULT_VOCAB } from "./data/defaultVocab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type Route = "home" | "list" | "learn" | "exam" | "settings";

function getInitialDarkMode(): boolean {
  // 1) gespeicherte Präferenz
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;

  // 2) fallback: System-Einstellung
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export default function App() {
  const [route, setRoute] = useState<Route>("home");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showVocabPage, setShowVocabPage] = useState<boolean>(false);

  // Initialize default vocab on app load
  useEffect(() => {
    const initDefaultVocab = async () => {
      try {
        const count = await db.vocab.count();
        if (count === 0) {
          const now = Date.now();
          const entries = DEFAULT_VOCAB.map(v => ({
            ...v,
            createdAt: now,
            updatedAt: now,
          }));
          await db.vocab.bulkAdd(entries);
          console.log(`✅ Default vocab loaded: ${entries.length} entries`);
        }
      } catch (err) {
        console.error("Failed to load default vocab:", err);
      }
    };
    void initDefaultVocab();
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
              {showVocabPage && <TabsTrigger value="list">Vokabeln</TabsTrigger>}
              <TabsTrigger value="learn">Lernen</TabsTrigger>
              <TabsTrigger value="exam">Examen</TabsTrigger>
              <TabsTrigger value="settings">Einstellungen</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {route === "home" && <Home />}
        {route === "list" && <VocabList />}
        {route === "learn" && <Learn />}
        {route === "exam" && <Exam />}
        {route === "settings" && <Settings />}
      </div>
    </div>
  );
}