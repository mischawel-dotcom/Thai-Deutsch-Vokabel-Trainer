import { useEffect, useMemo, useState, useRef } from "react";
import { db } from "../db/db";
import type { SentenceEntry, VocabEntry } from "../db/db";
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
import { ensureDefaultSentencesSeeded } from "../features/sentences/defaults";
import { buildSentenceSegments } from "../features/sentences/transliteration";
import { applyCefrFirstFilter } from "../features/vocab/cefrFirst";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Test() {
  // ===== State =====
  const [allVocab, setAllVocab] = useState<TestCard[]>([]);
  const [allNumbers, setAllNumbers] = useState<TestCard[]>([]);
  const [allSentences, setAllSentences] = useState<TestCard[]>([]);
  const [lessonMetadata, setLessonMetadata] = useState<{lesson: number, count: number}[]>([]);
  const [lessonCache, setLessonCache] = useState<Map<number, TestCard[]>>(new Map());
  const [testEntryView, setTestEntryView] = useState<"hub" | "vocab">("hub");
  const [sentenceModeDialogOpen, setSentenceModeDialogOpen] = useState<boolean>(false);
  const [sessionMode, setSessionMode] = useState<
    "vocab" | "numbers" | "sentences_regular" | "sentences_important" | null
  >(null);
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
  const [sentenceDialogOpen, setSentenceDialogOpen] = useState<boolean>(false);
  const [sentenceIncludeViewed, setSentenceIncludeViewed] = useState<boolean>(false);
  const [sentenceCardLimit, setSentenceCardLimit] = useState<string>("");
  const [sentenceLessonOptions, setSentenceLessonOptions] = useState<
    Array<{
      lesson: number;
      unlockedCount: number;
      unlockedUnviewedCount: number;
      totalCount: number;
      enabled: boolean;
    }>
  >([]);
  const [sentenceSelectedLessons, setSentenceSelectedLessons] = useState<Record<number, boolean>>(
    {}
  );
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
    if (sessionMode === "numbers") {
      return allNumbers.find((v) => v.id === currentId) ?? null;
    }
    if (sessionMode === "sentences_regular" || sessionMode === "sentences_important") {
      return allSentences.find((v) => v.id === currentId) ?? null;
    }
    // Suche erst in allVocab, dann im Cache
    let found = allVocab.find((v) => v.id === currentId);
    if (found) return found;
    
    // Durchsuche Cache
    for (const cachedVocab of lessonCache.values()) {
      found = cachedVocab.find((v) => v.id === currentId);
      if (found) return found;
    }
    
    return null;
  }, [allVocab, allNumbers, allSentences, lessonCache, currentId, sessionMode]);

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
  const isVocabSessionCard = sessionMode === "vocab" || current?.sourceType === "vocab";
  const frontIsThai = frontLang === "th-TH";
  const backIsThai = backLang === "th-TH";
  const showBackAudioButton = !(isVocabSessionCard && backLang === "de-DE");
  const showGermanExampleAudio = !isVocabSessionCard;
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
      const { entries: cefrFilteredEntries, activeGate } = applyCefrFirstFilter(
        await db.vocab.toArray()
      );
      const vocab = cefrFilteredEntries
        .map((entry) => ({
          ...entry,
          sourceType: "vocab" as const,
        }));
      const ids = vocab
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(ids);

      setAllVocab(vocab);

      if (!silent) {
        if (!vocab.length) {
          setStatus("Keine Einträge vorhanden.");
        } else {
          const gateHint =
            activeGate === "A1"
              ? " (CEFR-first aktiv: A2 wird ausgeblendet, bis A1 gelernt ist)"
              : "";
          setStatus(`Geladen: ${vocab.length} Einträge${gateHint}`);
        }
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

  async function getTestPassedByLesson(): Promise<Record<number, number>> {
    const groupedIdsByLesson: Record<number, number[]> = {};
    const { entries: vocabEntries } = applyCefrFirstFilter(await db.vocab.toArray());
    for (const vocabEntry of vocabEntries) {
      const lesson = vocabEntry.lesson ?? 0;
      const id = vocabEntry.id;
      if (!Number.isFinite(lesson) || lesson <= 0 || typeof id !== "number") continue;
      if (!groupedIdsByLesson[lesson]) groupedIdsByLesson[lesson] = [];
      groupedIdsByLesson[lesson].push(id);
    }

    const testPassedByLesson: Record<number, number> = {};
    for (const [lessonKey, ids] of Object.entries(groupedIdsByLesson)) {
      const lesson = Number(lessonKey);
      if (!Number.isFinite(lesson) || ids.length === 0) {
        testPassedByLesson[lesson] = 0;
        continue;
      }
      const progressRows = await db.progress.bulkGet(ids);
      testPassedByLesson[lesson] = progressRows.filter(
        (row) => row && typeof row.repetitions === "number" && row.repetitions >= 5
      ).length;
    }
    return testPassedByLesson;
  }

  async function loadSentenceCardsForTest(
    scope: "regular" | "important",
    lessonFilter: number[] = [],
    includeViewedCards = false
  ): Promise<TestCard[]> {
    await ensureDefaultSentencesSeeded();
    const testPassedByLesson = await getTestPassedByLesson();
    const lessonSet = lessonFilter.length > 0 ? new Set(lessonFilter) : null;
    const vocabEntries = await db.vocab.toArray();
    const transliterationByThai = new Map<string, string>();
    for (const entry of vocabEntries) {
      const thai = (entry.thai ?? "").trim();
      const transliteration = (entry.transliteration ?? "").trim();
      if (!thai || !transliteration || transliterationByThai.has(thai)) continue;
      transliterationByThai.set(thai, transliteration);
    }
    const knownThaiWords = Array.from(transliterationByThai.keys());

    const sentenceEntries = await db.sentencesVocab.toArray();
    const filteredByScope = sentenceEntries.filter((entry) =>
      scope === "important" ? entry.lesson === 6 : entry.lesson >= 1 && entry.lesson <= 5
    );
    const unlocked = filteredByScope.filter(
      (entry) => (testPassedByLesson[entry.lesson] ?? 0) >= entry.unlockThresholdTestPassed
    );
    const byLesson = lessonSet
      ? unlocked.filter((entry) => lessonSet.has(entry.lesson))
      : unlocked;
    const byViewed = includeViewedCards
      ? byLesson
      : byLesson.filter((entry) => !entry.viewed);

    return byViewed
      .sort((a, b) => {
        if (a.lesson !== b.lesson) return a.lesson - b.lesson;
        if (a.rangeStart !== b.rangeStart) return a.rangeStart - b.rangeStart;
        return (a.id ?? 0) - (b.id ?? 0);
      })
      .map((entry) =>
        mapSentenceEntryToTestCard(
          entry,
          scope,
          knownThaiWords,
          transliterationByThai
        )
      );
  }

  function mapSentenceEntryToTestCard(
    entry: SentenceEntry,
    scope: "regular" | "important",
    knownThaiWords: string[],
    transliterationByThai: Map<string, string>
  ): TestCard {
    return {
      id: entry.id,
      thai: entry.thai,
      german: entry.german,
      lesson: entry.lesson,
      tags: entry.tags,
      viewed: entry.viewed,
      sentenceSegments: buildSentenceSegments(
        entry.thai,
        knownThaiWords,
        transliterationByThai
      ),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      sourceType: scope === "important" ? "sentences_important" : "sentences",
    };
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
      setStatus("");
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
          setSessionMode("vocab");
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
    setSessionMode("vocab");
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
    setSessionMode("numbers");
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

  async function openSentenceTestDialog() {
    try {
      const testPassedByLesson = await getTestPassedByLesson();
      await ensureDefaultSentencesSeeded();
      const sentenceEntries = (await db.sentencesVocab.toArray()).filter(
        (entry) => entry.lesson >= 1 && entry.lesson <= 5
      );
      const grouped = new Map<
        number,
        { totalCount: number; unlockedCount: number; unlockedUnviewedCount: number }
      >();
      for (const entry of sentenceEntries) {
        const lesson = entry.lesson;
        const currentStats = grouped.get(lesson) ?? {
          totalCount: 0,
          unlockedCount: 0,
          unlockedUnviewedCount: 0,
        };
        currentStats.totalCount += 1;
        if ((testPassedByLesson[lesson] ?? 0) >= entry.unlockThresholdTestPassed) {
          currentStats.unlockedCount += 1;
          if (!entry.viewed) {
            currentStats.unlockedUnviewedCount += 1;
          }
        }
        grouped.set(lesson, currentStats);
      }

      const options = Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([lesson, stats]) => ({
          lesson,
          totalCount: stats.totalCount,
          unlockedCount: stats.unlockedCount,
          unlockedUnviewedCount: stats.unlockedUnviewedCount,
          enabled: stats.unlockedCount > 0,
        }));

      const defaultSelection: Record<number, boolean> = {};
      for (const option of options) {
        defaultSelection[option.lesson] = option.enabled;
      }

      setSentenceLessonOptions(options);
      setSentenceSelectedLessons(defaultSelection);
      setSentenceIncludeViewed(false);
      setSentenceCardLimit("");
      setSentenceDialogOpen(true);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Fehler beim Öffnen der Satztest-Auswahl.");
    }
  }

  async function startSentenceRegularTestFromDialog() {
    const selectedLessons = sentenceLessonOptions
      .filter((option) => option.enabled && sentenceSelectedLessons[option.lesson])
      .map((option) => option.lesson);
    if (selectedLessons.length === 0) {
      setStatus("Bitte mindestens eine freigeschaltete Satz-Lektion wählen.");
      return;
    }

    const parsedLimit = sentenceCardLimit.trim()
      ? Number.parseInt(sentenceCardLimit, 10)
      : NaN;
    let limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;
    if (
      typeof limit === "number" &&
      sentenceDialogMaxCount > 0 &&
      limit > sentenceDialogMaxCount
    ) {
      limit = sentenceDialogMaxCount;
    }

    await startSentenceTestSession("regular", selectedLessons, sentenceIncludeViewed, limit);
    setSentenceDialogOpen(false);
  }

  async function startSentenceImportantTestDirect() {
    await startSentenceTestSession("important", [6], true);
  }

  function openSentenceModeDialog() {
    setSentenceModeDialogOpen(true);
  }

  async function startSentenceTestSession(
    scope: "regular" | "important",
    selectedLessons: number[],
    includeViewedCards: boolean,
    limit?: number
  ) {
    let cards = await loadSentenceCardsForTest(scope, selectedLessons, includeViewedCards);
    if (cards.length === 0) {
      setStatus(
        scope === "important"
          ? "Keine wichtigen Sätze verfügbar."
          : "Keine freigeschalteten Satzkarten für die Auswahl."
      );
      return;
    }
    if (typeof limit === "number" && limit > 0 && limit < cards.length) {
      cards = [...cards].sort(() => Math.random() - 0.5).slice(0, limit);
    }

    const ids = cards
      .map((v) => v.id)
      .filter((id): id is number => typeof id === "number");
    const shuffled = [...ids].sort(() => Math.random() - 0.5);

    setAllSentences(cards);
    setSessionMode(scope === "important" ? "sentences_important" : "sentences_regular");
    dispatchSession({
      type: "set",
      payload: {
        sessionActive: true,
        queue: ids,
        currentRound: shuffled,
        roundIndex: 0,
        currentId: shuffled[0] ?? null,
        flipped: false,
        streaks: new Map(ids.map((id) => [id, 0])),
        doneIds: new Set(),
      },
    });
    setStatus(
      scope === "important"
        ? `Wichtige Sätze Test gestartet (${cards.length} Karte(n)).`
        : `Satztest gestartet (${cards.length} Karte(n)).`
    );
  }

  const selectedCardsCount = useMemo(() => {
    return buildSessionIds().length;
  }, [allVocab, selectedLesson, selectedTags, onlyViewed]);
  const sentenceDialogMaxCount = useMemo(() => {
    const selectedOptions = sentenceLessonOptions.filter(
      (option) => option.enabled && sentenceSelectedLessons[option.lesson]
    );
    if (selectedOptions.length === 0) return 0;
    return selectedOptions.reduce((sum, option) => {
      return (
        sum +
        (sentenceIncludeViewed ? option.unlockedCount : option.unlockedUnviewedCount)
      );
    }, 0);
  }, [sentenceLessonOptions, sentenceSelectedLessons, sentenceIncludeViewed]);

  function restartSessionConfirm() {
    setConfirmAction("restart");
  }

  function endSessionConfirm() {
    setConfirmAction("end");
  }

  function goBackToTests() {
    dispatchSession({
      type: "set",
      payload: {
        sessionActive: false,
        currentId: null,
        flipped: false,
      },
    });
    setSessionMode(null);
    setTestEntryView("hub");
    setStatus("Test abgeschlossen.");
  }

  function executeConfirmAction() {
    if (confirmAction === "restart") {
      if (queue.length > 0) {
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        dispatchSession({
          type: "set",
          payload: {
            sessionActive: true,
            queue: [...queue],
            currentRound: shuffled,
            roundIndex: 0,
            currentId: shuffled[0] ?? null,
            flipped: false,
            streaks: new Map(queue.map((id) => [id, 0])),
            doneIds: new Set(),
          },
        });
      } else {
        setSessionMode("vocab");
        startSessionHook();
      }
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
      setSessionMode(null);
      setStatus("Session beendet");
      setConfirmAction(null);
      return;
    }
  }

  // startSession ist jetzt im useSessionStart Hook

  const finished = sessionActive && currentId == null;
  const isSentenceSession =
    sessionMode === "sentences_regular" || sessionMode === "sentences_important";
  const cardStreak = current?.id ? Math.min(streaks.get(current.id) ?? 0, 5) : 0;
  const progressPct = isSentenceSession
    ? Math.round((queue.length > 0 ? (doneIds.size / queue.length) * 100 : 0))
    : Math.round((cardStreak / 5) * 100);
  const statusIsWarning = status.startsWith("Keine ");
  const showStatusMessage = !finished && Boolean(status);

  // ===== Render =====
  return (
    <PageShell title="Tests">
      {/* Status / Fehler */}
      {status || error ? (
        <div className="space-y-2" role="status" aria-live="polite">
          {showStatusMessage ? (
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
      ) : null}

      {/* Test-Einstieg */}
      {!sessionActive && testEntryView === "hub" ? (
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">🧪 Test wählen</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              onClick={() => setTestEntryView("vocab")}
              variant="outline"
              className="h-24 flex-col items-start justify-center gap-1 text-left"
            >
              <span className="text-base font-semibold">📚 Teste Vokabeln</span>
              <span className="text-xs opacity-80">Eigener Vokabel-Testbereich</span>
            </Button>
            <Button
              onClick={() => setNumberQuickStartDialogOpen(true)}
              variant="outline"
              className="h-24 flex-col items-start justify-center gap-1 text-left"
            >
              <span className="text-base font-semibold">🔢 Teste Zahlen</span>
              <span className="text-xs opacity-80">Dialog: Zahlentest</span>
            </Button>
            <Button
              onClick={openSentenceModeDialog}
              variant="outline"
              className="h-24 flex-col items-start justify-center gap-1 text-left"
            >
              <span className="text-base font-semibold">💬 Teste Sätze</span>
              <span className="text-xs opacity-80">Satztest oder wichtige Sätze</span>
            </Button>
          </div>
        </Card>
      ) : null}

      {!sessionActive && testEntryView === "vocab" ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-muted-foreground">📚 Vokabeltests</div>
            <Button variant="ghost" size="sm" onClick={() => setTestEntryView("hub")}>
              Zurück
            </Button>
          </div>
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
        </Card>
      ) : null}

      {/* Filter / Controls */}
      {!sessionActive && testEntryView === "vocab" && showAdvancedFilters ? (
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
                onClick={() => {
                  setSessionMode("vocab");
                  startSessionHook();
                }}
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
          <div className="text-2xl font-semibold">Test abgeschlossen</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSentenceSession ? (
              <>Alle Satzkarten in diesem Durchlauf wurden beantwortet.</>
            ) : (
              <>Alle ausgewählten Karten wurden erfolgreich abgeschlossen.</>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Karten im Durchlauf: {queue.length}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={goBackToTests}>
              Zurück zu Tests
            </Button>
            <Button variant="outline" onClick={restartSessionConfirm}>
              Session neu starten
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Keine Session */}
      {!sessionActive ? (
        <div className="space-y-2">
          {testEntryView === "vocab" ? (
            <p className="text-center text-sm text-muted-foreground">
              Wähle einen Vokabeltest. Richtung und Optionen konfigurierst du im jeweiligen
              Startdialog.
            </p>
          ) : null}
          {testEntryView === "vocab" ? (
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
          ) : null}
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
              aria-label={
                isSentenceSession
                  ? "Diese Karte wird einmal bewertet"
                  : `Diese Karte: ${cardStreak} von 5 richtig`
              }
              className="rounded-full bg-muted/70 px-2 py-1"
            >
              {isSentenceSession ? (
                <>Diese Karte: <b className="text-foreground">1x bewerten</b></>
              ) : (
                <>Diese Karte: <b className="text-foreground">{cardStreak}/5</b></>
              )}
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
          <Card
            className={`mx-auto mt-3 flex w-full min-h-0 max-w-xs flex-col overflow-y-auto p-3 shadow-xl sm:max-w-md sm:p-5 md:max-w-2xl md:p-7 max-h-[calc(100dvh-16rem)] sm:max-h-[calc(100dvh-18rem)] ${
              isVocabSessionCard ? "justify-center pt-5 pb-5 sm:pt-7 sm:pb-7 md:pt-9 md:pb-9" : ""
            }`}
          >
            <div className="w-full space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                <span className="font-semibold text-foreground">Teste dein Wissen!</span> Karte umdrehen → bewerten.
                {isSentenceSession
                  ? " Jede Satzkarte wird in diesem Durchlauf genau einmal bewertet."
                  : " Richtig erhöht den Zähler, Falsch setzt ihn zurück. Bei 5× richtig in Folge ist die Karte erledigt."}
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

                  <div
                    className={`font-semibold text-center leading-snug ${
                      isVocabSessionCard
                        ? frontIsThai
                          ? "text-4xl sm:text-5xl"
                          : "text-2xl sm:text-3xl text-blue-600 dark:text-blue-400"
                        : "text-3xl sm:text-4xl"
                    }`}
                  >
                    {frontText}
                  </div>

                  {showCurrentCardTransliteration && direction === "TH_DE" ? (
                    current.sourceType === "sentences" ||
                    current.sourceType === "sentences_important" ? (
                      current.sentenceSegments && current.sentenceSegments.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-2">
                          {current.sentenceSegments.map((segment, idx) => (
                            <div
                              key={`${current.id ?? "sentence"}-front-segment-${idx}-${segment.thai}`}
                              className="rounded-md border bg-muted/20 px-2 py-1 text-center"
                            >
                              <div className="text-xs leading-tight text-muted-foreground">
                                {segment.thai}
                              </div>
                              {segment.transliteration ? (
                                <div className="text-xs italic leading-tight">
                                  {segment.transliteration}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null
                    ) : current.transliteration ? (
                      <div className="text-center">
                        <div
                          className={`text-muted-foreground italic ${
                            isVocabSessionCard ? "text-base sm:text-lg" : "text-sm"
                          }`}
                        >
                          {current.transliteration}
                        </div>
                      </div>
                    ) : null
                  ) : null}

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className={`transition-all duration-150 ${
                        isVocabSessionCard
                          ? "h-10 border border-transparent bg-background text-foreground shadow-none hover:bg-muted"
                          : "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 bg-slate-400 hover:bg-slate-500 text-white"
                      }`}
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
                      className={`${
                        isVocabSessionCard
                          ? "w-full h-11 text-sm font-medium rounded-lg border transition-colors bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                          : "w-full h-12 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 bg-green-600 hover:bg-green-700 text-white"
                      }`}
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

                  <div
                    className={`font-semibold text-center leading-snug ${
                      isVocabSessionCard
                        ? backIsThai
                          ? "text-4xl sm:text-5xl"
                          : "text-2xl sm:text-3xl text-blue-600 dark:text-blue-400"
                        : "text-2xl sm:text-3xl"
                    }`}
                  >
                    {backText}
                  </div>

                  {showCurrentCardTransliteration && direction === "DE_TH" ? (
                    current.sourceType === "sentences" ||
                    current.sourceType === "sentences_important" ? (
                      current.sentenceSegments && current.sentenceSegments.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-2">
                          {current.sentenceSegments.map((segment, idx) => (
                            <div
                              key={`${current.id ?? "sentence"}-back-segment-${idx}-${segment.thai}`}
                              className="rounded-md border bg-muted/20 px-2 py-1 text-center"
                            >
                              <div className="text-xs leading-tight text-muted-foreground">
                                {segment.thai}
                              </div>
                              {segment.transliteration ? (
                                <div className="text-xs italic leading-tight">
                                  {segment.transliteration}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null
                    ) : current.transliteration ? (
                      <div className="text-center">
                        <div
                          className={`text-muted-foreground italic ${
                            isVocabSessionCard ? "text-base sm:text-lg" : "text-sm"
                          }`}
                        >
                          {current.transliteration}
                        </div>
                      </div>
                    ) : null
                  ) : null}

                  {showBackAudioButton ? (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className={`transition-all duration-150 ${
                          isVocabSessionCard
                            ? "h-10 border border-transparent bg-background text-foreground shadow-none hover:bg-muted"
                            : "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 bg-slate-400 hover:bg-slate-500 text-white"
                        }`}
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
                  ) : null}

                  {/* Beispiele (falls vorhanden) */}
                  {current.exampleThai || current.exampleGerman ? (
                    <>
                      <div className="border-t my-3" />
                      <div
                        className={`rounded-md border bg-muted/30 p-3 ${
                          isVocabSessionCard ? "text-base sm:text-lg space-y-3" : "text-xs space-y-2"
                        }`}
                      >
                        <div className="font-semibold text-muted-foreground">📝 Beispiele:</div>
                        
                        {current.exampleThai ? (
                          <div
                            className={
                              isVocabSessionCard
                                ? "grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-2 pt-1"
                                : "flex flex-wrap items-center justify-center gap-2"
                            }
                          >
                            <span
                              className={`text-muted-foreground ${
                                isVocabSessionCard ? "font-medium mt-0.5" : ""
                              }`}
                            >
                              TH:
                            </span>
                            <div className="flex items-end">
                              <span className="leading-relaxed break-words">{current.exampleThai}</span>
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
                                className={
                                  isVocabSessionCard ? "ml-4 h-8 w-8 self-end p-0 leading-none -mb-0.5" : ""
                                }
                              >
                                {isSpeaking && speakingKey === "example-th" ? "⏳" : "🔊"}
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {current.exampleGerman ? (
                          <div
                            className={
                              isVocabSessionCard
                                ? "grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-2"
                                : "flex flex-wrap items-center justify-center gap-2"
                            }
                          >
                            <span className={`text-muted-foreground ${isVocabSessionCard ? "font-medium" : ""}`}>
                              DE:
                            </span>
                            <div className="flex items-start">
                              <span className="leading-relaxed break-words">{current.exampleGerman}</span>
                              {showGermanExampleAudio ? (
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
                                  className={isVocabSessionCard ? "ml-4 -mt-0.5" : ""}
                                >
                                  {isSpeaking && speakingKey === "example-de" ? "⏳" : "🔊"}
                                </Button>
                              ) : null}
                            </div>
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
                  variant={isVocabSessionCard ? "outline" : "destructive"}
                  size="sm"
                  disabled={!flipped}
                  className={`h-11 flex-1 transition-colors ${
                    flipped
                      ? isVocabSessionCard
                        ? "rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                        : "shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 bg-red-600 hover:bg-red-700 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  }`}
                  aria-label="Antwort als falsch markieren"
                >
                  ❌ Falsch
                </Button>
                <Button
                  onClick={() => gradeAnswerHook(true)}
                  variant={isVocabSessionCard ? "outline" : "default"}
                  size="sm"
                  disabled={!flipped}
                  className={`h-11 flex-1 transition-colors ${
                    flipped
                      ? isVocabSessionCard
                        ? "rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                        : "shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 bg-green-600 hover:bg-green-700 text-white"
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
        onStart={() => {
          setSessionMode("vocab");
          startLessonFromDialogHook();
        }}
      />

      <Dialog open={sentenceModeDialogOpen} onOpenChange={setSentenceModeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>💬 Sätze testen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showTransliteration}
                onChange={(event) => setShowTransliteration(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Lautschrift unter Thai-Satz anzeigen
            </label>
            <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => {
                setSentenceModeDialogOpen(false);
                void openSentenceTestDialog();
              }}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              title="Satztest L1-L5 mit Filter starten"
            >
              💬 Satztest
            </Button>
            <Button
              onClick={() => {
                setSentenceModeDialogOpen(false);
                void startSentenceImportantTestDirect();
              }}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
              title="Wichtige Sätze direkt testen"
            >
              🧭 Wichtige Sätze testen
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sentenceDialogOpen} onOpenChange={setSentenceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>💬 Satztest konfigurieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showTransliteration}
                onChange={(event) => setShowTransliteration(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Lautschrift unter Thai-Satz anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sentenceIncludeViewed}
                onChange={(event) => setSentenceIncludeViewed(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Bereits gelernte Sätze einblenden
            </label>
            <div className="space-y-2">
              <div className="text-sm font-medium">Lektionen</div>
              <div className="flex flex-wrap gap-2">
                {sentenceLessonOptions.map((option) => (
                  <label
                    key={`sentence-test-lesson-${option.lesson}`}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                      option.enabled ? "" : "opacity-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(sentenceSelectedLessons[option.lesson])}
                      onChange={(event) =>
                        setSentenceSelectedLessons((prev) => ({
                          ...prev,
                          [option.lesson]: event.target.checked,
                        }))
                      }
                      disabled={!option.enabled}
                      className="h-4 w-4 accent-primary"
                    />
                    <span>
                      Lektion {option.lesson} ({option.unlockedCount}/{option.totalCount})
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="sentenceCardLimit">
                Anzahl Sätze (optional)
              </label>
              <input
                id="sentenceCardLimit"
                type="number"
                value={sentenceCardLimit}
                onChange={(event) => setSentenceCardLimit(event.target.value)}
                placeholder="Alle"
                min="1"
                max={sentenceDialogMaxCount > 0 ? sentenceDialogMaxCount : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Maximal: {sentenceDialogMaxCount} Satz/Saetze mit aktueller Auswahl
              </p>
            </div>
            <Button className="w-full" onClick={() => void startSentenceRegularTestFromDialog()}>
              Satztest starten
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog für Session-Aktionen */}
      <SessionActionConfirmDialog
        action={confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
      />
    </PageShell>
  );
}
