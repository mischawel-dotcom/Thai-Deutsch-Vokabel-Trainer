import type { NumberEntry, VocabEntry } from "../../db/db";
import type { ExamDirection, ExamDomain } from "../../lib/sessionTypes";

export function getSpeakableText(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeNumberAnswer(text: string, direction: ExamDirection): string {
  const trimmed = text.trim();
  if (direction === "TH_DE") {
    const arabic = trimmed.match(/\d+/)?.[0];
    return arabic ?? trimmed;
  }
  const thaiDigits = trimmed.match(/[๐-๙]+/)?.[0];
  return thaiDigits ?? trimmed;
}

export function toExamLabels(
  entry: VocabEntry | NumberEntry,
  domain: ExamDomain
): { thai: string; german: string } {
  if (domain === "numbers") {
    const numberEntry = entry as NumberEntry;
    return {
      thai: `${numberEntry.thaiWord} (${numberEntry.thaiDigit})`,
      german: `${numberEntry.german} (${numberEntry.arabic})`,
    };
  }
  const vocabEntry = entry as VocabEntry;
  return {
    thai: vocabEntry.thai,
    german: vocabEntry.german,
  };
}

export function toExamAnswerLabel(
  entry: VocabEntry | NumberEntry,
  domain: ExamDomain,
  examDirection: ExamDirection
): string {
  if (domain === "numbers") {
    const numberEntry = entry as NumberEntry;
    return examDirection === "TH_DE" ? String(numberEntry.arabic) : numberEntry.thaiDigit;
  }
  const vocabEntry = entry as VocabEntry;
  return examDirection === "TH_DE" ? vocabEntry.german : vocabEntry.thai;
}

