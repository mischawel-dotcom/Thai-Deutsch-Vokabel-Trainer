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
import {
  buildQuickStartSessionPayload,
  filterDueOrUnfinishedLearnedIds,
  normalizeOptionalLimit,
} from "./quickStartShared";

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
      const numberLimit = normalizeOptionalLimit(options.limit);

      if (options.generatorMode) {
        const range = normalizeNumberGeneratorRange(options.generatorFrom, options.generatorTo);
        const generatedCards = buildGeneratedNumberTestCards(range);
        const ids = generatedCards
          .map((v) => v.id)
          .filter((id): id is number => typeof id === "number");
        const cardsToUse = numberLimit ? shuffle(ids).slice(0, numberLimit) : shuffle(ids);

        setAllNumbers(generatedCards);
        dispatchSession({
          type: "set",
          payload: buildQuickStartSessionPayload(cardsToUse),
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
        ids = await filterDueOrUnfinishedLearnedIds(learnedIds, "numbersProgress");
      }

      if (ids.length === 0) {
        setStatus(
          includeAllLearned
            ? "Keine gelernten Zahlen verfügbar. Lerne zuerst Zahlen auf der Seite 'Lernen'."
            : "Keine passenden gelernten Zahlen verfügbar (fällig oder <5x richtig). Lerne zuerst Zahlen auf der Seite 'Lernen' oder aktiviere optional 'Alle gelernten Zahlen'."
        );
        return;
      }

      const cardsToUse = numberLimit ? shuffle(ids).slice(0, numberLimit) : shuffle(ids);
      dispatchSession({
        type: "set",
        payload: buildQuickStartSessionPayload(cardsToUse),
      });
      const modeLabel = includeAllLearned
        ? "gelernte Zahlen"
        : "fällige oder noch nicht 5x richtige Zahlen";
      setStatus(`Zahlentest gestartet: ${cardsToUse.length} ${modeLabel}`);
      setDialogOpen(false);
    },
    [allNumbers, dispatchSession, loadAllNumbers, setAllNumbers, setDialogOpen, setStatus]
  );

  return { startNumberQuickStart };
}

