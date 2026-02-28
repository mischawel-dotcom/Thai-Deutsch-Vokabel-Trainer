import { useCallback } from "react";
import { db } from "../db/db";
import { ensureProgressForEntries } from "../db/srs";
import type { VocabEntry } from "../db/db";
import { shuffle } from "../lib/shuffle";
import type { SessionDispatch } from "./useSessionState";

interface UseQuickStartLearnedProps {
  dispatchSession: SessionDispatch;
  setAllVocab: (vocab: VocabEntry[]) => void;
  setStatus: (msg: string) => void;
}

/**
 * Hook fuer Quick-Start mit allen gelernten Karten
 */
export function useQuickStartLearned({
  dispatchSession,
  setAllVocab,
  setStatus,
}: UseQuickStartLearnedProps) {
  const quickStartLearned = useCallback(
    async () => {
      // Lade alle Vokabeln direkt aus der DB
      const vocab = await db.vocab.toArray();

      // Ensure progress fuer alle
      const idsToEnsure = vocab
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(idsToEnsure);

      // Filtere auf viewed = true
      const ids = vocab.filter((v) => v.viewed === true && v.id).map((v) => v.id!);

      if (ids.length === 0) {
        setStatus("Keine gelernten Karten verfuegbar.");
        return;
      }

      // Update allVocab damit current die Karten finden kann
      setAllVocab(vocab);

      const shuffled = shuffle(ids);

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

      setStatus(`Session gestartet: ${ids.length} gelernte Karte(n)`);
    },
    [dispatchSession, setAllVocab, setStatus]
  );

  return { quickStartLearned };
}
