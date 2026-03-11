import type { GameMode } from "../../hooks/useGamesSetup";
import type { GameModeCard, GameModeUiConfig } from "./types";

const MODE_CONFIGS: Record<GameMode, GameModeUiConfig> = {
  blitz: {
    id: "blitz",
    title: "Blitzrunde",
    subtitle: "Zeitlimit wählen und so viele Treffer wie möglich",
    directionThDeLabel: "Thai → Deutsch",
    directionDeThLabel: "Deutsch → Thai",
    resultLabel: "Blitzrunde",
    promptLabel: "Übersetze:",
    isAudio: false,
  },
  quiz: {
    id: "quiz",
    title: "4er-Quiz",
    subtitle: "Fragenanzahl wählen und die richtige Übersetzung tippen",
    directionThDeLabel: "Thai → Deutsch",
    directionDeThLabel: "Deutsch → Thai",
    resultLabel: "4er-Quiz",
    promptLabel: "Übersetze:",
    isAudio: false,
  },
  audio: {
    id: "audio",
    title: "Hör-Spiel",
    subtitle: "Audio hören und Übersetzung wählen",
    directionThDeLabel: "Thai → Deutsch",
    directionDeThLabel: "Deutsch → Thai",
    resultLabel: "Hör-Spiel",
    promptLabel: "Höre zu und wähle die richtige Übersetzung:",
    isAudio: true,
  },
  numbers: {
    id: "numbers",
    title: "Zahlenspiel",
    subtitle: "Ziffern zuordnen: Thai ⇄ Arabisch",
    directionThDeLabel: "Thai-Ziffern → Arabisch",
    directionDeThLabel: "Arabisch → Thai-Ziffern",
    resultLabel: "Zahlenspiel",
    promptLabel: "Ordne die Zahl zu:",
    isAudio: false,
  },
};

export const MODE_CARDS: GameModeCard[] = (Object.keys(MODE_CONFIGS) as GameMode[]).map((id) => ({
  id,
  title: MODE_CONFIGS[id].title,
  subtitle: MODE_CONFIGS[id].subtitle,
}));

export function getModeConfig(mode: GameMode): GameModeUiConfig {
  return MODE_CONFIGS[mode];
}
