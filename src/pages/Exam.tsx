import { useEffect, useState, useMemo } from "react";
import { db } from "../db/db";
import type { NumberEntry, VocabEntry } from "../db/db";
import { speak, stopSpeak } from "../features/tts";
import { completeLessonViaExam } from "../lib/lessonProgress";
import { shuffle } from "../lib/shuffle";
import {
  type ExamDomain,
  isExamSessionData,
  type ExamDirection,
  type ExamQuestionData,
  type ExamSessionData,
  type ExamState,
} from "../lib/sessionTypes";
import { usePersistedSession } from "../hooks/usePersistedSession";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Question {
  entryId: number;
  thai: string;
  german: string;
  correctAnswer: string;
  options: string[];
  questionText: string; // Das Wort, das abgefragt wird
}

function getSpeakableText(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeNumberAnswer(text: string, direction: ExamDirection): string {
  const trimmed = text.trim();
  if (direction === "TH_DE") {
    const arabic = trimmed.match(/\d+/)?.[0];
    return arabic ?? trimmed;
  }
  const thaiDigits = trimmed.match(/[๐-๙]+/)?.[0];
  return thaiDigits ?? trimmed;
}

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
      
      // Group by lesson
      const grouped: Record<number, VocabEntry[]> = {};
      allVocab.forEach((v) => {
        const lesson = v.lesson || 0;
        if (!grouped[lesson]) grouped[lesson] = [];
        grouped[lesson].push(v);
      });

      setVocabByLesson(grouped);
      const groupedNumbers: Record<number, NumberEntry[]> = {};
      allNumbers.forEach((n) => {
        const lesson = n.lesson || 0;
        if (!groupedNumbers[lesson]) groupedNumbers[lesson] = [];
        groupedNumbers[lesson].push(n);
      });
      setNumbersByLesson(groupedNumbers);
    } catch (err) {
      console.error("Error loading vocab:", err);
    } finally {
      setLoading(false);
    }
  }

  const availableLessons = useMemo(() => {
    return Object.keys(examDomain === "numbers" ? numbersByLesson : vocabByLesson)
      .map(Number)
      .filter((l) =>
        l > 0 &&
        (examDomain === "numbers"
          ? (numbersByLesson[l]?.length ?? 0) > 0
          : (vocabByLesson[l]?.length ?? 0) > 0)
      )
      .sort((a, b) => a - b);
  }, [examDomain, numbersByLesson, vocabByLesson]);

  function toExamLabels(entry: VocabEntry | NumberEntry, domain: ExamDomain): {
    thai: string;
    german: string;
  } {
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

  function toExamAnswerLabel(
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

  function startExam(lesson: number, examDirection: ExamDirection) {
    const vocabForLesson =
      examDomain === "numbers"
        ? numbersByLesson[lesson]
        : vocabByLesson[lesson];
    if (!vocabForLesson || vocabForLesson.length === 0) return;

    // Generate questions
    const generatedQuestions: Question[] = vocabForLesson.map((entry) => {
      const labels = toExamLabels(entry, examDomain);
      // Get correct answer and wrong answers based on direction
      const isThaiToDeutsch = examDirection === "TH_DE";
      const correctAnswer = toExamAnswerLabel(entry, examDomain, examDirection);
      
      // Get wrong answers
      const otherVocab = vocabForLesson.filter((v) => v.id !== entry.id) as Array<VocabEntry | NumberEntry>;
      const uniqueAnswers = Array.from(
        new Map(
          otherVocab.map((v) => {
            return [toExamAnswerLabel(v, examDomain, examDirection), v];
          })
        ).values()
      );

      const wrongAnswers = shuffle(uniqueAnswers)
        .slice(0, 3)
        .map((v) => toExamAnswerLabel(v, examDomain, examDirection));

      const allOptions = [correctAnswer, ...wrongAnswers];
      const uniqueOptions = Array.from(new Set(allOptions));
      const shuffledOptions = shuffle(uniqueOptions);

      return {
        entryId: entry.id || 0,
        thai: labels.thai,
        german: labels.german,
        correctAnswer: correctAnswer,
        options: shuffledOptions,
        questionText: isThaiToDeutsch ? labels.thai : labels.german,
      };
    });

    setSelectedLesson(lesson);
    setDirection(examDirection);
    setQuestions(shuffle(generatedQuestions));
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
    if (loading) {
      return (
        <PageShell title="Examen">
          <p>Laden...</p>
        </PageShell>
      );
    }

    return (
      <PageShell title="Examen">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Wähle zuerst den Prüfungsmodus und dann eine Lektion.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant={examDomain === "vocab" ? "default" : "secondary"}
              className={`h-11 ${examDomain === "vocab" ? "ring-2 ring-primary/30" : ""}`}
              onClick={() => setExamDomain("vocab")}
            >
              📚 Vokabel-Examen
            </Button>
            <Button
              variant={examDomain === "numbers" ? "default" : "secondary"}
              className={`h-11 ${examDomain === "numbers" ? "ring-2 ring-primary/30" : ""}`}
              onClick={() => setExamDomain("numbers")}
            >
              🔢 Zahlenexamen
            </Button>
          </div>

          <div className="grid gap-3">
            {availableLessons.map((lesson) => {
              const vocabCount =
                examDomain === "numbers"
                  ? (numbersByLesson[lesson]?.length ?? 0)
                  : (vocabByLesson[lesson]?.length ?? 0);
              return (
            <Button
              key={lesson}
              onClick={() => {
                setSelectedLesson(lesson);
                setState("direction");
              }}
              className="w-full justify-start h-auto py-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">
                  {examDomain === "numbers" ? `Zahlenlektion ${lesson}` : `Lektion ${lesson}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {vocabCount} {examDomain === "numbers" ? "Zahlenkarten" : "Vokabeln"}
                </div>
              </div>
            </Button>
              );
            })}
          </div>

          {availableLessons.length === 0 && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                {examDomain === "numbers"
                  ? "Keine Zahlenlektionen verfügbar."
                  : "Keine Lektionen verfügbar. Bitte importiere zuerst Vokabeln."}
              </p>
            </Card>
          )}
        </div>
      </PageShell>
    );
  }

  // Direction State
  if (state === "direction" && selectedLesson !== null) {
    return (
      <PageShell title={examDomain === "numbers" ? `Zahlenexamen - Lektion ${selectedLesson}` : `Examen - Lektion ${selectedLesson}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Wähle die Richtung für deinen Test:
          </p>

          <div className="grid gap-3">
            <Button
              onClick={() => {
                startExam(selectedLesson, "TH_DE");
              }}
              className="w-full justify-start h-auto py-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Thai → Deutsch</div>
                <div className="text-xs text-muted-foreground">
                  {examDomain === "numbers"
                    ? "Sehe Thai-Zahl, wähle deutsche Zahl"
                    : "Sehe Thai-Wort, wähle deutsche Übersetzung"}
                </div>
              </div>
            </Button>

            <Button
              onClick={() => {
                startExam(selectedLesson, "DE_TH");
              }}
              className="w-full justify-start h-auto py-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Deutsch → Thai</div>
                <div className="text-xs text-muted-foreground">
                  {examDomain === "numbers"
                    ? "Sehe deutsche Zahl, wähle Thai-Zahl"
                    : "Sehe deutsches Wort, wähle Thai-Übersetzung"}
                </div>
              </div>
            </Button>
          </div>

          <Button
            onClick={() => {
              setState("selection");
              setSelectedLesson(null);
            }}
            variant="ghost"
            className="w-full mt-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
          >
            ← Zurück
          </Button>
        </div>
      </PageShell>
    );
  }

  // Testing State
  if (state === "testing" && questions.length > 0) {
    const question = questions[currentQuestionIndex];
    const userAnswer = answered[currentQuestionIndex];
    const isAnswered = userAnswer !== undefined;

    return (
      <PageShell title="Examen">
        <div className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3 sm:pt-3">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-end">
              <Button
                onClick={() => setConfirmEndExamOpen(true)}
                variant="outline"
                size="sm"
                className="h-9 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Examen beenden
              </Button>
            </div>
          </div>

          <div className="mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted/70 px-2 py-1">
              Frage <b className="text-foreground">{currentQuestionIndex + 1}</b> von <b className="text-foreground">{questions.length}</b>
            </span>
            <span className="rounded-full bg-muted/70 px-2 py-1">
              Punkte: <b className="text-foreground">{score}</b>
            </span>
          </div>

          <div className="mx-auto mt-2 w-full max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300 dark:bg-blue-600"
                style={{
                  width: `${Math.max(1, ((currentQuestionIndex + 1) / questions.length) * 100)}%`,
                  minWidth: "2px",
                }}
              />
            </div>
          </div>

          <Card className="mx-auto mt-3 flex w-full min-h-0 max-w-xs flex-col overflow-y-auto p-4 shadow-lg sm:max-w-md md:max-w-2xl">
            <div className="space-y-3">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-semibold leading-snug text-primary">{question.questionText}</div>
                <Button
                  onClick={() => {
                    const textToSpeak = getSpeakableText(
                      direction === "TH_DE" ? question.thai : question.german
                    );
                    const lang = direction === "TH_DE" ? "th-TH" : "de-DE";
                    void speak(textToSpeak, lang);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    stopSpeak();
                  }}
                  variant="outline"
                  size="sm"
                  className="mx-auto min-h-[44px] shadow-md"
                  title="Klick = Abspielen, Rechtsklick = Stoppen"
                >
                  🔊 Vorlesen
                </Button>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">Wähle die richtige Antwort</p>
              </div>

              <div className="grid gap-2">
                {question.options.map((option, idx) => {
                  const isSelected = userAnswer === option;
                  const isCorrect = option === question.correctAnswer;

                  const alignmentClass =
                    examDomain === "numbers" ? "justify-center text-center" : "justify-start px-3 text-left";
                  let buttonClassName = `h-11 text-sm ${alignmentClass}`;
                  if (isAnswered) {
                    if (isCorrect) {
                      buttonClassName += " bg-green-100 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-900 text-foreground";
                    } else if (isSelected && !isCorrect) {
                      buttonClassName += " bg-red-100 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-900 text-foreground";
                    }
                  }

                  return (
                    <Button
                      key={idx}
                      onClick={() => !isAnswered && handleAnswer(option)}
                      variant={isSelected ? "default" : "outline"}
                      className={buttonClassName}
                      disabled={isAnswered}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>

              {isAnswered ? (
                <div className="mt-2 rounded-lg bg-muted p-2 animate-in fade-in" aria-live="polite">
                  {userAnswer === question.correctAnswer ? (
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">✓ Richtig!</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">✗ Falsch</p>
                      <p className="text-xs text-foreground">Richtige Antwort: {question.correctAnswer}</p>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">(Nächste Frage in Kürze...)</p>
                </div>
              ) : null}

            </div>
          </Card>

          {isAnswered ? (
            <div className="mt-2 w-full max-w-2xl shrink-0 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
              <div className="rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur">
                <Button
                  onClick={() => {
                    if (nextQuestionTimer) clearTimeout(nextQuestionTimer);
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      setState("result");
                    }
                  }}
                  className="h-11 w-full"
                  variant="outline"
                  size="sm"
                >
                  Jetzt weiter →
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <Dialog open={confirmEndExamOpen} onOpenChange={setConfirmEndExamOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Examen beenden?</DialogTitle>
              <DialogDescription>
                Dein aktuelles Examen wird beendet und du kehrst zur Auswahl zurück.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="h-11" onClick={() => setConfirmEndExamOpen(false)}>
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                className="h-11"
                onClick={() => {
                  setConfirmEndExamOpen(false);
                  resetExam();
                }}
              >
                Beenden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  // Result State
  if (state === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    let resultColor = "text-red-600 dark:text-red-400";
    if (percentage >= 50) resultColor = "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 75) resultColor = "text-green-600 dark:text-green-400";

    return (
      <PageShell title="Examen - Ergebnis">
        <div className="space-y-4 sm:space-y-6">
          <Card className="space-y-3 p-4 text-center sm:space-y-4 sm:p-8">
            <h2 className="text-xl font-bold sm:text-2xl">Gratuliere!</h2>

            <div className={`text-4xl font-bold sm:text-5xl ${resultColor}`}>
              {score}/{questions.length}
            </div>

            <div className="text-base font-semibold text-muted-foreground sm:text-lg">
              {percentage}% korrekt
            </div>

            <p className="mt-3 text-sm text-muted-foreground sm:mt-4">
              {percentage >= 85 && "Ausgezeichnet! 🎉 Lektion abgeschlossen!"}
              {percentage >= 70 && percentage < 85 && "Gute Leistung! 👍 Bitte versuchen Sie es nochmal für eine bessere Note."}
              {percentage >= 50 && percentage < 70 && "Noch etwas üben! 📚"}
              {percentage < 50 && "Viel Erfolg beim nächsten Mal! 💪"}
            </p>
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button onClick={resetExam} className="h-11 flex-1 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150">
              Neue Lektion wählen
            </Button>
            <Button
              onClick={() => {
                resetExam();
                startExam(selectedLesson || 1, direction);
              }}
              variant="outline"
              className="h-11 flex-1 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:shadow-md active:translate-y-0 transition-all duration-150"
            >
              Wiederholen
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return null;
}
