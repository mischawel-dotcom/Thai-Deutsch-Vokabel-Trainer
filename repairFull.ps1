#requires -Version 5.1
$ErrorActionPreference = "Stop"

# Always work in script folder
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Working directory: $(Get-Location)"

function Write-FileUtf8NoBom([string]$RelPath, [string]$Content) {
  $FullPath = Join-Path (Get-Location) $RelPath
  $Dir = Split-Path -Parent $FullPath
  if ($Dir -and !(Test-Path $Dir)) { New-Item -ItemType Directory -Force -Path $Dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($FullPath, $Content, $utf8NoBom)
  if (!(Test-Path $FullPath)) { throw "Write failed: $FullPath" }
}

# Ensure folders
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
  else {
    const mult = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3;
    intervalDays = Math.max(1, Math.round(intervalDays * mult));
  }

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

# --- src\features\tts.ts ---
Write-FileUtf8NoBom "src\features\tts.ts" @'
export type TtsLang = "th-TH" | "de-DE";

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const finish = () => {
      voicesCache = synth.getVoices() ?? [];
      resolve(voicesCache);
    };

    const voices = synth.getVoices();
    if (voices && voices.length) {
      voicesCache = voices;
      resolve(voicesCache);
      return;
    }

    const onVoicesChanged = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      finish();
    };

    synth.addEventListener("voiceschanged", onVoicesChanged);
    setTimeout(() => finish(), 800);
  });
}

function pickVoice(lang: TtsLang): SpeechSynthesisVoice | undefined {
  const voices = voicesCache.length ? voicesCache : window.speechSynthesis.getVoices();
  const exact = voices.find(v => (v.lang ?? "").toLowerCase() === lang.toLowerCase());
  if (exact) return exact;

  const prefix = lang.split("-")[0].toLowerCase();
  return voices.find(v => (v.lang ?? "").toLowerCase().startsWith(prefix));
}

export async function speak(text: string, lang: TtsLang) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    alert("TTS wird von diesem Browser nicht unterstützt.");
    return;
  }

  window.speechSynthesis.cancel();
  await loadVoices();

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = lang;

  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;

  utter.rate = 0.95;
  utter.pitch = 1.0;

  window.speechSynthesis.speak(utter);
}

export function stopSpeak() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
'@

# --- src\features\vocab\csv.ts ---
Write-FileUtf8NoBom "src\features\vocab\csv.ts" @'
import Papa from "papaparse";
import { VocabEntry, db } from "../../db/db";

type CsvRow = {
  thai?: string;
  german?: string;
  transliteration?: string;
  pos?: string;
  tags?: string;
  exampleThai?: string;
  exampleGerman?: string;
};

export async function importCsv(file: File) {
  const text = await file.text();

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error(parsed.errors.map(e => e.message).join("; "));
  }

  const now = Date.now();
  const entries: VocabEntry[] = (parsed.data ?? [])
    .map(r => ({
      thai: (r.thai ?? "").trim(),
      german: (r.german ?? "").trim(),
      transliteration: (r.transliteration ?? "").trim() || undefined,
      pos: (r.pos ?? "").trim() || undefined,
      tags: (r.tags ?? "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      exampleThai: (r.exampleThai ?? "").trim() || undefined,
      exampleGerman: (r.exampleGerman ?? "").trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }))
    .filter(e => e.thai && e.german);

  await db.vocab.bulkAdd(entries);
  return entries.length;
}

export async function exportCsv(): Promise<Blob> {
  const all = await db.vocab.toArray();

  const rows = all.map(e => ({
    thai: e.thai,
    german: e.german,
    transliteration: e.transliteration ?? "",
    pos: e.pos ?? "",
    tags: (e.tags ?? []).join(","),
    exampleThai: e.exampleThai ?? "",
    exampleGerman: e.exampleGerman ?? "",
  }));

  const csv = Papa.unparse(rows, { quotes: true });
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}
'@

# --- pages ---
Write-FileUtf8NoBom "src\pages\Home.tsx" @'
import { useEffect, useState } from "react";
import { db } from "../db/db";

export default function Home() {
  const [dueCount, setDueCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const run = async () => {
      const now = Date.now();
      const due = await db.progress.where("dueAt").belowOrEqual(now).count();
      const vocab = await db.vocab.count();
      setDueCount(due);
      setTotal(vocab);
    };
    run();
  }, []);

  return (
    <div>
      <p><b>Vokabeln:</b> {total} &nbsp; | &nbsp; <b>Heute fällig:</b> {dueCount}</p>
      <p style={{ marginTop: 16, opacity: 0.8 }}>
        Tipp: Importiere die Sample-CSV über Import/Export, dann hast du sofort Karten.
      </p>
    </div>
  );
}
'@

