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
  viewed?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type NumberEntry = {
  id?: number;
  arabic: number;
  thaiWord: string;
  thaiDigit: string;
  german: string;
  transliteration?: string;
  lesson?: number;
  tags?: string[];
  viewed?: boolean;
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
  lastReviewed?: number;
  updatedAt: number;
};

class AppDB extends Dexie {
  vocab!: Dexie.Table<VocabEntry, number>;
  progress!: Dexie.Table<SrsProgress, number>;
  numbersVocab!: Dexie.Table<NumberEntry, number>;
  numbersProgress!: Dexie.Table<SrsProgress, number>;

  constructor() {
    // Updated to v4 to force clean slate after fixing duplication bug
    super("thaiVocabTrainer_v4");

    // Version 3: Original schema
    this.version(3).stores({
      vocab: "++id, thai, german, lesson, createdAt, updatedAt",
      progress: "entryId, dueAt, updatedAt",
    });

    // Version 4: Add lastReviewed field for daily progress tracking
    this.version(4).stores({
      vocab: "++id, thai, german, lesson, createdAt, updatedAt",
      progress: "entryId, dueAt, lastReviewed, updatedAt",
    });

    // Version 5: Add viewed flag for learning tracking
    this.version(5).stores({
      vocab: "++id, thai, german, lesson, viewed, createdAt, updatedAt",
      progress: "entryId, dueAt, lastReviewed, updatedAt",
    });

    // Version 6: Force clean slate after fixing duplication bug
    this.version(6).stores({
      vocab: "++id, thai, german, lesson, viewed, createdAt, updatedAt",
      progress: "entryId, dueAt, lastReviewed, updatedAt",
    });

    // Version 7: Add separate numbers world tables
    this.version(7).stores({
      vocab: "++id, thai, german, lesson, viewed, createdAt, updatedAt",
      progress: "entryId, dueAt, lastReviewed, updatedAt",
      numbersVocab: "++id, arabic, thaiWord, thaiDigit, lesson, viewed, createdAt, updatedAt",
      numbersProgress: "entryId, dueAt, lastReviewed, updatedAt",
    });

    this.vocab = this.table("vocab");
    this.progress = this.table("progress");
    this.numbersVocab = this.table("numbersVocab");
    this.numbersProgress = this.table("numbersProgress");
  }
}

export const db = new AppDB();
