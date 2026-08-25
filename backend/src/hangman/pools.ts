import { DIFFICULTIES } from "./difficulty.js";
import { poolSizes } from "./store.js";

/**
 * Difficulty is derived from the word rather than tagged in `words.ts`, which
 * removes the risk of a stale tag but adds a new one: regenerate or filter the
 * word list and a whole difficulty can quietly shrink to a handful of words,
 * or to nothing at all — every "hard" round then serves the same word.
 *
 * There is no test runner here, so the check runs at boot and throws. A server
 * that refuses to start is a loud failure; a pool of three words is a silent one.
 * Sizes at the time of writing: easy 271, normal 697, hard 156.
 */
const MIN_POOL_SIZE = 50;

export function assertHangmanPoolsAreUsable(): void {
  const sizes = poolSizes();
  const starved = DIFFICULTIES.filter((level) => sizes[level] < MIN_POOL_SIZE);

  if (starved.length > 0) {
    const detail = starved.map((level) => `${level}=${sizes[level]}`).join(", ");
    throw new Error(
      `Hangman word pools too small (${detail}); ` +
        `each difficulty needs at least ${MIN_POOL_SIZE} words. ` +
        `Check the thresholds in hangman/difficulty.ts against the current words.ts.`,
    );
  }
}
