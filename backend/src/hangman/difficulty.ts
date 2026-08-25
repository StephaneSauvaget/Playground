import type { WordEntry } from "../data/words.js";
import { stripAccents } from "./normalize.js";

export const DIFFICULTIES = ["easy", "normal", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_DIFFICULTY: Difficulty = "normal";

/**
 * The difficulty of a word is derived, never stored: `words.ts` stays a plain
 * {word, hint} list, so regenerating it can't leave a stale tag behind.
 *
 * Two measures, but really one axis — how much of the word a child still has to
 * find once a letter lands. Distinct letters is the one that matters ("aussi",
 * 5 letters / 4 distinct, costs as much as "chat"); length is what the child
 * actually sees on screen, as a row of dashes, before guessing anything.
 *
 * Accents are folded first, matching what a guess does in normalize.ts: "é" and
 * "e" are one letter to the player, so they must be one letter here too.
 */
export function difficultyOf({ word }: WordEntry): Difficulty {
  const letters = stripAccents(word);
  const distinct = new Set(letters).size;

  if (letters.length <= 5 && distinct <= 4) return "easy";
  if (letters.length >= 8 && distinct >= 7) return "hard";
  return "normal";
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}
