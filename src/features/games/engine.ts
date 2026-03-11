import type { GameDirection } from "../../hooks/useGamesSetup";
import { shuffle } from "../../lib/shuffle";
import { getAnswer, getPrompt, type GameEntry, type GameQuestion } from "./types";

export function getValidBaseEntries(pool: GameEntry[], direction: GameDirection): GameEntry[] {
  return pool.filter((baseEntry) => {
    const correct = getAnswer(baseEntry, direction);
    const distractors = new Set(
      pool
        .filter((entry) => entry.id !== baseEntry.id)
        .map((entry) => getAnswer(entry, direction))
        .filter((value) => value && value !== correct)
    );
    return distractors.size >= 3;
  });
}

export function buildQuestionOrder(baseIds: number[], targetCount: number): number[] {
  if (baseIds.length === 0 || targetCount <= 0) return [];

  const order: number[] = [];
  let previousId: number | undefined;
  while (order.length < targetCount) {
    let cycle = shuffle(baseIds);
    if (previousId !== undefined && cycle.length > 1 && cycle[0] === previousId) {
      cycle = [...cycle.slice(1), cycle[0]];
    }
    for (const id of cycle) {
      if (order.length >= targetCount) break;
      order.push(id);
      previousId = id;
    }
  }
  return order;
}

export function createQuestion(
  pool: GameEntry[],
  direction: GameDirection,
  preferredEntryId?: number
): GameQuestion | null {
  const validBases = getValidBaseEntries(pool, direction);
  if (validBases.length === 0) return null;

  const base =
    preferredEntryId != null
      ? validBases.find((entry) => entry.id === preferredEntryId) ?? null
      : validBases[Math.floor(Math.random() * validBases.length)];
  if (!base) return null;

  const correctAnswer = getAnswer(base, direction);
  const prompt = getPrompt(base, direction);

  const answerCandidates = Array.from(
    new Set(
      pool
        .filter((entry) => entry.id !== base.id)
        .map((entry) => getAnswer(entry, direction))
        .filter((value) => value && value !== correctAnswer)
    )
  );

  if (answerCandidates.length < 3) return null;

  const options = shuffle([correctAnswer, ...shuffle(answerCandidates).slice(0, 3)]);
  return {
    entryId: base.id,
    prompt,
    correctAnswer,
    options,
  };
}
