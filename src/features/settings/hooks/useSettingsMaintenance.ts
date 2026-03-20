import { db } from "@/db/db";
import { ensureProgressForEntries } from "@/db/srs";
import { DEFAULT_VOCAB } from "@/data/defaultVocab";

type UseSettingsMaintenanceArgs = {
  setMsg: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
  refreshVocabCount: () => Promise<void>;
};

export function useSettingsMaintenance({
  setMsg,
  setIsLoading,
  refreshVocabCount,
}: UseSettingsMaintenanceArgs) {
  async function getLessonEntryIds(lesson: number): Promise<number[]> {
    const entries = await db.vocab.where("lesson").equals(lesson).toArray();
    return entries
      .map((entry) => entry.id)
      .filter((id): id is number => typeof id === "number");
  }

  async function resetDatabase() {
    if (
      !window.confirm(
        "⚠️ WARNUNG: Dies löscht ALLE Vokabeln und Lernfortschritt!\n\nNur die Standard-Vokabeln (38) bleiben erhalten.\n\nWirklich fortfahren?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await db.vocab.clear();
      await db.progress.clear();

      const now = Date.now();
      const entries = DEFAULT_VOCAB.map((v) => ({
        ...v,
        createdAt: now,
        updatedAt: now,
      }));
      await db.vocab.bulkAdd(entries);
      localStorage.removeItem("vocabDataSource");
      await refreshVocabCount();

      setMsg("✅ Datenbank zurückgesetzt. Nur Standard-Vokabeln enthalten.");
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Fehler beim Zurücksetzen: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function repairProgressRecords() {
    try {
      setIsLoading(true);
      const vocab = await db.vocab.toArray();
      const ids = vocab
        .map((entry) => entry.id)
        .filter((id): id is number => typeof id === "number");
      await ensureProgressForEntries(ids);
      const progressCount = await db.progress.count();
      setMsg(`✅ Reparatur abgeschlossen: ${progressCount} Fortschritts-Einträge geprüft`);
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Fehler bei Reparatur: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function debugSetLessonReadyForExam(lesson: number) {
    try {
      setIsLoading(true);
      const targetLessons = [1, 2, 3, 4, 5].filter((item) => item <= lesson);
      const idsByLesson = await Promise.all(
        targetLessons.map(async (item) => [item, await getLessonEntryIds(item)] as const)
      );
      const allIds = idsByLesson.flatMap(([, ids]) => ids);
      if (allIds.length === 0) {
        setMsg(`⚠️ Keine Karten in Lektion 1-${lesson} gefunden`);
        setTimeout(() => setMsg(""), 2500);
        return;
      }

      await ensureProgressForEntries(allIds);
      const now = Date.now();
      const futureDue = now + 1000 * 60 * 60 * 24 * 30;

      await db.transaction("rw", db.vocab, db.progress, async () => {
        for (const [targetLesson, ids] of idsByLesson) {
          if (ids.length === 0) continue;

          await db.vocab.where("lesson").equals(targetLesson).modify((entry) => {
            entry.viewed = true;
            entry.updatedAt = now;
          });

          const currentRows = await db.progress.bulkGet(ids);
          const patchedRows = ids.map((entryId, idx) => {
            const row = currentRows[idx];
            return {
              entryId,
              ease: row?.ease ?? 2.5,
              intervalDays: row?.intervalDays ?? 1,
              repetitions: 5,
              lastReviewed: now,
              lastGrade: 2 as const,
              dueAt: futureDue,
              updatedAt: now,
            };
          });
          await db.progress.bulkPut(patchedRows);
        }
      });

      setMsg(`✅ Lektion 1-${lesson}: alle Karten als im Test bestanden markiert`);
      setTimeout(() => setMsg(""), 2000);
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Debug-Fehler L${lesson}: ${message}`);
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  function debugSetLessonExamPassed(lesson: number) {
    localStorage.setItem(`lessonExamScore_${lesson}`, "85");
    setMsg(`✅ Lektion ${lesson}: Examen mit 85% gesetzt`);
    setTimeout(() => setMsg(""), 2000);
    window.location.reload();
  }

  async function debugResetLesson(lesson: number) {
    try {
      setIsLoading(true);
      const ids = await getLessonEntryIds(lesson);
      if (ids.length === 0) {
        localStorage.removeItem(`lessonExamScore_${lesson}`);
        setMsg(`✅ Lektion ${lesson}: Exam-Status zurückgesetzt`);
        setTimeout(() => setMsg(""), 2000);
        window.location.reload();
        return;
      }

      await ensureProgressForEntries(ids);
      const now = Date.now();

      await db.transaction("rw", db.vocab, db.progress, async () => {
        await db.vocab.where("lesson").equals(lesson).modify((entry) => {
          entry.viewed = false;
          entry.updatedAt = now;
        });

        const currentRows = await db.progress.bulkGet(ids);
        const resetRows = ids.map((entryId, idx) => {
          const row = currentRows[idx];
          return {
            entryId,
            ease: row?.ease ?? 2.5,
            intervalDays: 0,
            repetitions: 0,
            dueAt: now,
            updatedAt: now,
          };
        });
        await db.progress.bulkPut(resetRows);
      });

      localStorage.removeItem(`lessonExamScore_${lesson}`);
      localStorage.removeItem(`lessonProgress_${lesson}`);
      setMsg(`✅ Lektion ${lesson}: Fortschritt + Exam zurückgesetzt`);
      setTimeout(() => setMsg(""), 2000);
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Debug-Reset L${lesson} fehlgeschlagen: ${message}`);
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    resetDatabase,
    repairProgressRecords,
    debugSetLessonReadyForExam,
    debugSetLessonExamPassed,
    debugResetLesson,
  };
}

