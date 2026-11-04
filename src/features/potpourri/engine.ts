import { shuffle } from "../../lib/shuffle";
import { getPotpourriSemanticGroup } from "./semanticGroups";
import type { PotpourriCard, PotpourriPromptMode, PotpourriQuestion } from "./types";

const MODES: PotpourriPromptMode[] = ["TH_DE", "DE_TH", "AUDIO_TH_DE", "AUDIO_DE_TH"];

export function nextPotpourriScore(score: number, isCorrect: boolean): number {
  if (isCorrect) return score + 1;
  return Math.max(0, score - 3);
}

export function isPotpourriWon(score: number, target: number): boolean {
  return target > 0 && score >= target;
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
 * Baut eine Multiple-Choice-Frage.
 * Bei Wochentag/Zahlwort: Distraktoren bevorzugt aus derselben Gruppe (gesamter Katalog).
 * Sonst / Auffüllen: aus allen gelernten Karten.
 */
export function createPotpourriQuestion(
  pool: PotpourriCard[],
  learnedPool: PotpourriCard[],
  catalogPool: PotpourriCard[] = learnedPool,
  preferredId?: number
): PotpourriQuestion | null {
  if (pool.length === 0) return null;

  const base =
    preferredId != null
      ? pool.find((card) => card.id === preferredId) ?? null
      : pool[Math.floor(Math.random() * pool.length)];
  if (!base) return null;

  const mode = MODES[Math.floor(Math.random() * MODES.length)];
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

/** Versucht mehrere Male eine gültige Frage zu bauen (Mode/Distraktoren). */
export function createPotpourriQuestionWithRetry(
  pool: PotpourriCard[],
  learnedPool: PotpourriCard[],
  catalogPool: PotpourriCard[] = learnedPool,
  attempts = 12
): PotpourriQuestion | null {
  for (let i = 0; i < attempts; i += 1) {
    const question = createPotpourriQuestion(pool, learnedPool, catalogPool);
    if (question) return question;
  }
  return null;
}
