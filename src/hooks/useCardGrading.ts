import { useCallback } from "react";
import { db } from "../db/db";
import { gradeCard } from "../db/srs";
import { recalculateLearningProgress } from "../lib/lessonProgress";
import type { VocabEntry } from "../db/db";

interface UseCardGradingProps {
  dispatchSession: (action: any) => void;
  currentId: number | null;
  flipped: boolean;
  streaks: Map<number, number>;
  current: VocabEntry | null;
  playFeedbackTone: (tone: "right" | "wrong") => void;
  setLastAnswer: (answer: "right" | "wrong" | null) => void;
  requeueCurrentToEnd: () => void;
  goNext: (treatedDoneId?: number) => void;
}

/**
 * Hook für Card Grading Logik
 * Verwaltet die Bewertung von Antworten und SRS Updates
 */
export function useCardGrading({
  dispatchSession,
  currentId,
  flipped,
  streaks,
  current,
  playFeedbackTone,
  setLastAnswer,
  requeueCurrentToEnd,
  goNext,
}: UseCardGradingProps) {
  const gradeAnswer = useCallback(
    async (isRight: boolean) => {
      if (!currentId) return;

      if (!flipped) {
        alert("Bitte erst die Karte umdrehen, dann bewerten.");
        return;
      }

      await gradeCard(currentId, isRight ? 2 : 0);
      setLastAnswer(isRight ? "right" : "wrong");
      setTimeout(() => setLastAnswer(null), 350);
      playFeedbackTone(isRight ? "right" : "wrong");

      if (!isRight) {
        // Falsch: Streak zurücksetzen, dueAt auf jetzt setzen
        const now = Date.now();
        await db.progress.update(currentId, {
          dueAt: now,
          intervalDays: 0,
          updatedAt: now,
        });
        dispatchSession({ type: "resetStreak", id: currentId });
        requeueCurrentToEnd();
        return;
      }

      // Richtig: Streak erhöhen
      const nextStreak = (streaks.get(currentId) ?? 0) + 1;
      dispatchSession({ type: "updateStreak", id: currentId, value: nextStreak });

      if (nextStreak < 5) {
        // Noch nicht 5x: dueAt auf jetzt setzen
        const now = Date.now();
        await db.progress.update(currentId, {
          dueAt: now,
          intervalDays: 0,
          updatedAt: now,
        });
      } else {
        // 5x RICHTIG: Markiere als erledigt + set dueAt to tomorrow
        dispatchSession({ type: "addDone", id: currentId });

        const now = Date.now();
        const tomorrow = now + 24 * 60 * 60 * 1000;

        // Update SRS: Setze viewed=true + dueAt tomorrow
        await db.progress.update(currentId, {
          dueAt: tomorrow,
          intervalDays: 1,
          updatedAt: now,
        });
        await db.vocab.update(currentId, { viewed: true });

        if (current && current.lesson) {
          const viewedCount = await db.vocab
            .where("lesson")
            .equals(current.lesson)
            .and((v) => v.viewed === true)
            .count();
          recalculateLearningProgress(current.lesson, viewedCount);
        }
      }

      // Immer zur nächsten Karte im Durchgang
      goNext(nextStreak >= 5 ? currentId : undefined);
    },
    [currentId, flipped, streaks, current, playFeedbackTone, setLastAnswer, dispatchSession, requeueCurrentToEnd, goNext]
  );

  return { gradeAnswer };
}
