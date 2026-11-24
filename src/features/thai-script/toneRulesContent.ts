/**
 * Tonregeln – Einstieg: kurze Erklärungen + Erkennungsübung.
 * Didaktik: Mittelklasse → Hoch ≈ Mittel bei Zeichen → Tief weicht ab.
 * Bewusst vereinfacht (noch ohne tote Silben / alle Sonderfälle).
 */

export type ThaiToneId = "mid" | "low" | "falling" | "high" | "rising";

export const THAI_TONE_LABELS_DE: Record<ThaiToneId, string> = {
  mid: "Mittelton",
  low: "Tiefton",
  falling: "Fallton",
  high: "Hochton",
  rising: "Steigton",
};

export type ToneExplainAudioExample = {
  thai: string;
  labelDe?: string;
  ttsThai: string;
  /** Tonzeichen farblich/größer hervorheben (before + mark + after) */
  highlight?: { before: string; mark: string; after: string };
};

export type ToneExplainCard = {
  titleDe: string;
  bodyDe: string;
  /** Optional große Thai-Beispiele ohne Audio (z. B. nur Tonzeichen) */
  examplesThai?: string;
  /** Thai-Beispiele mit eigenem Lautsprecher-Icon */
  audioExamples?: ToneExplainAudioExample[];
};

