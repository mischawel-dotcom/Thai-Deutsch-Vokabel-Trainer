import { useState } from "react";

export type LearnDirection = "TH_DE" | "DE_TH";

type UseSettingsPreferencesArgs = {
  setMsg: (message: string) => void;
};

export function useSettingsPreferences({ setMsg }: UseSettingsPreferencesArgs) {
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const saved = localStorage.getItem("dailyLimit");
    if (!saved) return 10;
    const num = parseInt(saved, 10);
    return !isNaN(num) && num > 0 ? num : 10;
  });
  const [inputValue, setInputValue] = useState<string>(() => {
    const saved = localStorage.getItem("dailyLimit");
    if (!saved) return "10";
    const num = parseInt(saved, 10);
    return !isNaN(num) && num > 0 ? String(num) : "10";
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [learnDirection, setLearnDirection] = useState<LearnDirection>(() => {
    const savedDirection = localStorage.getItem("learnDirection");
    return savedDirection === "TH_DE" || savedDirection === "DE_TH" ? savedDirection : "TH_DE";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const savedSoundEnabled = localStorage.getItem("soundEnabled");
    return savedSoundEnabled !== "false";
  });

  function saveDailyLimit() {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) {
      setMsg("❌ Bitte geben Sie eine Zahl größer als 0 ein");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    setIsSaving(true);
    setDailyLimit(num);
    localStorage.setItem("dailyLimit", String(num));
    setMsg(`✅ Tägliches Limit gespeichert: ${num} Karten`);

    setTimeout(() => {
      setIsSaving(false);
      setMsg("");
    }, 1500);
  }

  function resetDailyLimit() {
    setDailyLimit(10);
    setInputValue("10");
    localStorage.setItem("dailyLimit", "10");
    setMsg("✅ Limit zurückgesetzt auf 10");
    setTimeout(() => setMsg(""), 3000);
  }

  function changeLearnDirection(direction: LearnDirection) {
    setLearnDirection(direction);
    localStorage.setItem("learnDirection", direction);
    const dirText = direction === "TH_DE" ? "Thai → Deutsch" : "Deutsch → Thai";
    setMsg(`✅ Lernrichtung: ${dirText}`);
    setTimeout(() => setMsg(""), 3000);
  }

  function toggleSoundEnabled() {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
    setMsg(newValue ? "✅ Sound aktiviert" : "✅ Sound deaktiviert");
    setTimeout(() => setMsg(""), 3000);
  }

  return {
    dailyLimit,
    inputValue,
    setInputValue,
    isSaving,
    learnDirection,
    soundEnabled,
    saveDailyLimit,
    resetDailyLimit,
    changeLearnDirection,
    toggleSoundEnabled,
  };
}

