/**
 * Statischer Lerninhalt: Thai-Konsonanten (Phase 1).
 * Beispielwörter sind wo möglich an thai-de-vocab_Ver_2.csv angelehnt.
 */

export type ConsonantClassId = "mid" | "high" | "low";

export interface ThaiConsonantEntry {
  /** Einzelnes Thai-Zeichen */
  char: string;
  class: ConsonantClassId;
  /** Mnemonik wie im Thai-Unterricht, z. B. ก.ไก่ */
  mnemonicThai: string;
  /** Lesung des Buchstabennamens (ungefähr RTGS) */
  mnemonicRtgs: string;
  /** Bedeutung des Namensworts (Kurz, Deutsch) */
  mnemonicDe: string;
  /** Silbenanlaut in einfachen Worten (Deutsch) */
  initialSoundDe: string;
  /** Beispiel aus dem Vokabeltrainer, falls passend */
  exampleFromVocab?: {
    thai: string;
    german: string;
    transliteration: string;
  };
  /** Wenn kein gutes Trainer-Vokabel oder nur Namenswort */
  exampleNoteDe?: string;
  /** Phrase für Thai-TTS (klassischer Buchstabenname, z. B. „กอไก่“) */
  ttsPhraseThai: string;
}

/**
 * Mittelklasse-Konsonanten (9): Grundlage für spätere Tonregeln.
 * Reihenfolge: übliche didaktische Abfolge.
 */
export const MID_CLASS_CONSONANTS: ThaiConsonantEntry[] = [
  {
    char: "ก",
    class: "mid",
    mnemonicThai: "ก.ไก่",
    mnemonicRtgs: "gor gai",
    mnemonicDe: "Huhn",
    initialSoundDe:
      "unbehaucht (ohne Luftstoß wie bei deutschem „Kuh“); klingt zwischen „k“ und „g“",
    exampleFromVocab: {
      thai: "กิน",
      german: "essen",
      transliteration: "gin",
    },
    ttsPhraseThai: "กอไก่",
  },
  {
    char: "จ",
    class: "mid",
    mnemonicThai: "จ.จาน",
    mnemonicRtgs: "jor jaan",
    mnemonicDe: "Teller",
    initialSoundDe: "wie „dsch“ (z. B. Dschungel)",
    exampleFromVocab: {
      thai: "จาน",
      german: "Teller",
      transliteration: "jaan",
    },
    ttsPhraseThai: "จอจาน",
  },
  {
    char: "ด",
    class: "mid",
    mnemonicThai: "ด.เด็ก",
    mnemonicRtgs: "dor dek",
    mnemonicDe: "Kind",
    initialSoundDe: "wie „d“",
    exampleFromVocab: {
      thai: "เด็ก",
      german: "Kind",
      transliteration: "dek",
    },
    ttsPhraseThai: "ดอเด็ก",
  },
  {
    char: "ฎ",
    class: "mid",
    mnemonicThai: "ฎ.ชฎา",
    mnemonicRtgs: "dor cha-daa",
    mnemonicDe: "trad. Kopfschmuck (im Namen)",
    initialSoundDe: "wie „d“ (seltener Buchstabe, gleicher Laut wie ด)",
    exampleNoteDe:
      "Kommt fast nur in Lehn- oder Fachwörtern vor. Laut = wie ด.",
    ttsPhraseThai: "ฎอชฎา",
  },
  {
    char: "ต",
    class: "mid",
    mnemonicThai: "ต.เต่า",
    mnemonicRtgs: "tor tao",
    mnemonicDe: "Schildkröte",
    initialSoundDe:
      "wie „t“, unbehaucht – nicht wie englisches „th“ in „think“",
    exampleFromVocab: {
      thai: "ตา",
      german: "Auge",
      transliteration: "taa",
    },
    ttsPhraseThai: "ตอเต่า",
  },
  {
    char: "ฏ",
    class: "mid",
    mnemonicThai: "ฏ.ปฏัก",
    mnemonicRtgs: "tor pa-tak",
    mnemonicDe: "Stachelstock (im Namen)",
    initialSoundDe: "wie „t“ (seltener Buchstabe, gleicher Laut wie ต)",
    exampleNoteDe:
      "Kommt fast nur in Lehn- oder Fachwörtern vor. Laut = wie ต.",
    ttsPhraseThai: "ฏอปฏัก",
  },
  {
    char: "บ",
    class: "mid",
    mnemonicThai: "บ.ใบไม้",
    mnemonicRtgs: "bor bai mai",
    mnemonicDe: "Blatt",
    initialSoundDe: "wie „b“",
    exampleFromVocab: {
      thai: "บ้าน",
      german: "Haus",
      transliteration: "baan",
    },
    ttsPhraseThai: "บอใบไม้",
  },
  {
    char: "ป",
    class: "mid",
    mnemonicThai: "ป.ปลา",
    mnemonicRtgs: "por plaa",
    mnemonicDe: "Fisch",
    initialSoundDe: "wie „p“, unbehaucht (ohne Luftstoß wie bei „Paar“)",
    exampleFromVocab: {
      thai: "ปลา",
      german: "Fisch",
      transliteration: "plaa",
    },
    ttsPhraseThai: "ปอปลา",
  },
  {
    char: "อ",
    class: "mid",
    mnemonicThai: "อ.อ่าง",
    mnemonicRtgs: "or ang",
    mnemonicDe: "Wanne/Becken",
    initialSoundDe:
      "oft stumm als Platzhalter; mit Vokalen voll aussprechbar (z. B. offener Vokal)",
    exampleFromVocab: {
      thai: "อยู่",
      german: "sein/wohnen",
      transliteration: "yuu",
    },
    ttsPhraseThai: "ออ่าง",
  },
];

export { HIGH_CLASS_CONSONANTS, LOW_CLASS_CONSONANTS } from "./consonantsHighLow";
