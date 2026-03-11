import type { NumberEntry } from "../db/db";

const THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
const THAI_UNITS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const THAI_UNITS_TRANS = ["soon", "nueng", "song", "sam", "si", "ha", "hok", "chet", "paet", "kao"];

const GERMAN_UNITS = [
  "null",
  "eins",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
];
const GERMAN_TEENS: Record<number, string> = {
  10: "zehn",
  11: "elf",
  12: "zwölf",
  13: "dreizehn",
  14: "vierzehn",
  15: "fünfzehn",
  16: "sechzehn",
  17: "siebzehn",
  18: "achtzehn",
  19: "neunzehn",
};
const GERMAN_TENS: Record<number, string> = {
  20: "zwanzig",
  30: "dreißig",
  40: "vierzig",
  50: "fünfzig",
  60: "sechzig",
  70: "siebzig",
  80: "achtzig",
  90: "neunzig",
};

function toThaiDigits(value: number): string {
  return String(value)
    .split("")
    .map((ch) => THAI_DIGITS[Number(ch)])
    .join("");
}

function thaiWordFor(value: number): string {
  if (value < 10) return THAI_UNITS[value];
  if (value === 10) return "สิบ";
  if (value === 100) return "หนึ่งร้อย";

  const tens = Math.floor(value / 10);
  const ones = value % 10;

  let prefix = "สิบ";
  if (tens === 2) prefix = "ยี่สิบ";
  else if (tens > 2) prefix = `${THAI_UNITS[tens]}สิบ`;

  if (ones === 0) return prefix;
  if (ones === 1) return `${prefix}เอ็ด`;
  return `${prefix}${THAI_UNITS[ones]}`;
}

function thaiTransliterationFor(value: number): string {
  if (value < 10) return THAI_UNITS_TRANS[value];
  if (value === 10) return "sip";
  if (value === 100) return "nueng-roi";

  const tens = Math.floor(value / 10);
  const ones = value % 10;

  let prefix = "sip";
  if (tens === 2) prefix = "yi-sip";
  else if (tens > 2) prefix = `${THAI_UNITS_TRANS[tens]}-sip`;

  if (ones === 0) return prefix;
  if (ones === 1) return `${prefix}-et`;
  return `${prefix}-${THAI_UNITS_TRANS[ones]}`;
}

function germanFor(value: number): string {
  if (value < 10) return GERMAN_UNITS[value];
  if (value < 20) return GERMAN_TEENS[value];
  if (value === 100) return "einhundert";

  const tens = Math.floor(value / 10) * 10;
  const ones = value % 10;
  const tensWord = GERMAN_TENS[tens];
  if (ones === 0) return tensWord;

  const unitStem = ones === 1 ? "ein" : GERMAN_UNITS[ones];
  return `${unitStem}und${tensWord}`;
}

export const DEFAULT_NUMBERS: NumberEntry[] = Array.from({ length: 101 }, (_, n) => ({
  arabic: n,
  thaiWord: thaiWordFor(n),
  thaiDigit: toThaiDigits(n),
  german: germanFor(n),
  transliteration: thaiTransliterationFor(n),
  lesson: 1,
  tags: ["Numbers", "A1", "Kardinalzahlen"],
  createdAt: 0,
  updatedAt: 0,
}));
