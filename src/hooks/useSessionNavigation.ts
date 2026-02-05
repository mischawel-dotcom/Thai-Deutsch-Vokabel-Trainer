import { useCallback } from "react";

interface UseSessionNavigationProps {
  dispatchSession: (action: any) => void;
  roundIndex: number;
  doneIds: Set<number>;
  currentRound: number[];
  currentId: number | null;
  queue: number[];
}

/**
 * Shuffle-Utility für Array-Mischen (Fisher-Yates)
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
 * Hook für Session Navigation
 * Verwaltet Navigation zwischen Karten, Requeuing und Runden-Management
 */
export function useSessionNavigation({
  dispatchSession,
  roundIndex,
  doneIds,
  currentRound,
  currentId,
  queue,
}: UseSessionNavigationProps) {
  const goNext = useCallback(
    (treatedDoneId?: number) => {
      const effectiveDoneIds = treatedDoneId
        ? new Set(doneIds).add(treatedDoneId)
        : doneIds;

      // Gehe zur nächsten Karte in der aktuellen Runde
      const nextIndex = roundIndex + 1;

      // Suche nächste nicht-abgeschlossene Karte
      let searchIndex = nextIndex;
      while (
        searchIndex < currentRound.length &&
        effectiveDoneIds.has(currentRound[searchIndex])
      ) {
        searchIndex++;
      }

      if (searchIndex >= currentRound.length) {
        // Runde abgeschlossen - starte neue Runde
        startNewRound(effectiveDoneIds);
      } else {
        dispatchSession({
          type: "set",
          payload: {
            roundIndex: searchIndex,
            currentId: currentRound[searchIndex] ?? null,
            flipped: false,
          },
        });
      }
    },
    [roundIndex, doneIds, currentRound, dispatchSession]
  );

  const startNewRound = useCallback(
    (effectiveDoneIds: Set<number> = doneIds) => {
      // Sammle alle noch nicht abgeschlossenen Karten
      const remaining = queue.filter((id) => !effectiveDoneIds.has(id));

      if (remaining.length === 0) {
        // Session beendet
        dispatchSession({
          type: "set",
          payload: { currentId: null, flipped: false },
        });
        return;
      }

      // Mische für neue Runde
      const shuffled = shuffle(remaining);

      dispatchSession({
        type: "set",
        payload: {
          currentRound: shuffled,
          roundIndex: 0,
          currentId: shuffled[0] ?? null,
          flipped: false,
        },
      });
    },
    [queue, doneIds, dispatchSession]
  );

  const requeueCurrentToEnd = useCallback(() => {
    if (!currentId) return;

    // Verschiebe aktuelle Karte ans Ende der Runde
    const newRound = [...currentRound];
    const [removed] = newRound.splice(roundIndex, 1);
    newRound.push(removed);

    dispatchSession({ type: "set", payload: { currentRound: newRound } });

    // Zeige die Karte, die jetzt an der aktuellen Position ist
    // (da wir eine entfernt haben, rutscht die nächste nach)
    let searchIndex = roundIndex;
    while (searchIndex < newRound.length && doneIds.has(newRound[searchIndex])) {
      searchIndex++;
    }

    if (searchIndex >= newRound.length) {
      // Alle verbleibenden Karten dieser Runde sind done -> neue Runde
      startNewRound();
    } else {
      dispatchSession({
        type: "set",
        payload: {
          roundIndex: searchIndex,
          currentId: newRound[searchIndex] ?? null,
          flipped: false,
        },
      });
    }
  }, [currentId, currentRound, roundIndex, doneIds, dispatchSession, startNewRound]);

  return { goNext, startNewRound, requeueCurrentToEnd };
}