export const TONE_EXPLAIN_CARDS: ToneExplainCard[] = [
  {
    titleDe: "Fünf Töne",
    bodyDe:
      "Im Thai ändert die Tonhöhe die Bedeutung. Es gibt fünf Töne: Mittel, Tief, Fallend, Hoch und Steigend. Dieselbe Silbe mit anderem Ton kann ein anderes Wort sein – hier alle fünf an กา:",
    audioExamples: [
      { thai: "กา", labelDe: "Mittelton", ttsThai: "กา" },
      { thai: "ก่า", labelDe: "Tiefton", ttsThai: "ก่า" },
      { thai: "ก้า", labelDe: "Fallton", ttsThai: "ก้า" },
      { thai: "ก๊า", labelDe: "Hochton", ttsThai: "ก๊า" },
      { thai: "ก๋า", labelDe: "Steigton", ttsThai: "ก๋า" },
    ],
  },
  {
    titleDe: "Drei Konsonantenklassen",
    bodyDe:
      "Jeder Anlaut gehört zur Mittel-, Hoch- oder Tiefklasse. Die Klasse entscheidet mit, welcher Ton entsteht – zuerst ohne Tonzeichen, später mit Tonzeichen.",
  },
  {
    titleDe: "Lebendige und tote Silben",
    bodyDe:
      "Vereinfacht: Eine Silbe ist „lebendig“, wenn sie auf einen langen Vokal oder auf einen stimmhaften Endlaut (z. B. น ม ง ย ว) endet. „Tote“ Silben enden oft auf kurze Vokale oder harte Endlaute (ก ด บ). Hier üben wir vorerst nur lebendige Silben.",
  },
  {
    titleDe: "Ohne Tonzeichen (lebendig)",
    bodyDe:
      "Faustregel für offene, lebendige Silben ohne Tonzeichen:\n\n• Mittelklasse → Mittelton\n• Hochklasse → Steigton\n• Tiefklasse → Mittelton",
    audioExamples: [
      { thai: "กา", labelDe: "Mitte → Mittelton", ttsThai: "กา" },
      { thai: "ขา", labelDe: "Hoch → Steigton", ttsThai: "ขา" },
      { thai: "คา", labelDe: "Tief → Mittelton", ttsThai: "คา" },
    ],
  },
  {
    titleDe: "Stufe 1: Tonzeichen an Mittelklasse",
    bodyDe:
      "Es gibt vier Tonzeichen: ไม้เอก ่, ไม้โท ้, ไม้ตรี ๊ und ไม้จัตวา ๋. Lerne sie zuerst nur an der Mittelklasse – das ist die Basis.",
  },
  {
    titleDe: "ไม้เอก ่ – Tiefton (Mittel)",
    bodyDe:
      "Bei Mittelklasse ergibt ่ den Tiefton. Merkhilfe: ไม้เอก ist das „erste“ Tonzeichen.",
    audioExamples: [
      {
        thai: "ก่า",
        labelDe: "Silbe: Tiefton",
        ttsThai: "ก่า",
        highlight: { before: "ก", mark: "่", after: "า" },
      },
      {
        thai: "ปู่",
        labelDe: "Beispielwort: Großvater (väterlich)",
        ttsThai: "ปู่",
        highlight: { before: "ป", mark: "่", after: "ู" },
      },
    ],
  },
  {
    titleDe: "ไม้โท ้ – Fallton (Mittel)",
    bodyDe:
      "Bei Mittelklasse ergibt ้ den Fallton. Merkhilfe: ไม้โท ist das „zweite“ Tonzeichen.",
    audioExamples: [
      {
        thai: "ก้า",
        labelDe: "Silbe: Fallton",
        ttsThai: "ก้า",
        highlight: { before: "ก", mark: "้", after: "า" },
      },
      {
        thai: "ได้",
        labelDe: "Beispielwort: können / bekommen",
        ttsThai: "ได้",
        highlight: { before: "ได", mark: "้", after: "" },
      },
    ],
  },
  {
    titleDe: "ไม้ตรี ๊ und ไม้จัตวา ๋ (Mittel)",
    bodyDe:
      "Bei Mittelklasse: ๊ → Hochton, ๋ → Steigton. Beide Zeichen sind seltener, aber gut zu erkennen.",
    audioExamples: [
      {
        thai: "ก๊า",
        labelDe: "๊ → Hochton",
        ttsThai: "ก๊า",
        highlight: { before: "ก", mark: "๊", after: "า" },
      },
      {
        thai: "ก๋า",
        labelDe: "๋ → Steigton",
        ttsThai: "ก๋า",
        highlight: { before: "ก", mark: "๋", after: "า" },
      },
      {
        thai: "ก๊าซ",
        labelDe: "Beispiel: Gas",
        ttsThai: "ก๊าซ",
        highlight: { before: "ก", mark: "๊", after: "าซ" },
      },
    ],
  },
  {
    titleDe: "Stufe 2: Hochklasse = wie Mittel",
    bodyDe:
      "Wichtige Merkregel: Bei Tonzeichen verhalten sich Hochklasse und Mittelklasse gleich. ่ → Tiefton, ้ → Fallton – genau wie bei กา. Ohne Tonzeichen ist Hochklasse anders (Steigton, z. B. ขา).",
    audioExamples: [
      {
        thai: "ก่า",
        labelDe: "Mitte + ่ → Tiefton",
        ttsThai: "ก่า",
        highlight: { before: "ก", mark: "่", after: "า" },
      },
      {
        thai: "ใหม่",
        labelDe: "Hoch + ่ → ebenfalls Tiefton",
        ttsThai: "ใหม่",
        highlight: { before: "ใหม", mark: "่", after: "" },
      },
      {
        thai: "ก้า",
        labelDe: "Mitte + ้ → Fallton",
        ttsThai: "ก้า",
        highlight: { before: "ก", mark: "้", after: "า" },
      },
      {
        thai: "ห้า",
        labelDe: "Hoch + ้ → ebenfalls Fallton",
        ttsThai: "ห้า",
        highlight: { before: "ห", mark: "้", after: "า" },
      },
    ],
  },
  {
    titleDe: "Stufe 3: Tiefklasse weicht ab",
    bodyDe:
      "Dieselben Tonzeichen ergeben bei Tiefklasse andere Töne: ่ → Fallton (nicht Tief), ้ → Hochton (nicht Fall). Das ist die normale Regel – kein Sonderfall.",
    audioExamples: [
      {
        thai: "ก่า",
        labelDe: "Mitte + ่ → Tiefton",
        ttsThai: "ก่า",
        highlight: { before: "ก", mark: "่", after: "า" },
      },
      {
        thai: "น่า",
        labelDe: "Tief + ่ → Fallton",
        ttsThai: "น่า",
        highlight: { before: "น", mark: "่", after: "า" },
      },
      {
        thai: "ก้า",
        labelDe: "Mitte + ้ → Fallton",
        ttsThai: "ก้า",
        highlight: { before: "ก", mark: "้", after: "า" },
      },
      {
        thai: "ม้า",
        labelDe: "Tief + ้ → Hochton",
        ttsThai: "ม้า",
        highlight: { before: "ม", mark: "้", after: "า" },
      },
    ],
  },
  {
    titleDe: "Kurzüberblick (lebendig)",
    bodyDe:
      "• kein Zeichen: Mitte → Mittel · Hoch → Steig · Tief → Mittel\n• ่: Mitte/Hoch → Tief · Tief → Fall\n• ้: Mitte/Hoch → Fall · Tief → Hoch\n\n๊ und ๋ vor allem bei Mittelklasse. Tote Silben später.",
  },
  {
    titleDe: "So übst du weiter",
    bodyDe:
      "Die Übung hat drei Teile:\n\n1. Mittelklasse – Tonzeichen wie gelernt\n2. Hochklasse – bei Zeichen wie Mittel; ohne Zeichen Steigton\n3. Tiefklasse – dieselben Zeichen, andere Töne\n\nHinweise nach der Antwort erklären den Schritt.",
  },
];

