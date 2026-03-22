/**
 * Große Hero-Darstellung auf Vokalkarten.
 * Beispiel-Konsonant ก (ausgegraut) wie in den Ellipsis-Mustern – einheitlich für alle
 * Karten, die einen Träger brauchen.
 */

const ELLIPSIS_TO_SYLLABLE: Record<string, string> = {
  "เ…": "เก",
  "แ…": "แก",
  "โ…": "โก",
  "ไ…": "ไก",
  "ใ…": "ใก",
  "เ…า": "เกา",
  "เ…ีย": "เกีย",
  "เ…ือ": "เกือ",
  "ื…อ": "กือ",
  "เ…อ": "เกอ",
  "เ…ิ…": "เกิน",
  "แ…ะ": "แกะ",
};

/** Vokalzeichen, die mit ก als Träger in der Hero-Silbe gezeigt werden */
const VOWEL_SIGNS_WITH_KO_KAI = new Set(["ิ", "ี", "ุ", "ู", "ั", "ึ"]);

export type VowelHeroSegment = {
  text: string;
  /** Beispiel-Konsonant ก optisch zurücknehmen */
  muted?: boolean;
};

export type VowelHeroDisplay = {
  heroText: string;
  /** Erklärung unter der großen Schrift; null = kein Zusatz */
  sublabelDe: string | null;
  /** Optional: Hero aus Teilen (Beispiel-ก ausgegraut) */
  heroSegments?: VowelHeroSegment[];
};

const SUBLABEL_EXAMPLE_KO_KAI_DE =
  "ก ist nur ein Beispiel-Konsonant – derselbe Vokal lässt sich mit jedem anderen Konsonanten bilden.";

/** Thai ก (Ko Kai) – Platzhalter-Konsonant in allen Träger-Silben */
const KO_KAI = "\u0E01";

/**
 * Zerlegt eine Beispielsilbe wie เกา / กือ / กิ: jedes Vorkommen von ก wird ausgegraut dargestellt.
 */
function heroSegmentsWithMutedKoKai(syllable: string): VowelHeroSegment[] {
  const parts = syllable.split(new RegExp(`(${KO_KAI}+)`));
  const onlyKoKai = new RegExp(`^${KO_KAI}+$`);
  return parts
    .filter((p) => p.length > 0)
    .map((p) => (onlyKoKai.test(p) ? { text: p, muted: true } : { text: p }));
}

function withKoKaiHero(syllable: string): VowelHeroDisplay {
  return {
    heroText: syllable,
    sublabelDe: SUBLABEL_EXAMPLE_KO_KAI_DE,
    heroSegments: heroSegmentsWithMutedKoKai(syllable),
  };
}

export function buildVowelHeroDisplay(vowelDisplay: string): VowelHeroDisplay {
  const ellipsisHero = ELLIPSIS_TO_SYLLABLE[vowelDisplay];
  if (ellipsisHero) {
    return withKoKaiHero(ellipsisHero);
  }

  switch (vowelDisplay) {
    case "า":
    case "ะ":
    case "ฤ":
      return { heroText: vowelDisplay, sublabelDe: null };
    case "ำ":
      return withKoKaiHero(`${KO_KAI}ำ`);
    case "ื":
      return withKoKaiHero(`${KO_KAI}ื`);
    default:
      break;
  }

  if (vowelDisplay.length === 1 && VOWEL_SIGNS_WITH_KO_KAI.has(vowelDisplay)) {
    return withKoKaiHero(`${KO_KAI}${vowelDisplay}`);
  }

  return { heroText: vowelDisplay, sublabelDe: null };
}
