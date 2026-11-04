import { shuffle } from "../../lib/shuffle";
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

/**
 * Baut eine Multiple-Choice-Frage.
 * Distraktoren: aus allen gelernten Karten (learnedPool), nicht die Zielkarte.
 */
export function createPotpourriQuestion(
  pool: PotpourriCard[],
  learnedPool: PotpourriCard[],
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

  const distractorSource = learnedPool.length > 0 ? learnedPool : pool;
  const candidates = Array.from(
    new Set(
      distractorSource
        .filter((card) => card.id !== base.id)
        .map((card) => answerForMode(card, mode))
        .filter((value) => value.trim().length > 0 && value !== correctAnswer)
    )
  );

  if (candidates.length < 3) return null;

  const options = shuffle([correctAnswer, ...shuffle(candidates).slice(0, 3)]);
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
  attempts = 12
): PotpourriQuestion | null {
  for (let i = 0; i < attempts; i += 1) {
    const question = createPotpourriQuestion(pool, learnedPool);
    if (question) return question;
  }
  return null;
}
