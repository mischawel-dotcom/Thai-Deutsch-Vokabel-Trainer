import { MID_CLASS_CONSONANTS } from "./content";
import { HIGH_CLASS_CONSONANTS, LOW_CLASS_CONSONANTS } from "./consonantsHighLow";
import type { ConsonantClassId, ThaiConsonantEntry } from "./content";

/**
 * Alle Konsonanten aus den Klassen-Daten, in üblicher Alphabet-Reihenfolge.
 * Referenzliste (kein Lernfortschritt) – analog zur Vokal-Liste.
 */

export type ConsonantCatalogEntry = {
  thai: string;
  /** z. B. „gor gai · Huhn“ */
  romanization: string;
  /** Mnemonik Thai, z. B. ก.ไก่ */
  mnemonicThai: string;
  classId: ConsonantClassId;
  classLabelDe: string;
  ttsThai: string;
};

const CLASS_LABEL_DE: Record<ConsonantClassId, string> = {
  mid: "Mittelklasse",
  high: "Hochklasse",
  low: "Tiefklasse",
};

/** Klassische Reihenfolge der thailändischen Konsonanten. */
const THAI_CONSONANT_ORDER =
  "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ";

function orderIndex(char: string): number {
  const idx = THAI_CONSONANT_ORDER.indexOf(char);
  return idx >= 0 ? idx : 999;
}

function toCatalogEntry(entry: ThaiConsonantEntry): ConsonantCatalogEntry {
  return {
    thai: entry.char,
    romanization: `${entry.mnemonicRtgs} · ${entry.mnemonicDe}`,
    mnemonicThai: entry.mnemonicThai,
    classId: entry.class,
    classLabelDe: CLASS_LABEL_DE[entry.class],
    ttsThai: entry.ttsPhraseThai,
  };
}

export const CONSONANT_CATALOG: ConsonantCatalogEntry[] = [
  ...MID_CLASS_CONSONANTS,
  ...HIGH_CLASS_CONSONANTS,
  ...LOW_CLASS_CONSONANTS,
]
  .map(toCatalogEntry)
  .sort((a, b) => orderIndex(a.thai) - orderIndex(b.thai));
