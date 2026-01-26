import Dexie from "dexie";

export type VocabEntry = {
  id?: number;
  thai: string;
  german: string;
  transliteration?: string;
  pos?: string;
  lesson?: number;
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
  vocab!: Dexie.Table<VocabEntry, number>;
  progress!: Dexie.Table<SrsProgress, number>;

  constructor() {
    // Bump DB name to force a clean IndexedDB (fix duplicate 1000 entries)
    super("thaiVocabTrainer_v2");

    this.version(3).stores({
      vocab: "++id, thai, german, lesson, createdAt, updatedAt",
      progress: "entryId, dueAt, updatedAt",
    });

    this.vocab = this.table("vocab");
    this.progress = this.table("progress");
  }
}

export const db = new AppDB();
