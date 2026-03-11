import type { NumberEntry, VocabEntry } from "../../db/db";
import type { ExamDirection, ExamDomain } from "../../lib/sessionTypes";
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
    const uniqueAnswers = Array.from(
      new Map(
        otherEntries.map((v) => [toExamAnswerLabel(v, domain, direction), v])
      ).values()
    );
    const wrongAnswers = shuffle(uniqueAnswers)
      .slice(0, 3)
      .map((v) => toExamAnswerLabel(v, domain, direction));

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

