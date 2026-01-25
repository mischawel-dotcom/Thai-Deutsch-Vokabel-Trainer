#requires -Version 5.1
$ErrorActionPreference = "Stop"

# Immer im Ordner arbeiten, in dem dieses Script liegt (robust!)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Working directory: $(Get-Location)"

function Write-FileUtf8NoBom([string]$Path, [string]$Content) {
  $full = Join-Path (Get-Location) $Path
  $dir = Split-Path -Parent $full
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
}

# Ordner anlegen
New-Item -ItemType Directory -Force -Path "src\db" | Out-Null
New-Item -ItemType Directory -Force -Path "src\features\vocab" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "data" | Out-Null

# --- src\db\db.ts ---
Write-FileUtf8NoBom "src\db\db.ts" @'
import Dexie, { Table } from "dexie";

export type VocabEntry = {
  id?: number;
  thai: string;
  german: string;
  transliteration?: string;
  pos?: string;
  exampleThai?: string;
  exampleGerman?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

export type SrsProgress = {
  entryId: number;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number;
  lastGrade?: number;
  updatedAt: number;
};

class AppDB extends Dexie {
  vocab!: Table<VocabEntry, number>;
  progress!: Table<SrsProgress, number>;

  constructor() {
    super("thaiVocabTrainer");
    this.version(1).stores({
      vocab: "++id, thai, german, createdAt, updatedAt",
      progress: "entryId, dueAt, updatedAt",
    });
  }
}

export const db = new AppDB();
'@

# --- src\db\srs.ts ---
Write-FileUtf8NoBom "src\db\srs.ts" @'
import { db, SrsProgress } from "./db";

export type Grade = 0 | 1 | 2 | 3;
const DAY = 24 * 60 * 60 * 1000;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function nextProgress(prev: SrsProgress | undefined, grade: Grade): SrsProgress {
  const now = Date.now();
  const p: SrsProgress = prev ?? {
    entryId: -1,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
    updatedAt: now,
  };

  let ease = p.ease;
  let repetitions = p.repetitions;
  let intervalDays = p.intervalDays;

  if (grade === 0) {
    repetitions = 0;
    intervalDays = 0;
    ease = clamp(ease - 0.2, 1.3, 3.0);
    return { ...p, ease, repetitions, intervalDays, dueAt: now + 10 * 60 * 1000, lastGrade: grade, updatedAt: now };
  }

  repetitions += 1;
  if (grade === 1) ease = clamp(ease - 0.05, 1.3, 3.0);
  if (grade === 3) ease = clamp(ease + 0.05, 1.3, 3.0);

  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = grade === 3 ? 4 : 3;
  else intervalDays = Math.max(1, Math.round(intervalDays * ease));

  return { ...p, ease, repetitions, intervalDays, dueAt: now + intervalDays * DAY, lastGrade: grade, updatedAt: now };
}

export async function ensureProgress(entryId: number) {
  if (await db.progress.get(entryId)) return;
  const now = Date.now();
  await db.progress.put({
    entryId,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
    updatedAt: now,
  });
}

export async function gradeCard(entryId: number, grade: Grade) {
  const prev = await db.progress.get(entryId);
  const next = nextProgress(prev, grade);
  next.entryId = entryId;
  await db.progress.put(next);
}
'@

Write-Host "✅ db files written: src\db\db.ts and src\db\srs.ts"

# (Kurz halten) – Wenn das klappt, ergänzen wir im nächsten Schritt pages/features/App.tsx.
