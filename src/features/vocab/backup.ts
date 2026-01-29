import { db } from "../../db/db";
import type { VocabEntry, SrsProgress } from "../../db/db";

export type BackupData = {
  version: string;
  timestamp: number;
  vocab: VocabEntry[];
  progress: SrsProgress[];
};

/**
 * Exportiert alle Daten (Vokabeln + Lernfortschritt) als JSON
 */
export async function exportBackup(): Promise<Blob> {
  const vocab = await db.vocab.toArray();
  const progress = await db.progress.toArray();

  const backup: BackupData = {
    version: "1.0",
    timestamp: Date.now(),
    vocab,
    progress,
  };

  const json = JSON.stringify(backup, null, 2);
  return new Blob([json], { type: "application/json" });
}

/**
 * Importiert Backup-Daten und überschreibt vorhandene Daten
 */
export async function importBackup(file: File): Promise<{ vocabCount: number; progressCount: number }> {
  const text = await file.text();
  const backup: BackupData = JSON.parse(text);

  if (!backup.version || !backup.vocab || !backup.progress) {
    throw new Error("Ungültiges Backup-Format");
  }

  // Lösche alte Daten
  await db.vocab.clear();
  await db.progress.clear();

  // Importiere neue Daten
  await db.vocab.bulkAdd(backup.vocab);
  await db.progress.bulkAdd(backup.progress);

  return {
    vocabCount: backup.vocab.length,
    progressCount: backup.progress.length,
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
  a.download = `thai-vocab-backup-${date}.json`;
  
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
