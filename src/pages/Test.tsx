import { useEffect, useMemo, useState, useRef } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { ensureProgressForEntries, ensureProgressForNumberEntries } from "../db/srs";
import { useAudioFeedback } from "../hooks/useAudioFeedback";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useSessionState } from "../hooks/useSessionState";
import { useCardGrading } from "../hooks/useCardGrading";
import { useSessionNavigation } from "../hooks/useSessionNavigation";
import { useSessionStart } from "../hooks/useSessionStart";
import { useSessionStartWithFilters } from "../hooks/useSessionStartWithFilters";
import { useQuickStartLearned } from "../hooks/useQuickStartLearned";
import { useNumberQuickStart } from "../hooks/useNumberQuickStart";
import { useStartLessonFromDialog } from "../hooks/useStartLessonFromDialog";
import { usePersistedSession } from "../hooks/usePersistedSession";
import { serializeTestSession } from "../lib/testSessionCodec";
import { MAX_GENERATED_NUMBER } from "../lib/number-generator";
import type { ConfirmAction, TestCard } from "../features/test/types";
import {
  mapNumberEntryToTestCard,
} from "../features/test/numbers";
import {
  isPersistedTestSessionData,
  type LearnDirection,
  type PersistedTestSessionData,
} from "../lib/sessionTypes";

import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuickStartDialog } from "../features/test/components/QuickStartDialog";
import { NumberQuickStartDialog } from "../features/test/components/NumberQuickStartDialog";
import { LessonTestDialog } from "../features/test/components/LessonTestDialog";
import { SessionActionConfirmDialog } from "../features/test/components/SessionActionConfirmDialog";

