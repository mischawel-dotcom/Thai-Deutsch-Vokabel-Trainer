import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { ensureProgress, gradeCard } from "../db/srs";
import { speak, stopSpeak, listVoices, hasThaiVoice } from "../features/tts";

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
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [thaiVoiceInfo, setThaiVoiceInfo] = useState("");

  // Richtung (nur vor Session änderbar)
  const [direction, setDirection] = useState<LearnDirection>("TH_DE");

  // Filter
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [onlyDue, setOnlyDue] = useState(false);
  const [dueSet, setDueSet] = useState<Set<number>>(new Set());

  // Session
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  // SRS
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [doneIds, setDoneIds] = useState<Record<number, true>>({});

  const canGrade = flipped && currentId != null;

  /* ---------------- Persist Richtung ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("learnDirection");
    if (saved === "TH_DE" || saved === "DE_TH") {
      setDirection(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("learnDirection", direction);
  }, [direction]);

  /* ---------------- Daten ---------------- */

  useEffect(() => {
    void loadAllVocab();
  }, []);

  async function loadAllVocab() {
    setStatus("Lade Vokabeln …");
    try {
      const vocab = await db.vocab.toArray();
      for (const v of vocab) {
        if (v.id && !(await db.progress.get(v.id))) {
          await ensureProgress(v.id);
        }
      }
      setAllVocab(vocab);
      await refreshDueSet();
      setStatus(`Geladen: ${vocab.length} Einträge`);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  async function refreshDueSet() {
    const now = Date.now();
    const due = await db.progress.where("dueAt").belowOrEqual(now).toArray();
    setDueSet(new Set(due.map((p) => p.entryId)));
  }

  /* ---------------- Helpers ---------------- */

  const current = useMemo(
    () => allVocab.find((v) => v.id === currentId) ?? null,
    [allVocab, currentId]
  );

  const frontText = current
    ? direction === "TH_DE"
      ? current.thai
      : current.german
    : "";

  const backText = current
    ? direction === "TH_DE"
      ? current.german
      : current.thai
    : "";

  const frontLang = direction === "TH_DE" ? "th-TH" : "de-DE";
  const backLang = direction === "TH_DE" ? "de-DE" : "th-TH";

  function buildSessionIds() {
    return allVocab
      .filter(
        (v) =>
          v.id &&
          (!onlyDue || dueSet.has(v.id)) &&
          (selectedTags.length === 0 ||
            selectedTags.some((t) => (v.tags ?? []).includes(t)))
      )
      .map((v) => v.id!);
  }

  /* ---------------- Session ---------------- */

  function startSession() {
    const ids = shuffle(buildSessionIds());
    if (!ids.length) {
      setStatus("Keine passenden Karten.");
      return;
    }
    setSessionActive(true);
    setQueue(ids);
    setCurrentId(ids[0]);
    setFlipped(false);
    setStreaks(Object.fromEntries(ids.map((id) => [id, 0])));
    setDoneIds({});
  }

  function goNext() {
    const rest = queue.slice(1).filter((id) => !doneIds[id]);
    setQueue(rest);
    setCurrentId(rest[0] ?? null);
    setFlipped(false);
  }

  async function markWrong() {
    if (!currentId) return;
    await gradeCard(currentId, 0);
    setStreaks((s) => ({ ...s, [currentId]: 0 }));
    goNext();
  }

  async function markRight() {
    if (!currentId) return;
    await gradeCard(currentId, 2);
    const next = (streaks[currentId] ?? 0) + 1;
    setStreaks((s) => ({ ...s, [currentId]: next }));
    if (next >= 5) {
      setDoneIds((d) => ({ ...d, [currentId]: true }));
    }
    goNext();
  }

  /* ---------------- UI ---------------- */

  return (
    <PageShell title="Lernen">
      {!sessionActive && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Richtung:</span>

            <Button
              type="button"
              size="sm"
              variant={direction === "TH_DE" ? "secondary" : "outline"}
              onClick={() => setDirection("TH_DE")}
            >
              Thai → Deutsch
            </Button>

            <Button
              type="button"
              size="sm"
              variant={direction === "DE_TH" ? "secondary" : "outline"}
              onClick={() => setDirection("DE_TH")}
            >
              Deutsch → Thai
            </Button>
          </div>

          <Button onClick={startSession}>Session starten</Button>
        </Card>
      )}

      {sessionActive && current && (
        <Card
          className="mx-auto max-w-2xl p-10 text-center cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
        >
          {!flipped ? (
            <>
              <div className="text-6xl font-semibold">{frontText}</div>
              {direction === "TH_DE" && current.transliteration && (
                <div className="text-muted-foreground">
                  {current.transliteration}
                </div>
              )}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(frontText, frontLang);
                }}
              >
                🔊 Vorlesen
              </Button>
            </>
          ) : (
            <>
              <div className="text-4xl font-semibold">{backText}</div>
              {direction === "DE_TH" && current.transliteration && (
                <div className="text-muted-foreground">
                  {current.transliteration}
                </div>
              )}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(backText, backLang);
                }}
              >
                🔊 Vorlesen
              </Button>
            </>
          )}
        </Card>
      )}

      {sessionActive && (
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="destructive" onClick={markWrong} disabled={!canGrade}>
            Falsch
          </Button>
          <Button onClick={markRight} disabled={!canGrade}>
            Richtig
          </Button>
        </div>
      )}
    </PageShell>
  );
}