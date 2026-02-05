import { useCallback } from "react";

interface UseStartLessonFromDialogProps {
  selectedDialogLesson: number | null;
  cardLimit: string;
  loadLesson: (lessonNumber: number) => Promise<any[]>;
  dispatchSession: (action: any) => void;
  setStatus: (msg: string) => void;
  setDialogOpen: (open: boolean) => void;
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
 * Hook fuer Lektion-Start aus Dialog
 */
export function useStartLessonFromDialog({
  selectedDialogLesson,
  cardLimit,
  loadLesson,
  dispatchSession,
  setStatus,
  setDialogOpen,
}: UseStartLessonFromDialogProps) {
  const startLessonFromDialog = useCallback(
    async () => {
      if (!selectedDialogLesson) return;

      const limit = cardLimit ? parseInt(cardLimit, 10) : 0;

      // Lade Lektion on-demand
      const lessonCards = await loadLesson(selectedDialogLesson);

      let cardsToUse = lessonCards.filter((v) => v.id).map((v) => v.id!);

      // Limitiere auf gewuenschte Anzahl
      if (limit > 0 && limit < cardsToUse.length) {
        cardsToUse = shuffle(cardsToUse).slice(0, limit);
      }

      if (cardsToUse.length === 0) {
        setStatus(`Keine Karten in Lektion ${selectedDialogLesson} verfuegbar.`);
        setDialogOpen(false);
        return;
      }

      const shuffled = shuffle(cardsToUse);

      dispatchSession({
        type: "set",
        payload: {
          sessionActive: true,
          queue: cardsToUse,
          currentRound: shuffled,
          roundIndex: 0,
          currentId: shuffled[0] ?? null,
          flipped: false,
          streaks: new Map(cardsToUse.map((id) => [id, 0])),
          doneIds: new Set(),
        },
      });
      setStatus(
        `Session gestartet: ${cardsToUse.length} Karte(n) aus Lektion ${selectedDialogLesson}`
      );

      setDialogOpen(false);
    },
    [
      selectedDialogLesson,
      cardLimit,
      loadLesson,
      dispatchSession,
      setStatus,
      setDialogOpen,
    ]
  );

  return { startLessonFromDialog };
}
