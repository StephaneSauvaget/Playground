import type { Difficulty } from "../difficulty";

export interface PatternEntry {
  id: string;
  /** A TranslationKey, resolved with t() at render time — the server holds no text. */
  altKey: string;
}

export interface MemoryCard {
  cardId: string;
  patternId: string;
}

/**
 * What POST /api/games/memory/rounds returns: the whole board, face up.
 *
 * Nothing is withheld, unlike Hangman's RoundView where `word` only appears once the
 * round is over. A Memory's answer is its layout, and the child uncovers it in half a
 * minute — hiding it would have cost a network round-trip per tap.
 */
export interface BoardView {
  roundId: string;
  difficulty: Difficulty;
  pairs: number;
  columns: number;
  rows: number;
  patterns: PatternEntry[];
  cards: MemoryCard[];
}
