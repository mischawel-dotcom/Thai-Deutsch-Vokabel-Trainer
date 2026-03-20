import { db } from "../../db/db";
import type { NumberEntry, SentenceEntry, VocabEntry, SrsProgress } from "../../db/db";

export type BackupData = {
  version: string;
  timestamp: number;
  vocab: VocabEntry[];
  progress: SrsProgress[];
  numbersVocab?: NumberEntry[];
  numbersProgress?: SrsProgress[];
  sentencesVocab?: SentenceEntry[];
  sentencesProgress?: SrsProgress[];
  settings?: Record<string, string>;
};

const BACKUP_VERSION = "2.0";
const BACKUP_LOCAL_STORAGE_KEYS = [
  "dailyLimit",
  "learnDirection",
  "soundEnabled",
  "showTransliterationInTest",
  "showTransliterationInNumberTest",
  "numberTestGeneratorMode",
  "numberTestGeneratorFrom",
  "numberTestGeneratorTo",
  "numbersExamLastScore",
  "numbersExamBestScore",
  "numbersExamPassed",
] as const;
const BACKUP_LOCAL_STORAGE_PREFIXES = ["lessonExamScore_", "lessonProgress_"] as const;

function collectBackupSettings(): Record<string, string> {
  const settings: Record<string, string> = {};
  for (const key of BACKUP_LOCAL_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) settings[key] = value;
  }
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (BACKUP_LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      const value = localStorage.getItem(key);
      if (value !== null) settings[key] = value;
    }
  }
  return settings;
}

function restoreBackupSettings(settings: Record<string, string> | undefined) {
  for (const key of BACKUP_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (BACKUP_LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  }
  if (!settings) return;
  for (const [key, value] of Object.entries(settings)) {
    localStorage.setItem(key, value);
  }
}

/**
 * Exportiert alle Daten (Vokabeln + Lernfortschritt) als JSON
 */
export async function exportBackup(): Promise<Blob> {
  const [vocab, progress, numbersVocab, numbersProgress, sentencesVocab, sentencesProgress] =
    await Promise.all([
      db.vocab.toArray(),
      db.progress.toArray(),
      db.numbersVocab.toArray(),
      db.numbersProgress.toArray(),
      db.sentencesVocab.toArray(),
      db.sentencesProgress.toArray(),
    ]);

  const backup: BackupData = {
    version: BACKUP_VERSION,
    timestamp: Date.now(),
    vocab,
    progress,
    numbersVocab,
    numbersProgress,
    sentencesVocab,
    sentencesProgress,
    settings: collectBackupSettings(),
  };

  const json = JSON.stringify(backup, null, 2);
  return new Blob([json], { type: "application/json" });
}

/**
 * Importiert Backup-Daten und überschreibt vorhandene Daten
 */
export async function importBackup(file: File): Promise<{
  vocabCount: number;
  progressCount: number;
  numbersVocabCount: number;
  numbersProgressCount: number;
  sentencesVocabCount: number;
  sentencesProgressCount: number;
}> {
  const text = await file.text();
  const backup: BackupData = JSON.parse(text);

  if (!backup.version || !Array.isArray(backup.vocab) || !Array.isArray(backup.progress)) {
    throw new Error("Ungültiges Backup-Format");
  }

  const numbersVocab = backup.numbersVocab ?? [];
  const numbersProgress = backup.numbersProgress ?? [];
  const sentencesVocab = backup.sentencesVocab ?? [];
  const sentencesProgress = backup.sentencesProgress ?? [];

  await Promise.all([
    db.vocab.clear(),
    db.progress.clear(),
    db.numbersVocab.clear(),
    db.numbersProgress.clear(),
    db.sentencesVocab.clear(),
    db.sentencesProgress.clear(),
  ]);

  if (backup.vocab.length > 0) await db.vocab.bulkAdd(backup.vocab);
  if (backup.progress.length > 0) await db.progress.bulkAdd(backup.progress);
  if (numbersVocab.length > 0) await db.numbersVocab.bulkAdd(numbersVocab);
  if (numbersProgress.length > 0) await db.numbersProgress.bulkAdd(numbersProgress);
  if (sentencesVocab.length > 0) await db.sentencesVocab.bulkAdd(sentencesVocab);
  if (sentencesProgress.length > 0) await db.sentencesProgress.bulkAdd(sentencesProgress);
  restoreBackupSettings(backup.settings);

  return {
    vocabCount: backup.vocab.length,
    progressCount: backup.progress.length,
    numbersVocabCount: numbersVocab.length,
    numbersProgressCount: numbersProgress.length,
    sentencesVocabCount: sentencesVocab.length,
    sentencesProgressCount: sentencesProgress.length,
  };
}

/**
 * Automatischer Download des Backups
 */
export async function downloadBackup(): Promise<void> {
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  a.download = `thai-vocab-backup-v2-${date}.json`;
  
  a.click();
  URL.revokeObjectURL(url);

  // Speichere Zeitstempel des letzten Backups
  localStorage.setItem("lastBackup", Date.now().toString());
}

/**
 * Gibt zurück, wann das letzte Backup erstellt wurde
 */
export function getLastBackupTime(): number | null {
  const saved = localStorage.getItem("lastBackup");
  return saved ? parseInt(saved, 10) : null;
}
