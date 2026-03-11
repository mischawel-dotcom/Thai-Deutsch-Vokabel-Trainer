import { useEffect, useState, useMemo } from "react";
import { db } from "../db/db";
import type { NumberEntry, VocabEntry } from "../db/db";
import { normalizeNumberAnswer } from "../features/exam/helpers";
import { buildExamQuestions, getAvailableLessons, groupEntriesByLesson } from "../features/exam/engine";
import type { Question } from "../features/exam/types";
import { SelectionScreen } from "../features/exam/components/SelectionScreen";
import { DirectionScreen } from "../features/exam/components/DirectionScreen";
import { TestingScreen } from "../features/exam/components/TestingScreen";
import { ResultScreen } from "../features/exam/components/ResultScreen";
import { completeLessonViaExam } from "../lib/lessonProgress";
import {
  type ExamDomain,
  isExamSessionData,
  type ExamDirection,
  type ExamQuestionData,
  type ExamSessionData,
  type ExamState,
} from "../lib/sessionTypes";
import { usePersistedSession } from "../hooks/usePersistedSession";

export default function Exam() {
  const [state, setState] = useState<ExamState>("selection");
  const [examDomain, setExamDomain] = useState<ExamDomain>("vocab");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [direction, setDirection] = useState<ExamDirection>("TH_DE");
  const [vocabByLesson, setVocabByLesson] = useState<Record<number, VocabEntry[]>>({});
  const [numbersByLesson, setNumbersByLesson] = useState<Record<number, NumberEntry[]>>({});
  const [loading, setLoading] = useState(true);

  // Exam State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, string>>({});
  const [nextQuestionTimer, setNextQuestionTimer] = useState<NodeJS.Timeout | null>(null);
  const [confirmEndExamOpen, setConfirmEndExamOpen] = useState(false);
  const {
    hydrated: examSessionHydrated,
    restoredSession: restoredExamSession,
    savePersistedSession: saveExamSession,
    clearPersistedSession: clearExamSession,
  } = usePersistedSession<ExamSessionData>({
    key: "examSession",
    isValid: isExamSessionData,
  });

  // Load vocab auf Component Mount
  useEffect(() => {
    loadVocab();
  }, []);

  useEffect(() => {
    const shouldOpenNumbersExam = localStorage.getItem("openNumbersExamMode") === "true";
    if (!shouldOpenNumbersExam) return;
    setExamDomain("numbers");
    localStorage.removeItem("openNumbersExamMode");
  }, []);

  // Restore session after data loads
  useEffect(() => {
    if (Object.keys(vocabByLesson).length === 0 && Object.keys(numbersByLesson).length === 0) return;
    const session = restoredExamSession;
    if (!session) return;

    const restoredQuestions = session.questions as Question[];
    if (session.state === "testing" && restoredQuestions.length > 0) {
      setExamDomain(session.domain ?? "vocab");
      setSelectedLesson(session.selectedLesson);
      setDirection(session.direction);
      const normalizedQuestions =
        (session.domain ?? "vocab") === "numbers"
          ? restoredQuestions.map((q) => ({
              ...q,
              correctAnswer: normalizeNumberAnswer(q.correctAnswer, session.direction),
              options: q.options.map((opt) => normalizeNumberAnswer(opt, session.direction)),
            }))
          : restoredQuestions;
      setQuestions(normalizedQuestions);
      setCurrentQuestionIndex(session.currentQuestionIndex);
      setScore(session.score);
      setAnswered(session.answered);
      setState("testing");
    } else {
      clearExamSession();
    }
  }, [vocabByLesson, numbersByLesson, restoredExamSession, clearExamSession]);

  // Save session on every change
  useEffect(() => {
    if (!examSessionHydrated) return;

    if (state === "testing" && questions.length > 0) {
      const sessionData = {
        state,
        selectedLesson,
        domain: examDomain,
        direction,
        questions: questions as ExamQuestionData[],
        currentQuestionIndex,
        score,
        answered,
      } satisfies ExamSessionData;
      saveExamSession(sessionData);
    } else {
      clearExamSession();
    }
  }, [examSessionHydrated, state, selectedLesson, examDomain, direction, questions, currentQuestionIndex, score, answered, saveExamSession, clearExamSession]);

  // Handle exam completion
  useEffect(() => {
    if (state === "result" && selectedLesson !== null && examDomain === "vocab") {
      const percentage = Math.round((score / questions.length) * 100);
      if (percentage >= 85) {
        completeLessonViaExam(selectedLesson, percentage);
      }
    }
  }, [state, selectedLesson, examDomain, score, questions.length]);

  async function loadVocab() {
    try {
      const allVocab = await db.vocab.toArray();
      const allNumbers = await db.numbersVocab.toArray();

      setVocabByLesson(groupEntriesByLesson(allVocab));
      setNumbersByLesson(groupEntriesByLesson(allNumbers));
    } catch (err) {
      console.error("Error loading vocab:", err);
    } finally {
      setLoading(false);
    }
  }

  const availableLessons = useMemo(() => {
    return getAvailableLessons(examDomain, vocabByLesson, numbersByLesson);
  }, [examDomain, numbersByLesson, vocabByLesson]);

  function startExam(lesson: number, examDirection: ExamDirection) {
    const vocabForLesson =
      examDomain === "numbers"
        ? numbersByLesson[lesson]
        : vocabByLesson[lesson];
    if (!vocabForLesson || vocabForLesson.length === 0) return;

    const generatedQuestions = buildExamQuestions(vocabForLesson, examDomain, examDirection);

    setSelectedLesson(lesson);
    setDirection(examDirection);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered({});
    setState("testing");
  }

  function handleAnswer(selectedOption: string) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedOption === question.correctAnswer;
    setAnswered({
      ...answered,
      [currentQuestionIndex]: selectedOption,
    });

    if (isCorrect) {
      setScore(score + 1);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(isCorrect ? 40 : 120);
      } catch {
        // ignore unsupported vibration failures
      }
    }

    // Auto-continue after 2 seconds
    const timer = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Exam finished
        setState("result");
      }
    }, 2000);

    setNextQuestionTimer(timer);
  }

  function resetExam() {
    if (nextQuestionTimer) clearTimeout(nextQuestionTimer);
    clearExamSession();
    setState("selection");
    setSelectedLesson(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered({});
  }

  // Selection State
  if (state === "selection") {
    return (
      <SelectionScreen
        loading={loading}
        examDomain={examDomain}
        availableLessons={availableLessons}
        vocabByLesson={vocabByLesson}
        numbersByLesson={numbersByLesson}
        onDomainChange={setExamDomain}
        onLessonSelect={(lesson) => {
          setSelectedLesson(lesson);
          setState("direction");
        }}
      />
    );
  }

  // Direction State
  if (state === "direction" && selectedLesson !== null) {
    return (
      <DirectionScreen
        examDomain={examDomain}
        selectedLesson={selectedLesson}
        onStart={(examDirection) => startExam(selectedLesson, examDirection)}
        onBack={() => {
          setState("selection");
          setSelectedLesson(null);
        }}
      />
    );
  }

  // Testing State
  if (state === "testing" && questions.length > 0) {
    return (
      <TestingScreen
        examDomain={examDomain}
        direction={direction}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        score={score}
        answered={answered}
        confirmEndExamOpen={confirmEndExamOpen}
        onAnswer={handleAnswer}
        onContinue={() => {
          if (nextQuestionTimer) clearTimeout(nextQuestionTimer);
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            setState("result");
          }
        }}
        onConfirmDialogChange={setConfirmEndExamOpen}
        onEndRequest={() => setConfirmEndExamOpen(true)}
        onCancelEnd={() => setConfirmEndExamOpen(false)}
        onConfirmEnd={() => {
          setConfirmEndExamOpen(false);
          resetExam();
        }}
      />
    );
  }

  // Result State
  if (state === "result") {
    return (
      <ResultScreen
        score={score}
        totalQuestions={questions.length}
        onReset={resetExam}
        onRepeat={() => {
          resetExam();
          startExam(selectedLesson || 1, direction);
        }}
      />
    );
  }

  return null;
}