Write-FileUtf8NoBom "src\pages\VocabList.tsx" @'
import { useEffect, useMemo, useState } from "react";
import { db, VocabEntry } from "../db/db";
import { ensureProgress } from "../db/srs";

export default function VocabList() {
  const [items, setItems] = useState<VocabEntry[]>([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(v =>
      v.thai.toLowerCase().includes(s) ||
      v.german.toLowerCase().includes(s) ||
      (v.transliteration ?? "").toLowerCase().includes(s) ||
      (v.tags ?? []).join(",").toLowerCase().includes(s)
    );
  }, [items, q]);

  useEffect(() => {
    db.vocab.orderBy("updatedAt").reverse().toArray().then(setItems);
  }, []);

  async function addQuick() {
    const thai = prompt("Thai (z.B. กิน)")?.trim();
    if (!thai) return;
    const german = prompt("Deutsch (z.B. essen)")?.trim();
    if (!german) return;

    const now = Date.now();
    const id = await db.vocab.add({ thai, german, createdAt: now, updatedAt: now, tags: [] });
    await ensureProgress(id);
    setItems(await db.vocab.orderBy("updatedAt").reverse().toArray());
  }

  async function remove(id?: number) {
    if (!id) return;
    if (!confirm("Wirklich löschen?")) return;
    await db.vocab.delete(id);
    await db.progress.delete(id);
    setItems(await db.vocab.orderBy("updatedAt").reverse().toArray());
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Suche Thai / Deutsch / Transliteration / Tag…"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addQuick}>+ Neu</button>
      </div>

      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Thai</th>
            <th>Deutsch</th>
            <th>Translit.</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(v => (
            <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ fontSize: 18 }}>{v.thai}</td>
              <td>{v.german}</td>
              <td style={{ opacity: 0.8 }}>{v.transliteration ?? ""}</td>
              <td style={{ opacity: 0.8 }}>{(v.tags ?? []).join(", ")}</td>
              <td style={{ textAlign: "right" }}>
                <button onClick={() => remove(v.id)}>Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p style={{ opacity: 0.8 }}>Keine Treffer.</p>}
    </div>
  );
}
'@

Write-FileUtf8NoBom "src\pages\ImportExport.tsx" @'
import { useState } from "react";
import { importCsv, exportCsv } from "../features/vocab/csv";

export default function ImportExport() {
  const [msg, setMsg] = useState<string>("");

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importCsv(file);
      setMsg(`✅ Importiert: ${n} Einträge`);
    } catch (err: any) {
      setMsg(`❌ Fehler: ${err?.message ?? String(err)}`);
    } finally {
      e.target.value = "";
    }
  }

  async function onExport() {
    const blob = await exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thai-de-vocab.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h3>CSV Import</h3>
      <input type="file" accept=".csv,text/csv" onChange={onImport} />

      <h3 style={{ marginTop: 20 }}>CSV Export</h3>
      <button onClick={onExport}>Export herunterladen</button>

      <p style={{ marginTop: 16, opacity: 0.8 }}>
        CSV Header: <code>thai,german,transliteration,pos,tags,exampleThai,exampleGerman</code>
      </p>

      {msg && <p>{msg}</p>}
    </div>
  );
}
'@

Write-FileUtf8NoBom "src\pages\Learn.tsx" @'
import { useEffect, useState } from "react";
import { db, VocabEntry } from "../db/db";
import { ensureProgress, gradeCard, Grade } from "../db/srs";
import { speak, stopSpeak } from "../features/tts";

type Card = { entry: VocabEntry; dueAt: number };

