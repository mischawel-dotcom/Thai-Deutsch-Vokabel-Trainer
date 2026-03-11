import { useCallback } from "react";
import { db } from "../db/db";
import { shuffle } from "../lib/shuffle";
import type { SessionDispatch } from "./useSessionState";
import type { TestCard } from "../features/test/types";
import {
  buildGeneratedNumberTestCards,
  mapNumberEntryToTestCard,
  normalizeNumberGeneratorRange,
} from "../features/test/numbers";

interface UseNumberQuickStartProps {
  dispatchSession: SessionDispatch;
  allNumbers: TestCard[];
  setAllNumbers: (cards: TestCard[]) => void;
  loadAllNumbers: (silent?: boolean) => Promise<void>;
  setStatus: (msg: string) => void;
  setDialogOpen: (open: boolean) => void;
}

interface NumberQuickStartOptions {
  includeAllLearned: boolean;
  limit?: number;
  generatorMode: boolean;
  generatorFrom: string;
  generatorTo: string;
}

export function useNumberQuickStart({
  dispatchSession,
  allNumbers,
  setAllNumbers,
  loadAllNumbers,
  setStatus,
  setDialogOpen,
}: UseNumberQuickStartProps) {
  const startNumberQuickStart = useCallback(
    async (options: NumberQuickStartOptions) => {
      const includeAllLearned = options.includeAllLearned;
      const numberLimit =
        typeof options.limit === "number" && Number.isFinite(options.limit) && options.limit > 0
          ? Math.floor(options.limit)
          : undefined;

      if (options.generatorMode) {
        const range = normalizeNumberGeneratorRange(options.generatorFrom, options.generatorTo);
        const generatedCards = buildGeneratedNumberTestCards(range);
        const ids = generatedCards
          .map((v) => v.id)
          .filter((id): id is number => typeof id === "number");
        const cardsToUse = numberLimit ? shuffle(ids).slice(0, numberLimit) : shuffle(ids);
        const shuffledRound = shuffle(cardsToUse);

        setAllNumbers(generatedCards);
        dispatchSession({
          type: "set",
          payload: {
            sessionActive: true,
            queue: cardsToUse,
            currentRound: shuffledRound,
            roundIndex: 0,
            currentId: shuffledRound[0] ?? null,
            flipped: false,
            streaks: new Map(cardsToUse.map((id) => [id, 0])),
            doneIds: new Set(),
          },
        });
        setStatus(
          `Generator-Zahlentest gestartet: ${cardsToUse.length} Karten (${range.fromValue}-${range.toValue})`
        );
        setDialogOpen(false);
        return;
      }

      let numbers = allNumbers;
      if (numbers.length === 0) {
        await loadAllNumbers(true);
        numbers = (await db.numbersVocab.toArray()).map(mapNumberEntryToTestCard);
        setAllNumbers(numbers);
      }

      const learnedIds = numbers
        .filter((v) => v.viewed === true && typeof v.id === "number")
        .map((v) => v.id as number);

      let ids = learnedIds;
      if (!includeAllLearned) {
        const dueProgress = await db.numbersProgress.where("dueAt").belowOrEqual(Date.now()).toArray();
        const dueIds = new Set(
          dueProgress.map((p) => p.entryId).filter((id): id is number => typeof id === "number")
        );
        ids = learnedIds.filter((id) => dueIds.has(id));
      }

      if (ids.length === 0) {
        setStatus(
          includeAllLearned
            ? "Keine gelernten Zahlen verfügbar. Lerne zuerst Zahlen auf der Seite 'Lernen'."
            : "Keine fälligen gelernten Zahlen verfügbar. Lerne zuerst Zahlen auf der Seite 'Lernen' oder aktiviere optional 'Alle gelernten Zahlen'."
        );
        return;
      }

      const cardsToUse = numberLimit ? shuffle(ids).slice(0, numberLimit) : shuffle(ids);
      const shuffledRound = shuffle(cardsToUse);
      dispatchSession({
        type: "set",
        payload: {
          sessionActive: true,
          queue: cardsToUse,
          currentRound: shuffledRound,
          roundIndex: 0,
          currentId: shuffledRound[0] ?? null,
          flipped: false,
          streaks: new Map(cardsToUse.map((id) => [id, 0])),
          doneIds: new Set(),
        },
      });
      const modeLabel = includeAllLearned ? "gelernte Zahlen" : "fällige gelernte Zahlen";
      setStatus(`Zahlentest gestartet: ${cardsToUse.length} ${modeLabel}`);
      setDialogOpen(false);
    },
    [allNumbers, dispatchSession, loadAllNumbers, setAllNumbers, setDialogOpen, setStatus]
  );

  return { startNumberQuickStart };
}