export default function Test() {
  // ===== State =====
  const [allVocab, setAllVocab] = useState<TestCard[]>([]);
  const [allNumbers, setAllNumbers] = useState<TestCard[]>([]);
  const [lessonMetadata, setLessonMetadata] = useState<{lesson: number, count: number}[]>([]);
  const [lessonCache, setLessonCache] = useState<Map<number, TestCard[]>>(new Map());
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Richtung (während Session gesperrt)
  const [direction, setDirection] = useState<LearnDirection>(() => {
    const saved = localStorage.getItem("learnDirection");
    if (saved === "TH_DE" || saved === "DE_TH") return saved;
    return "TH_DE";
  });

  // Tag-Auswahl (OR-Logik)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Lektion-Auswahl
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>(undefined);
  // Nur gelernte Karten
  const [onlyViewed, setOnlyViewed] = useState<boolean>(false);
  // Nur fällige Karten (SRS dueAt <= now)
  const [onlyDue, setOnlyDue] = useState<boolean>(false);
  // Lautschrift unter Thai ein-/ausblenden
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => {
    const saved = localStorage.getItem("showTransliterationInTest");
    if (saved === "false") return false;
    return true;
  });
  const [showNumberTransliteration, setShowNumberTransliteration] = useState<boolean>(() => {
    const saved = localStorage.getItem("showTransliterationInNumberTest");
    if (saved === "true") return true;
    return false;
  });

  // Dialog für Lektion-Auswahl
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedDialogLesson, setSelectedDialogLesson] = useState<number | null>(null);
  const [cardLimit, setCardLimit] = useState<string>("");
  const [includeLearnedInDialog, setIncludeLearnedInDialog] = useState<boolean>(false);
  const [cardLimitAdvanced, setCardLimitAdvanced] = useState<string>("");
  const [quickStartIncludeAllLearned, setQuickStartIncludeAllLearned] = useState<boolean>(false);
  const [quickStartLimit, setQuickStartLimit] = useState<string>("");
  const [quickStartDialogOpen, setQuickStartDialogOpen] = useState<boolean>(false);
  const [numberQuickStartDialogOpen, setNumberQuickStartDialogOpen] = useState<boolean>(false);
  const [numberQuickStartIncludeAllLearned, setNumberQuickStartIncludeAllLearned] = useState<boolean>(false);
  const [numberQuickStartLimit, setNumberQuickStartLimit] = useState<string>("");
  const [numberGeneratorMode, setNumberGeneratorMode] = useState<boolean>(() => {
    return localStorage.getItem("numberTestGeneratorMode") === "true";
  });
  const [numberGeneratorFrom, setNumberGeneratorFrom] = useState<string>(() => {
    const raw = localStorage.getItem("numberTestGeneratorFrom");
    if (!raw) return "0";
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return "0";
    return String(Math.min(MAX_GENERATED_NUMBER, parsed));
  });
  const [numberGeneratorTo, setNumberGeneratorTo] = useState<string>(() => {
    const raw = localStorage.getItem("numberTestGeneratorTo");
    if (!raw) return "100";
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return "100";
    return String(Math.min(MAX_GENERATED_NUMBER, parsed));
  });
  const [lastAnswer, setLastAnswer] = useState<"right" | "wrong" | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const flipButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const {
    hydrated: testSessionHydrated,
    savePersistedSession: saveTestSession,
    clearPersistedSession: clearTestSession,
  } = usePersistedSession<PersistedTestSessionData>({
    key: "testSession",
    isValid: isPersistedTestSessionData,
  });

  const { session, dispatchSession, flipCard } = useSessionState();
  const {
    sessionActive,
    queue,
    currentId,
    flipped,
    streaks,
    doneIds,
    currentRound,
    roundIndex,
  } = session;

  const { isSpeaking, speakingKey, handleSpeak, playFeedbackTone } = useAudioFeedback();

  // Always start on the Test overview when entering this page.
  // We intentionally clear any persisted in-page session state.
  useEffect(() => {
    if (!testSessionHydrated) return;
    clearTestSession();
  }, [testSessionHydrated, clearTestSession]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (!testSessionHydrated) return;

    if (sessionActive && queue.length > 0 && currentId != null) {
      const sessionData = serializeTestSession({
        queue,
        currentRound,
        currentId,
        flipped,
        roundIndex,
        direction,
        onlyDue,
        streaks,
        doneIds,
      });
      saveTestSession(sessionData);
    } else {
      clearTestSession();
    }
  }, [testSessionHydrated, sessionActive, queue, currentId, flipped, streaks, doneIds, currentRound, roundIndex, direction, onlyDue, saveTestSession, clearTestSession]);

  useEffect(() => {
    localStorage.setItem("showTransliterationInTest", showTransliteration ? "true" : "false");
  }, [showTransliteration]);
  useEffect(() => {
    localStorage.setItem(
      "showTransliterationInNumberTest",
      showNumberTransliteration ? "true" : "false"
    );
  }, [showNumberTransliteration]);

  useEffect(() => {
    localStorage.setItem("numberTestGeneratorMode", numberGeneratorMode ? "true" : "false");
  }, [numberGeneratorMode]);

  useEffect(() => {
    localStorage.setItem("numberTestGeneratorFrom", numberGeneratorFrom);
  }, [numberGeneratorFrom]);

  useEffect(() => {
    localStorage.setItem("numberTestGeneratorTo", numberGeneratorTo);
  }, [numberGeneratorTo]);


  // ===== Derived data =====
  // Tag-Index
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of allVocab) {
      for (const t of v.tags ?? []) {
        const key = t.trim();
        if (!key) continue;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "de"))
      .map(([tag, count]) => ({ tag, count }));
  }, [allVocab]);

  // Lektionen-Index (aus Metadaten, nicht aus allVocab)
  const allLessons = lessonMetadata;

  const current = useMemo(() => {
    if (!currentId) return null;
    // Suche erst in allVocab, dann im Cache
    let found = allVocab.find((v) => v.id === currentId);
    if (found) return found;
    found = allNumbers.find((v) => v.id === currentId);
    if (found) return found;
    
    // Durchsuche Cache
    for (const cachedVocab of lessonCache.values()) {
      found = cachedVocab.find((v) => v.id === currentId);
      if (found) return found;
    }
    
    return null;
  }, [allVocab, allNumbers, lessonCache, currentId]);

  // Front/Back abhängig von Richtung
  const frontText = useMemo(() => {
    if (!current) return "";
    return direction === "TH_DE" ? current.thai : current.german;
  }, [current, direction]);

  const backText = useMemo(() => {
    if (!current) return "";
    return direction === "TH_DE" ? current.german : current.thai;
  }, [current, direction]);

  const frontLang = direction === "TH_DE" ? "th-TH" : "de-DE";
  const backLang = direction === "TH_DE" ? "de-DE" : "th-TH";
  const getSpeakableText = (text: string) => {
    if (current?.sourceType !== "numbers" && current?.sourceType !== "numbers_generated") return text;
    return text.replace(/\s*\([^)]*\)\s*$/, "").trim();
  };
  const isNumberSessionCard = current?.sourceType === "numbers" || current?.sourceType === "numbers_generated";
  const showCurrentCardTransliteration = isNumberSessionCard
    ? showNumberTransliteration
    : showTransliteration;

  const remainingUniqueCount = useMemo(() => {
    const unique = new Set(queue);
    let c = 0;
    unique.forEach((id) => {
      if (!doneIds.has(id)) c++;
    });
    return c;
  }, [queue, doneIds]);

  const completedCount = useMemo(() => doneIds.size, [doneIds]);

  // ===== Data loading =====
  async function loadAllVocab(silent: boolean = false) {
    setError("");
    if (!silent) {
      setStatus("Lade alle Vokabeln …");
    }
    try {
      const vocab = (await db.vocab.toArray()).map((entry) => ({
        ...entry,
        sourceType: "vocab" as const,
      }));
      const ids = vocab
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(ids);

      setAllVocab(vocab);

      if (!silent) {
        setStatus(vocab.length ? `Geladen: ${vocab.length} Einträge` : "Keine Einträge vorhanden.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      if (!silent) {
        setStatus("");
      }
    }
  }

  async function loadAllNumbers(silent: boolean = false) {
    setError("");
    if (!silent) {
      setStatus("Lade Zahlen …");
    }
    try {
      const numbers = (await db.numbersVocab.toArray()).map(mapNumberEntryToTestCard);
      const ids = numbers
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForNumberEntries(ids);
      setAllNumbers(numbers);
      if (!silent) {
        setStatus(numbers.length ? `Geladen: ${numbers.length} Zahlen` : "Keine Zahlen vorhanden.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      if (!silent) {
        setStatus("");
      }
    }
  }

  async function loadLessonMetadata() {
    setError("");
    setStatus("Lade Lektionen …");
    try {
      // Hole nur eindeutige Lektionen und deren Counts
      const lessons = await db.vocab
        .orderBy("lesson")
        .uniqueKeys();
      
      const metadata = await Promise.all(
        lessons.map(async (lesson) => ({
          lesson: lesson as number,
          count: await db.vocab.where("lesson").equals(lesson).count()
        }))
      );
      
      setLessonMetadata(metadata.sort((a, b) => a.lesson - b.lesson));
      setStatus(`${metadata.length} Lektionen verfügbar`);
      return metadata;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  async function loadLesson(lessonNumber: number): Promise<TestCard[]> {
    // Prüfe Cache
    if (lessonCache.has(lessonNumber)) {
      return lessonCache.get(lessonNumber)!;
    }
    
    setStatus(`Lade Lektion ${lessonNumber} …`);
    
    const vocab = (await db.vocab
      .where("lesson")
      .equals(lessonNumber)
      .toArray()).map((entry) => ({ ...entry, sourceType: "vocab" as const }));
    const ids = vocab
      .map((v) => v.id)
      .filter((id): id is number => typeof id === "number");
    await ensureProgressForEntries(ids);
    
    // Cache aktualisieren
    setLessonCache(prev => new Map(prev).set(lessonNumber, vocab));
    
    setStatus(`Lektion ${lessonNumber} geladen: ${vocab.length} Karten`);
    return vocab;
  }

  useEffect(() => {
    // Lade nur Metadaten beim Start (Lazy Loading)
    loadLessonMetadata().then(() => {
      // Check if user came from Home with a lesson selected
      const selectedLesson = localStorage.getItem("selectedLessonForTest");
      if (selectedLesson) {
        const lesson = parseInt(selectedLesson, 10);
        if (!isNaN(lesson) && [1, 2, 3, 4, 5].includes(lesson)) {
          setSelectedLesson(lesson);
          setTimeout(() => {
            startSessionWithFiltersHook(lesson, false);
          }, 0);
          localStorage.removeItem("selectedLessonForTest");
        }
      }
    });
  }, []);

  useEffect(() => {
    const shouldOpenNumberQuickStart = localStorage.getItem("openNumberQuickStartDialog") === "true";
    if (!shouldOpenNumberQuickStart) return;
    setNumberQuickStartDialogOpen(true);
    localStorage.removeItem("openNumberQuickStartDialog");
  }, []);

  // Load tags source data when advanced filters are opened so tag chips appear immediately.
  useEffect(() => {
    if (!showAdvancedFilters) return;
    if (allVocab.length > 0) return;
    void loadAllVocab(true);
  }, [showAdvancedFilters, allVocab.length]);

  // Focus Management: Fokussiere Flip-Button wenn Session startet oder neue Karte kommt
  useEffect(() => {
    if (sessionActive && currentId && flipButtonRef.current && !flipped) {
      // Kleine Verzögerung damit die Karte gerendert ist
      setTimeout(() => {
        flipButtonRef.current?.focus();
      }, 100);
    }
  }, [sessionActive, currentId, flipped]);

  // Focus Management: Restore focus when dialog closes
  useEffect(() => {
    if (!dialogOpen && lastFocusedElement.current) {
      // Restore focus nach Dialog-Close
      setTimeout(() => {
        lastFocusedElement.current?.focus();
        lastFocusedElement.current = null;
      }, 100);
    }
  }, [dialogOpen]);

  // Session Navigation Hook (muss vor gradeAnswer Hook kommen)
  const { goNext, requeueCurrentToEnd } = useSessionNavigation({
    dispatchSession,
    roundIndex,
    doneIds,
    currentRound,
    currentId,
    queue,
  });

  // Session Start Hook
  const { startSession: startSessionHook } = useSessionStart({
    dispatchSession,
    allVocab,
    loadAllVocab,
    buildSessionIds,
    cardLimitAdvanced,
    selectedTags,
    selectedLesson,
    onlyViewed,
    onlyDue,
    setStatus,
  });

  const { startSessionWithFilters: startSessionWithFiltersHook } = useSessionStartWithFilters({
    dispatchSession,
    allVocab,
    loadAllVocab,
    loadLesson,
    setSelectedLesson,
    setOnlyViewed,
    setStatus,
  });

  const { quickStartLearned: quickStartLearnedHook } = useQuickStartLearned({
    dispatchSession,
    setAllVocab,
    setStatus,
  });
  const { startNumberQuickStart } = useNumberQuickStart({
    dispatchSession,
    allNumbers,
    setAllNumbers,
    loadAllNumbers,
    setStatus,
    setDialogOpen: setNumberQuickStartDialogOpen,
  });

  const { startLessonFromDialog: startLessonFromDialogHook } = useStartLessonFromDialog({
    selectedDialogLesson,
    cardLimit,
      includeLearnedCards: includeLearnedInDialog,
    loadLesson,
    dispatchSession,
    setStatus,
    setDialogOpen,
  });

  // gradeAnswer Hook
  const { gradeAnswer: gradeAnswerHook } = useCardGrading({
    dispatchSession,
    currentId,
    flipped,
    streaks,
    current,
    playFeedbackTone,
    setLastAnswer,
    requeueCurrentToEnd,
    goNext,
  });

  useKeyboardNavigation({
    sessionActive,
    currentId,
    flipped,
    current,
    frontText,
    backText,
    frontLang,
    backLang,
    flipCard,
    gradeAnswer: gradeAnswerHook,
    handleSpeak,
    endSessionConfirm,
  });

  // ===== Helpers =====
  // Helper: Build session IDs
  function buildSessionIds(): number[] {
    const ids: number[] = [];
    for (const v of allVocab) {
      if (!v.id) continue;
      if (!matchesLessonFilter(v)) continue;
      if (!matchesTagFilter(v)) continue;
      if (!matchesViewedFilter(v)) continue;
      ids.push(v.id);
    }
    return ids;
  }

  // startSessionWithFilters ist jetzt im useSessionStartWithFilters Hook
  // quickStartLearned ist jetzt im useQuickStartLearned Hook
  // startLessonFromDialog ist jetzt im useStartLessonFromDialog Hook

  // Quick-Start: Specific lesson, learned cards only
  function openLessonDialog(lesson: number) {
    // Speichere aktuell fokussiertes Element
    lastFocusedElement.current = document.activeElement as HTMLElement;
    setSelectedDialogLesson(lesson);
    setCardLimit(""); // Leer lassen, damit nichts markiert ist
    setDialogOpen(true);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function matchesLessonFilter(v: VocabEntry): boolean {
    if (selectedLesson === undefined) return true;
    return v.lesson === selectedLesson;
  }

  function matchesTagFilter(v: VocabEntry): boolean {
    if (selectedTags.length === 0) return true;
    const tags = (v.tags ?? []).map((t) => t.trim()).filter(Boolean);
    return selectedTags.some((t) => tags.includes(t));
  }

  function matchesViewedFilter(v: VocabEntry): boolean {
    // Option 1: Nur gelernte Karten
    if (onlyViewed) {
      return v.viewed === true;
    }
    // Option 2 (Standard): keine Einschränkung über viewed
    return true;
  }

  function clearSelectedTags() {
    setSelectedTags([]);
  }

  function startQuickStartSession() {
    const parsedLimit = quickStartLimit.trim() ? Number.parseInt(quickStartLimit, 10) : NaN;
    const quickLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;
    void quickStartLearnedHook({
      includeAllLearned: quickStartIncludeAllLearned,
      limit: quickLimit,
    });
    setQuickStartDialogOpen(false);
  }

  async function startNumberQuickStartSession() {
    const parsedLimit = numberQuickStartLimit.trim() ? Number.parseInt(numberQuickStartLimit, 10) : NaN;
    const numberLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;
    await startNumberQuickStart({
      includeAllLearned: numberQuickStartIncludeAllLearned,
      limit: numberLimit,
      generatorMode: numberGeneratorMode,
      generatorFrom: numberGeneratorFrom,
      generatorTo: numberGeneratorTo,
    });
  }

  const selectedCardsCount = useMemo(() => {
    return buildSessionIds().length;
  }, [allVocab, selectedLesson, selectedTags, onlyViewed]);

  function restartSessionConfirm() {
    setConfirmAction("restart");
  }

  function endSessionConfirm() {
    setConfirmAction("end");
  }

  function executeConfirmAction() {
    if (confirmAction === "restart") {
      startSessionHook();
      setStatus("Session neu gestartet");
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "end") {
      dispatchSession({
        type: "set",
        payload: {
          sessionActive: false,
          currentId: null,
          flipped: false,
        },
      });
      setStatus("Session beendet");
      setConfirmAction(null);
      return;
    }
  }

  // startSession ist jetzt im useSessionStart Hook

  const finished = sessionActive && currentId == null;
  const cardStreak = current?.id ? Math.min(streaks.get(current.id) ?? 0, 5) : 0;
  const progressPct = Math.round((cardStreak / 5) * 100);
  const statusIsWarning = status.startsWith("Keine ");

  // ===== Render =====
  return (
    <PageShell
      title="Tests"
      description="Teste dein Wissen! Karte umdrehen → bewerten. Richtig erhöht den Zähler, Falsch setzt ihn zurück. Bei 5× richtig in Folge ist die Karte erledigt."
    >
      {/* Status / Fehler */}
      <div className="space-y-2" role="status" aria-live="polite">
        {status ? (
          <p
            className={
              statusIsWarning
                ? "rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                : "text-sm text-muted-foreground"
            }
          >
            {status}
          </p>
        ) : null}
        {error ? (
          <pre className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm whitespace-pre-wrap" role="alert">
            {error}
          </pre>
        ) : null}
      </div>

      {/* QUICK-START BUTTONS */}
      {!sessionActive ? (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">🚀 Schnellstart:</div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => setQuickStartDialogOpen(true)}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              title="Teste standardmäßig fällige gelernte Karten"
              aria-label="Schnellstart: Teste fällige gelernte Karten"
            >
              📖 Fällige Karten testen
            </Button>
            <Button
              onClick={() => setNumberQuickStartDialogOpen(true)}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              title="Teste standardmäßig fällige gelernte Zahlen"
              aria-label="Schnellstart: Zahlentest"
            >
              🔢 Zahlentest
            </Button>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {allLessons.length > 0 ? (
                allLessons.map(({ lesson, count }) => (
                  <Button
                    key={lesson}
                    onClick={() => openLessonDialog(lesson)}
                    variant="secondary"
                    className="h-10 text-sm font-medium"
                    title={`Lektion ${lesson} testen (${count} Karten)`}
                    aria-label={`Lektion ${lesson} starten, ${count} Karten verfügbar`}
                  >
                    L{lesson} <span className="text-xs opacity-75">({count})</span>
                  </Button>
                ))
              ) : null}
            </div>
          </div>

        </div>
      ) : null}

      {/* Filter / Controls */}
      {!sessionActive && showAdvancedFilters ? (
        <Card className="p-4" id="advanced-filters" role="region" aria-label="Erweiterte Filter-Optionen">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyViewed}
                  onChange={(e) => setOnlyViewed(e.target.checked)}
                  aria-label="Nur bereits gelernte Karten anzeigen"
                />
                nur gelernte Karten
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyDue}
                  onChange={(e) => setOnlyDue(e.target.checked)}
                  aria-label="Nur fällige Karten anzeigen"
                />
                nur fällige Karten
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={showTransliteration}
                  onChange={(e) => setShowTransliteration(e.target.checked)}
                  aria-label="Lautschrift unter Thai anzeigen"
                />
                Lautschrift anzeigen
              </label>
              <p className="w-full text-xs text-muted-foreground">
                Hinweis: "nur fällige Karten" nutzt SRS-Fälligkeit (dueAt kleiner/gleich jetzt). Ohne diesen Filter testest du alle Karten der aktuellen Auswahl.
              </p>

              {/* Richtung */}
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lernrichtung wählen">
                <span className="text-sm text-muted-foreground">Richtung:</span>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === "TH_DE" ? "default" : "secondary"}
                  className={`min-h-[44px] transition-all ${
                    direction === "TH_DE"
                      ? "shadow-sm ring-2 ring-primary/30"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDirection("TH_DE")}
                  title="Thai → Deutsch"
                  aria-pressed={direction === "TH_DE"}
                  aria-label="Richtung: Thai nach Deutsch"
                >
                  Thai → Deutsch
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === "DE_TH" ? "default" : "secondary"}
                  className={`min-h-[44px] transition-all ${
                    direction === "DE_TH"
                      ? "shadow-sm ring-2 ring-primary/30"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDirection("DE_TH")}
                  title="Deutsch → Thai"
                  aria-pressed={direction === "DE_TH"}
                  aria-label="Richtung: Deutsch nach Thai"
                >
                  Deutsch → Thai
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Lektionen auswählen:</div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Lektion filtern">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedLesson === undefined ? "default" : "secondary"}
                  onClick={() => setSelectedLesson(undefined)}
                  className={`h-8 min-h-[36px] transition-all ${
                    selectedLesson === undefined
                      ? "shadow-sm ring-2 ring-primary/30"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={selectedLesson === undefined}
                  aria-label="Alle Lektionen wählen"
                >
                  Alle
                </Button>
                {allLessons.map(({ lesson, count }) => (
                  <Button
                    key={lesson}
                    type="button"
                    size="sm"
                    variant={selectedLesson === lesson ? "default" : "secondary"}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`h-8 min-h-[36px] transition-all ${
                      selectedLesson === lesson
                        ? "shadow-sm ring-2 ring-primary/30"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    title={`Lektion ${lesson}`}
                    aria-pressed={selectedLesson === lesson}
                    aria-label={`Lektion ${lesson} auswählen, ${count} Karten`}
                  >
                    L{lesson} <span className="text-muted-foreground">({count})</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Tags auswählen:</div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Tags filtern">
                {allTags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Keine Tags vorhanden.</div>
                ) : (
                  allTags.map(({ tag, count }) => {
                    const selected = selectedTags.includes(tag);

                    return (
                      <Button
                        key={tag}
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "secondary"}
                        onClick={() => toggleTag(tag)}
                        className={`h-8 rounded-full px-3 transition-all ${
                          selected
                            ? "shadow-sm ring-2 ring-primary/30"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                        title="Klicken zum Filtern"
                        aria-pressed={selected}
                        aria-label={`Tag ${tag} ${selected ? 'abwählen' : 'auswählen'}, ${count} Karten`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="font-normal">
                            {tag} <span className="text-muted-foreground">({count})</span>
                          </span>
                          {selected ? (
                            <span className="text-muted-foreground" aria-hidden="true">
                              ×
                            </span>
                          ) : null}
                        </span>
                      </Button>
                    );
                  })
                )}

                {selectedTags.length > 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={clearSelectedTags}
                    className="h-8 rounded-full"
                  >
                    Auswahl löschen
                  </Button>
                ) : null}
              </div>

              {selectedTags.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Aktiv:{" "}
                  {selectedTags.map((t) => (
                    <span key={t} className="mr-1">
                      {t}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Keine Tag-Filter aktiv (alle Karten).</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="cardLimitAdvanced">Anzahl Karten (optional)</label>
              <input
                id="cardLimitAdvanced"
                type="number"
                value={cardLimitAdvanced}
                onChange={(e) => setCardLimitAdvanced(e.target.value)}
                placeholder={`Alle (${selectedCardsCount} verfügbar)`}
                min="1"
                max={selectedCardsCount}
                className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-describedby="cardLimitAdvanced-description"
              />
              <p className="text-xs text-muted-foreground" id="cardLimitAdvanced-description">
                Leer lassen für alle verfügbaren Karten ({selectedCardsCount})
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={startSessionHook}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                {(() => {
                  const limit = cardLimitAdvanced ? parseInt(cardLimitAdvanced, 10) : 0;
                  const actualCount = limit > 0 && limit < selectedCardsCount ? limit : selectedCardsCount;
                  return `🚀 Session starten (${actualCount} ${actualCount === 1 ? "Karte" : "Karten"})`;
                })()}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Fertig */}
      {finished ? (
        <Card className="p-6 text-center">
          <div className="text-2xl font-semibold">🎉 Fertig!</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Alle ausgewählten Karten wurden mindestens <b>5× hintereinander</b> richtig beantwortet.
          </p>
          <div className="mt-4">
            <Button onClick={restartSessionConfirm}>Noch einmal (Session neu starten)</Button>
          </div>
        </Card>
      ) : null}

      {/* Keine Session */}
      {!sessionActive ? (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Wähle <b>Fällige Karten testen</b> oder eine <b>Lektion</b>. Richtung und Optionen
            konfigurierst du im jeweiligen Startdialog.
          </p>
          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant={showAdvancedFilters ? "secondary" : "outline"}
              size="sm"
              className="h-10 min-w-[220px] font-medium"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters"
              aria-label={
                showAdvancedFilters
                  ? "Erweiterte Filter ausblenden"
                  : "Erweiterte Filter anzeigen"
              }
            >
              {showAdvancedFilters ? "⬆️ Erweiterte Filter ausblenden" : "⬇️ Erweiterte Filter anzeigen"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Erweiterte Filter sind optional für einen individuellen Testlauf (Tags, Lektionen,
              fällige/gelernte Karten, Kartenanzahl).
            </p>
          </div>
        </div>
      ) : null}

      {/* Session-Controls */}
      {sessionActive && !finished ? (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={restartSessionConfirm}
            aria-label="Test-Session neu starten"
          >
            Session neu starten
          </Button>
        </div>
      ) : null}

      {/* Karte */}
      {!finished && sessionActive && current && current.id ? (
        <div className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-end">
              <Button
                onClick={endSessionConfirm}
                variant="outline"
                size="sm"
                className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                aria-label="Test-Session beenden"
              >
                Test beenden
              </Button>
            </div>
          </div>

          {/* Top-Status */}
          <div
            className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <span
              aria-label={`${remainingUniqueCount} Karten verbleibend`}
              className="rounded-full bg-muted/70 px-2 py-1"
            >
              Verbleibend: <b className="text-foreground">{remainingUniqueCount}</b>
            </span>
            <span
              aria-label={`${completedCount} Karten erledigt`}
              className="rounded-full bg-muted/70 px-2 py-1"
            >
              Erledigt: <b className="text-foreground">{completedCount}</b>
            </span>
            <span
              aria-label={`Diese Karte: ${cardStreak} von 5 richtig`}
              className="rounded-full bg-muted/70 px-2 py-1"
            >
              Diese Karte: <b className="text-foreground">{cardStreak}/5</b>
            </span>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mx-auto mt-2 w-full max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
                aria-label={`Fortschritt ${progressPct}%`}
              />
            </div>
          </div>

          {/* Testkarte */}
          <Card className="mx-auto mt-3 flex w-full min-h-0 max-w-xs flex-col overflow-y-auto border border-slate-200/70 bg-background p-3 shadow-xl dark:border-slate-800/70 sm:max-w-md sm:p-5 md:max-w-2xl md:p-7 max-h-[calc(100dvh-16rem)] sm:max-h-[calc(100dvh-18rem)]">
            <div className="w-full space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                <span className="font-semibold text-foreground">Teste dein Wissen!</span> Karte umdrehen → bewerten.
                Richtig erhöht den Zähler, Falsch setzt ihn zurück. Bei 5× richtig in Folge ist die Karte erledigt.
              </div>
              {lastAnswer ? (
                <div className="flex justify-center" aria-live="polite">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      lastAnswer === "right"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {lastAnswer === "right" ? "✅ Richtig" : "❌ Falsch"}
                  </span>
                </div>
              ) : null}
              {!flipped ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5">
                      Vorderseite
                    </span>
                    <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5">
                      {direction === "TH_DE" ? "Thai → Deutsch" : "Deutsch → Thai"}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-semibold text-center leading-snug">
                    {frontText}
                  </div>

                  {showCurrentCardTransliteration && direction === "TH_DE" && current.transliteration ? (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground italic">{current.transliteration}</div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-slate-400 hover:bg-slate-500 text-white"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        void handleSpeak(getSpeakableText(frontText), frontLang, "front");
                      }}
                      title="Vorlesen"
                      aria-label={`Vorderseite vorlesen: ${frontText}`}
                      disabled={isSpeaking}
                      aria-busy={isSpeaking && speakingKey === "front"}
                    >
                      {isSpeaking && speakingKey === "front" ? "🔊 Spricht…" : "🔊 Vorlesen"}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      ref={flipButtonRef}
                      onClick={flipCard}
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      aria-label="Karte umdrehen um Rückseite zu sehen"
                    >
                      👉 Karte umdrehen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5">
                      Rückseite
                    </span>
                    <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5">
                      {direction === "TH_DE" ? "Thai → Deutsch" : "Deutsch → Thai"}
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-semibold text-center leading-snug">{backText}</div>

                  {showCurrentCardTransliteration && direction === "DE_TH" && current.transliteration ? (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground italic">{current.transliteration}</div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 transition-all duration-150 bg-slate-400 hover:bg-slate-500 text-white"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        void handleSpeak(getSpeakableText(backText), backLang, "back");
                      }}
                      title="Vorlesen"
                      aria-label={`Rückseite vorlesen: ${backText}`}
                      disabled={isSpeaking}
                      aria-busy={isSpeaking && speakingKey === "back"}
                    >
                      {isSpeaking && speakingKey === "back" ? "🔊 Spricht…" : "🔊 Vorlesen"}
                    </Button>
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
                              onClick={(ev) => {
                                ev.stopPropagation();
                                void handleSpeak(current.exampleThai!, "th-TH", "example-th");
                              }}
                              title="Beispiel Thai vorlesen"
                              aria-label={`Thai Beispiel vorlesen: ${current.exampleThai}`}
                              disabled={isSpeaking}
                              aria-busy={isSpeaking && speakingKey === "example-th"}
                            >
                              {isSpeaking && speakingKey === "example-th" ? "⏳" : "🔊"}
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
                              onClick={(ev) => {
                                ev.stopPropagation();
                                void handleSpeak(current.exampleGerman!, "de-DE", "example-de");
                              }}
                              title="Beispiel Deutsch vorlesen"
                              aria-label={`Deutsches Beispiel vorlesen: ${current.exampleGerman}`}
                              disabled={isSpeaking}
                              aria-busy={isSpeaking && speakingKey === "example-de"}
                            >
                              {isSpeaking && speakingKey === "example-de" ? "⏳" : "🔊"}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </Card>

          {/* Keyboard Shortcuts Legende */}
          <div className="mt-4 mb-2 text-center hidden sm:block">
            <details className="inline-block text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground transition-colors">
                ⌨️ Tastatur-Shortcuts
              </summary>
              <div className="mt-2 p-3 rounded-md bg-muted/50 space-y-1 text-left">
                <div><kbd className="px-2 py-0.5 rounded bg-background border">Space</kbd> / <kbd className="px-2 py-0.5 rounded bg-background border">Enter</kbd> - Karte umdrehen</div>
                <div><kbd className="px-2 py-0.5 rounded bg-background border">→</kbd> / <kbd className="px-2 py-0.5 rounded bg-background border">1</kbd> - Richtig</div>
                <div><kbd className="px-2 py-0.5 rounded bg-background border">←</kbd> / <kbd className="px-2 py-0.5 rounded bg-background border">0</kbd> - Falsch</div>
                <div><kbd className="px-2 py-0.5 rounded bg-background border">P</kbd> - Vorlesen</div>
                <div><kbd className="px-2 py-0.5 rounded bg-background border">Esc</kbd> - Session beenden</div>
              </div>
            </details>
          </div>

          {/* Bewertungs-Buttons */}
          <div className="mt-2 w-full max-w-2xl shrink-0 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
            <div className="rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur">
              <div className="flex gap-2 justify-center" role="group" aria-label="Karte bewerten">
                <Button
                  onClick={() => gradeAnswerHook(false)}
                  variant="destructive"
                  size="sm"
                  disabled={!flipped}
                  className={`h-11 flex-1 shadow-lg transition-all duration-150 ${
                    flipped
                      ? "hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 bg-red-600 hover:bg-red-700 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  }`}
                  aria-label="Antwort als falsch markieren"
                >
                  ❌ Falsch
                </Button>
                <Button
                  onClick={() => gradeAnswerHook(true)}
                  variant="default"
                  size="sm"
                  disabled={!flipped}
                  className={`h-11 flex-1 shadow-lg transition-all duration-150 ${
                    flipped
                      ? "hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 bg-green-600 hover:bg-green-700 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  }`}
                  aria-label="Antwort als richtig markieren"
                >
                  ✅ Richtig
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dialoge für Schnellstart */}
      <QuickStartDialog
        open={quickStartDialogOpen}
        onOpenChange={setQuickStartDialogOpen}
        direction={direction}
        onDirectionChange={setDirection}
        showTransliteration={showTransliteration}
        onShowTransliterationChange={setShowTransliteration}
        includeAllLearned={quickStartIncludeAllLearned}
        onIncludeAllLearnedChange={setQuickStartIncludeAllLearned}
        limit={quickStartLimit}
        onLimitChange={setQuickStartLimit}
        onStart={startQuickStartSession}
      />

      <NumberQuickStartDialog
        open={numberQuickStartDialogOpen}
        onOpenChange={setNumberQuickStartDialogOpen}
        direction={direction}
        onDirectionChange={setDirection}
        showNumberTransliteration={showNumberTransliteration}
        onShowNumberTransliterationChange={setShowNumberTransliteration}
        includeAllLearned={numberQuickStartIncludeAllLearned}
        onIncludeAllLearnedChange={setNumberQuickStartIncludeAllLearned}
        generatorMode={numberGeneratorMode}
        onGeneratorModeChange={setNumberGeneratorMode}
        generatorFrom={numberGeneratorFrom}
        onGeneratorFromChange={setNumberGeneratorFrom}
        generatorTo={numberGeneratorTo}
        onGeneratorToChange={setNumberGeneratorTo}
        maxGeneratedNumber={MAX_GENERATED_NUMBER}
        limit={numberQuickStartLimit}
        onLimitChange={setNumberQuickStartLimit}
        onStart={() => void startNumberQuickStartSession()}
      />

      {/* Dialog für Lektion-Auswahl */}
      <LessonTestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedLesson={selectedDialogLesson}
        direction={direction}
        onDirectionChange={setDirection}
        showTransliteration={showTransliteration}
        onShowTransliterationChange={setShowTransliteration}
        cardLimit={cardLimit}
        onCardLimitChange={setCardLimit}
        includeLearnedInDialog={includeLearnedInDialog}
        onIncludeLearnedInDialogChange={setIncludeLearnedInDialog}
        onStart={startLessonFromDialogHook}
      />

      {/* Confirm Dialog für Session-Aktionen */}
      <SessionActionConfirmDialog
        action={confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
      />
    </PageShell>
  );
}
