import { useCallback } from "react";
import { db } from "../db/db";
import { gradeCard, gradeNumberCard } from "../db/srs";
import { recalculateLearningProgress } from "../lib/lessonProgress";
import type { VocabEntry } from "../db/db";
import type { SessionDispatch } from "./useSessionState";

type CardSourceType = "vocab" | "numbers" | "numbers_generated";
type GradingCard = VocabEntry & { sourceType?: CardSourceType };

interface UseCardGradingProps {
  dispatchSession: SessionDispatch;
  currentId: number | null;
  flipped: boolean;
  streaks: Map<number, number>;
  current: GradingCard | null;
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

      const sourceType: CardSourceType =
        current?.sourceType === "numbers"
          ? "numbers"
          : current?.sourceType === "numbers_generated"
            ? "numbers_generated"
            : "vocab";
      if (sourceType === "numbers") {
        await gradeNumberCard(currentId, isRight ? 2 : 0);
      } else if (sourceType === "vocab") {
        await gradeCard(currentId, isRight ? 2 : 0);
      }
      setLastAnswer(isRight ? "right" : "wrong");
      setTimeout(() => setLastAnswer(null), 350);
      playFeedbackTone(isRight ? "right" : "wrong");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(isRight ? 40 : 120);
        } catch {
          // ignore unsupported vibration failures
        }
      }

      if (!isRight) {
        // Falsch: nur Session-Streak zurücksetzen.
        // Das persistente SRS wurde bereits via gradeCard() aktualisiert.
        dispatchSession({ type: "resetStreak", id: currentId });
        requeueCurrentToEnd();
        return;
      }

      // Richtig: Streak erhöhen
      const nextStreak = (streaks.get(currentId) ?? 0) + 1;
      dispatchSession({ type: "updateStreak", id: currentId, value: nextStreak });

      if (nextStreak >= 5) {
        // 5x RICHTIG in dieser Session: Karte als erledigt markieren.
        // Das persistente SRS (dueAt/intervall/repetitions) kommt aus gradeCard().
        dispatchSession({ type: "addDone", id: currentId });
        if (sourceType === "numbers") {
          await db.numbersVocab.update(currentId, { viewed: true });
        } else if (sourceType === "vocab") {
          await db.vocab.update(currentId, { viewed: true });
        }

        if (sourceType === "vocab" && current && current.lesson) {
          const viewedCount = await db.vocab
            .where("lesson")
            .equals(current.lesson)
            .and((v) => v.viewed === true)
            .count();
          await recalculateLearningProgress(current.lesson, viewedCount);
        }
      }

      // Immer zur nächsten Karte im Durchgang
      goNext(nextStreak >= 5 ? currentId : undefined);
    },
    [currentId, flipped, streaks, current, playFeedbackTone, setLastAnswer, dispatchSession, requeueCurrentToEnd, goNext]
  );

  return { gradeAnswer };
}
