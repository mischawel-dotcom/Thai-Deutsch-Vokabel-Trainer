import { useEffect, useMemo, useState, useReducer } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { speak } from "../features/tts";
import { isLearnSessionData, type LearnSessionData } from "../lib/sessionTypes";
import { usePersistedSession } from "../hooks/usePersistedSession";

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

// Session-State für Learn
type SessionState = {
  sessionActive: boolean;
  lessonCards: VocabEntry[];
  currentIndex: number;
};

type SessionAction =
  | { type: "SET"; payload: { lessonCards: VocabEntry[]; currentIndex?: number } }
  | { type: "NEXT_CARD" }
  | { type: "PREV_CARD" }
  | { type: "END_SESSION" }
  | { type: "UPDATE_CARD"; payload: VocabEntry }
  | { type: "UPDATE_CURRENT_VIEWED"; payload: boolean };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET":
      const safeIndex = Math.min(
        Math.max(action.payload.currentIndex ?? 0, 0),
        Math.max(action.payload.lessonCards.length - 1, 0)
      );
      return {
        sessionActive: true,
        lessonCards: action.payload.lessonCards,
        currentIndex: safeIndex,
      };
    case "NEXT_CARD":
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.lessonCards.length - 1),
      };
    case "PREV_CARD":
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    case "END_SESSION":
      return {
        sessionActive: false,
        lessonCards: [],
        currentIndex: 0,
      };
    case "UPDATE_CARD":
      return {
        ...state,
        lessonCards: state.lessonCards.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "UPDATE_CURRENT_VIEWED":
      return {
        ...state,
        lessonCards: state.lessonCards.map((c, idx) =>
          idx === state.currentIndex ? { ...c, viewed: action.payload } : c
        ),
      };
    default:
      return state;
  }
}

