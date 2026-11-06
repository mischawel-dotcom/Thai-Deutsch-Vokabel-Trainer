export type PotpourriPromptMode = "TH_DE" | "DE_TH" | "AUDIO_TH_DE" | "AUDIO_DE_TH";

export type PotpourriCard = {
  id: number;
  thai: string;
  german: string;
};

/** Geplante Abfrage in der Session-Warteschlange. */
export type PotpourriQueueItem = {
  entryId: number;
  mode: PotpourriPromptMode;
};

export type PotpourriQuestion = {
  entryId: number;
  mode: PotpourriPromptMode;
  /** Sichtbarer Prompt; bei Audio-Modi leer (nur Lautsprecher). */
  promptText: string;
  /** Text für TTS. */
  speakText: string;
  speakLang: "th-TH" | "de-DE";
  correctAnswer: string;
  options: string[];
  /** Antwortseite ist Thai (für Schriftgröße). */
  answerIsThai: boolean;
};

export type PotpourriFeedback = {
  selected: string;
  correct: string;
  isCorrect: boolean;
};
