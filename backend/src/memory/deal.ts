import { randomUUID } from "node:crypto";
import { families, patterns, type PatternEntry } from "../data/patterns.js";
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

/**
 * Which motifs end up on the table — the second difficulty lever.
 *
 * The art is three animals in four poses each, so "how many pairs" is not the only
 * thing that makes a board hard: two fawns are far harder to tell apart than a fawn
 * and an owl. Motifs are therefore drawn one family at a time, round-robin, from a
 * shuffled pool. A 3-pair board takes one pose from each of the three species; only
 * once every family has been used does a second pose of the same animal appear. So an
 * easy board is always maximally distinct and a hard one necessarily mixes poses,
 * without either being a special case.
 *
 * This is still content, not rule: the level never changes "turn over two cards".
 */
function pickPatterns(pairs: number): PatternEntry[] {
  const byFamily = new Map<string, PatternEntry[]>();
  for (const family of families) {
    byFamily.set(family, shuffle(patterns.filter((entry) => entry.family === family)));
  }

  const order = shuffle([...families]);
  const chosen: PatternEntry[] = [];
  while (chosen.length < pairs) {
    let dealt = false;
    for (const family of order) {
      if (chosen.length >= pairs) break;
      const next = byFamily.get(family)?.shift();
      if (next) {
        chosen.push(next);
        dealt = true;
      }
    }
    // Impossible while pools.ts holds at boot, but an infinite loop is a worse way to
    // find that out than a short board.
    if (!dealt) break;
  }
  return chosen;
}

/** Fisher-Yates, in place. */
function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealBoard(difficulty: Difficulty = DEFAULT_DIFFICULTY): PublicBoardView {
  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const { columns, rows } = GRID_BY_DIFFICULTY[difficulty];

  const chosen = pickPatterns(pairs);

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
