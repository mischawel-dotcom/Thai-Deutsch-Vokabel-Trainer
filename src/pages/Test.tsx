import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { ensureProgress, gradeCard } from "../db/srs";
import { speak, stopSpeak } from "../features/tts";
import { getNextLesson, recalculateLearningProgress } from "../lib/lessonProgress";

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

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  // Fisher-Yates Shuffle für echtes Mischen
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type LearnDirection = "TH_DE" | "DE_TH";

export default function Test() {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
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

  // Dialog für Lektion-Auswahl
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedDialogLesson, setSelectedDialogLesson] = useState<number | null>(null);
  const [cardLimit, setCardLimit] = useState<string>("");
  const [cardLimitAdvanced, setCardLimitAdvanced] = useState<string>("");

  // Session-State
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  // 5-in-a-row Logik (Durchgang-basiert)
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [doneIds, setDoneIds] = useState<Record<number, true>>({});
  const [currentRound, setCurrentRound] = useState<number[]>([]); // Aktuelle Runde
  const [roundIndex, setRoundIndex] = useState<number>(0); // Position in der Runde

  const canGrade = flipped && currentId != null;

  // Persist direction
  useEffect(() => {
    const saved = localStorage.getItem("learnDirection");
    if (saved === "TH_DE" || saved === "DE_TH") setDirection(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("learnDirection", direction);
  }, [direction]);

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

  const current = useMemo(() => {
    if (!currentId) return null;
    return allVocab.find((v) => v.id === currentId) ?? null;
  }, [allVocab, currentId]);

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

  const remainingUniqueCount = useMemo(() => {
    const unique = new Set(queue);
    let c = 0;
    unique.forEach((id) => {
      if (!doneIds[id]) c++;
    });
    return c;
  }, [queue, doneIds]);

  const completedCount = useMemo(() => Object.keys(doneIds).length, [doneIds]);

  async function loadAllVocab() {
    setError("");
    setStatus("Lade Vokabeln …");
    try {
      const vocab = await db.vocab.toArray();

      // Ensure progress exists (für SRS + gradeCard)
      for (const v of vocab) {
        if (v.id && !(await db.progress.get(v.id))) {
          await ensureProgress(v.id);
        }
      }

      setAllVocab(vocab);

      setStatus(vocab.length ? `Geladen: ${vocab.length} Einträge` : "Keine Einträge vorhanden.");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  useEffect(() => {
    loadAllVocab().then(() => {
      // Check if user came from Home with a lesson selected
      const selectedLesson = localStorage.getItem("selectedLessonForTest");
      if (selectedLesson) {
        const lesson = parseInt(selectedLesson, 10);
        if (!isNaN(lesson) && [1, 2, 3, 4, 5].includes(lesson)) {
          setSelectedLesson(lesson);
          setTimeout(() => {
            startSessionWithFilters(lesson, false);
            setSessionActive(true);
          }, 0);
          localStorage.removeItem("selectedLessonForTest");
        }
      }
    });
  }, []);

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

  // Helper: Start session with learned cards
  function startSessionWithFilters(lesson?: number, viewedOnly: boolean = false) {
    setSelectedLesson(lesson);
    setOnlyViewed(viewedOnly);

    const ids: number[] = [];
    for (const v of allVocab) {
      if (!v.id) continue;
      if (lesson !== undefined && v.lesson !== lesson) continue;
      if (viewedOnly && !v.viewed) continue;
      ids.push(v.id);
    }

    if (ids.length === 0) {
      setStatus("Keine Karten für diese Auswahl verfügbar.");
      setSessionActive(false);
      setQueue([]);
      setCurrentId(null);
      setFlipped(false);
      setStreaks({});
      setDoneIds({});
      setCurrentRound([]);
      setRoundIndex(0);
      return;
    }

    const shuffled = shuffle(ids);

    setSessionActive(true);
    setQueue(ids); // Komplette Liste
    setCurrentRound(shuffled); // Erste Runde gemischt
    setRoundIndex(0);
    setCurrentId(shuffled[0] ?? null);
    setFlipped(false);

    setStreaks(Object.fromEntries(ids.map((id) => [id, 0])));
    setDoneIds({});

    setStatus(`Session gestartet: ${ids.length} Karte(n)`);
  }

  // Quick-Start: Learned cards
  function quickStartLearned() {
    const nextLesson = getNextLesson();
    if (nextLesson !== null) {
      startSessionWithFilters(nextLesson, true);
    } else {
      startSessionWithFilters(1, true);
    }
  }

  // Quick-Start: Specific lesson, learned cards only
  function openLessonDialog(lesson: number) {
    setSelectedDialogLesson(lesson);
    setCardLimit("");
    setDialogOpen(true);
  }

  function startLessonFromDialog() {
    if (!selectedDialogLesson) return;
    
    const limit = cardLimit ? parseInt(cardLimit, 10) : 0;
    
    // Hole alle Karten dieser Lektion (unabhängig vom viewed-Status)
    const lessonCards = allVocab.filter(
      (v) => v.id && v.lesson === selectedDialogLesson
    );
    
    let cardsToUse = lessonCards.map((v) => v.id!);
    
    // Limitiere auf gewünschte Anzahl
    if (limit > 0 && limit < cardsToUse.length) {
      cardsToUse = shuffle(cardsToUse).slice(0, limit);
    }
    
    if (cardsToUse.length === 0) {
      setStatus(`Keine gelernten Karten in Lektion ${selectedDialogLesson} verfügbar.`);
      setDialogOpen(false);
      return;
    }
    
    const shuffled = shuffle(cardsToUse);
    
    setSessionActive(true);
    setQueue(cardsToUse);
    setCurrentRound(shuffled);
    setRoundIndex(0);
    setCurrentId(shuffled[0] ?? null);
    setFlipped(false);
    setStreaks(Object.fromEntries(cardsToUse.map((id) => [id, 0])));
    setDoneIds({});
    setStatus(`Session gestartet: ${cardsToUse.length} Karte(n) aus Lektion ${selectedDialogLesson}`);
    
    setDialogOpen(false);
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
    if (!onlyViewed) return true;
    return v.viewed === true;
  }

  function clearSelectedTags() {
    setSelectedTags([]);
  }

  const selectedCardsCount = useMemo(() => {
    return buildSessionIds().length;
  }, [allVocab, selectedLesson, selectedTags, onlyViewed]);

  async function restartSessionConfirm() {
    const ok = confirm("Wollen Sie die Test-Session neu starten?\n\nAlle Session-Zähler werden zurückgesetzt.");
    if (!ok) return;

    startSession();
  }

  function goNext() {
    // Gehe zur nächsten Karte in der aktuellen Runde
    const nextIndex = roundIndex + 1;
    
    // Suche nächste nicht-abgeschlossene Karte
    let searchIndex = nextIndex;
    while (searchIndex < currentRound.length && doneIds[currentRound[searchIndex]]) {
      searchIndex++;
    }

    if (searchIndex >= currentRound.length) {
      // Runde abgeschlossen - starte neue Runde
      startNewRound();
    } else {
      setRoundIndex(searchIndex);
      setCurrentId(currentRound[searchIndex] ?? null);
      setFlipped(false);
    }
  }

  function startNewRound() {
    // Sammle alle noch nicht abgeschlossenen Karten
    const remaining = queue.filter(id => !doneIds[id]);
    
    if (remaining.length === 0) {
      // Session beendet
      setCurrentId(null);
      setFlipped(false);
      return;
    }

    // Mische für neue Runde
    const shuffled = shuffle(remaining);
    
    setCurrentRound(shuffled);
    setRoundIndex(0);
    setCurrentId(shuffled[0] ?? null);
    setFlipped(false);
  }

  function requeueCurrentToEnd() {
    if (!currentId) return;
    
    // Verschiebe aktuelle Karte ans Ende der Runde
    const newRound = [...currentRound];
    const [removed] = newRound.splice(roundIndex, 1);
    newRound.push(removed);
    
    setCurrentRound(newRound);
    
    // Zeige die Karte, die jetzt an der aktuellen Position ist
    // (da wir eine entfernt haben, rutscht die nächste nach)
    let searchIndex = roundIndex;
    while (searchIndex < newRound.length && doneIds[newRound[searchIndex]]) {
      searchIndex++;
    }
    
    if (searchIndex >= newRound.length) {
      // Alle verbleibenden Karten dieser Runde sind done -> neue Runde
      startNewRound();
    } else {
      setRoundIndex(searchIndex);
      setCurrentId(newRound[searchIndex] ?? null);
      setFlipped(false);
    }
  }

  async function markWrong() {
    if (!canGrade || !currentId) return;

    await gradeCard(currentId, 0);
    setStreaks((prev) => ({ ...prev, [currentId]: 0 }));
    requeueCurrentToEnd();
  }

  async function markRight() {
    if (!canGrade || !currentId) return;

    await gradeCard(currentId, 2);

    const nextStreak = (streaks[currentId] ?? 0) + 1;
    setStreaks((prev) => ({ ...prev, [currentId]: nextStreak }));

    if (nextStreak >= 5) {
      setDoneIds((prev) => ({ ...prev, [currentId]: true }));
      
      const card = allVocab.find((v) => v.id === currentId);
      if (card && card.lesson) {
        // Markiere Karte als "viewed" und berechne Fortschritt neu
        await db.vocab.update(currentId, { viewed: true });
        
        // Berechne neu: Wie viele Karten in dieser Lektion haben viewed=true?
        const viewedCards = await db.vocab
          .where("lesson")
          .equals(card.lesson)
          .and((v) => v.viewed === true)
          .count();
        
        // Setze Fortschritt basierend auf echten gelernten Karten
        recalculateLearningProgress(card.lesson, viewedCards);
      }
    }
    
    // Immer zur nächsten Karte im Durchgang (egal ob 5/5 oder nicht)
    goNext();
  }

  function startSession() {
    const ids = buildSessionIds();

    if (ids.length === 0) {
      const filters = [];
      if (selectedTags.length > 0) filters.push("Tag-Auswahl");
      if (selectedLesson !== undefined) filters.push("Lektion-Auswahl");
      if (onlyViewed) filters.push("(und gelernt)");
      const msg = filters.length > 0 ? `Keine Karten passend zur ${filters.join(" ")}` : "Keine Karten vorhanden.";
      setStatus(msg);
      setSessionActive(false);
      setQueue([]);
      setCurrentId(null);
      setFlipped(false);
      setStreaks({});
      setDoneIds({});
      setCurrentRound([]);
      setRoundIndex(0);
      return;
    }

    // Limitiere auf gewünschte Anzahl
    const limit = cardLimitAdvanced ? parseInt(cardLimitAdvanced, 10) : 0;
    let cardsToUse = ids;
    
    if (limit > 0 && limit < ids.length) {
      cardsToUse = shuffle(ids).slice(0, limit);
    } else if (limit > ids.length) {
      setStatus(`⚠️ Nur ${ids.length} Karten verfügbar, nicht ${limit}`);
      return;
    }

    const shuffled = shuffle(cardsToUse);

    setSessionActive(true);
    setQueue(cardsToUse); // Komplette Liste aller Karten
    setCurrentRound(shuffled); // Erste Runde gemischt
    setRoundIndex(0);
    setCurrentId(shuffled[0] ?? null);
    setFlipped(false);

    setStreaks(Object.fromEntries(cardsToUse.map((id) => [id, 0])));
    setDoneIds({});

    setStatus(`Session gestartet: ${cardsToUse.length} Karte(n)`);
  }

  const finished = sessionActive && currentId == null;
  const cardStreak = current?.id ? Math.min(streaks[current.id] ?? 0, 5) : 0;
  const progressPct = Math.round((cardStreak / 5) * 100);

  return (
    <PageShell
      title="Tests"
      description="Teste dein Wissen! Karte umdrehen → bewerten. Richtig erhöht den Zähler, Falsch setzt ihn zurück. Bei 5× richtig in Folge ist die Karte erledigt."
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

      {/* QUICK-START BUTTONS */}
      {!sessionActive ? (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">🚀 Schnellstart:</div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={quickStartLearned}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              title="Teste die Karten, die du bereits gelernt hast"
            >
              📖 Teste gelernte Karten (empfohlen)
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
                  >
                    L{lesson} <span className="text-xs opacity-75">({count})</span>
                  </Button>
                ))
              ) : null}
            </div>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {showAdvancedFilters ? "⬆️" : "⬇️"} Erweiterte Filter {showAdvancedFilters ? "ausblenden" : "anzeigen"}
          </button>
        </div>
      ) : null}

      {/* Filter / Controls */}
      {!sessionActive && showAdvancedFilters ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyViewed}
                  onChange={(e) => setOnlyViewed(e.target.checked)}
                />
                nur gesehene Karten
              </label>

              {/* Richtung */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Richtung:</span>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === "TH_DE" ? "secondary" : "outline"}
                  onClick={() => setDirection("TH_DE")}
                  title="Thai → Deutsch"
                >
                  Thai → Deutsch
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === "DE_TH" ? "secondary" : "outline"}
                  onClick={() => setDirection("DE_TH")}
                  title="Deutsch → Thai"
                >
                  Deutsch → Thai
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Lektionen auswählen:</div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedLesson === undefined ? "secondary" : "outline"}
                  onClick={() => setSelectedLesson(undefined)}
                  className="h-8"
                >
                  Alle
                </Button>
                {allLessons.map(({ lesson, count }) => (
                  <Button
                    key={lesson}
                    type="button"
                    size="sm"
                    variant={selectedLesson === lesson ? "secondary" : "outline"}
                    onClick={() => setSelectedLesson(lesson)}
                    className="h-8"
                    title={`Lektion ${lesson}`}
                  >
                    L{lesson} <span className="text-muted-foreground">({count})</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Tags auswählen:</div>

              <div className="flex flex-wrap gap-2">
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
                        variant={selected ? "secondary" : "outline"}
                        onClick={() => toggleTag(tag)}
                        className="h-8 rounded-full px-3"
                        title="Klicken zum Filtern"
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
              <label className="text-sm font-medium">Anzahl Karten (optional)</label>
              <input
                type="number"
                value={cardLimitAdvanced}
                onChange={(e) => setCardLimitAdvanced(e.target.value)}
                placeholder={`Alle (${selectedCardsCount} verfügbar)`}
                min="1"
                max={selectedCardsCount}
                className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Leer lassen für alle verfügbaren Karten ({selectedCardsCount})
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={startSession}
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
        <p className="text-center text-sm text-muted-foreground">
          Wähle Richtung + optional Lektion/Tags/Filter und klicke auf <b>Session starten</b>.
        </p>
      ) : null}

      {/* Session-Controls */}
      {sessionActive && !finished ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={restartSessionConfirm}>
            Session neu starten
          </Button>
        </div>
      ) : null}

      {/* Karte */}
      {!finished && sessionActive && current && current.id ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>
              Verbleibend: <b className="text-foreground">{remainingUniqueCount}</b>
            </span>
            <span>·</span>
            <span>
              Erledigt: <b className="text-foreground">{completedCount}</b>
            </span>
            <span>·</span>
            <span>
              Diese Karte: <b className="text-foreground">{cardStreak}/5</b>
            </span>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
                aria-label={`Fortschritt ${progressPct}%`}
              />
            </div>
          </div>

          <Card
            className="mx-auto max-w-2xl cursor-pointer select-none p-10 text-center shadow-lg hover:shadow-xl transition-shadow hover:bg-secondary/30"
            onClick={() => setFlipped((f) => !f)}
            role="button"
            aria-label="Karte umdrehen"
            title="Klicken zum Umdrehen"
          >
            {!flipped ? (
              <div className="space-y-6">
                <div className="text-6xl font-semibold leading-tight">{frontText}</div>

                {direction === "TH_DE" && current.transliteration ? (
                  <div className="text-base text-muted-foreground">{current.transliteration}</div>
                ) : null}

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      void speak(frontText, frontLang);
                    }}
                    title="Vorlesen"
                  >
                    🔊 Vorlesen
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      stopSpeak();
                    }}
                    title="Stop"
                  >
                    Stop
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-primary animate-pulse">👇 Klick zum Umdrehen</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl font-semibold leading-snug">{backText}</div>

                {direction === "DE_TH" && current.transliteration ? (
                  <div className="text-base text-muted-foreground">{current.transliteration}</div>
                ) : null}

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      void speak(backText, backLang);
                    }}
                    title="Vorlesen"
                  >
                    🔊 Vorlesen
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      stopSpeak();
                    }}
                    title="Stop"
                  >
                    Stop
                  </Button>
                </div>

                {current.exampleThai || current.exampleGerman ? (
                  <div className="space-y-2 rounded-md border bg-muted/30 p-4 text-sm">
                    {current.exampleThai ? (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-muted-foreground">TH:</span>
                        <span>{current.exampleThai}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            void speak(current.exampleThai!, "th-TH");
                          }}
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
                          onClick={(ev) => {
                            ev.stopPropagation();
                            void speak(current.exampleGerman!, "de-DE");
                          }}
                          title="Beispiel Deutsch vorlesen"
                        >
                          🔊
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="text-xs text-muted-foreground">Klicken zum Zurückdrehen</div>
              </div>
            )}
          </Card>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="destructive"
              onClick={markWrong}
              disabled={!canGrade}
              title={!canGrade ? "Bitte zuerst umdrehen" : "Setzt den 5er-Zähler dieser Karte auf 0"}
              className="px-8"
            >
              ❌ Falsch
            </Button>

            <Button
              onClick={markRight}
              disabled={!canGrade}
              title={!canGrade ? "Bitte zuerst umdrehen" : "Erhöht den 5er-Zähler dieser Karte um 1"}
              className="px-8"
            >
              ✅ Richtig
            </Button>
          </div>

          {!canGrade ? (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 text-center">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                ⬆️ Bitte erst die Karte umdrehen, dann bewerten.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Dialog für Lektion-Auswahl */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lektion {selectedDialogLesson} testen</DialogTitle>
            <DialogDescription>
              Wähle, wie viele Karten du testen möchtest.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Anzahl Karten (optional)</label>
              <input
                type="number"
                value={cardLimit}
                onChange={(e) => setCardLimit(e.target.value)}
                placeholder="Alle Karten"
                min="1"
                className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Leer lassen für alle gelernten Karten
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={startLessonFromDialog}>
              Test starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
