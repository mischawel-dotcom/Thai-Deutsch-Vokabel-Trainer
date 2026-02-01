import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { speak, stopSpeak } from "../features/tts";

import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Learn() {
    // Automatischer Dialog-Start für Lektion aus Home
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Session-State für lineares Durchgehen
  const [sessionActive, setSessionActive] = useState(false);
  const [lessonCards, setLessonCards] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Dialog-State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [includeViewed, setIncludeViewed] = useState(true);
  const [cardLimit, setCardLimit] = useState<string>("");

  // Lektionen-Index
  const allLessons = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of allVocab) {
      if (v.lesson !== undefined && v.lesson > 0) {
        map.set(v.lesson, (map.get(v.lesson) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([lesson, count]) => ({ lesson, count }));
  }, [allVocab]);

  async function loadAllVocab() {
    setError("");
    setStatus("Lade Vokabeln …");
    try {
      const vocab = await db.vocab.toArray();
      setAllVocab(vocab);
      setStatus(vocab.length ? `Geladen: ${vocab.length} Einträge` : "Keine Einträge vorhanden.");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  useEffect(() => {
    void loadAllVocab();
  }, []);

  useEffect(() => {
    const shouldAutoStart = localStorage.getItem("autoStartLearnDue") === "true";
    if (!shouldAutoStart) return;
    if (sessionActive) return;
    if (!allVocab.length) return;

    const rawLimit = localStorage.getItem("dailyLimit");
    const limitParsed = rawLimit ? parseInt(rawLimit, 10) : 30;
    const validLimit = !isNaN(limitParsed) && limitParsed > 0 ? limitParsed : 30;

    const rawDueCount = localStorage.getItem("autoStartLearnDueCount");
    const dueParsed = rawDueCount ? parseInt(rawDueCount, 10) : validLimit;
    const targetLimit = !isNaN(dueParsed) && dueParsed > 0 ? Math.min(dueParsed, validLimit) : validLimit;

    let cards = allVocab.filter((v) => !v.viewed);
    cards.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    cards = cards.slice(0, targetLimit);

    if (cards.length === 0) {
      setStatus("Keine ungelernten Karten verfügbar.");
    } else {
      setLessonCards(cards);
      setCurrentIndex(0);
      setSessionActive(true);
      setStatus(`Heute fällig: ${cards.length} Karte(n)`);
    }

    localStorage.removeItem("autoStartLearnDue");
    localStorage.removeItem("autoStartLearnDueCount");
  }, [allVocab, sessionActive]);

  function openLessonDialog(lesson: number) {
    const cards = allVocab.filter((v) => v.lesson === lesson);
    setSelectedLesson(lesson);
    setCardLimit(String(cards.length)); // Standard: alle Karten
    setIncludeViewed(true);
    setDialogOpen(true);
  }

  function startSession() {
    let cards = allVocab.filter((v) => v.lesson === selectedLesson);

    // Filter: nur ungesehene Karten
    if (!includeViewed) {
      cards = cards.filter((v) => !v.viewed);
    }

    // Sortieren nach ID
    cards.sort((a, b) => {
      const aId = a.id ?? 0;
      const bId = b.id ?? 0;
      return aId - bId;
    });

    // Limit anwenden
    const limit = parseInt(cardLimit, 10);
    if (!isNaN(limit) && limit > 0) {
      cards = cards.slice(0, limit);
    }

    if (cards.length === 0) {
      setStatus(`Keine Karten in Lektion ${selectedLesson} vorhanden.`);
      setDialogOpen(false);
      return;
    }

    setLessonCards(cards);
    setCurrentIndex(0);
    setSessionActive(true);
    setStatus(`Lektion ${selectedLesson}: ${cards.length} Karte(n)`);
    setDialogOpen(false);
  }

  function endSession() {
    setSessionActive(false);
    setLessonCards([]);
    setCurrentIndex(0);
    setStatus("Session beendet");
  }

  async function markCurrentAsViewed() {
    if (currentIndex < lessonCards.length) {
      const card = lessonCards[currentIndex];
      if (card.id) {
        try {
          await db.vocab.update(card.id, { viewed: true });
          setLessonCards((prev) => {
            const updated = [...prev];
            updated[currentIndex] = { ...updated[currentIndex], viewed: true };
            return updated;
          });
          setStatus(`✅ Karte ${currentIndex + 1}/${lessonCards.length} als gesehen markiert`);
        } catch (e) {
          console.error("Fehler beim Speichern:", e);
          setError("Fehler beim Speichern");
        }
      }
    }
  }

  function goNext() {
    if (currentIndex < lessonCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStatus("Ende der Lektion erreicht!");
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  const current = lessonCards[currentIndex];
  const thaiLang = "th-TH";
  const germanLang = "de-DE";

  return (
    <PageShell
      title="Lernen"
      description="Lerne Vokabeln Schritt für Schritt. Wähle eine Lektion und gehe linear durch die Karten."
    >
      {/* Status / Fehler */}
      <div className="space-y-2">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        {error ? (
          <pre className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm whitespace-pre-wrap">
            {error}
          </pre>
        ) : null}
      </div>

      {/* Lektion-Auswahl (nur wenn keine Session läuft) */}
      {!sessionActive ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground">📚 Lektion auswählen:</div>

            <div className="flex flex-wrap gap-2">
              {allLessons.length === 0 ? (
                <div className="text-sm text-muted-foreground">Keine Lektionen vorhanden.</div>
              ) : (
                allLessons.map(({ lesson, count }) => (
                  <Button
                    key={lesson}
                    onClick={() => openLessonDialog(lesson)}
                    className="h-12 px-6 text-base font-medium"
                    title={`Lektion ${lesson} starten (${count} Karten)`}
                  >
                    Lektion {lesson} <span className="text-xs opacity-75 ml-2">({count})</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* Lern-Session */}
      {sessionActive && current ? (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 w-screen h-screen flex flex-col items-center justify-center p-2 sm:p-3 m-0">
          {/* Top-Status */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>
              Karte: <b className="text-foreground">{currentIndex + 1}</b> / <b className="text-foreground">{lessonCards.length}</b>
            </span>
            <span>·</span>
            <span>
              Status: {current.viewed ? "✅ Gesehen" : "⭕ Nicht gesehen"}
            </span>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mx-auto w-full max-w-2xl mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentIndex + 1) / lessonCards.length) * 100}%` }}
                aria-label={`Fortschritt ${Math.round(((currentIndex + 1) / lessonCards.length) * 100)}%`}
              />
            </div>
          </div>

          {/* Lernkarte */}
          <Card className="mx-auto w-full max-w-xs sm:max-w-md md:max-w-2xl p-3 sm:p-6 md:p-8 shadow-lg mt-3">
            <div className="space-y-4">
              {/* Thai mit Ton */}
              <div className="space-y-2">
                <div className="text-4xl font-semibold text-center leading-tight">{current.thai}</div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void speak(current.thai, thaiLang)}
                    title="Thai Wort vorlesen"
                  >
                    🔊 Thai sprechen
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopSpeak}
                    title="Stop"
                  >
                    Stop
                  </Button>
                </div>
              </div>

              {/* Trennlinie */}
              <div className="border-t my-3" />

              {/* Lautschrift */}
              {current.transliteration ? (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground italic">{current.transliteration}</div>
                </div>
              ) : null}

              {/* Trennlinie */}
              <div className="border-t my-3" />

              {/* Deutsch mit Ton */}
              <div className="space-y-2">
                <div className="text-3xl font-semibold text-center leading-tight text-blue-600 dark:text-blue-400">{current.german}</div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void speak(current.german, germanLang)}
                    title="Deutsche Übersetzung vorlesen"
                  >
                    🔊 Deutsch sprechen
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopSpeak}
                    title="Stop"
                  >
                    Stop
                  </Button>
                </div>
              </div>

              {/* Beispiele (falls vorhanden) */}
              {current.exampleThai || current.exampleGerman ? (
                <>
                  <div className="border-t my-3" />
                  <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-2">
                    <div className="font-semibold text-muted-foreground">📝 Beispiele:</div>
                    
                    {current.exampleThai ? (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-muted-foreground">TH:</span>
                        <span>{current.exampleThai}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void speak(current.exampleThai!, thaiLang)}
                          title="Beispiel Thai vorlesen"
                        >
                          🔊
                        </Button>
                      </div>
                    ) : null}

                    {current.exampleGerman ? (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-muted-foreground">DE:</span>
                        <span>{current.exampleGerman}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void speak(current.exampleGerman!, germanLang)}
                          title="Beispiel Deutsch vorlesen"
                        >
                          🔊
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </Card>

          {/* Navigation + Aktionen */}
          <div className="space-y-2 mt-3 w-full max-w-md px-2 pb-2">
            {/* Markieren als gesehen */}
            <Button
              onClick={markCurrentAsViewed}
              size="sm"
              className="w-full h-10 text-sm font-semibold"
              variant={current.viewed ? "secondary" : "default"}
            >
              {current.viewed ? "✅ Bereits gesehen" : "Markiere als gelernt"}
            </Button>

            {/* Navigation */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                onClick={goPrev}
                disabled={currentIndex === 0}
                variant="outline"
                className="px-4"
              >
                ⬅️ Zurück
              </Button>

              <Button
                onClick={goNext}
                disabled={currentIndex === lessonCards.length - 1}
                className="px-4"
              >
                Weiter ➡️
              </Button>
            </div>

            {/* Beenden */}
            <Button
              onClick={endSession}
              variant="outline"
              className="w-full h-10 text-sm"
            >
              📚 Lektion beenden
            </Button>
          </div>

          {/* Info: Ende der Lektion */}
          {currentIndex === lessonCards.length - 1 ? (
            <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 text-center">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                🎉 Ende der Lektion erreicht!
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Leer-Zustand */}
      {!sessionActive && allLessons.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Keine Lektionen gefunden. Bitte importiere zuerst Vokabeln.</p>
        </Card>
      ) : null}

      {/* Lektions-Konfigurations-Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lektion {selectedLesson} starten</DialogTitle>
            <DialogDescription>
              Konfiguriere deine Lernsession
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Bereits gelernte Karten anzeigen */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeViewed"
                checked={includeViewed}
                onChange={(e) => setIncludeViewed(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="includeViewed" className="text-sm font-medium cursor-pointer">
                Bereits gelernte Karten anzeigen
              </label>
            </div>

            {/* Anzahl der Karten */}
            <div className="space-y-2">
              <label htmlFor="cardLimit" className="text-sm font-medium">
                Anzahl der Karten
              </label>
              <input
                type="number"
                id="cardLimit"
                value={cardLimit}
                onChange={(e) => setCardLimit(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Alle Karten"
              />
              <p className="text-xs text-muted-foreground">
                Standard: alle verfügbaren Karten der Lektion
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={startSession}>
              Starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}