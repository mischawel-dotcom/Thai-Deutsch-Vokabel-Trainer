import { useCallback } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import type { SessionDispatch } from "./useSessionState";

interface UseSessionStartProps {
  dispatchSession: SessionDispatch;
  allVocab: VocabEntry[];
  loadAllVocab: () => Promise<void>;
  buildSessionIds: () => number[];
  cardLimitAdvanced: string;
  selectedTags: string[];
  selectedLesson: number | undefined;
  onlyViewed: boolean;
  onlyDue: boolean;
  setStatus: (msg: string) => void;
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
 * Hook für Session-Start Logik
 * Verwaltet das Starten von Test-Sessions mit Filter
 */
export function useSessionStart({
  dispatchSession,
  allVocab,
  loadAllVocab,
  buildSessionIds,
  cardLimitAdvanced,
  selectedTags,
  selectedLesson,
  onlyViewed,
  onlyDue,
  setStatus,
}: UseSessionStartProps) {
  const startSession = useCallback(
    async () => {
      // Für erweiterte Filter: Lade alle Vokabeln falls noch nicht geladen
      if (allVocab.length === 0) {
        await loadAllVocab();
      }

      const ids = buildSessionIds();
      let idsAfterDueFilter = ids;

      if (onlyDue) {
        const dueProgress = await db.progress.where("dueAt").belowOrEqual(Date.now()).toArray();
        const dueIds = new Set(
          dueProgress
            .map((p) => p.entryId)
            .filter((id): id is number => typeof id === "number")
        );
        idsAfterDueFilter = ids.filter((id) => dueIds.has(id));
      }

      if (idsAfterDueFilter.length === 0) {
        const filters = [];
        if (selectedTags.length > 0) filters.push("Tag-Auswahl");
        if (selectedLesson !== undefined) filters.push("Lektion-Auswahl");
        if (onlyViewed) filters.push("(und gelernt)");
        if (onlyDue) filters.push("(und fällig)");
        const msg = filters.length > 0 ? `Keine Karten passend zur ${filters.join(" ")}` : "Keine Karten vorhanden.";
        setStatus(msg);
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

      // Limitiere auf gewünschte Anzahl
      const limit = cardLimitAdvanced ? parseInt(cardLimitAdvanced, 10) : 0;
      let cardsToUse = idsAfterDueFilter;

      if (limit > 0 && limit < idsAfterDueFilter.length) {
        cardsToUse = shuffle(idsAfterDueFilter).slice(0, limit);
      } else if (limit > idsAfterDueFilter.length) {
        setStatus(`⚠️ Nur ${idsAfterDueFilter.length} Karten verfügbar, nicht ${limit}`);
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

      setStatus(`Session gestartet: ${cardsToUse.length} Karte(n)`);
    },
    [
      dispatchSession,
      allVocab,
      loadAllVocab,
      buildSessionIds,
      cardLimitAdvanced,
      selectedTags,
      selectedLesson,
      onlyViewed,
      onlyDue,
      setStatus,
    ]
  );

  return { startSession };
}
