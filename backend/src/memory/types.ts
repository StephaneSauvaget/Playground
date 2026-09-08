import type { Difficulty } from "./difficulty.js";

/**
 * What the client needs to know about a motif: which one it is, and how to name it
 * out loud. `family` stays server-side — it decides which motifs are dealt together
 * (memory/deal.ts) and means nothing once the board exists.
 */
export interface PublicPattern {
  id: string;
  altKey: string;
}

export interface MemoryCard {
  /** Opaque and unique within a board; the frontend uses it as its React key. */
  cardId: string;
  patternId: string;
}

/**
 * The whole board, face up, in one response. Nothing is withheld — unlike Hangman,
 * where the word is the answer, here the answer is the layout and the child uncovers
 * it in half a minute. Hiding it would have cost a network round-trip per tap.
 *
 * `patterns` carries only the motifs this board uses, so the frontend can resolve an
 * alt text without shipping the whole catalogue.
 */
export interface PublicBoardView {
  roundId: string;
  difficulty: Difficulty;
  pairs: number;
  columns: number;
  rows: number;
  patterns: PublicPattern[];
  cards: MemoryCard[];
}
