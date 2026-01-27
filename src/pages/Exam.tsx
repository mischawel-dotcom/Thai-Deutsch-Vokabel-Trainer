import { useEffect, useState, useMemo } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { speak, stopSpeak } from "../features/tts";
import { completeLessonViaExam } from "../lib/lessonProgress";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExamState = "selection" | "direction" | "testing" | "result";
type ExamDirection = "TH_DE" | "DE_TH";

interface Question {
  entryId: number;
  thai: string;
  german: string;
  correctAnswer: string;
  options: string[];
  questionText: string; // Das Wort, das abgefragt wird
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  a.sort(() => Math.random() - 0.5);
  return a;
}

export default function Exam() {
  const [state, setState] = useState<ExamState>("selection");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [direction, setDirection] = useState<ExamDirection>("TH_DE");
  const [vocabByLesson, setVocabByLesson] = useState<Record<number, VocabEntry[]>>({});
  const [loading, setLoading] = useState(true);

  // Exam State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, string>>({});
  const [nextQuestionTimer, setNextQuestionTimer] = useState<NodeJS.Timeout | null>(null);

  // Load vocab auf Component Mount
  useEffect(() => {
    loadVocab();
  }, []);

  // Handle exam completion
  useEffect(() => {
    if (state === "result" && selectedLesson !== null) {
      const percentage = Math.round((score / questions.length) * 100);
      if (percentage >= 85) {
        completeLessonViaExam(selectedLesson, percentage);
      }
    }
  }, [state, selectedLesson, score, questions.length]);

  async function loadVocab() {
    try {
      const allVocab = await db.vocab.toArray();
      
      // Group by lesson
      const grouped: Record<number, VocabEntry[]> = {};
      allVocab.forEach((v) => {
        const lesson = v.lesson || 0;
        if (!grouped[lesson]) grouped[lesson] = [];
        grouped[lesson].push(v);
      });

      setVocabByLesson(grouped);
    } catch (err) {
      console.error("Error loading vocab:", err);
    } finally {
      setLoading(false);
    }
  }

  const availableLessons = useMemo(() => {
    return Object.keys(vocabByLesson)
      .map(Number)
      .filter((l) => l > 0 && vocabByLesson[l].length > 0)
      .sort((a, b) => a - b);
  }, [vocabByLesson]);

  function startExam(lesson: number, examDirection: ExamDirection) {
    const vocabForLesson = vocabByLesson[lesson];
    if (!vocabForLesson || vocabForLesson.length === 0) return;

    // Generate questions
    const generatedQuestions: Question[] = vocabForLesson.map((entry) => {
      // Get correct answer and wrong answers based on direction
      const isThaiToDeutsch = examDirection === "TH_DE";
      const correctAnswer = isThaiToDeutsch ? entry.german : entry.thai;
      
      // Get wrong answers
      const otherVocab = vocabForLesson.filter((v) => v.id !== entry.id);
      const uniqueAnswers = Array.from(
        new Map(
          otherVocab.map((v) => [isThaiToDeutsch ? v.german : v.thai, v])
        ).values()
      );

      const wrongAnswers = shuffle(uniqueAnswers)
        .slice(0, 3)
        .map((v) => isThaiToDeutsch ? v.german : v.thai);

      const allOptions = [correctAnswer, ...wrongAnswers];
      const uniqueOptions = Array.from(new Set(allOptions));
      const shuffledOptions = shuffle(uniqueOptions);

      return {
        entryId: entry.id || 0,
        thai: entry.thai,
        german: entry.german,
        correctAnswer: correctAnswer,
        options: shuffledOptions,
        questionText: isThaiToDeutsch ? entry.thai : entry.german,
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
    setAnswered({
      ...answered,
      [currentQuestionIndex]: selectedOption,
    });

    if (selectedOption === question.correctAnswer) {
      setScore(score + 1);
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
            Wähle eine Lektion und starte deinen Vokabeltest.
          </p>

          <div className="grid gap-3">
            {availableLessons.map((lesson) => {
              const vocabCount = vocabByLesson[lesson].length;
              return (
            <Button
              key={lesson}
              onClick={() => {
                setSelectedLesson(lesson);
                setState("direction");
              }}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Lektion {lesson}</div>
                <div className="text-xs text-muted-foreground">
                  {vocabCount} Vokabeln
                </div>
              </div>
            </Button>
              );
            })}
          </div>

          {availableLessons.length === 0 && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Keine Lektionen verfügbar. Bitte importiere zuerst Vokabeln.
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
      <PageShell title={`Examen - Lektion ${selectedLesson}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Wähle die Richtung für deinen Test:
          </p>

          <div className="grid gap-3">
            <Button
              onClick={() => {
                startExam(selectedLesson, "TH_DE");
              }}
              className="w-full justify-start h-auto py-6"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Thai → Deutsch</div>
                <div className="text-xs text-muted-foreground">
                  Sehe Thai-Wort, wähle deutsche Übersetzung
                </div>
              </div>
            </Button>

            <Button
              onClick={() => {
                startExam(selectedLesson, "DE_TH");
              }}
              className="w-full justify-start h-auto py-6"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Deutsch → Thai</div>
                <div className="text-xs text-muted-foreground">
                  Sehe deutsches Wort, wähle Thai-Übersetzung
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
            className="w-full mt-4"
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
      <PageShell title={`Examen - Lektion ${selectedLesson}`}>
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Frage {currentQuestionIndex + 1} von {questions.length}
              </span>
              <span className="font-semibold">Punkte: {score}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${Math.max(1, ((currentQuestionIndex + 1) / questions.length) * 100)}%`,
                  minWidth: '2px'
                }}
              />
            </div>
          </div>

          {/* Question */}
          <Card className="p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="text-3xl font-semibold text-primary">
                {question.questionText}
              </div>
              <Button
                onClick={() => {
                  const textToSpeak = direction === "TH_DE" ? question.thai : question.german;
                  const lang = direction === "TH_DE" ? "th-TH" : "de-DE";
                  void speak(textToSpeak, lang);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  stopSpeak();
                }}
                variant="outline"
                size="sm"
                className="mx-auto"
                title="Klick = Abspielen, Rechtsklick = Stoppen"
              >
                🔊 Aussprechen
              </Button>
              <p className="text-sm text-muted-foreground">
                Wähle die richtige Antwort
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {question.options.map((option, idx) => {
                const isSelected = userAnswer === option;
                const isCorrect = option === question.correctAnswer;

                let buttonClassName = "justify-start h-auto py-3 px-4";
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

            {/* Feedback */}
            {isAnswered && (
              <div className="mt-4 p-3 rounded-lg bg-muted animate-in fade-in">
                {userAnswer === question.correctAnswer ? (
                  <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                    ✓ Richtig!
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                      ✗ Falsch
                    </p>
                    <p className="text-sm text-foreground">
                      Richtige Antwort: {question.correctAnswer}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  (Nächste Frage in Kürze...)
                </p>
              </div>
            )}

            {/* Next Button - nur wenn manuell weitergehen möchte */}
            {isAnswered && (
              <Button
                onClick={() => {
                  if (nextQuestionTimer) clearTimeout(nextQuestionTimer);
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  } else {
                    setState("result");
                  }
                }}
                className="w-full mt-4"
                variant="outline"
                size="sm"
              >
                Jetzt weiter →
              </Button>
            )}
          </Card>
        </div>
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
        <div className="space-y-6">
          <Card className="p-8 space-y-4 text-center">
            <h2 className="text-2xl font-bold">Gratuliere!</h2>

            <div className={`text-5xl font-bold ${resultColor}`}>
              {score}/{questions.length}
            </div>

            <div className="text-lg font-semibold text-muted-foreground">
              {percentage}% korrekt
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {percentage >= 85 && "Ausgezeichnet! 🎉 Lektion abgeschlossen!"}
              {percentage >= 70 && percentage < 85 && "Gute Leistung! 👍 Bitte versuchen Sie es nochmal für eine bessere Note."}
              {percentage >= 50 && percentage < 70 && "Noch etwas üben! 📚"}
              {percentage < 50 && "Viel Erfolg beim nächsten Mal! 💪"}
            </p>
          </Card>

          <div className="flex gap-3">
            <Button onClick={resetExam} className="flex-1">
              Neue Lektion wählen
            </Button>
            <Button
              onClick={() => {
                resetExam();
                startExam(selectedLesson || 1, direction);
              }}
              variant="outline"
              className="flex-1"
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
