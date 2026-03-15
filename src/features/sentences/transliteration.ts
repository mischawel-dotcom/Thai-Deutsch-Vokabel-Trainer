export type SentenceSegment = {
  thai: string;
  transliteration?: string;
};

function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

function buildLongestThaiWords(words: string[]): string[] {
  return Array.from(new Set(words))
    .map((word) => word.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

export function buildSentenceSegments(
  thaiSentence: string,
  vocabThaiWords: string[],
  transliterationByThai: Map<string, string>
): SentenceSegment[] {
  const sortedWords = buildLongestThaiWords(vocabThaiWords);
  const text = thaiSentence.trim();
  if (!text) return [];

  const segments: SentenceSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const currentChar = text[cursor];
    if (isWhitespace(currentChar)) {
      cursor += 1;
      continue;
    }

    let matchedWord: string | null = null;
    for (const word of sortedWords) {
      if (text.startsWith(word, cursor)) {
        matchedWord = word;
        break;
      }
    }

    if (matchedWord) {
      segments.push({
        thai: matchedWord,
        transliteration: transliterationByThai.get(matchedWord),
      });
      cursor += matchedWord.length;
      continue;
    }

    // Unknown chunk fallback: consume until next whitespace or known token match.
    let end = cursor + 1;
    while (end < text.length && !isWhitespace(text[end])) {
      const hasFutureMatch = sortedWords.some((word) => text.startsWith(word, end));
      if (hasFutureMatch) break;
      end += 1;
    }
    const unknownChunk = text.slice(cursor, end);
    segments.push({ thai: unknownChunk, transliteration: undefined });
    cursor = end;
  }

  return segments;
}

