import { shuffle } from "../../lib/shuffle";
import { getPotpourriSemanticGroup } from "./semanticGroups";
import type {
  PotpourriCard,
  PotpourriPromptMode,
  PotpourriQuestion,
  PotpourriQueueItem,
} from "./types";

/** Audio nur Thai → Deutsch (kein deutsches Vorlesen). */
const TEXT_MODES: PotpourriPromptMode[] = ["TH_DE", "DE_TH"];

export function nextPotpourriScore(score: number, isCorrect: boolean): number {
  if (isCorrect) return score + 1;
  return Math.max(0, score - 3);
}

export function isPotpourriWon(score: number, target: number): boolean {
  return target > 0 && score >= target;
}

export function isPotpourriAudioMode(mode: PotpourriPromptMode): boolean {
  return mode.startsWith("AUDIO_");
}

function randomTextMode(): PotpourriPromptMode {
  return TEXT_MODES[Math.floor(Math.random() * TEXT_MODES.length)];
}

/**
 * Jede Karte genau 2×: einmal Audio (Thai), einmal Text — Reihenfolge gemischt.
 */
export function buildPotpourriQueue(pool: PotpourriCard[]): PotpourriQueueItem[] {
  const items: PotpourriQueueItem[] = [];
  for (const card of pool) {
    const audioFirst = Math.random() < 0.5;
    if (audioFirst) {
      items.push({ entryId: card.id, mode: "AUDIO_TH_DE" });
      items.push({ entryId: card.id, mode: randomTextMode() });
    } else {
      items.push({ entryId: card.id, mode: randomTextMode() });
      items.push({ entryId: card.id, mode: "AUDIO_TH_DE" });
    }
  }
  return shuffle(items);
}

export function potpourriQuestionTarget(poolSize: number): number {
  return Math.max(0, poolSize) * 2;
}

function answerForMode(card: PotpourriCard, mode: PotpourriPromptMode): string {
  return mode === "TH_DE" || mode === "AUDIO_TH_DE" ? card.german : card.thai;
}

function promptParts(card: PotpourriCard, mode: PotpourriPromptMode) {
  switch (mode) {
    case "TH_DE":
      return {
        promptText: card.thai,
        speakText: card.thai,
        speakLang: "th-TH" as const,
        answerIsThai: false,
      };
    case "DE_TH":
      return {
        promptText: card.german,
        speakText: card.german,
        speakLang: "de-DE" as const,
        answerIsThai: true,
      };
    case "AUDIO_TH_DE":
      return {
        promptText: "",
        speakText: card.thai,
        speakLang: "th-TH" as const,
        answerIsThai: false,
      };
    case "AUDIO_DE_TH":
      return {
        promptText: "",
        speakText: card.german,
        speakLang: "de-DE" as const,
        answerIsThai: true,
      };
  }
}

function uniqueAnswers(
  cards: PotpourriCard[],
  mode: PotpourriPromptMode,
  excludeId: number,
  excludeAnswer: string
): string[] {
  return Array.from(
    new Set(
      cards
        .filter((card) => card.id !== excludeId)
        .map((card) => answerForMode(card, mode))
        .filter((value) => value.trim().length > 0 && value !== excludeAnswer)
    )
  );
}

/**
 * Baut eine Multiple-Choice-Frage für eine feste Karte/Mode.
 */
export function createPotpourriQuestion(
  pool: PotpourriCard[],
  learnedPool: PotpourriCard[],
  catalogPool: PotpourriCard[] = learnedPool,
  preferredId?: number,
  forcedMode?: PotpourriPromptMode
): PotpourriQuestion | null {
  if (pool.length === 0) return null;

  const base =
    preferredId != null
      ? pool.find((card) => card.id === preferredId) ?? null
      : pool[Math.floor(Math.random() * pool.length)];
  if (!base) return null;

  const mode =
    forcedMode ??
    (Math.random() < 0.5 ? "AUDIO_TH_DE" : randomTextMode());
  const correctAnswer = answerForMode(base, mode);
  const parts = promptParts(base, mode);
  const group = getPotpourriSemanticGroup(base);

  const preferredSource =
    group != null
      ? catalogPool.filter((card) => getPotpourriSemanticGroup(card) === group)
      : [];

  const preferredCandidates = uniqueAnswers(preferredSource, mode, base.id, correctAnswer);
  const fallbackSource = learnedPool.length > 0 ? learnedPool : pool;
  const fallbackCandidates = uniqueAnswers(fallbackSource, mode, base.id, correctAnswer).filter(
    (value) => !preferredCandidates.includes(value)
  );

  const candidates = [...shuffle(preferredCandidates), ...shuffle(fallbackCandidates)];
  if (candidates.length < 3) return null;

  const options = shuffle([correctAnswer, ...candidates.slice(0, 3)]);
  return {
    entryId: base.id,
    mode,
    promptText: parts.promptText,
    speakText: parts.speakText,
    speakLang: parts.speakLang,
    correctAnswer,
    options,
    answerIsThai: parts.answerIsThai,
  };
}

/** Baut die Frage zu einem Queue-Eintrag (mit Fallback auf andere Text-Richtung). */
export function createQuestionForQueueItem(
  item: PotpourriQueueItem,
  pool: PotpourriCard[],
  learnedPool: PotpourriCard[],
  catalogPool: PotpourriCard[]
): PotpourriQuestion | null {
  const primary = createPotpourriQuestion(
    pool,
    learnedPool,
    catalogPool,
    item.entryId,
    item.mode
  );
  if (primary) return primary;

  if (!isPotpourriAudioMode(item.mode)) {
    const otherText: PotpourriPromptMode = item.mode === "TH_DE" ? "DE_TH" : "TH_DE";
    return createPotpourriQuestion(pool, learnedPool, catalogPool, item.entryId, otherText);
  }

  return createPotpourriQuestion(pool, learnedPool, catalogPool, item.entryId, randomTextMode());
}
