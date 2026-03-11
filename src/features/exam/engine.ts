import type { NumberEntry, VocabEntry } from "../../db/db";
import type { ExamDirection, ExamDomain } from "../../lib/sessionTypes";
import { generateNumber, toThaiDigits } from "../../lib/number-generator";
import { shuffle } from "../../lib/shuffle";
import { toExamAnswerLabel, toExamLabels } from "./helpers";
import type { Question } from "./types";

export function groupEntriesByLesson<T extends { lesson?: number }>(entries: T[]): Record<number, T[]> {
  const grouped: Record<number, T[]> = {};
  entries.forEach((entry) => {
    const lesson = entry.lesson || 0;
    if (!grouped[lesson]) grouped[lesson] = [];
    grouped[lesson].push(entry);
  });
  return grouped;
}

export function getAvailableLessons(
  domain: ExamDomain,
  vocabByLesson: Record<number, VocabEntry[]>,
  numbersByLesson: Record<number, NumberEntry[]>
): number[] {
  const source = domain === "numbers" ? numbersByLesson : vocabByLesson;
  return Object.keys(source)
    .map(Number)
    .filter((lesson) => lesson > 0 && (source[lesson]?.length ?? 0) > 0)
    .sort((a, b) => a - b);
}

export function buildExamQuestions(
  entries: Array<VocabEntry | NumberEntry>,
  domain: ExamDomain,
  direction: ExamDirection
): Question[] {
  const generatedQuestions: Question[] = entries.map((entry) => {
    const labels = toExamLabels(entry, domain);
    const isThaiToDeutsch = direction === "TH_DE";
    const correctAnswer = toExamAnswerLabel(entry, domain, direction);

    const otherEntries = entries.filter((v) => v.id !== entry.id);
    let wrongAnswers: string[] = [];

    if (domain === "numbers") {
      const numberEntry = entry as NumberEntry;
      const numberEntries = entries as NumberEntry[];
      const digitCount = String(numberEntry.arabic).length;
      const candidateLabels = new Set<string>();

      numberEntries
        .filter((candidate) => candidate.id !== numberEntry.id)
        .filter((candidate) => String(candidate.arabic).length === digitCount)
        .forEach((candidate) => {
          candidateLabels.add(toExamAnswerLabel(candidate, domain, direction));
        });

      // If lesson pool is too small, synthesize additional same-length distractors.
      if (candidateLabels.size < 3) {
        const minValue = digitCount === 1 ? 0 : 10 ** (digitCount - 1);
        const maxValue = 10 ** digitCount - 1;
        let attempts = 0;
        while (candidateLabels.size < 3 && attempts < 100) {
          const value = minValue + Math.floor(Math.random() * (maxValue - minValue + 1));
          if (value === numberEntry.arabic) {
            attempts += 1;
            continue;
          }
          const label = direction === "TH_DE" ? String(value) : toThaiDigits(value);
          candidateLabels.add(label);
          attempts += 1;
        }
      }

      wrongAnswers = shuffle(Array.from(candidateLabels)).slice(0, 3);
    } else {
      const uniqueAnswers = Array.from(
        new Map(otherEntries.map((v) => [toExamAnswerLabel(v, domain, direction), v])).values()
      );
      wrongAnswers = shuffle(uniqueAnswers)
        .slice(0, 3)
        .map((v) => toExamAnswerLabel(v, domain, direction));
    }

    const allOptions = [correctAnswer, ...wrongAnswers];
    const uniqueOptions = Array.from(new Set(allOptions));
    const shuffledOptions = shuffle(uniqueOptions);

    return {
      entryId: entry.id || 0,
      thai: labels.thai,
      german: labels.german,
      correctAnswer,
      options: shuffledOptions,
      questionText: isThaiToDeutsch ? labels.thai : labels.german,
    };
  });

  return shuffle(generatedQuestions);
}

function pickUniqueNumbers(from: number, to: number, count: number): number[] {
  const poolSize = to - from + 1;
  if (count >= poolSize) {
    return Array.from({ length: poolSize }, (_, idx) => from + idx);
  }

  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(from + Math.floor(Math.random() * poolSize));
  }
  return Array.from(picked);
}

export function buildWeightedGeneratedNumberExamEntries(): NumberEntry[] {
  const values = [
    ...pickUniqueNumbers(0, 100, 60),
    ...pickUniqueNumbers(101, 1_000, 20),
    ...pickUniqueNumbers(1_001, 100_000, 15),
    ...pickUniqueNumbers(100_001, 9_999_999, 5),
  ].sort((a, b) => a - b);

  return values.map((value) => {
    const generated = generateNumber(value);
    return {
      id: 3_000_000_000 + value,
      arabic: generated.arabic,
      thaiWord: generated.thaiWord,
      thaiDigit: generated.thaiDigit,
      german: generated.german,
      transliteration: generated.transliteration,
      lesson: 1,
      tags: ["Numbers", "Generated", "Exam"],
      viewed: true,
      createdAt: 0,
      updatedAt: 0,
    } satisfies NumberEntry;
  });
}

