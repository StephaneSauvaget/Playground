import { stripAccents } from "./normalize";

/**
 * Letters currently revealed in the word, accent-stripped so they match the
 * plain a-z keyboard: guessing "e" reveals every "é"/"è"/"ê" at once, so the
 * key has to light up as correct even though `display` holds the accented form.
 *
 * Shared by Keyboard and UsedLetters — they must never disagree about whether
 * a letter was a hit.
 */
export function foundLetterSet(display: (string | null)[]): Set<string> {
  return new Set(display.filter((letter) => letter !== null).map(stripAccents));
}
