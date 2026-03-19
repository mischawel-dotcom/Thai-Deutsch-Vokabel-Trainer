import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type UseSettingsPwaInstallArgs = {
  setMsg: (message: string) => void;
};

export function useSettingsPwaInstall({ setMsg }: UseSettingsPwaInstallArgs) {
  const isStandaloneMode =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches;
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(!isStandaloneMode);
  const [debugInfo, setDebugInfo] = useState<string>(
    isStandaloneMode
      ? "ℹ️ App ist bereits installiert (standalone mode)"
      : "⏳ Warte auf beforeinstallprompt Event..."
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);
      setDebugInfo("✅ beforeinstallprompt Event empfangen!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      setMsg("⚠️ Installation nicht verfügbar. Öffnen Sie die App im Browser.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setMsg("✅ App wird installiert...");
      setShowInstallButton(false);
    } else {
      setMsg("ℹ️ Installation abgebrochen");
    }

    setDeferredPrompt(null);
    setTimeout(() => setMsg(""), 3000);
  }

  return {
    deferredPrompt,
    showInstallButton,
    debugInfo,
    installApp,
  };
}

