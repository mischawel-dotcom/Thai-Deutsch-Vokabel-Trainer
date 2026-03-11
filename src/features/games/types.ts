import type { GameDirection, GameMode } from "../../hooks/useGamesSetup";

export type GameQuestion = {
  entryId: number;
  prompt: string;
  correctAnswer: string;
  options: string[];
};

export type AnswerFeedback = {
  selected: string;
  correct: string;
  isCorrect: boolean;
};

export type GameModeCard = {
  id: GameMode;
  title: string;
  subtitle: string;
};

export type GameEntry = {
  id: number;
  lesson?: number;
  viewed?: boolean;
  thPrompt: string;
  dePrompt: string;
  thAnswer: string;
  deAnswer: string;
};

export type GameModeUiConfig = {
  id: GameMode;
  title: string;
  subtitle: string;
  directionThDeLabel: string;
  directionDeThLabel: string;
  resultLabel: string;
  promptLabel: string;
  isAudio: boolean;
};

export type GamePoolSource = "vocab" | "numbers";

export function getGamePoolSource(mode: GameMode): GamePoolSource {
  return mode === "numbers" ? "numbers" : "vocab";
}

export function getPrompt(entry: GameEntry, direction: GameDirection): string {
  return direction === "TH_DE" ? entry.thPrompt : entry.dePrompt;
}

export function getAnswer(entry: GameEntry, direction: GameDirection): string {
  return direction === "TH_DE" ? entry.deAnswer : entry.thAnswer;
}
