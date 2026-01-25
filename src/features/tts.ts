export type TtsLang = "th-TH" | "de-DE";

let voicesCache: SpeechSynthesisVoice[] = [];

function getVoicesNow(): SpeechSynthesisVoice[] {
  try {
    return window.speechSynthesis?.getVoices?.() ?? [];
  } catch {
    return [];
  }
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * Loads voices reliably across browsers (voices can be empty at first).
 */
async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  if (!synth) return [];

  // Try immediately
  let voices = getVoicesNow();
  if (voices.length) {
    voicesCache = voices;
    return voicesCache;
  }

  // Wait for voiceschanged event or timeout
  await new Promise<void>((resolve) => {
    const onChanged = () => {
      synth.removeEventListener("voiceschanged", onChanged);
      resolve();
    };
    synth.addEventListener("voiceschanged", onChanged);

    // safety timeout
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", onChanged);
      resolve();
    }, 1200);
  });

  voices = getVoicesNow();
  voicesCache = voices;
  return voicesCache;
}

function pickVoice(lang: TtsLang): SpeechSynthesisVoice | undefined {
  const voices = voicesCache.length ? voicesCache : getVoicesNow();
  const wanted = lang.toLowerCase();

  // 1) exact match
  const exact = voices.find((v) => (v.lang ?? "").toLowerCase() === wanted);
  if (exact) return exact;

  // 2) prefix match (th / de)
  const prefix = wanted.split("-")[0];
  const byPrefix = voices.find((v) => (v.lang ?? "").toLowerCase().startsWith(prefix));
  if (byPrefix) return byPrefix;

  // 3) default voice
  return voices.find((v) => v.default) ?? voices[0];
}

export async function speak(text: string, lang: TtsLang) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    alert("Text-to-Speech wird von diesem Browser nicht unterstützt.");
    return;
  }

  // Must be called from a user gesture (click) for best compatibility.
  const synth = window.speechSynthesis;
  synth.cancel();

  // Load voices (reliably)
  await loadVoices();

  // Debug info for Thai
  if (lang === "th-TH") {
    const hasThai = (voicesCache ?? []).some((v) => (v.lang ?? "").toLowerCase().startsWith("th"));
    if (!hasThai) {
      console.warn("No Thai (th-*) voice available. Falling back to default voice.");
    }
  }

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = lang;

  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;

  // conservative defaults
  utter.rate = 0.95;
  utter.pitch = 1.0;
  utter.volume = 1.0;

  // Some engines need a tiny async gap after cancel()
  await wait(20);

  synth.speak(utter);
}

export function stopSpeak() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Debug helper: list available voices.
 */
export async function listVoices() {
  await loadVoices();
  return (voicesCache ?? []).map((v) => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService,
    default: v.default,
  }));
}

/**
 * Debug helper: returns whether a Thai voice exists.
 */
export async function hasThaiVoice(): Promise<boolean> {
  await loadVoices();
  return (voicesCache ?? []).some((v) => (v.lang ?? "").toLowerCase().startsWith("th"));
}