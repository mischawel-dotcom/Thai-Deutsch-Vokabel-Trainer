import { useEffect, useState } from "react";

import Home from "./pages/Home";
import VocabList from "./pages/VocabList";
import Learn from "./pages/Learn";
import ImportExport from "./pages/ImportExport";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type Route = "home" | "list" | "learn" | "io";

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
              <TabsTrigger value="list">Vokabeln</TabsTrigger>
              <TabsTrigger value="learn">Lernen</TabsTrigger>
              <TabsTrigger value="io">Import / Export</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {route === "home" && <Home />}
        {route === "list" && <VocabList />}
        {route === "learn" && <Learn />}
        {route === "io" && <ImportExport />}
      </div>
    </div>
  );
}