/**
 * The three level names are duplicated from hangman/difficulty.ts rather than shared,
 * the same trade normalize.ts already makes: three strings are cheaper to copy than to
 * couple two games through a common module. `/shared` is created the day duplication
 * actually hurts.
 */
export const DIFFICULTIES = ["easy", "normal", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_DIFFICULTY: Difficulty = "normal";

/**
 * The level changes how many pairs are on the table, and nothing else.
 *
 * The 2026-08-26 workshop wrote "the level acts on the content, never on the rules",
 * which for Hangman meant the word. Applied literally here it would forbid the only
 * lever a Memory has, since a bigger grid *is* the board. The 2026-09-08 workshop
 * therefore narrowed the rule rather than dodging it: **the level never touches the
 * rule constants** — two cards per turn, no limit on attempts, at every level. The
 * devil's advocate disagreed (3 pairs is matching, 8 pairs is spatial memory: two
 * different tasks) and that dissent is recorded in the report.
 *
 * Grids are wider than they are tall so the board fits a landscape tablet without
 * scrolling, which is what caps `hard` at 8 pairs / 16 cards.
 */
export const PAIRS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 3,
  normal: 6,
  hard: 8,
};

export const GRID_BY_DIFFICULTY: Record<Difficulty, { columns: number; rows: number }> = {
  easy: { columns: 3, rows: 2 },
  normal: { columns: 4, rows: 3 },
  hard: { columns: 4, rows: 4 },
};

export const MAX_PAIRS = Math.max(...Object.values(PAIRS_BY_DIFFICULTY));

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}