/** Teil 1 = Mittel, Teil 2 = Hoch, Teil 3 = Tief */
export type ToneQuizPart = 1 | 2 | 3;

export type ToneQuizEntry = {
  thai: string;
  romanization: string;
  german: string;
  tone: ThaiToneId;
  hintDe?: string;
  ttsThai: string;
  part: ToneQuizPart;
};

export const TONE_QUIZ_PART_LABELS: Record<ToneQuizPart, string> = {
  1: "Teil 1 · Mittelklasse",
  2: "Teil 2 · Hochklasse",
  3: "Teil 3 · Tiefklasse",
};

/** Teil 1 Mittel · Teil 2 Hoch · Teil 3 Tief */
export const TONE_QUIZ_ENTRIES: ToneQuizEntry[] = [
  // —— Teil 1: Mittelklasse ——
  {
    thai: "กา",
    romanization: "kaa",
    german: "Krähe (u. a.)",
    tone: "mid",
    hintDe: "Mittelklasse, kein Tonzeichen → Mittelton",
    ttsThai: "กา",
    part: 1,
  },
  {
    thai: "ก่า",
    romanization: "kàa",
    german: "Beispielsilbe mit ่",
    tone: "low",
    hintDe: "Mittelklasse + ่ → Tiefton",
    ttsThai: "ก่า",
    part: 1,
  },
  {
    thai: "ก้า",
    romanization: "kâa",
    german: "Beispielsilbe mit ้",
    tone: "falling",
    hintDe: "Mittelklasse + ้ → Fallton",
    ttsThai: "ก้า",
    part: 1,
  },
  {
    thai: "ก๊า",
    romanization: "káa",
    german: "Beispielsilbe mit ๊",
    tone: "high",
    hintDe: "Mittelklasse + ๊ → Hochton",
    ttsThai: "ก๊า",
    part: 1,
  },
  {
    thai: "ก๋า",
    romanization: "kǎa",
    german: "Beispielsilbe mit ๋",
    tone: "rising",
    hintDe: "Mittelklasse + ๋ → Steigton",
    ttsThai: "ก๋า",
    part: 1,
  },
  {
    thai: "ดี",
    romanization: "dii",
    german: "gut",
    tone: "mid",
    hintDe: "Mittelklasse, kein Tonzeichen → Mittelton",
    ttsThai: "ดี",
    part: 1,
  },
  {
    thai: "ได้",
    romanization: "dâi",
    german: "können / bekommen",
    tone: "falling",
    hintDe: "Mittelklasse + ้ → Fallton",
    ttsThai: "ได้",
    part: 1,
  },
  {
    thai: "ปู",
    romanization: "puu",
    german: "Krabbe",
    tone: "mid",
    hintDe: "Mittelklasse, kein Tonzeichen → Mittelton",
    ttsThai: "ปู",
    part: 1,
  },
  {
    thai: "ปู่",
    romanization: "pùu",
    german: "Großvater (väterlich)",
    tone: "low",
    hintDe: "Mittelklasse + ่ → Tiefton",
    ttsThai: "ปู่",
    part: 1,
  },
  {
    thai: "ก๊าซ",
    romanization: "káat",
    german: "Gas",
    tone: "high",
    hintDe: "Mittelklasse + ๊ → Hochton",
    ttsThai: "ก๊าซ",
    part: 1,
  },
  // —— Teil 2: Hochklasse ——
  {
    thai: "ขา",
    romanization: "khaa",
    german: "Bein",
    tone: "rising",
    hintDe: "Hochklasse, kein Zeichen → Steigton (anders als Mittel)",
    ttsThai: "ขา",
    part: 2,
  },
  {
    thai: "ใหม่",
    romanization: "mài",
    german: "neu",
    tone: "low",
    hintDe: "Hochklasse + ่ → Tiefton (wie Mittelklasse)",
    ttsThai: "ใหม่",
    part: 2,
  },
  {
    thai: "ห้า",
    romanization: "hâa",
    german: "fünf",
    tone: "falling",
    hintDe: "Hochklasse + ้ → Fallton (wie Mittelklasse)",
    ttsThai: "ห้า",
    part: 2,
  },
  {
    thai: "ขาว",
    romanization: "khǎao",
    german: "weiß",
    tone: "rising",
    hintDe: "Hochklasse, kein Zeichen, lebendig → Steigton",
    ttsThai: "ขาว",
    part: 2,
  },
  {
    thai: "ข่า",
    romanization: "khàa",
    german: "Galgant (Gewürz)",
    tone: "low",
    hintDe: "Hochklasse + ่ → Tiefton (wie Mittelklasse)",
    ttsThai: "ข่า",
    part: 2,
  },
  // —— Teil 3: Tiefklasse ——
  {
    thai: "คา",
    romanization: "khaa",
    german: "stecken / festhängen (u. a.)",
    tone: "mid",
    hintDe: "Tiefklasse, kein Zeichen → Mittelton",
    ttsThai: "คา",
    part: 3,
  },
  {
    thai: "มา",
    romanization: "maa",
    german: "kommen",
    tone: "mid",
    hintDe: "Tiefklasse, kein Zeichen → Mittelton",
    ttsThai: "มา",
    part: 3,
  },
  {
    thai: "น่า",
    romanization: "nâa",
    german: "Partikel / „-wert“ (u. a.)",
    tone: "falling",
    hintDe: "Tiefklasse + ่ → Fallton (nicht Tiefton wie bei Mittel)",
    ttsThai: "น่า",
    part: 3,
  },
  {
    thai: "ไม่",
    romanization: "mâi",
    german: "nicht",
    tone: "falling",
    hintDe: "Tiefklasse + ่ → Fallton (nicht Tiefton wie bei Mittel)",
    ttsThai: "ไม่",
    part: 3,
  },
  {
    thai: "ม้า",
    romanization: "máa",
    german: "Pferd",
    tone: "high",
    hintDe: "Tiefklasse + ้ → Hochton (nicht Fallton wie bei Mittel)",
    ttsThai: "ม้า",
    part: 3,
  },
  {
    thai: "มือ",
    romanization: "mʉʉ",
    german: "Hand",
    tone: "mid",
    hintDe: "Tiefklasse, kein Zeichen → Mittelton",
    ttsThai: "มือ",
    part: 3,
  },
];

export const TONE_QUIZ_OPTIONS: ThaiToneId[] = [
  "mid",
  "low",
  "falling",
  "high",
  "rising",
];
