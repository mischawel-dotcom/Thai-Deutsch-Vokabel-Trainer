import { useEffect, useMemo, useState, useReducer } from "react";
import { db } from "../db/db";
import type { NumberEntry, VocabEntry } from "../db/db";
import { speak } from "../features/tts";
import { isLearnSessionData, type LearnSessionData } from "../lib/sessionTypes";
import { usePersistedSession } from "../hooks/usePersistedSession";
import { useLearnLessonFlow } from "../hooks/useLearnLessonFlow";

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

type LearnCard = VocabEntry & {
  sourceType?: "vocab" | "numbers" | "numbers_info";
  infoRows?: Array<{ arabic: string; thaiDigit: string; thaiWord: string; transliteration: string }>;
  infoNotes?: string[];
};

// Session-State für Learn
type SessionState = {
  sessionActive: boolean;
  lessonCards: LearnCard[];
  currentIndex: number;
};

type SessionAction =
  | { type: "SET"; payload: { lessonCards: LearnCard[]; currentIndex?: number } }
  | { type: "NEXT_CARD" }
  | { type: "PREV_CARD" }
  | { type: "END_SESSION" }
  | { type: "UPDATE_CARD"; payload: LearnCard }
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
  const NUMBER_INFO_CARDS: LearnCard[] = useMemo(
    () => [
      {
        id: 9_000_000_001,
        thai: "Grundlagen Thai-Zahlen: 0-9",
        german: "Die Ziffern und Grundwörter",
        transliteration: "Grundformen",
        lesson: 0,
        tags: ["Numbers", "Info"],
        viewed: true,
        createdAt: 0,
        updatedAt: 0,
        sourceType: "numbers_info",
        infoRows: [
          { arabic: "0", thaiDigit: "๐", thaiWord: "ศูนย์", transliteration: "suun" },
          { arabic: "1", thaiDigit: "๑", thaiWord: "หนึ่ง", transliteration: "nüng" },
          { arabic: "2", thaiDigit: "๒", thaiWord: "สอง", transliteration: "song" },
          { arabic: "3", thaiDigit: "๓", thaiWord: "สาม", transliteration: "sam" },
          { arabic: "4", thaiDigit: "๔", thaiWord: "สี่", transliteration: "sii" },
          { arabic: "5", thaiDigit: "๕", thaiWord: "ห้า", transliteration: "haa" },
          { arabic: "6", thaiDigit: "๖", thaiWord: "หก", transliteration: "hok" },
          { arabic: "7", thaiDigit: "๗", thaiWord: "เจ็ด", transliteration: "chet" },
          { arabic: "8", thaiDigit: "๘", thaiWord: "แปด", transliteration: "päät" },
          { arabic: "9", thaiDigit: "๙", thaiWord: "เก้า", transliteration: "gao" },
        ],
      },
      {
        id: 9_000_000_002,
        thai: "Zehnerpotenzen",
        german: "10, 100, 1000, 10000, 100000, 1000000",
        transliteration: "Bauwoerter",
        lesson: 0,
        tags: ["Numbers", "Info"],
        viewed: true,
        createdAt: 0,
        updatedAt: 0,
        sourceType: "numbers_info",
        infoRows: [
          { arabic: "10", thaiDigit: "๑๐", thaiWord: "สิบ", transliteration: "sip" },
          { arabic: "100", thaiDigit: "๑๐๐", thaiWord: "ร้อย", transliteration: "roi" },
          { arabic: "1000", thaiDigit: "๑๐๐๐", thaiWord: "พัน", transliteration: "pan" },
          { arabic: "10000", thaiDigit: "๑๐๐๐๐", thaiWord: "หมื่น", transliteration: "müün" },
          { arabic: "100000", thaiDigit: "๑๐๐๐๐๐", thaiWord: "แสน", transliteration: "sään" },
          { arabic: "1000000", thaiDigit: "๑๐๐๐๐๐๐", thaiWord: "ล้าน", transliteration: "lan" },
        ],
      },
      {
        id: 9_000_000_003,
        thai: "Wie Zahlen zusammengesetzt werden",
        german: "Beispiele aus 0-9 + Bauwoertern",
        transliteration: "Muster",
        lesson: 0,
        tags: ["Numbers", "Info"],
        viewed: true,
        createdAt: 0,
        updatedAt: 0,
        sourceType: "numbers_info",
        infoRows: [
          { arabic: "25", thaiDigit: "๒๕", thaiWord: "ยี่สิบห้า", transliteration: "ji-sip-haa" },
          { arabic: "108", thaiDigit: "๑๐๘", thaiWord: "หนึ่งร้อยแปด", transliteration: "nüng-roi-päät" },
          { arabic: "321", thaiDigit: "๓๒๑", thaiWord: "สามร้อยยี่สิบเอ็ด", transliteration: "sam-roi-ji-sip-et" },
          { arabic: "4 502", thaiDigit: "๔๕๐๒", thaiWord: "สี่พันห้าร้อยสอง", transliteration: "sii-pan-haa-roi-song" },
          { arabic: "78 900", thaiDigit: "๗๘๙๐๐", thaiWord: "เจ็ดหมื่นแปดพันเก้าร้อย", transliteration: "chet-müün-päät-pan-gao-roi" },
        ],
      },
      {
        id: 9_000_000_004,
        thai: "Wichtige Besonderheiten",
        german: "Ausnahmen, die du frueh kennen solltest",
        transliteration: "Tipps",
        lesson: 0,
        tags: ["Numbers", "Info"],
        viewed: true,
        createdAt: 0,
        updatedAt: 0,
        sourceType: "numbers_info",
        infoNotes: [
          "11 ist สิบเอ็ด (sip-et), nicht sip-nüng.",
          "21 ist ยี่สิบเอ็ด (ji-sip-et). In der Einerstelle oft เอด/et statt nüng.",
          "20 beginnt mit ยี่สิบ (ji-sip), nicht song-sip.",
          "Bei 101, 1001 usw. bleibt die letzte 1 haeufig หนึ่ง (nüng), z. B. หนึ่งร้อยหนึ่ง.",
          "Million = ล้าน (lan). Darueber beginnt Thai die Struktur erneut in Millionenbloecken.",
        ],
      },
    ],
    []
  );
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
  const [numbersMeta, setNumbersMeta] = useState<{ count: number; learnedCount: number }>({
    count: 0,
    learnedCount: 0,
  });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Dialog-State
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [numbersDialogOpen, setNumbersDialogOpen] = useState(false);
  const [numbersIncludeViewed, setNumbersIncludeViewed] = useState(false);
  const [numbersCardLimit, setNumbersCardLimit] = useState<string>("");

  // Lesson Cache für bereits geladene Lektionen
  const lessonCacheRef = useMemo(() => new Map<number, LearnCard[]>(), []);
  const numbersCacheRef = useMemo(() => ({ cards: null as LearnCard[] | null }), []);
  const {
    hydrated: learnSessionHydrated,
    savePersistedSession: saveLearnSession,
    clearPersistedSession: clearLearnSession,
  } = usePersistedSession<LearnSessionData>({
    key: "learnSession",
    isValid: isLearnSessionData,
  });

  function mapNumberEntryToLearnCard(entry: NumberEntry): LearnCard {
    return {
      id: entry.id,
      thai: `${entry.thaiWord} (${entry.thaiDigit})`,
      german: `${entry.german} (${entry.arabic})`,
      transliteration: entry.transliteration,
      lesson: entry.lesson,
      tags: entry.tags,
      viewed: entry.viewed,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      sourceType: "numbers",
    };
  }

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
      const numbers = await db.numbersVocab.toArray();
      const numbersCount = numbers.length;
      const numbersLearnedCount = numbers.filter((n) => n.viewed).length;
      setNumbersMeta({ count: numbersCount, learnedCount: numbersLearnedCount });
      if (!lessons.length) {
        setStatus(numbersCount > 0 ? "" : "Keine Lektionen vorhanden.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  async function loadLesson(lessonNum: number): Promise<LearnCard[]> {
    // Check cache first
    if (lessonCacheRef.has(lessonNum)) {
      return lessonCacheRef.get(lessonNum) ?? [];
    }

    try {
      const cards = (await db.vocab.where("lesson").equals(lessonNum).toArray()).map((card) => ({
        ...card,
        sourceType: "vocab" as const,
      }));
      lessonCacheRef.set(lessonNum, cards);
      return cards;
    } catch (e) {
      console.error(`Fehler beim Laden von Lektion ${lessonNum}:`, e);
      return [];
    }
  }

  async function loadNumbersCards(): Promise<LearnCard[]> {
    if (numbersCacheRef.cards) return numbersCacheRef.cards;
    try {
      const cards = (await db.numbersVocab.orderBy("arabic").toArray()).map(mapNumberEntryToLearnCard);
      numbersCacheRef.cards = cards;
      return cards;
    } catch (e) {
      console.error("Fehler beim Laden der Zahlenlektion:", e);
      return [];
    }
  }

  useEffect(() => {
    void loadLessonMetadata();
  }, []);

  useEffect(() => {
    const shouldOpenNumbers = localStorage.getItem("openNumbersLessonDialog") === "true";
    if (!shouldOpenNumbers) return;
    if (sessionState.sessionActive) return;
    if (numbersMeta.count <= 0) return;
    openNumbersDialog();
    localStorage.removeItem("openNumbersLessonDialog");
  }, [numbersMeta.count, sessionState.sessionActive]);

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
    const limitParsed = rawLimit ? parseInt(rawLimit, 10) : 10;
    const validLimit = !isNaN(limitParsed) && limitParsed > 0 ? limitParsed : 10;

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

  function openNumbersDialog() {
    const rawDailyLimit = localStorage.getItem("dailyLimit");
    const parsedDailyLimit = rawDailyLimit ? parseInt(rawDailyLimit, 10) : 10;
    const validDailyLimit = !isNaN(parsedDailyLimit) && parsedDailyLimit > 0 ? parsedDailyLimit : 10;
    setNumbersIncludeViewed(false);
    setNumbersCardLimit(String(validDailyLimit));
    setNumbersDialogOpen(true);
  }

  async function startNumbersSession() {
    try {
      let cards = await loadNumbersCards();
      if (!numbersIncludeViewed) {
        cards = cards.filter((v) => !v.viewed);
      }
      cards.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      const limit = parseInt(numbersCardLimit, 10);
      if (!isNaN(limit) && limit > 0) {
        cards = cards.slice(0, limit);
      }

      if (cards.length === 0) {
        setStatus("Keine Karten in der Zahlenlektion vorhanden.");
        setNumbersDialogOpen(false);
        return;
      }

      dispatchSession({
        type: "SET",
        payload: { lessonCards: cards },
      });
      setStatus(`Zahlenlektion: ${cards.length} Karte(n)`);
      setNumbersDialogOpen(false);
    } catch (e) {
      console.error("Fehler beim Starten der Zahlenlektion:", e);
      setError("Fehler beim Starten der Zahlenlektion");
    }
  }

  function startNumbersBasicsSession() {
    dispatchSession({
      type: "SET",
      payload: { lessonCards: NUMBER_INFO_CARDS },
    });
    setStatus("Grundlagen Thai-Zahlen gestartet (4 Infokarten).");
  }

  const {
    dialogOpen,
    setDialogOpen,
    selectedLesson,
    includeViewed,
    setIncludeViewed,
    cardLimit,
    setCardLimit,
    openLessonDialog,
    startSession,
  } = useLearnLessonFlow({
    loadLesson,
    onStartSession: (cards) => {
      dispatchSession({
        type: "SET",
        payload: { lessonCards: cards },
      });
    },
    onStatus: setStatus,
    onError: setError,
  });

  function endSession() {
    dispatchSession({ type: "END_SESSION" });
    setStatus("Session beendet");
    setConfirmEndOpen(false);
  }

  function requestEndSession() {
    setConfirmEndOpen(true);
  }

  async function markCurrentAsViewed() {
    if (sessionState.currentIndex < sessionState.lessonCards.length) {
      const card = sessionState.lessonCards[sessionState.currentIndex];
      if (card.sourceType === "numbers_info") {
        setStatus("Infokarten haben keinen Lernstatus.");
        return;
      }
      if (card.id != null) {
        try {
          // Learn.tsx: Nur viewed toggeln. Keine SRS/dueAt Änderungen!
          const newViewedState = !card.viewed;
          if (card.sourceType === "numbers") {
            await db.numbersVocab.update(card.id, { viewed: newViewedState });
          } else {
            await db.vocab.update(card.id, { viewed: newViewedState });
          }

          dispatchSession({
            type: "UPDATE_CURRENT_VIEWED",
            payload: newViewedState,
          });

          // Update lesson metadata counters in-place for immediate UI feedback.
          if (card.sourceType === "numbers") {
            setNumbersMeta((prev) => {
              const nextLearnedCount = newViewedState
                ? Math.min(prev.count, prev.learnedCount + 1)
                : Math.max(0, prev.learnedCount - 1);
              return { ...prev, learnedCount: nextLearnedCount };
            });
          } else if (typeof card.lesson === "number" && card.lesson > 0) {
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
  const getSpeakableText = (text: string, sourceType?: "vocab" | "numbers" | "numbers_info") => {
    if (sourceType !== "numbers" && sourceType !== "numbers_info") return text;
    return text.replace(/\s*\([^)]*\)\s*$/, "").trim();
  };

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
              {allLessons.length === 0 && numbersMeta.count === 0 ? (
                <div className="text-sm text-muted-foreground">Keine Lektionen vorhanden.</div>
              ) : (
                <>
                  {allLessons.map(({ lesson, count, learnedCount = 0 }) => (
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
                  ))}
                  {numbersMeta.count > 0 ? (
                    <>
                      <Button
                        onClick={startNumbersBasicsSession}
                        className="h-12 px-6 text-base font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-100 dark:hover:bg-indigo-900/70"
                        title="Grundlagen Thai-Zahlen als Infokarten starten"
                      >
                        📘 Grundlagen Thai-Zahlen
                      </Button>
                      <Button
                        onClick={openNumbersDialog}
                        className="h-12 px-6 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                        title={`Zahlenlektion starten (${numbersMeta.learnedCount}/${numbersMeta.count} gelernt)`}
                      >
                        🔢 Zahlenlektion{" "}
                        <span className="text-xs opacity-90 ml-2">
                          ({numbersMeta.learnedCount}/{numbersMeta.count})
                        </span>
                      </Button>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* Lern-Session */}
      {sessionState.sessionActive && current ? (
        <div className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+8.5rem)] pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-end">
              <Button
                onClick={requestEndSession}
                variant="outline"
                size="sm"
                className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Lektion beenden
              </Button>
            </div>
          </div>
          {/* Top-Status */}
          <div className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted/70 px-2 py-1">
              Karte: <b className="text-foreground">{sessionState.currentIndex + 1}</b> / <b className="text-foreground">{sessionState.lessonCards.length}</b>
            </span>
            <span className="rounded-full bg-muted/70 px-2 py-1">
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
          <Card className="mx-auto mt-2 flex w-full min-h-0 max-w-xs flex-1 flex-col overflow-y-auto p-3 shadow-lg sm:max-w-md sm:p-6 md:max-w-2xl md:p-8">
            <div className="w-full space-y-4">
              {/* Infokarte Grundlagen Thai-Zahlen */}
              {current.sourceType === "numbers_info" ? (
                <div className="space-y-4">
                  <div className="text-2xl sm:text-3xl font-semibold text-center leading-snug">{current.thai}</div>
                  <div className="text-center text-sm text-muted-foreground">{current.german}</div>
                  {current.infoRows?.length ? (
                    <div className="rounded-md border bg-muted/20 p-2 sm:p-3">
                      {current.id === 9_000_000_003 ? (
                        <div className="space-y-2">
                          {current.infoRows.map((row) => (
                            <div
                              key={`${current.id}-${row.arabic}-${row.thaiDigit}`}
                              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-start gap-2 rounded-md border bg-background px-2 py-2"
                            >
                              <div className="space-y-1 text-[11px] font-semibold text-muted-foreground">
                                <div>#</div>
                                <div>TH</div>
                                <div>Thai Wort</div>
                              </div>
                              <div className="min-w-0 space-y-1">
                                <div className="text-sm font-semibold leading-tight break-all">{row.arabic}</div>
                                <div className="text-sm font-semibold leading-tight break-all">{row.thaiDigit}</div>
                                <div className="text-sm leading-snug break-words">{row.thaiWord}</div>
                                <div className="text-xs text-muted-foreground italic leading-snug break-words">
                                  {row.transliteration}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => void speak(row.thaiWord, thaiLang)}
                                title={`Thai sprechen: ${row.thaiWord}`}
                              >
                                🔊
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-[minmax(52px,80px)_minmax(52px,86px)_minmax(0,1fr)_auto] gap-2 text-xs font-semibold text-muted-foreground px-1 pb-2">
                            <div>#</div>
                            <div>TH</div>
                            <div>Thai Wort</div>
                            <div>Audio</div>
                          </div>
                          <div className="space-y-1">
                            {current.infoRows.map((row) => (
                              <div
                                key={`${current.id}-${row.arabic}-${row.thaiDigit}`}
                                className="grid grid-cols-[minmax(52px,80px)_minmax(52px,86px)_minmax(0,1fr)_auto] items-start gap-2 rounded-md border bg-background px-2 py-1.5"
                              >
                                <div className="text-xs sm:text-sm font-semibold leading-tight break-all">{row.arabic}</div>
                                <div className="text-sm sm:text-base font-semibold leading-tight break-all">{row.thaiDigit}</div>
                                <div className="min-w-0">
                                  <div className="text-sm leading-snug break-words">{row.thaiWord}</div>
                                  <div className="text-xs text-muted-foreground italic leading-snug break-words">{row.transliteration}</div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => void speak(row.thaiWord, thaiLang)}
                                  title={`Thai sprechen: ${row.thaiWord}`}
                                >
                                  🔊
                                </Button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                  {current.infoNotes?.length ? (
                    <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                      {current.infoNotes.map((note, idx) => (
                        <p key={`${current.id}-note-${idx}`} className="text-sm leading-relaxed">
                          {note}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {/* Standard-Lernkarte */}
              {current.sourceType !== "numbers_info" ? (
                <>
                  {/* Thai mit Ton */}
                  <div className="space-y-2">
                    <div className="text-3xl sm:text-4xl font-semibold text-center leading-snug">{current.thai}</div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void speak(getSpeakableText(current.thai, current.sourceType), thaiLang)}
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
                    <div className="text-2xl sm:text-3xl font-semibold text-center leading-snug text-blue-600 dark:text-blue-400">{current.german}</div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void speak(getSpeakableText(current.german, current.sourceType), germanLang)}
                        title="Deutsche Übersetzung vorlesen"
                        className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-slate-400 hover:bg-slate-500 text-white"
                      >
                        🔊 Deutsch sprechen
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Beispiele (falls vorhanden) */}
              {current.sourceType !== "numbers_info" && (current.exampleThai || current.exampleGerman) ? (
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
            <div className="mx-auto w-full max-w-2xl rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur">
              <div className="space-y-2">
                {/* Markieren als gesehen */}
                {current.sourceType !== "numbers_info" ? (
                  <Button
                    onClick={markCurrentAsViewed}
                    size="sm"
                    className={`w-full h-11 text-sm font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150 rounded-lg ${
                      current.viewed
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {current.viewed ? "↩️ Markiere als ungelernt" : "✅ Markiere als gelernt"}
                  </Button>
                ) : null}

                {/* Navigation */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={goPrev}
                    disabled={sessionState.currentIndex === 0}
                    variant="outline"
                    className="h-11 px-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:shadow-none"
                  >
                    ⬅️ Zurück
                  </Button>

                  <Button
                    onClick={goNext}
                    disabled={sessionState.currentIndex === sessionState.lessonCards.length - 1}
                    className="h-11 px-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:shadow-none"
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
          <p className="text-muted-foreground">
            {numbersMeta.count > 0
              ? "Keine Vokabel-Lektionen gefunden. Du kannst aber die Zahlenlektion starten."
              : "Keine Lektionen gefunden. Bitte importiere zuerst Vokabeln."}
          </p>
        </Card>
      ) : null}

      {/* Zahlen-Konfigurations-Dialog */}
      <Dialog open={numbersDialogOpen} onOpenChange={setNumbersDialogOpen}>
        <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zahlenlektion starten</DialogTitle>
            <DialogDescription>
              Konfiguriere deine Zahlen-Lernsession (0–100)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeViewedNumbers"
                checked={numbersIncludeViewed}
                onChange={(e) => setNumbersIncludeViewed(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="includeViewedNumbers" className="text-sm font-medium cursor-pointer">
                Bereits gelernte Zahlen anzeigen ({numbersMeta.learnedCount})
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="numbersCardLimit" className="text-sm font-medium">
                Anzahl der Karten
              </label>
              <input
                type="number"
                id="numbersCardLimit"
                value={numbersCardLimit}
                onChange={(e) => setNumbersCardLimit(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="z.B. 10"
              />
              <p className="text-xs text-muted-foreground">
                Standard: dein tägliches Lernziel. Leer = alle verfügbaren Zahlenkarten.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setNumbersDialogOpen(false)} className="h-11">
              Abbrechen
            </Button>
            <Button
              onClick={() => void startNumbersSession()}
              className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lektions-Konfigurations-Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
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
                placeholder="z.B. 10"
              />
              <p className="text-xs text-muted-foreground">
                Standard: dein tägliches Lernziel. Leer = alle verfügbaren Karten der Lektion.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onPointerDown={() => {
                const active = document.activeElement;
                if (active instanceof HTMLInputElement) {
                  active.blur();
                }
              }}
              onClick={() => setDialogOpen(false)}
              className="h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Abbrechen
            </Button>
            <Button
              onPointerDown={() => {
                const active = document.activeElement;
                if (active instanceof HTMLInputElement) {
                  active.blur();
                }
              }}
              onClick={() => void startSession()}
              className="h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog: Session beenden */}
      <Dialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lektion beenden?</DialogTitle>
            <DialogDescription>
              Du kannst später jederzeit eine neue Lernsession starten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="h-11" onClick={() => setConfirmEndOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" className="h-11" onClick={endSession}>
              Beenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}