import { useCallback, useState } from "react";
import type { VocabEntry } from "../db/db";

type UseLearnLessonFlowArgs = {
  loadLesson: (lessonNum: number) => Promise<VocabEntry[]>;
  onStartSession: (cards: VocabEntry[]) => void;
  onStatus: (message: string) => void;
  onError: (message: string) => void;
};

export function useLearnLessonFlow({
  loadLesson,
  onStartSession,
  onStatus,
  onError,
}: UseLearnLessonFlowArgs) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [includeViewed, setIncludeViewed] = useState(false);
  const [cardLimit, setCardLimit] = useState<string>("");

  const openLessonDialog = useCallback((lesson: number) => {
    const rawDailyLimit = localStorage.getItem("dailyLimit");
    const parsedDailyLimit = rawDailyLimit ? parseInt(rawDailyLimit, 10) : 10;
    const validDailyLimit = !isNaN(parsedDailyLimit) && parsedDailyLimit > 0 ? parsedDailyLimit : 10;
    setSelectedLesson(lesson);
    setCardLimit(String(validDailyLimit));
    setIncludeViewed(false);
    setDialogOpen(true);
  }, []);

  const startSession = useCallback(async () => {
    try {
      let cards = await loadLesson(selectedLesson);
      if (!includeViewed) {
        cards = cards.filter((v) => !v.viewed);
      }
      cards.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      const limit = parseInt(cardLimit, 10);
      if (!isNaN(limit) && limit > 0) {
        cards = cards.slice(0, limit);
      }

      if (cards.length === 0) {
        onStatus(`Keine Karten in Lektion ${selectedLesson} vorhanden.`);
        setDialogOpen(false);
        return;
      }

      onStartSession(cards);
      onStatus(`Lektion ${selectedLesson}: ${cards.length} Karte(n)`);
      setDialogOpen(false);
    } catch {
      onError("Fehler beim Starten der Session");
    }
  }, [cardLimit, includeViewed, loadLesson, onError, onStartSession, onStatus, selectedLesson]);

  return {
    dialogOpen,
    setDialogOpen,
    selectedLesson,
    includeViewed,
    setIncludeViewed,
    cardLimit,
    setCardLimit,
    openLessonDialog,
    startSession,
  };
}
