import type { PotpourriCard } from "./types";

export type PotpourriSemanticGroup = "weekday" | "number";

const WEEKDAY_DE = new Set([
  "montag",
  "dienstag",
  "mittwoch",
  "donnerstag",
  "freitag",
  "samstag",
  "sonntag",
]);

const WEEKDAY_TH = new Set([
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
  "วันอาทิตย์",
]);

/** Exakte DE-Lemmata – vermeidet Treffer wie „Ehemann“. */
const NUMBER_DE = new Set([
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
  "zehn",
  "elf",
  "zwölf",
  "zwanzig",
  "dreißig",
  "dreissig",
  "hundert",
  "tausend",
]);

/** Exakte TH-Lemmata – vermeidet Treffer wie ห้าม / เก้าอี้ / สามี. */
const NUMBER_TH = new Set([
  "ศูนย์",
  "หนึ่ง",
  "สอง",
  "สาม",
  "สี่",
  "ห้า",
  "หก",
  "เจ็ด",
  "แปด",
  "เก้า",
  "สิบ",
  "ยี่สิบ",
  "ร้อย",
  "พัน",
]);

function normalizeDe(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Semantische Gruppe für schwierigere Distraktoren (Wochentag / Zahlwort).
 */
export function getPotpourriSemanticGroup(
  card: Pick<PotpourriCard, "thai" | "german">
): PotpourriSemanticGroup | null {
  const de = normalizeDe(card.german);
  const th = card.thai.trim();

  if (WEEKDAY_DE.has(de) || WEEKDAY_TH.has(th)) return "weekday";
  if (NUMBER_DE.has(de) || NUMBER_TH.has(th)) return "number";
  return null;
}
