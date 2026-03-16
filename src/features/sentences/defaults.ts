import { db } from "@/db/db";
import { ensureProgressForSentenceEntries } from "@/db/srs";
import { DEFAULT_SENTENCE_BLOCKS } from "@/data/defaultSentences";

function buildSentenceKey(
  thai: string,
  german: string,
  lesson: number,
  rangeStart: number,
  rangeEnd: number
) {
  return `${thai.trim()}__${german.trim()}__${lesson}__${rangeStart}__${rangeEnd}`;
}

export async function ensureDefaultSentencesSeeded(): Promise<void> {
  const existing = await db.sentencesVocab.toArray();
  const existingKeys = new Set(
    existing.map((entry) =>
      buildSentenceKey(entry.thai, entry.german, entry.lesson, entry.rangeStart, entry.rangeEnd)
    )
  );

  const now = Date.now();
  const missing = DEFAULT_SENTENCE_BLOCKS.flatMap((block) =>
    block.sentences
      .map((sentence) => ({
        thai: sentence.thai,
        german: sentence.german,
        lesson: block.lesson,
        rangeStart: block.rangeStart,
        rangeEnd: block.rangeEnd,
        unlockThresholdTestPassed: block.unlockThresholdTestPassed,
        sourceThaiWord: sentence.sourceThaiWord,
        tags: ["Sentences", `L${block.lesson}`, `R${block.rangeStart}-${block.rangeEnd}`],
        viewed: false,
        createdAt: now,
        updatedAt: now,
      }))
      .filter(
        (entry) =>
          !existingKeys.has(
            buildSentenceKey(
              entry.thai,
              entry.german,
              entry.lesson,
              entry.rangeStart,
              entry.rangeEnd
            )
          )
      )
  );

  if (missing.length === 0) return;

  const insertedIds = await db.sentencesVocab.bulkAdd(missing, { allKeys: true });
  const normalizedIds = insertedIds
    .map((id) => Number(id))
    .filter((id): id is number => Number.isFinite(id) && id > 0);
  await ensureProgressForSentenceEntries(normalizedIds);
}

