import type { TranslationKey } from "../i18n/translations";

/**
 * Site-level, not Hangman-level: the three names and the picker that shows them
 * belong to the Playground, so game #2 gets them for free. What each level
 * *means* is the game's business — see `DIFFICULTY_HELP` in each game.
 *
 * Mirrors the server's whitelist in backend/src/hangman/difficulty.ts. Declared,
 * not verified: TypeScript checks nothing at runtime, so the server validates
 * the value again on arrival.
 */
export const DIFFICULTIES = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, TranslationKey> = {
  easy: "difficulty.easy",
  normal: "difficulty.normal",
  hard: "difficulty.hard",
};