export default function Learn() {
  // Session-State mit useReducer
  const [sessionState, dispatchSession] = useReducer(sessionReducer, {
    sessionActive: false,
    lessonCards: [],
    currentIndex: 0,
  });

  // UI-State
  const [allLessons, setAllLessons] = useState<
    Array<{ lesson: number; count: number; learnedCount: number }>
  >([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Dialog-State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [includeViewed, setIncludeViewed] = useState(true);
  const [cardLimit, setCardLimit] = useState<string>("");

  // Lesson Cache für bereits geladene Lektionen
  const lessonCacheRef = useMemo(() => new Map<number, VocabEntry[]>(), []);
  const {
    hydrated: learnSessionHydrated,
    savePersistedSession: saveLearnSession,
    clearPersistedSession: clearLearnSession,
  } = usePersistedSession<LearnSessionData>({
    key: "learnSession",
    isValid: isLearnSessionData,
  });

  async function loadLessonMetadata() {
    setError("");
    try {
      // Nur Metadaten: alle Vokabeln zählen ohne Inhalte zu laden
      const count = await db.vocab.count();
      if (count === 0) {
        setStatus("Keine Einträge vorhanden.");
        setAllLessons([]);
        return;
      }

      // Count + learnedCount pro Lektion
      const lessonsMap = new Map<number, { count: number; learnedCount: number }>();
      await db.vocab.each((v) => {
        if (v.lesson !== undefined && v.lesson > 0) {
          const current = lessonsMap.get(v.lesson) ?? { count: 0, learnedCount: 0 };
          current.count += 1;
          if (v.viewed) current.learnedCount += 1;
          lessonsMap.set(v.lesson, current);
        }
      });

      const lessons = Array.from(lessonsMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([lesson, stats]) => ({
          lesson,
          count: stats.count,
          learnedCount: stats.learnedCount,
        }));

      setAllLessons(lessons);
      if (!lessons.length) {
        setStatus("Keine Lektionen vorhanden.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  async function loadLesson(lessonNum: number): Promise<VocabEntry[]> {
    // Check cache first
    if (lessonCacheRef.has(lessonNum)) {
      return lessonCacheRef.get(lessonNum) ?? [];
    }

    try {
      const cards = await db.vocab.where("lesson").equals(lessonNum).toArray();
      lessonCacheRef.set(lessonNum, cards);
      return cards;
    } catch (e) {
      console.error(`Fehler beim Laden von Lektion ${lessonNum}:`, e);
      return [];
    }
  }

  useEffect(() => {
    void loadLessonMetadata();
  }, []);

  // On Learn page entry we reset any persisted in-page card session.
  // This keeps navigation deterministic: opening "Lernen" shows the overview.
  useEffect(() => {
    if (!learnSessionHydrated) return;
    clearLearnSession();
  }, [learnSessionHydrated, clearLearnSession]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("learnSessionVisibilityChanged", {
        detail: { active: sessionState.sessionActive },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("learnSessionVisibilityChanged", {
          detail: { active: false },
        })
      );
    };
  }, [sessionState.sessionActive]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (!learnSessionHydrated) return;

    if (sessionState.sessionActive && sessionState.lessonCards.length > 0) {
      const sessionData = {
        sessionActive: sessionState.sessionActive,
        lessonCards: sessionState.lessonCards,
        currentIndex: sessionState.currentIndex,
      };
      saveLearnSession(sessionData);
    } else {
      clearLearnSession();
    }
  }, [learnSessionHydrated, sessionState, saveLearnSession, clearLearnSession]);

  useEffect(() => {
    const shouldAutoStart = localStorage.getItem("autoStartLearnDue") === "true";
    if (!shouldAutoStart) return;
    if (sessionState.sessionActive) return;

    const rawLimit = localStorage.getItem("dailyLimit");
    const limitParsed = rawLimit ? parseInt(rawLimit, 10) : 30;
    const validLimit = !isNaN(limitParsed) && limitParsed > 0 ? limitParsed : 30;

    const rawDueCount = localStorage.getItem("autoStartLearnDueCount");
    const dueParsed = rawDueCount ? parseInt(rawDueCount, 10) : validLimit;
    const targetLimit = !isNaN(dueParsed) && dueParsed > 0 ? Math.min(dueParsed, validLimit) : validLimit;

    // Load due cards on-demand
    (async () => {
      try {
        const dueProgress = await db.progress
          .where("dueAt")
          .belowOrEqual(Date.now())
          .toArray();
        dueProgress.sort((a, b) => {
          if (a.dueAt !== b.dueAt) return a.dueAt - b.dueAt;
          return a.entryId - b.entryId;
        });

        const dueIds = dueProgress
          .map((p) => p.entryId)
          .filter((id): id is number => typeof id === "number");

        let cards = (await db.vocab.bulkGet(dueIds)).filter(
          (v): v is VocabEntry => v !== undefined
        );
        cards = cards.slice(0, targetLimit);

        if (cards.length === 0) {
          setStatus("Keine fälligen Karten verfügbar.");
        } else {
          dispatchSession({
            type: "SET",
            payload: { lessonCards: cards },
          });
          setStatus(`Heute fällig: ${cards.length} Karte(n)`);
        }
      } catch (e) {
        console.error("Fehler beim Laden der fälligen Karten:", e);
        setError("Fehler beim Laden der fälligen Karten");
      }
    })();

    localStorage.removeItem("autoStartLearnDue");
    localStorage.removeItem("autoStartLearnDueCount");
  }, [sessionState.sessionActive]);

  // Auto-start from Home lesson cards
  useEffect(() => {
    const raw = localStorage.getItem("selectedLessonForLearn");
    if (!raw) return;
    if (sessionState.sessionActive) return;
    if (!allLessons.length) return;

    const lessonNum = parseInt(raw, 10);
    if (isNaN(lessonNum) || lessonNum <= 0) {
      localStorage.removeItem("selectedLessonForLearn");
      return;
    }

    (async () => {
      try {
        let cards = await loadLesson(lessonNum);
        cards = cards
          .filter((v) => !v.viewed)
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

        if (cards.length > 0) {
          dispatchSession({
            type: "SET",
            payload: { lessonCards: cards },
          });
          setStatus(`Lektion ${lessonNum}: ${cards.length} ungelernte Karte(n)`);
        } else {
          setStatus(`Lektion ${lessonNum}: keine ungelernten Karten verfügbar`);
        }
      } catch (e) {
        console.error("Fehler beim Start aus Home-Lektion:", e);
        setError("Fehler beim Start der Lektion");
      } finally {
        localStorage.removeItem("selectedLessonForLearn");
      }
    })();
  }, [allLessons, sessionState.sessionActive]);

  function openLessonDialog(lesson: number) {
    setSelectedLesson(lesson);
    setCardLimit(""); // Leer = alle verfuegbaren Karten der Lektion
    setIncludeViewed(true);
    setDialogOpen(true);
  }

  async function startSession() {
    try {
      // Load lesson on-demand
      let cards = await loadLesson(selectedLesson);

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

      dispatchSession({
        type: "SET",
        payload: { lessonCards: cards },
      });
      setStatus(`Lektion ${selectedLesson}: ${cards.length} Karte(n)`);
      setDialogOpen(false);
    } catch (e) {
      console.error("Fehler beim Starten der Session:", e);
      setError("Fehler beim Starten der Session");
    }
  }

  function endSession() {
    dispatchSession({ type: "END_SESSION" });
    setStatus("Session beendet");
  }

  async function markCurrentAsViewed() {
    if (sessionState.currentIndex < sessionState.lessonCards.length) {
      const card = sessionState.lessonCards[sessionState.currentIndex];
      if (card.id != null) {
        try {
          // Learn.tsx: Nur viewed toggeln. Keine SRS/dueAt Änderungen!
          const newViewedState = !card.viewed;
          await db.vocab.update(card.id, { viewed: newViewedState });

          dispatchSession({
            type: "UPDATE_CURRENT_VIEWED",
            payload: newViewedState,
          });

          // Update lesson metadata counters in-place for immediate UI feedback.
          if (typeof card.lesson === "number" && card.lesson > 0) {
            setAllLessons((prev) =>
              prev.map((lessonMeta) => {
                if (lessonMeta.lesson !== card.lesson) return lessonMeta;
                const safeLearnedCount = Number.isFinite(lessonMeta.learnedCount)
                  ? lessonMeta.learnedCount
                  : 0;
                const nextLearnedCount = newViewedState
                  ? Math.min(lessonMeta.count, safeLearnedCount + 1)
                  : Math.max(0, safeLearnedCount - 1);
                return { ...lessonMeta, learnedCount: nextLearnedCount };
              })
            );
          }

          const statusMsg = newViewedState
            ? `✅ Karte ${sessionState.currentIndex + 1}/${sessionState.lessonCards.length} als gelernt markiert`
            : `↩️ Karte ${sessionState.currentIndex + 1}/${sessionState.lessonCards.length} als ungelernt markiert`;
          setStatus(statusMsg);
        } catch (e) {
          console.error("Fehler beim Speichern:", e);
          setError("Fehler beim Speichern");
        }
      }
    }
  }

  function goNext() {
    if (sessionState.currentIndex < sessionState.lessonCards.length - 1) {
      dispatchSession({ type: "NEXT_CARD" });
    } else {
      setStatus("Ende der Lektion erreicht!");
    }
  }

  function goPrev() {
    if (sessionState.currentIndex > 0) {
      dispatchSession({ type: "PREV_CARD" });
    }
  }

  const current = sessionState.lessonCards[sessionState.currentIndex];
  const selectedLessonMeta = allLessons.find((l) => l.lesson === selectedLesson);
  const selectedLessonLearnedCount = selectedLessonMeta?.learnedCount ?? 0;
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
      {!sessionState.sessionActive ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground">📚 Lektion auswählen:</div>

            <div className="flex flex-wrap gap-2">
              {allLessons.length === 0 ? (
                <div className="text-sm text-muted-foreground">Keine Lektionen vorhanden.</div>
              ) : (
                allLessons.map(({ lesson, count, learnedCount = 0 }) => (
                  <Button
                    key={lesson}
                    onClick={() => openLessonDialog(lesson)}
                    className="h-12 px-6 text-base font-medium"
                    title={`Lektion ${lesson} starten (${learnedCount}/${count} gelernt)`}
                  >
                    Lektion {lesson}{" "}
                    <span className="text-xs opacity-75 ml-2">
                      ({learnedCount}/{count})
                    </span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* Lern-Session */}
      {sessionState.sessionActive && current ? (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 w-screen h-screen flex flex-col items-center justify-start p-2 sm:p-3 pb-36 m-0 overflow-hidden">
          <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
            <Button
              onClick={endSession}
              variant="outline"
              size="sm"
              className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Lektion beenden
            </Button>
          </div>
          {/* Top-Status */}
          <div className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 pr-28 text-xs text-muted-foreground">
            <span>
              Karte: <b className="text-foreground">{sessionState.currentIndex + 1}</b> / <b className="text-foreground">{sessionState.lessonCards.length}</b>
            </span>
            <span>·</span>
            <span>
              Status: {current.viewed ? "✅ Gesehen" : "⭕ Nicht gesehen"}
            </span>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mx-auto w-full max-w-2xl mt-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((sessionState.currentIndex + 1) / sessionState.lessonCards.length) * 100}%` }}
                aria-label={`Fortschritt ${Math.round(((sessionState.currentIndex + 1) / sessionState.lessonCards.length) * 100)}%`}
              />
            </div>
          </div>

          {/* Lernkarte */}
          <Card className="mx-auto w-full max-w-xs sm:max-w-md md:max-w-2xl p-3 sm:p-6 md:p-8 shadow-lg mt-2 max-h-[calc(100vh-17rem)] overflow-y-auto">
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
                    className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-slate-400 hover:bg-slate-500 text-white"
                  >
                    🔊 Thai sprechen
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
                    className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-slate-400 hover:bg-slate-500 text-white"
                  >
                    🔊 Deutsch sprechen
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
          <div className="fixed inset-x-0 bottom-0 z-10 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
            <div className="mx-auto w-full max-w-md rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur">
              <div className="space-y-2">
                {/* Markieren als gesehen */}
                <Button
                  onClick={markCurrentAsViewed}
                  size="sm"
                  className={`w-full h-10 text-sm font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150 rounded-lg ${
                    current.viewed
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {current.viewed ? "↩️ Markiere als ungelernt" : "✅ Markiere als gelernt"}
                </Button>

                {/* Navigation */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={goPrev}
                    disabled={sessionState.currentIndex === 0}
                    variant="outline"
                    className="px-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:shadow-none"
                  >
                    ⬅️ Zurück
                  </Button>

                  <Button
                    onClick={goNext}
                    disabled={sessionState.currentIndex === sessionState.lessonCards.length - 1}
                    className="px-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:shadow-none"
                  >
                    Weiter ➡️
                  </Button>
                </div>

              </div>
            </div>
          </div>

          {/* Info: Ende der Lektion */}
          {sessionState.currentIndex === sessionState.lessonCards.length - 1 ? (
            <div className="mt-2 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 text-center">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                🎉 Ende der Lektion erreicht!
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Leer-Zustand */}
      {!sessionState.sessionActive && allLessons.length === 0 ? (
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
                Bereits gelernte Karten anzeigen ({selectedLessonLearnedCount})
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
              Abbrechen
            </Button>
            <Button onClick={() => void startSession()} className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              Starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}