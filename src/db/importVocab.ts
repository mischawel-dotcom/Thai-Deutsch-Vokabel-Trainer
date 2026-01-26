import { db } from './db';
import { seedVocabularyData } from './seedData';
import type { VocabEntry } from './db';
import { ensureProgress } from './srs';

// Version marker to track when seed data is updated
// Change this number when updating seedVocabularyData to force a re-import
const SEED_DATA_VERSION = '1.4'; // Updated 2026-01-26 force reset after exam fix

// Prevent double execution (React StrictMode mounts twice in dev)
let seedPromise: Promise<boolean> | null = null;

/**
 * Seeds the vocabulary database with default data from seedData.ts
 * Only imports if the database is empty or version has changed
 * @returns True if data was imported, false if database already has current data
 */
export async function seedDatabase(): Promise<boolean> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
    const lastImportVersion = localStorage.getItem('seedDataVersion');
    const existingCount = await db.vocab.count();
    const expectedCount = seedVocabularyData.length;
    
    // Determine if a reset is required (version change or wrong count)
    const progressCount = await db.progress.count();
    const needsReset =
      lastImportVersion !== SEED_DATA_VERSION ||
      existingCount !== expectedCount ||
      progressCount !== expectedCount;

      if (existingCount > 0 && !needsReset) {
        console.log(`Database already contains ${existingCount} vocabulary entries with current version`);
        return false;
      }
    
    // If version changed, clear old data first
      if (existingCount > 0 && needsReset) {
        console.log(
          `Clearing data (version ${lastImportVersion} -> ${SEED_DATA_VERSION}, vocab ${existingCount} -> ${expectedCount}, progress ${progressCount} -> ${expectedCount})`
        );
        await db.transaction('rw', db.vocab, db.progress, async () => {
          await db.vocab.clear();
          await db.progress.clear();
        });
      }

      const now = Date.now();
    
    // Convert seed data to full VocabEntry objects with timestamps
      const entriesToAdd: VocabEntry[] = seedVocabularyData.map((entry) => ({
        ...entry,
        createdAt: now,
        updatedAt: now,
      }));

      // Add all entries to the database
      const addedIds = await db.vocab.bulkAdd(entriesToAdd);

      // Initialize SRS progress so cards become due immediately
      await db.vocab.each(async (entry) => {
        if (entry.id != null) {
          await ensureProgress(entry.id);
        }
      });
    
      // Save version to localStorage
      localStorage.setItem('seedDataVersion', SEED_DATA_VERSION);
    
      const addedCount = Array.isArray(addedIds) ? addedIds.length : expectedCount;
      console.log(`Successfully imported ${addedCount} vocabulary entries into database (v${SEED_DATA_VERSION})`);
      return true;
    } catch (error) {
      console.error('Error seeding vocabulary database:', error);
      throw error;
    } finally {
      seedPromise = null;
    }
  })();

  return seedPromise;
}
