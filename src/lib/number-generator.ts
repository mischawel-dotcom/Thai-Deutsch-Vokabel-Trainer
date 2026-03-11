export const MIN_GENERATED_NUMBER = 0;
export const MAX_GENERATED_NUMBER = 1_000_000;

const THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"] as const;
const THAI_UNITS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"] as const;
const THAI_UNITS_TRANS = ["soon", "nueng", "song", "sam", "si", "ha", "hok", "chet", "paet", "kao"] as const;

const GERMAN_UNITS = ["null", "eins", "zwei", "drei", "vier", "fuenf", "sechs", "sieben", "acht", "neun"] as const;
const GERMAN_TEENS: Record<number, string> = {
  10: "zehn",
  11: "elf",
  12: "zwoelf",
  13: "dreizehn",
  14: "vierzehn",
  15: "fuenfzehn",
  16: "sechzehn",
  17: "siebzehn",
  18: "achtzehn",
  19: "neunzehn",
};
const GERMAN_TENS: Record<number, string> = {
  20: "zwanzig",
  30: "dreissig",
  40: "vierzig",
  50: "fuenfzig",
  60: "sechzig",
  70: "siebzig",
  80: "achtzig",
  90: "neunzig",
};

export type GeneratedNumber = {
  arabic: number;
  thaiDigit: string;
  thaiWord: string;
  transliteration: string;
  german: string;
};

function assertSupportedInteger(value: number): void {
  if (!Number.isInteger(value)) {
    throw new Error(`Only integers are supported: ${value}`);
  }
  if (value < MIN_GENERATED_NUMBER || value > MAX_GENERATED_NUMBER) {
    throw new Error(`Number out of range (${MIN_GENERATED_NUMBER}-${MAX_GENERATED_NUMBER}): ${value}`);
  }
}

export function toThaiDigits(value: number): string {
  assertSupportedInteger(value);
  return String(value)
    .split("")
    .map((ch) => THAI_DIGITS[Number(ch)])
    .join("");
}

function thaiBelowMillion(value: number): string {
  if (value === 0) return THAI_UNITS[0];
  if (value < 10) return THAI_UNITS[value];

  const placeValues = [100_000, 10_000, 1_000, 100, 10, 1] as const;
  const placeWords = ["แสน", "หมื่น", "พัน", "ร้อย", "สิบ", ""] as const;
  const parts: string[] = [];
  let rest = value;

  for (let i = 0; i < placeValues.length; i += 1) {
    const place = placeValues[i];
    const digit = Math.floor(rest / place);
    rest %= place;
    if (digit === 0) continue;

    if (place === 10) {
      if (digit === 1) {
        parts.push("สิบ");
      } else if (digit === 2) {
        parts.push("ยี่สิบ");
      } else {
        parts.push(`${THAI_UNITS[digit]}สิบ`);
      }
      continue;
    }

    if (place === 1 && digit === 1 && value > 1) {
      parts.push("เอ็ด");
      continue;
    }

    parts.push(`${THAI_UNITS[digit]}${placeWords[i]}`);
  }

  return parts.join("");
}

function thaiTranslitBelowMillion(value: number): string {
  if (value === 0) return THAI_UNITS_TRANS[0];
  if (value < 10) return THAI_UNITS_TRANS[value];

  const placeValues = [100_000, 10_000, 1_000, 100, 10, 1] as const;
  const placeWords = ["saen", "muen", "phan", "roi", "sip", ""] as const;
  const parts: string[] = [];
  let rest = value;

  for (let i = 0; i < placeValues.length; i += 1) {
    const place = placeValues[i];
    const digit = Math.floor(rest / place);
    rest %= place;
    if (digit === 0) continue;

    if (place === 10) {
      if (digit === 1) {
        parts.push("sip");
      } else if (digit === 2) {
        parts.push("yi-sip");
      } else {
        parts.push(`${THAI_UNITS_TRANS[digit]}-sip`);
      }
      continue;
    }

    if (place === 1 && digit === 1 && value > 1) {
      parts.push("et");
      continue;
    }

    if (place === 1) {
      parts.push(THAI_UNITS_TRANS[digit]);
    } else {
      parts.push(`${THAI_UNITS_TRANS[digit]}-${placeWords[i]}`);
    }
  }

  return parts.join("-");
}

export function thaiWordForNumber(value: number): string {
  assertSupportedInteger(value);
  if (value < 1_000_000) return thaiBelowMillion(value);
  return "หนึ่งล้าน";
}

export function thaiTransliterationForNumber(value: number): string {
  assertSupportedInteger(value);
  if (value < 1_000_000) return thaiTranslitBelowMillion(value);
  return "nueng-lan";
}

function germanBelowThousand(value: number): string {
  if (value < 10) return GERMAN_UNITS[value];
  if (value < 20) return GERMAN_TEENS[value];
  if (value < 100) {
    const tens = Math.floor(value / 10) * 10;
    const ones = value % 10;
    if (ones === 0) return GERMAN_TENS[tens];
    const unitStem = ones === 1 ? "ein" : GERMAN_UNITS[ones];
    return `${unitStem}und${GERMAN_TENS[tens]}`;
  }

  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const prefix = hundreds === 1 ? "einhundert" : `${GERMAN_UNITS[hundreds]}hundert`;
  return rest === 0 ? prefix : `${prefix}${germanBelowThousand(rest)}`;
}

export function germanWordForNumber(value: number): string {
  assertSupportedInteger(value);
  if (value < 1_000) return germanBelowThousand(value);
  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1_000);
    const rest = value % 1_000;
    const thousandPrefix = thousands === 1 ? "eintausend" : `${germanBelowThousand(thousands)}tausend`;
    return rest === 0 ? thousandPrefix : `${thousandPrefix}${germanBelowThousand(rest)}`;
  }
  return "eine Million";
}

export function generateNumber(value: number): GeneratedNumber {
  assertSupportedInteger(value);
  return {
    arabic: value,
    thaiDigit: toThaiDigits(value),
    thaiWord: thaiWordForNumber(value),
    transliteration: thaiTransliterationForNumber(value),
    german: germanWordForNumber(value),
  };
}
