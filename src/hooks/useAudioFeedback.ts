import { useState } from "react";
import { speak } from "../features/tts";
import trueSoundFile from "@/assets/true.wav";
import falseSoundFile from "@/assets/false.wav";

type FeedbackTone = "right" | "wrong";

type SpeakLang = "th-TH" | "de-DE";

export function useAudioFeedback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  async function handleSpeak(text: string, lang: SpeakLang, key: string) {
    if (!text.trim()) return;
    setIsSpeaking(true);
    setSpeakingKey(key);
    try {
      await speak(text, lang);
    } finally {
      setIsSpeaking(false);
      setSpeakingKey(null);
    }
  }

  function playFeedbackTone(type: FeedbackTone) {
    try {
      const soundEnabled = localStorage.getItem("soundEnabled");
      if (soundEnabled === "false") return;

      const soundFile = type === "right" ? trueSoundFile : falseSoundFile;
      const audio = new Audio(soundFile);
      audio.volume = 0.8;

      audio.onerror = (e) => {
        console.error("Audio error:", e);
        alert("Audio-Fehler: Datei konnte nicht geladen werden");
      };

      audio.play().catch((error) => {
        console.error("Playback error:", error);
      });

      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 3000);
    } catch (error) {
      console.error("Audio error:", error);
    }
  }

  return {
    isSpeaking,
    speakingKey,
    handleSpeak,
    playFeedbackTone,
  };
}
