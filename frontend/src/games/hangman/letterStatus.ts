import { stripAccents } from "./normalize";

/**
 * Letters currently revealed in the word, accent-stripped so they match the
 * plain a-z keyboard: guessing "e" reveals every "é"/"è"/"ê" at once, so the
 * key has to light up as correct even though `display` holds the accented form.
 *
 * Kept in its own file rather than inlined in Keyboard: this is the one place
 * the accent-insensitive matching rule is written down on the frontend, and it
 * has to stay findable if the word list ever changes.
 */
export function foundLetterSet(display: (string | null)[]): Set<string> {
  return new Set(display.filter((letter) => letter !== null).map(stripAccents));
}