export default function Learn() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);

  async function loadDue() {
    const now = Date.now();

    const vocab = await db.vocab.toArray();
    for (const v of vocab) {
      if (v.id && !(await db.progress.get(v.id))) await ensureProgress(v.id);
    }

    const due = await db.progress.where("dueAt").belowOrEqual(now).toArray();
    const entries = await db.vocab.bulkGet(due.map(p => p.entryId));

    const cards: Card[] = [];
    for (let i = 0; i < due.length; i++) {
      const e = entries[i];
      if (e && e.id) cards.push({ entry: e, dueAt: due[i].dueAt });
    }

    cards.sort(() => Math.random() - 0.5);
    setQueue(cards);
    setCurrent(cards[0] ?? null);
    setFlipped(false);
  }

  useEffect(() => { void loadDue(); }, []);

  async function answer(g: Grade) {
    if (!current?.entry.id) return;
    await gradeCard(current.entry.id, g);
    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    setCurrent(nextQueue[0] ?? null);
    setFlipped(false);
  }

  if (!current) {
    return (
      <div>
        <p><b>Keine Karten fällig.</b></p>
        <button onClick={loadDue}>Neu laden</button>
      </div>
    );
  }

  const e = current.entry;

  return (
    <div>
      <p style={{ opacity: 0.8 }}>Fällig: {queue.length}</p>

      <div
        onClick={() => setFlipped(x => !x)}
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          cursor: "pointer",
          userSelect: "none",
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          {!flipped ? (
            <div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 42 }}>{e.thai}</div>
                <button onClick={(ev) => { ev.stopPropagation(); void speak(e.thai, "th-TH"); }} title="Thai vorlesen">🔊 TH</button>
                <button onClick={(ev) => { ev.stopPropagation(); stopSpeak(); }} title="Stop">⏹</button>
              </div>
              {e.transliteration && <div style={{ opacity: 0.75, marginTop: 6 }}>{e.transliteration}</div>}
              <div style={{ marginTop: 10, opacity: 0.7 }}>Klicken zum Umdrehen</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 28 }}>{e.german}</div>
                <button onClick={(ev) => { ev.stopPropagation(); void speak(e.german, "de-DE"); }} title="Deutsch vorlesen">🔊 DE</button>
                <button onClick={(ev) => { ev.stopPropagation(); stopSpeak(); }} title="Stop">⏹</button>
              </div>

              {(e.exampleThai || e.exampleGerman) && (
                <div style={{ marginTop: 10, opacity: 0.85 }}>
                  {e.exampleThai && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                      <span>TH: {e.exampleThai}</span>
                      <button onClick={(ev) => { ev.stopPropagation(); void speak(e.exampleThai!, "th-TH"); }} title="Beispiel Thai vorlesen">🔊</button>
                    </div>
                  )}
                  {e.exampleGerman && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                      <span>DE: {e.exampleGerman}</span>
                      <button onClick={(ev) => { ev.stopPropagation(); void speak(e.exampleGerman!, "de-DE"); }} title="Beispiel Deutsch vorlesen">🔊</button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 10, opacity: 0.7 }}>Klicken zum Zurückdrehen</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => answer(0)}>Again</button>
        <button onClick={() => answer(1)}>Hard</button>
        <button onClick={() => answer(2)}>Good</button>
        <button onClick={() => answer(3)}>Easy</button>
        <button onClick={loadDue} style={{ marginLeft: "auto" }}>Reload</button>
      </div>
    </div>
  );
}
'@

# --- src\App.tsx ---
Write-FileUtf8NoBom "src\App.tsx" @'
import { useState } from "react";
import Home from "./pages/Home";
import VocabList from "./pages/VocabList";
import Learn from "./pages/Learn";
import ImportExport from "./pages/ImportExport";

type Route = "home" | "list" | "learn" | "io";

export default function App() {
  const [route, setRoute] = useState<Route>("home");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, marginRight: 16 }}>Thai–Deutsch Vokabeltrainer</h2>
        <button onClick={() => setRoute("home")}>Home</button>
        <button onClick={() => setRoute("list")}>Vokabeln</button>
        <button onClick={() => setRoute("learn")}>Lernen</button>
        <button onClick={() => setRoute("io")}>Import/Export</button>
      </header>

      {route === "home" && <Home />}
      {route === "list" && <VocabList />}
      {route === "learn" && <Learn />}
      {route === "io" && <ImportExport />}
    </div>
  );
}
'@

# --- sample csv ---
Write-FileUtf8NoBom "data\sample-vocab.csv" @'
thai,german,transliteration,pos,tags,exampleThai,exampleGerman
กิน,essen,gin,Verb,"Food,A1",ฉันกินข้าว,I eat rice
น้ำ,Wasser,nam,Nomen,"Food,A1",น้ำเย็น,Cold water
ไป,gehen,paai,Verb,"Basics,A1",ฉันไปโรงเรียน,I go to school
'@

Write-Host "✅ All files written. Verifying..."

Get-ChildItem .\src\db -Force | Select-Object Name, Length
Get-ChildItem .\src\pages -Force | Select-Object Name, Length
Get-ChildItem .\src\features -Recurse -Force | Select-Object FullName, Length

Write-Host "✅ Verification done."
