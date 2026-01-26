import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { ensureProgress, gradeCard } from "../db/srs";
import { speak, stopSpeak } from "../features/tts";

import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  a.sort(() => Math.random() - 0.5);
  return a;
}

type LearnDirection = "TH_DE" | "DE_TH";

export default function Learn() {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  // Thai voice hint state removed (unused)
  const [dailyLimit, setDailyLimit] = useState<number>(30);

  // Load daily limit from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyLimit");
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0) {
        setDailyLimit(num);
      }
    }
  }, []);

  // Richtung (während Session gesperrt)
  const [direction, setDirection] = useState<LearnDirection>("TH_DE");

  // Tag-Auswahl (OR-Logik)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Lektion-Auswahl
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>(undefined);

  // Nur fällige Karten
  const [onlyDue, setOnlyDue] = useState<boolean>(false);
  const [dueSet, setDueSet] = useState<Set<number>>(new Set());

  // Session-State
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<number[]>([]); // entryIds
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  // 5-in-a-row Logik
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [doneIds, setDoneIds] = useState<Record<number, true>>({});

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

  async function refreshDueSet() {
    const now = Date.now();
    const due = await db.progress.where("dueAt").belowOrEqual(now).toArray();
    setDueSet(new Set(due.map((p) => p.entryId)));
  }

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
      await refreshDueSet();

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

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function matchesLessonFilter(v: VocabEntry): boolean {
    if (selectedLesson === undefined) return true;
    return v.lesson === selectedLesson;
  }

  function clearSelectedTags() {
    setSelectedTags([]);
  }

  // OR-Logik: mindestens ein Tag muss passen
  function matchesTagFilter(v: VocabEntry): boolean {
    if (selectedTags.length === 0) return true;
    const tags = (v.tags ?? []).map((t) => t.trim()).filter(Boolean);
    return selectedTags.some((t) => tags.includes(t));
  }

  function matchesDueFilter(id: number): boolean {
    if (!onlyDue) return true;
    return dueSet.has(id);
  }

  function buildSessionIds(): number[] {
    const ids: number[] = [];
    for (const v of allVocab) {
      if (!v.id) continue;
      if (!matchesLessonFilter(v)) continue;
      if (!matchesTagFilter(v)) continue;
      if (!matchesDueFilter(v.id)) continue;
      ids.push(v.id);
    }
    // Begrenze fällige Karten auf Daily-Limit, damit "nur fällige" nicht alle 500 lädt
    if (onlyDue && dailyLimit > 0 && ids.length > dailyLimit) {
      return ids.slice(0, dailyLimit);
    }
    return ids;
  }

  // Berechne die Anzahl der verfügbaren Karten basierend auf Filtern
  const selectedCardsCount = buildSessionIds().length;
  const isOverLimit = selectedCardsCount > dailyLimit;

  function startSession() {
    const ids = buildSessionIds();

    if (ids.length === 0) {
      const filters = [];
      if (selectedTags.length > 0) filters.push("Tag-Auswahl");
      if (selectedLesson !== undefined) filters.push("Lektion-Auswahl");
      if (onlyDue) filters.push("(und fällig)");
      const msg = filters.length > 0 ? `Keine Karten passend zur ${filters.join(" ")}` : "Keine Karten vorhanden.";
      setStatus(msg);
      setSessionActive(false);
      setQueue([]);
      setCurrentId(null);
      setFlipped(false);
      setStreaks({});
      setDoneIds({});
      return;
    }

    const shuffled = shuffle(ids);

    setSessionActive(true);
    setQueue(shuffled);
    setCurrentId(shuffled[0] ?? null);
    setFlipped(false);

    setStreaks(Object.fromEntries(ids.map((id) => [id, 0])));
    setDoneIds({});

    setStatus(`Session gestartet: ${ids.length} Karte(n)`);
  }

  async function restartSessionConfirm() {
    const ok = confirm("Wollen Sie die Lern-Session neu starten?\n\nAlle Session-Zähler werden zurückgesetzt.");
    if (!ok) return;

    await refreshDueSet();
    startSession();
  }

  function goNext() {
    let rest = queue.slice(1);
    while (rest.length > 0 && doneIds[rest[0]]) rest = rest.slice(1);

    setQueue(rest);
    setCurrentId(rest[0] ?? null);
    setFlipped(false);
  }

  function requeueCurrentToEnd() {
    if (!currentId) return;
    const rest = queue.slice(1);

    if (!doneIds[currentId]) rest.push(currentId);

    while (rest.length > 0 && doneIds[rest[0]]) rest.shift();

    setQueue(rest);
    setCurrentId(rest[0] ?? null);
    setFlipped(false);
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
      goNext();
    } else {
      requeueCurrentToEnd();
    }
  }

  const finished = sessionActive && currentId == null;
  const cardStreak = current?.id ? Math.min(streaks[current.id] ?? 0, 5) : 0;
  const progressPct = Math.round((cardStreak / 5) * 100);

  return (
    <PageShell
      title="Lernen"
      description="Wie funktioniert Lernen? Karte umdrehen → bewerten. Richtig erhöht den Zähler, Falsch setzt ihn zurück. Bei 5× richtig in Folge ist die Karte erledigt."
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

      {/* Filter / Controls (nur wenn keine Session läuft) */}
      {!sessionActive ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={onlyDue}
                  onChange={(e) => setOnlyDue(e.target.checked)}
                />
                nur fällige Karten
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

              {/* Lektionen Buttons */}
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

              {/* Chips */}
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

            {isOverLimit && (
              <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ⚠️ <strong>Viele Karten:</strong> Du hast {selectedCardsCount} Karten ausgewählt, empfohlen sind max. {dailyLimit}.
                  <br />
                  <span className="text-xs opacity-90">Du kannst trotzdem alle lernen, aber kurze Sessions sind effizienter!</span>
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={startSession}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                🚀 Session starten ({selectedCardsCount} {selectedCardsCount === 1 ? "Karte" : "Karten"})
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
          Wähle Richtung + optional Lektion/Tags/„nur fällige Karten" und klicke auf <b>Session starten</b>.
        </p>
      ) : null}

      {/* Session-Controls (nur wenn Session läuft) */}
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
          {/* Top-Status */}
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

          {/* Fortschritt */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
                aria-label={`Fortschritt ${progressPct}%`}
              />
            </div>
          </div>

          {/* Flashcard (größer) */}
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

                {/* transliteration nur sinnvoll, wenn Thai vorne */}
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

                {/* transliteration nur sinnvoll, wenn Thai hinten */}
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

                {/* Beispiele (unverändert: TH + DE) */}
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

          {/* Bewertung */}
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
    </PageShell>
  );
}