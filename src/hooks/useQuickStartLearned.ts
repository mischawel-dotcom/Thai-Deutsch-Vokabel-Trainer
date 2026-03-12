import { useCallback } from "react";
import { db } from "../db/db";
import { ensureProgressForEntries } from "../db/srs";
import type { VocabEntry } from "../db/db";
import { shuffle } from "../lib/shuffle";
import type { SessionDispatch } from "./useSessionState";
import {
  buildQuickStartSessionPayload,
  filterDueOrUnfinishedLearnedIds,
  normalizeOptionalLimit,
} from "./quickStartShared";

interface UseQuickStartLearnedProps {
  dispatchSession: SessionDispatch;
  setAllVocab: (vocab: VocabEntry[]) => void;
  setStatus: (msg: string) => void;
}

interface QuickStartLearnedOptions {
  includeAllLearned?: boolean;
  limit?: number;
}

/**
 * Hook fuer Quick-Start mit gelernten Karten.
 * Standard: nur faellige gelernte Karten (SRS-orientiert).
 */
export function useQuickStartLearned({
  dispatchSession,
  setAllVocab,
  setStatus,
}: UseQuickStartLearnedProps) {
  const quickStartLearned = useCallback(
    async (options?: QuickStartLearnedOptions) => {
      // Lade alle Vokabeln direkt aus der DB
      const vocab = await db.vocab.toArray();
      const includeAllLearned = options?.includeAllLearned ?? false;
      const limit = normalizeOptionalLimit(options?.limit);

      // Ensure progress fuer alle
      const idsToEnsure = vocab
        .map((v) => v.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(idsToEnsure);

      // Filtere auf gelernt (viewed=true)
      const learnedIds = vocab
        .filter((v) => v.viewed === true && typeof v.id === "number")
        .map((v) => v.id as number);

      // Standard: nur faellige gelernte Karten (dueAt <= now)
      let ids = learnedIds;
      if (!includeAllLearned) {
        ids = await filterDueOrUnfinishedLearnedIds(learnedIds, "progress");
      }

      if (ids.length === 0) {
        setStatus(
          includeAllLearned
            ? "Keine gelernten Karten verfuegbar. Lerne zuerst Karten auf der Seite 'Lernen'."
            : "Keine passenden gelernten Karten verfuegbar (faellig oder <5x richtig). Lerne zuerst Karten auf der Seite 'Lernen' oder aktiviere optional 'Alle gelernten Karten'."
        );
        return;
      }

      // Update allVocab damit current die Karten finden kann
      setAllVocab(vocab);

      const shuffledPool = shuffle(ids);
      const cardsToUse = limit ? shuffledPool.slice(0, limit) : shuffledPool;

      dispatchSession({
        type: "set",
        payload: buildQuickStartSessionPayload(cardsToUse),
      });

      const modeLabel = includeAllLearned
        ? "gelernte Karten"
        : "faellige oder noch nicht 5x richtige Karten";
      setStatus(`Session gestartet: ${cardsToUse.length} ${modeLabel}`);
    },
    [dispatchSession, setAllVocab, setStatus]
  );

  return { quickStartLearned };
}
