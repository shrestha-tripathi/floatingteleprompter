/** Pure reading-mode helpers; timing comes from the existing playback loop. */
export type ReadingMode = "guide" | "words";

export function parseReadingMode(value: string): ReadingMode {
  return value === "words" ? "words" : "guide";
}

export function tokenizeScript(text: string): { text: string; word: boolean }[] {
  return (text.match(/\s+|\S+/gu) ?? []).map((part) => ({
    text: part,
    word: !/^\s/u.test(part),
  }));
}

export function paintedWordCount(position: number, count: number): number {
  return count > 0 ? Math.min(count, Math.floor(Math.max(0, position)) + 1) : 0;
}

/** Scroll each word's untransformed top to the reading row, including blank lines. */
export function wordRowOffsets(tops: number[], readingTop: number): number[] {
  return tops.map((top) => Math.max(0, top - readingTop));
}

/** Cached untransformed word-row offsets: no layout reads during playback. */
export function wordScrollOffset(position: number, rows: readonly number[]): number {
  if (!rows.length) return 0;
  const p = Math.min(rows.length - 1, Math.max(0, position));
  const index = Math.floor(p);
  const from = rows[index];
  const to = rows[Math.min(index + 1, rows.length - 1)];
  return from + (to - from) * (p - index);
}
