import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { speak, stopSpeak } from "../features/tts";

import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Learn() {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Session-State für lineares Durchgehen
  const [sessionActive, setSessionActive] = useState(false);
  const [lessonCards, setLessonCards] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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

  function startSession(lesson: number) {
    const cards = allVocab.filter((v) => v.lesson === lesson).sort((a, b) => {
      const aId = a.id ?? 0;
      const bId = b.id ?? 0;
      return aId - bId;
    });

    if (cards.length === 0) {
      setStatus(`Keine Karten in Lektion ${lesson} vorhanden.`);
      return;
    }

    setLessonCards(cards);
    setCurrentIndex(0);
    setSessionActive(true);
    setStatus(`Lektion ${lesson}: ${cards.length} Karte(n)`);
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
                    onClick={() => startSession(lesson)}
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
        <div className="space-y-4">
          {/* Top-Status */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>
              Karte: <b className="text-foreground">{currentIndex + 1}</b> / <b className="text-foreground">{lessonCards.length}</b>
            </span>
            <span>·</span>
            <span>
              Status: {current.viewed ? "✅ Gesehen" : "⭕ Nicht gesehen"}
            </span>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentIndex + 1) / lessonCards.length) * 100}%` }}
                aria-label={`Fortschritt ${Math.round(((currentIndex + 1) / lessonCards.length) * 100)}%`}
              />
            </div>
          </div>

          {/* Lernkarte */}
          <Card className="mx-auto max-w-2xl p-10 shadow-lg">
            <div className="space-y-6">
              {/* Thai mit Ton */}
              <div className="space-y-3">
                <div className="text-5xl font-semibold text-center leading-tight">{current.thai}</div>
                
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
              <div className="border-t my-4" />

              {/* Lautschrift */}
              {current.transliteration ? (
                <div className="text-center">
                  <div className="text-base text-muted-foreground italic">{current.transliteration}</div>
                </div>
              ) : null}

              {/* Trennlinie */}
              <div className="border-t my-4" />

              {/* Deutsch mit Ton */}
              <div className="space-y-3">
                <div className="text-4xl font-semibold text-center leading-tight text-blue-600 dark:text-blue-400">{current.german}</div>
                
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
                  <div className="border-t my-4" />
                  <div className="rounded-md border bg-muted/30 p-4 text-sm space-y-2">
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
          <div className="space-y-3">
            {/* Markieren als gesehen */}
            <Button
              onClick={markCurrentAsViewed}
              size="lg"
              className="w-full h-12 text-base font-semibold"
              variant={current.viewed ? "secondary" : "default"}
            >
              {current.viewed ? "✅ Bereits gesehen" : "Markiere als gesehen"}
            </Button>

            {/* Navigation */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={goPrev}
                disabled={currentIndex === 0}
                variant="outline"
                className="px-6"
              >
                ⬅️ Zurück
              </Button>

              <Button
                onClick={goNext}
                disabled={currentIndex === lessonCards.length - 1}
                className="px-6"
              >
                Weiter ➡️
              </Button>
            </div>

            {/* Beenden */}
            <Button
              onClick={endSession}
              variant="outline"
              className="w-full"
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
    </PageShell>
  );
}