import { useCallback } from "react";
import type { VocabEntry } from "../db/db";

interface UseSessionStartWithFiltersProps {
  dispatchSession: (action: any) => void;
  allVocab: VocabEntry[];
  loadAllVocab: () => Promise<void>;
  loadLesson: (lessonNumber: number) => Promise<VocabEntry[]>;
  setSelectedLesson: (lesson?: number) => void;
  setOnlyViewed: (val: boolean) => void;
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
 * Hook fuer Start-Session mit Filter (Lektion / Gelernt)
 */
export function useSessionStartWithFilters({
  dispatchSession,
  allVocab,
  loadAllVocab,
  loadLesson,
  setSelectedLesson,
  setOnlyViewed,
  setStatus,
}: UseSessionStartWithFiltersProps) {
  const startSessionWithFilters = useCallback(
    async (lesson?: number, viewedOnly: boolean = false) => {
      setSelectedLesson(lesson);
      setOnlyViewed(viewedOnly);

      let vocab: VocabEntry[];

      if (lesson !== undefined) {
        // Lazy load nur diese Lektion
        vocab = await loadLesson(lesson);
      } else {
        // Lade alle (nur wenn "Alle" gewaehlt)
        if (allVocab.length === 0) {
          await loadAllVocab();
        }
        vocab = allVocab;
      }

      const ids: number[] = [];
      for (const v of vocab) {
        if (!v.id) continue;
        if (viewedOnly && !v.viewed) continue;
        ids.push(v.id);
      }

      if (ids.length === 0) {
        setStatus("Keine Karten fuer diese Auswahl verfuegbar.");
        dispatchSession({
          type: "set",
          payload: {
            sessionActive: false,
            queue: [],
            currentId: null,
            flipped: false,
            streaks: new Map(),
            doneIds: new Set(),
            currentRound: [],
            roundIndex: 0,
          },
        });
        return;
      }

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

      setStatus(`Session gestartet: ${ids.length} Karte(n)`);
    },
    [
      dispatchSession,
      allVocab,
      loadAllVocab,
      loadLesson,
      setSelectedLesson,
      setOnlyViewed,
      setStatus,
    ]
  );

  return { startSessionWithFilters };
}
