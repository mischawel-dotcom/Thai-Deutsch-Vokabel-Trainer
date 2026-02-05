import { useCallback } from "react";
import { db } from "../db/db";
import { ensureProgress } from "../db/srs";
import type { VocabEntry } from "../db/db";

interface UseQuickStartLearnedProps {
  dispatchSession: (action: any) => void;
  setAllVocab: (vocab: VocabEntry[]) => void;
  setStatus: (msg: string) => void;
}

/**
 * Shuffle-Utility fuer Array-Mischen (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
      for (const v of vocab) {
        if (v.id) {
          await ensureProgress(v.id);
        }
      }

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
