import { useState } from "react";
import { speak } from "../features/tts";

type FeedbackTone = "right" | "wrong";

type SpeakLang = "th-TH" | "de-DE";

let toneAssetsPromise: Promise<Record<FeedbackTone, string>> | null = null;
const toneAudioCache: Partial<Record<FeedbackTone, HTMLAudioElement>> = {};

async function loadToneAssets(): Promise<Record<FeedbackTone, string>> {
  if (!toneAssetsPromise) {
    toneAssetsPromise = (async () => {
      const [rightMod, wrongMod] = await Promise.all([
        import("@/assets/true.wav"),
        import("@/assets/false.wav"),
      ]);
      return {
        right: rightMod.default,
        wrong: wrongMod.default,
      };
    })();
  }
  return toneAssetsPromise;
}

async function getToneAudio(type: FeedbackTone): Promise<HTMLAudioElement> {
  const cached = toneAudioCache[type];
  if (cached) return cached;

  const assets = await loadToneAssets();
  const audio = new Audio(assets[type]);
  audio.volume = 0.8;
  toneAudioCache[type] = audio;
  return audio;
}

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
    const soundEnabled = localStorage.getItem("soundEnabled");
    if (soundEnabled === "false") return;

    void (async () => {
      try {
        const audio = await getToneAudio(type);
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        // Keep this non-blocking and silent for users; debug in console only.
        console.error("Feedback sound playback error:", error);
      }
    })();
  }

  return {
    isSpeaking,
    speakingKey,
    handleSpeak,
    playFeedbackTone,
  };
}
