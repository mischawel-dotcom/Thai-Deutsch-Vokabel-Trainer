import { db } from "../../db/db";
import { selectRecentlyLearnedVocabIds } from "../../hooks/quickStartShared";
import type { PotpourriCard } from "./types";

function toCard(entry: {
  id?: number;
  thai?: string;
  german?: string;
}): PotpourriCard | null {
  if (typeof entry.id !== "number") return null;
  const thai = (entry.thai ?? "").trim();
  const german = (entry.german ?? "").trim();
  if (!thai || !german) return null;
  return { id: entry.id, thai, german };
}

export type PotpourriLoadResult =
  | { ok: true; pool: PotpourriCard[]; learnedPool: PotpourriCard[]; target: number }
  | { ok: false; message: string };

/**
 * Lädt Potpourri-Pool (zuletzt gelernt) und Distraktor-Pool (alle gelernt).
 */
export async function loadPotpourriCards(limit: number): Promise<PotpourriLoadResult> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const vocab = await db.vocab.toArray();
  const recentIds = await selectRecentlyLearnedVocabIds(vocab, safeLimit);

  if (recentIds.length === 0) {
    return {
      ok: false,
      message:
        "Keine Karten mit Learn-Markierung. Markiere zuerst Vokabeln unter Lernen als gelernt.",
    };
  }

  const byId = new Map(
    vocab
      .filter((entry) => typeof entry.id === "number")
      .map((entry) => [entry.id as number, entry])
  );

  const pool: PotpourriCard[] = [];
  for (const id of recentIds) {
    const card = toCard(byId.get(id) ?? {});
    if (card) pool.push(card);
  }

  const learnedPool = vocab
    .filter(
      (entry) =>
        (entry.viewed === true ||
          (typeof entry.learnedAt === "number" && entry.learnedAt > 0)) &&
        typeof entry.id === "number"
    )
    .map((entry) => toCard(entry))
    .filter((card): card is PotpourriCard => card != null);

  if (pool.length === 0) {
    return { ok: false, message: "Die zuletzt gelernten Karten haben unvollständige Texte." };
  }

  if (learnedPool.length < 4) {
    return {
      ok: false,
      message:
        "Für 4 Antwortmöglichkeiten brauchst du mindestens 4 gelernte Karten mit Thai und Deutsch.",
    };
  }

  return { ok: true, pool, learnedPool, target: pool.length };
}
