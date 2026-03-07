import { useEffect } from "react";

import type { VocabEntry } from "../db/db";

type SpeakLang = "th-TH" | "de-DE";

type UseKeyboardNavigationArgs = {
  sessionActive: boolean;
  currentId: number | null;
  flipped: boolean;
  current: VocabEntry | null;
  frontText: string;
  backText: string;
  frontLang: SpeakLang;
  backLang: SpeakLang;
  flipCard: () => void;
  gradeAnswer: (isRight: boolean) => void;
  handleSpeak: (text: string, lang: SpeakLang, key: string) => void | Promise<void>;
  endSessionConfirm: () => void;
};

export function useKeyboardNavigation({
  sessionActive,
  currentId,
  flipped,
  current,
  frontText,
  backText,
  frontLang,
  backLang,
  flipCard,
  gradeAnswer,
  handleSpeak,
  endSessionConfirm,
}: UseKeyboardNavigationArgs) {
  useEffect(() => {
    if (!sessionActive || !currentId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          flipCard();
          break;

        case "ArrowRight":
        case "1":
          e.preventDefault();
          if (flipped) {
            gradeAnswer(true);
          }
          break;

        case "ArrowLeft":
        case "0":
          e.preventDefault();
          if (flipped) {
            gradeAnswer(false);
          }
          break;

        case "p":
        case "P":
          e.preventDefault();
          if (current) {
            const text = flipped ? backText : frontText;
            const lang = flipped ? backLang : frontLang;
            void handleSpeak(text, lang, flipped ? "back" : "front");
          }
          break;

        case "Escape":
          e.preventDefault();
          endSessionConfirm();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    sessionActive,
    currentId,
    flipped,
    current,
    frontText,
    backText,
    frontLang,
    backLang,
    flipCard,
    gradeAnswer,
    handleSpeak,
    endSessionConfirm,
  ]);
}
