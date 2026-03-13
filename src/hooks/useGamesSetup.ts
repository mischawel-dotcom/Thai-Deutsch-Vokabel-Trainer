import { useEffect, useMemo, useState } from "react";

export type GameMode = "blitz" | "quiz" | "audio" | "numbers";
export type GameDirection = "TH_DE" | "DE_TH";
export type QuestionCountOption = 10 | 15 | 20 | "ALL";
export type BlitzDurationOption = 60 | 90 | 120;

const QUIZ_QUESTION_COUNT_KEY = "gamesQuizQuestionCount";
const AUDIO_QUESTION_COUNT_KEY = "gamesAudioQuestionCount";
const NUMBER_QUESTION_COUNT_KEY = "gamesNumberQuestionCount";
const BLITZ_DURATION_KEY = "gamesBlitzDurationSec";
const NUMBER_MAX_VALUE_KEY = "gamesNumberMaxValue";

export function useGamesSetup() {
  const [mode, setMode] = useState<GameMode>("blitz");
  const [direction, setDirection] = useState<GameDirection>("TH_DE");
  const [onlyLearned, setOnlyLearned] = useState(true);
  const [quizQuestionCount, setQuizQuestionCount] = useState<QuestionCountOption>(() => {
    const raw = localStorage.getItem(QUIZ_QUESTION_COUNT_KEY);
    if (raw === "ALL") return "ALL";
    const parsed = Number.parseInt(raw ?? "", 10);
    if (parsed === 10 || parsed === 15 || parsed === 20) return parsed;
    return 10;
  });
  const [audioQuestionCount, setAudioQuestionCount] = useState<QuestionCountOption>(() => {
    const raw = localStorage.getItem(AUDIO_QUESTION_COUNT_KEY);
    if (raw === "ALL") return "ALL";
    const parsed = Number.parseInt(raw ?? "", 10);
    if (parsed === 10 || parsed === 15 || parsed === 20) return parsed;
    return 10;
  });
  const [numberQuestionCount, setNumberQuestionCount] = useState<QuestionCountOption>(() => {
    const raw = localStorage.getItem(NUMBER_QUESTION_COUNT_KEY);
    if (raw === "ALL") return "ALL";
    const parsed = Number.parseInt(raw ?? "", 10);
    if (parsed === 10 || parsed === 15 || parsed === 20) return parsed;
    return 10;
  });
  const [blitzDurationSec, setBlitzDurationSec] = useState<BlitzDurationOption>(() => {
    const parsed = Number.parseInt(localStorage.getItem(BLITZ_DURATION_KEY) ?? "", 10);
    if (parsed === 60 || parsed === 90 || parsed === 120) return parsed;
    return 60;
  });
  const [numberMaxValue, setNumberMaxValue] = useState<number>(() => {
    const parsed = Number.parseInt(localStorage.getItem(NUMBER_MAX_VALUE_KEY) ?? "", 10);
    if (!Number.isFinite(parsed)) return 1000;
    return Math.max(100, Math.min(1_000_000, parsed));
  });
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>(undefined);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const selectedQuestionCount = useMemo(
    () =>
      mode === "quiz"
        ? quizQuestionCount
        : mode === "audio"
          ? audioQuestionCount
          : numberQuestionCount,
    [audioQuestionCount, mode, numberQuestionCount, quizQuestionCount]
  );
  const allLearnedModeActive = useMemo(
    () => (mode === "quiz" || mode === "audio" || mode === "numbers") && selectedQuestionCount === "ALL",
    [mode, selectedQuestionCount]
  );

  useEffect(() => {
    localStorage.setItem(QUIZ_QUESTION_COUNT_KEY, String(quizQuestionCount));
  }, [quizQuestionCount]);

  useEffect(() => {
    localStorage.setItem(AUDIO_QUESTION_COUNT_KEY, String(audioQuestionCount));
  }, [audioQuestionCount]);

  useEffect(() => {
    localStorage.setItem(NUMBER_QUESTION_COUNT_KEY, String(numberQuestionCount));
  }, [numberQuestionCount]);

  useEffect(() => {
    localStorage.setItem(BLITZ_DURATION_KEY, String(blitzDurationSec));
  }, [blitzDurationSec]);

  useEffect(() => {
    localStorage.setItem(NUMBER_MAX_VALUE_KEY, String(numberMaxValue));
  }, [numberMaxValue]);

  useEffect(() => {
    if (allLearnedModeActive && !onlyLearned) {
      setOnlyLearned(true);
    }
  }, [allLearnedModeActive, onlyLearned]);

  return {
    mode,
    setMode,
    direction,
    setDirection,
    onlyLearned,
    setOnlyLearned,
    quizQuestionCount,
    setQuizQuestionCount,
    audioQuestionCount,
    setAudioQuestionCount,
    numberQuestionCount,
    setNumberQuestionCount,
    numberMaxValue,
    setNumberMaxValue,
    blitzDurationSec,
    setBlitzDurationSec,
    selectedLesson,
    setSelectedLesson,
    setupDialogOpen,
    setSetupDialogOpen,
    selectedQuestionCount,
    allLearnedModeActive,
  };
}
