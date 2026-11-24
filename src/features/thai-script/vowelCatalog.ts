/**
 * Die 32 thailändischen Vokalformen (Referenzliste, ohne Lernfortschritt).
 * TTS: bei ฤ/ฦ ggf. vereinfachte Silbe (wie in der HTML-Vorlage).
 */

export type VowelCatalogEntry = {
  /** Thai-Darstellung (mit Träger อ wo üblich) */
  thai: string;
  /** Deutsche Lautschrift / Kurzbeschreibung */
  romanization: string;
  /** Text für Speech Synthesis */
  ttsThai: string;
};

export const VOWEL_CATALOG: VowelCatalogEntry[] = [
  { thai: "อะ", romanization: "a (kurz)", ttsThai: "อะ" },
  { thai: "อา", romanization: "aa (lang)", ttsThai: "อา" },
  { thai: "อิ", romanization: "i (kurz)", ttsThai: "อิ" },
  { thai: "อี", romanization: "ii (lang)", ttsThai: "อี" },
  { thai: "อึ", romanization: "ü (kurz)", ttsThai: "อึ" },
  { thai: "อือ", romanization: "üü (lang)", ttsThai: "อือ" },
  { thai: "อุ", romanization: "u (kurz)", ttsThai: "อุ" },
  { thai: "อู", romanization: "uu (lang)", ttsThai: "อู" },
  { thai: "เอะ", romanization: "e (kurz)", ttsThai: "เอะ" },
  { thai: "เอ", romanization: "ee (lang)", ttsThai: "เอ" },
  { thai: "แอะ", romanization: "ä (kurz)", ttsThai: "แอะ" },
  { thai: "แอ", romanization: "ää (lang)", ttsThai: "แอ" },
  { thai: "โอะ", romanization: "o (kurz)", ttsThai: "โอะ" },
  { thai: "โอ", romanization: "oo (lang)", ttsThai: "โอ" },
  { thai: "เอาะ", romanization: "o offen (kurz)", ttsThai: "เอาะ" },
  { thai: "ออ", romanization: "oo offen (lang)", ttsThai: "ออ" },
  { thai: "เออะ", romanization: "ö (kurz)", ttsThai: "เออะ" },
  { thai: "เออ", romanization: "öö (lang)", ttsThai: "เออ" },
  { thai: "เอียะ", romanization: "ia (kurz)", ttsThai: "เอียะ" },
  { thai: "เอีย", romanization: "ia (lang)", ttsThai: "เอีย" },
  { thai: "เอือะ", romanization: "üa (kurz)", ttsThai: "เอือะ" },
  { thai: "เอือ", romanization: "üa (lang)", ttsThai: "เอือ" },
  { thai: "อัวะ", romanization: "ua (kurz)", ttsThai: "อัวะ" },
  { thai: "อัว", romanization: "ua (lang)", ttsThai: "อัว" },
  { thai: "อำ", romanization: "am", ttsThai: "อำ" },
  { thai: "ใอ", romanization: "ai (ม้วน)", ttsThai: "ใอ" },
  { thai: "ไอ", romanization: "ai (มลาย)", ttsThai: "ไอ" },
  { thai: "เอา", romanization: "ao", ttsThai: "เอา" },
  { thai: "ฤ", romanization: "rü/ri", ttsThai: "รึ" },
  { thai: "ฤๅ", romanization: "rüü", ttsThai: "รือ" },
  { thai: "ฦ", romanization: "lü", ttsThai: "ลึ" },
  { thai: "ฦๅ", romanization: "lüü", ttsThai: "ลือ" },
];
