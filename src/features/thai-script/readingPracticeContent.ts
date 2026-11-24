/**
 * Einfache Leseübungen: Silben/Kurz Wörter aus bereits behandelten
 * Konsonanten- und Vokalzeichen (Phase 1/2).
 */

export type ReadingPracticeEntry = {
  thai: string;
  romanization: string;
  german: string;
  /** Optionaler Hinweis zur Schreibung */
  hintDe?: string;
  ttsThai: string;
};

export const READING_PRACTICE_ENTRIES: ReadingPracticeEntry[] = [
  {
    thai: "กา",
    romanization: "kaa",
    german: "Silbe „kaa“ (langes a)",
    ttsThai: "กา",
  },
  {
    thai: "กิน",
    romanization: "gin",
    german: "essen",
    ttsThai: "กิน",
  },
  {
    thai: "มี",
    romanization: "mii",
    german: "haben",
    ttsThai: "มี",
  },
  {
    thai: "ดี",
    romanization: "dii",
    german: "gut",
    ttsThai: "ดี",
  },
  {
    thai: "มา",
    romanization: "maa",
    german: "kommen",
    ttsThai: "มา",
  },
  {
    thai: "ไป",
    romanization: "pai",
    german: "gehen",
    ttsThai: "ไป",
  },
  {
    thai: "ไก่",
    romanization: "gai",
    german: "Huhn",
    ttsThai: "ไก่",
  },
  {
    thai: "ใคร",
    romanization: "khrai",
    german: "wer",
    ttsThai: "ใคร",
  },
  {
    thai: "แม่",
    romanization: "mae",
    german: "Mutter",
    ttsThai: "แม่",
  },
  {
    thai: "โต๊ะ",
    romanization: "to",
    german: "Tisch",
    ttsThai: "โต๊ะ",
  },
  {
    thai: "ทำ",
    romanization: "tham",
    german: "machen / tun",
    ttsThai: "ทำ",
  },
  {
    thai: "น้ำ",
    romanization: "naam",
    german: "Wasser",
    hintDe: "ไม้ตรี (Tonzeichen) – erst mal Silbe lesen, Ton später.",
    ttsThai: "น้ำ",
  },
  {
    thai: "บ้าน",
    romanization: "baan",
    german: "Haus / Zuhause",
    ttsThai: "บ้าน",
  },
  {
    thai: "คน",
    romanization: "khon",
    german: "Mensch / Person",
    ttsThai: "คน",
  },
  {
    thai: "มือ",
    romanization: "mue",
    german: "Hand",
    hintDe: "ื + อ wie in Vokale Teil 2.",
    ttsThai: "มือ",
  },
  {
    thai: "เขา",
    romanization: "khao",
    german: "er / sie (höflich)",
    hintDe: "เ…า = „ao“.",
    ttsThai: "เขา",
  },
  {
    thai: "เรียน",
    romanization: "rian",
    german: "lernen / studieren",
    hintDe: "เ…ีย = „ia“.",
    ttsThai: "เรียน",
  },
  {
    thai: "เดือน",
    romanization: "duean",
    german: "Monat",
    hintDe: "เ…ือ = „üa“.",
    ttsThai: "เดือน",
  },
  {
    thai: "เกิด",
    romanization: "koet",
    german: "geboren werden",
    ttsThai: "เกิด",
  },
  {
    thai: "เงิน",
    romanization: "ngoen",
    german: "Geld",
    ttsThai: "เงิน",
  },
];
