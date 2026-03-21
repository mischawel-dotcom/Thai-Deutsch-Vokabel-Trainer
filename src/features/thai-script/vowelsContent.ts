/**
 * Phase 1: Grundvokale (Vokalzeichen mit ก … oder gängigen Beispielwörtern).
 * Reihenfolge: erst rechts/unten/oben am Konsonanten, dann Präfix-Vokale (เ แ โ), ใ/ไ, ำ.
 */

export interface ThaiVowelEntry {
  /** Groß dargestelltes Zeichen oder Kurznotation (z. B. „เ…“) */
  vowelDisplay: string;
  /** Thai-Name des Vokals */
  nameThai: string;
  nameRtgs: string;
  nameDe: string;
  /** Wo sitzt das Zeichen relativ zum Konsonanten? */
  positionDe: string;
  /** Beispielwort oder -silbe */
  exampleThai: string;
  exampleTransliteration: string;
  exampleGerman: string;
  /** Zusatzinfo (z. B. wenn nicht mit ก) */
  hintDe?: string;
  /** TTS: meist das Beispielwort */
  ttsPhraseThai: string;
}

export const PHASE1_VOWELS: ThaiVowelEntry[] = [
  {
    vowelDisplay: "า",
    nameThai: "สระ อา",
    nameRtgs: "sara aa",
    nameDe: "langes „a“",
    positionDe: "rechts vom Konsonanten",
    exampleThai: "กา",
    exampleTransliteration: "kaa",
    exampleGerman: "Silbe „kaa“ (wie ein langes a)",
    ttsPhraseThai: "กา",
  },
  {
    vowelDisplay: "ะ",
    nameThai: "สระ อะ",
    nameRtgs: "sara a",
    nameDe: "kurzes „a“",
    positionDe: "rechts vom Konsonanten (oft Silbenende)",
    exampleThai: "กะ",
    exampleTransliteration: "ka",
    exampleGerman: "kurzes „a“ (hier als Silbe)",
    ttsPhraseThai: "กะ",
  },
  {
    vowelDisplay: "ิ",
    nameThai: "สระ อิ",
    nameRtgs: "sara i",
    nameDe: "kurzes „i“",
    positionDe: "über dem Konsonanten",
    exampleThai: "กิน",
    exampleTransliteration: "gin",
    exampleGerman: "essen",
    ttsPhraseThai: "กิน",
  },
  {
    vowelDisplay: "ี",
    nameThai: "สระ อี",
    nameRtgs: "sara ii",
    nameDe: "langes „i“",
    positionDe: "über dem Konsonanten",
    exampleThai: "มี",
    exampleTransliteration: "mii",
    exampleGerman: "haben",
    ttsPhraseThai: "มี",
  },
  {
    vowelDisplay: "ุ",
    nameThai: "สระ อุ",
    nameRtgs: "sara u",
    nameDe: "kurzes „u“",
    positionDe: "unter dem Konsonanten",
    exampleThai: "กุ้ง",
    exampleTransliteration: "gung",
    exampleGerman: "Garnele",
    ttsPhraseThai: "กุ้ง",
  },
  {
    vowelDisplay: "ู",
    nameThai: "สระ อู",
    nameRtgs: "sara uu",
    nameDe: "langes „u“",
    positionDe: "unter dem Konsonanten",
    exampleThai: "กู้",
    exampleTransliteration: "kuu",
    exampleGerman: "borgen / leihen (Silbe)",
    ttsPhraseThai: "กู้",
  },
  {
    vowelDisplay: "เ…",
    nameThai: "สระ เอ",
    nameRtgs: "sara e",
    nameDe: "„e“-Art (Vorderzunge)",
    positionDe: "links vor dem Konsonanten (เ + Konsonant + …)",
    exampleThai: "เก็บ",
    exampleTransliteration: "gep",
    exampleGerman: "aufheben / nehmen",
    hintDe: "Das เ steht vor dem Konsonanten, die Silbe liest sich von links.",
    ttsPhraseThai: "เก็บ",
  },
  {
    vowelDisplay: "แ…",
    nameThai: "สระ แอ",
    nameRtgs: "sara ae",
    nameDe: "offenes „ä“ / „ae“",
    positionDe: "links vor dem Konsonanten (แ ก …)",
    exampleThai: "แม่",
    exampleTransliteration: "mae",
    exampleGerman: "Mutter",
    ttsPhraseThai: "แม่",
  },
  {
    vowelDisplay: "โ…",
    nameThai: "สระ โอ",
    nameRtgs: "sara o",
    nameDe: "„o“",
    positionDe: "links vor dem Konsonanten (โ ก …)",
    exampleThai: "โต๊ะ",
    exampleTransliteration: "to",
    exampleGerman: "Tisch",
    ttsPhraseThai: "โต๊ะ",
  },
  {
    vowelDisplay: "ไ…",
    nameThai: "สระ ไอ",
    nameRtgs: "sara ai",
    nameDe: "Diphthong „ai“",
    positionDe: "links vor dem Konsonanten (ไ ก …)",
    exampleThai: "ไก่",
    exampleTransliteration: "gai",
    exampleGerman: "Huhn",
    ttsPhraseThai: "ไก่",
  },
  {
    vowelDisplay: "ใ…",
    nameThai: "สระ ไอ (ใ-Form)",
    nameRtgs: "sara ai",
    nameDe: "gleicher Laut wie ไ…, andere Schreibung",
    positionDe: "links vor dem Konsonanten (nur wenige Wörter mit ใ)",
    exampleThai: "ใคร",
    exampleTransliteration: "khrai",
    exampleGerman: "wer",
    hintDe: "ใ- kommt nur in wenigen häufigen Wörtern vor (Merken!).",
    ttsPhraseThai: "ใคร",
  },
  {
    vowelDisplay: "ำ",
    nameThai: "สระ อำ",
    nameRtgs: "sara am",
    nameDe: "nasaliertes „am“",
    positionDe: "ersetzt rechten Vokal und nasaliert (klingt wie „am“/„ang“)",
    exampleThai: "ทำ",
    exampleTransliteration: "tham",
    exampleGerman: "machen / tun",
    hintDe: "Beispiel mit ท; ำ hängt direkt an den Konsonanten.",
    ttsPhraseThai: "ทำ",
  },
];
