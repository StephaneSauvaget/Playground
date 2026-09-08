import { randomUUID } from "node:crypto";
import { patterns } from "../data/patterns.js";
import {
  DEFAULT_DIFFICULTY,
  GRID_BY_DIFFICULTY,
  PAIRS_BY_DIFFICULTY,
  type Difficulty,
} from "./difficulty.js";
import type { MemoryCard, PublicBoardView } from "./types.js";

/**
 * There is no store.ts here, and that is the decision, not an omission.
 *
 * Hangman keeps rounds in a Map because it has to remember a word the client must not
 * see. A Memory board holds nothing the client isn't already looking at, so keeping it
 * server-side would buy no authority and cost a network round-trip per tap — in a game
 * played in dozens of fast gestures. The server deals and forgets; a reload deals a new
 * board, which is also the right behaviour for a six-year-old.
 *
 * The `roundId` is still issued by the server. It is the one thing the future
 * quests/progression features cannot invent after the fact.
 */

/** Fisher-Yates, in place. */
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function dealBoard(difficulty: Difficulty = DEFAULT_DIFFICULTY): PublicBoardView {
  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const { columns, rows } = GRID_BY_DIFFICULTY[difficulty];

  // Pick which motifs are on the table before deciding where they land, so the same
  // level never always shows the same subset of the catalogue.
  const chosen = shuffle([...patterns]).slice(0, pairs);

  const cards: MemoryCard[] = shuffle(
    chosen.flatMap((pattern) => [
      { cardId: randomUUID(), patternId: pattern.id },
      { cardId: randomUUID(), patternId: pattern.id },
    ]),
  );

  return {
    roundId: randomUUID(),
    difficulty,
    pairs,
    columns,
    rows,
    patterns: chosen.map(({ id, altKey }) => ({ id, altKey })),
    cards,
  };
}
