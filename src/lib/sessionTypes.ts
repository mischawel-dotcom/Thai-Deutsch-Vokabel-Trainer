import type { VocabEntry } from "../db/db";

export type LearnDirection = "TH_DE" | "DE_TH";
export type ExamDirection = "TH_DE" | "DE_TH";
export type ExamState = "selection" | "direction" | "testing" | "result";
export type ExamDomain = "vocab" | "numbers";

export type LearnSessionData = {
  sessionActive: boolean;
  lessonCards: VocabEntry[];
  currentIndex: number;
};

export type TestSessionData = {
  sessionActive: boolean;
  queue: number[];
  currentRound: number[];
  currentId: number | null;
  flipped: boolean;
  roundIndex: number;
  direction: LearnDirection;
  onlyDue: boolean;
};

export type PersistedTestSessionData = TestSessionData & {
  streaks: Array<[number, number]>;
  doneIds: number[];
};

export type ExamQuestionData = {
  entryId: number;
  thai: string;
  german: string;
  correctAnswer: string;
  options: string[];
  questionText: string;
};

export type ExamSessionData = {
  state: ExamState;
  selectedLesson: number | null;
  domain?: ExamDomain;
  direction: ExamDirection;
  questions: ExamQuestionData[];
  currentQuestionIndex: number;
  score: number;
  answered: Record<number, string>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((v) => typeof v === "number");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isDirection(value: unknown): value is LearnDirection {
  return value === "TH_DE" || value === "DE_TH";
}

function isExamState(value: unknown): value is ExamState {
  return value === "selection" || value === "direction" || value === "testing" || value === "result";
}

function isExamDomain(value: unknown): value is ExamDomain {
  return value === "vocab" || value === "numbers";
}

function isVocabEntry(value: unknown): value is VocabEntry {
  if (!isObject(value)) return false;
  return typeof value.thai === "string" && typeof value.german === "string";
}

function isExamQuestionData(value: unknown): value is ExamQuestionData {
  if (!isObject(value)) return false;
  return (
    typeof value.entryId === "number" &&
    typeof value.thai === "string" &&
    typeof value.german === "string" &&
    typeof value.correctAnswer === "string" &&
    isStringArray(value.options) &&
    typeof value.questionText === "string"
  );
}

export function isLearnSessionData(value: unknown): value is LearnSessionData {
  if (!isObject(value)) return false;
  return (
    typeof value.sessionActive === "boolean" &&
    Array.isArray(value.lessonCards) &&
    value.lessonCards.every(isVocabEntry) &&
    typeof value.currentIndex === "number"
  );
}

export function isTestSessionData(value: unknown): value is TestSessionData {
  if (!isObject(value)) return false;
  return (
    typeof value.sessionActive === "boolean" &&
    isNumberArray(value.queue) &&
    isNumberArray(value.currentRound) &&
    (typeof value.currentId === "number" || value.currentId === null) &&
    typeof value.flipped === "boolean" &&
    typeof value.roundIndex === "number" &&
    isDirection(value.direction) &&
    typeof value.onlyDue === "boolean"
  );
}

export function isPersistedTestSessionData(value: unknown): value is PersistedTestSessionData {
  if (!isObject(value)) return false;
  const baseOk =
    typeof value.sessionActive === "boolean" &&
    isNumberArray(value.queue) &&
    isNumberArray(value.currentRound) &&
    (typeof value.currentId === "number" || value.currentId === null) &&
    typeof value.flipped === "boolean" &&
    typeof value.roundIndex === "number" &&
    isDirection(value.direction) &&
    typeof value.onlyDue === "boolean";
  if (!baseOk) return false;
  const streaksOk =
    Array.isArray(value.streaks) &&
    value.streaks.every(
      (entry: unknown) =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "number" &&
        typeof entry[1] === "number"
    );
  const doneIdsOk = isNumberArray(value.doneIds);
  return streaksOk && doneIdsOk;
}

export function isExamSessionData(value: unknown): value is ExamSessionData {
  if (!isObject(value)) return false;
  const answeredOk =
    isObject(value.answered) &&
    Object.values(value.answered).every((v) => typeof v === "string");
  return (
    isExamState(value.state) &&
    (typeof value.selectedLesson === "number" || value.selectedLesson === null) &&
    (value.domain === undefined || isExamDomain(value.domain)) &&
    isDirection(value.direction) &&
    Array.isArray(value.questions) &&
    value.questions.every(isExamQuestionData) &&
    typeof value.currentQuestionIndex === "number" &&
    typeof value.score === "number" &&
    answeredOk
  );
}
