// Skript: csv-to-defaultVocab.ts
// Wandelt eine CSV-Datei (thai-de-vocab.csv) in ein TypeScript-Array für defaultVocab.ts um

import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const csvPath = path.join(process.cwd(), 'data/thai-de-vocab.csv');
const outPath = path.join(process.cwd(), 'src/data/defaultVocab.ts');

const csv = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

function toVocabEntry(row: any) {
  return {
    thai: row.thai?.trim() || '',
    german: row.german?.trim() || '',
    transliteration: row.transliteration?.trim() || undefined,
    pos: row.pos?.trim() || undefined,
    lesson: row.lesson ? parseInt(row.lesson, 10) || undefined : undefined,
    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    exampleThai: row.exampleThai?.trim() || undefined,
    exampleGerman: row.exampleGerman?.trim() || undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const entries = parsed.data.map(toVocabEntry);

const ts = `import type { VocabEntry } from "../db/db";\n\nexport const DEFAULT_VOCAB: VocabEntry[] = ${JSON.stringify(entries, null, 2)};\n`;

fs.writeFileSync(outPath, ts, 'utf8');
console.log(`Fertig! Es wurden ${entries.length} Vokabeln nach defaultVocab.ts exportiert.`);
