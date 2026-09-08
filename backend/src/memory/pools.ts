import { patterns } from "../data/patterns.js";
import { DIFFICULTIES, GRID_BY_DIFFICULTY, MAX_PAIRS, PAIRS_BY_DIFFICULTY } from "./difficulty.js";

/**
 * Same reasoning as hangman/pools.ts, applied to a different silent failure.
 *
 * Nothing tags a motif as belonging to a level: a board asks for N distinct motifs and
 * takes them from the catalogue. Drop motifs from `data/patterns.ts` — because a sheet
 * was recut, because one turned out unsuitable — and the hardest board quietly starts
 * dealing the same motif twice, which makes a pair impossible to tell apart. There is
 * no test runner here, so this runs at boot and throws: a server that refuses to start
 * is a loud failure, a board with two identical pairs is a silent one.
 *
 * The floor is not a magic number, it is `MAX_PAIRS` — derived from the difficulty
 * table, so raising a level's pair count can never leave a stale floor behind.
 */
export function assertMemoryPatternsAreUsable(): void {
  const ids = patterns.map((pattern) => pattern.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicates.length > 0) {
    throw new Error(
      `Memory pattern ids must be unique; duplicated: ${[...new Set(duplicates)].join(", ")}. ` +
        `Check data/patterns.ts.`,
    );
  }

  if (ids.length < MAX_PAIRS) {
    throw new Error(
      `Memory needs at least ${MAX_PAIRS} distinct patterns (the hardest board's pair ` +
        `count), found ${ids.length} in data/patterns.ts. Below that, a board would deal ` +
        `the same motif as two different pairs.`,
    );
  }

  // Catches a mistyped grid before a child meets a board with a hole in it.
  const mismatched = DIFFICULTIES.filter((level) => {
    const { columns, rows } = GRID_BY_DIFFICULTY[level];
    return columns * rows !== PAIRS_BY_DIFFICULTY[level] * 2;
  });

  if (mismatched.length > 0) {
    const detail = mismatched
      .map((level) => {
        const { columns, rows } = GRID_BY_DIFFICULTY[level];
        return `${level}=${columns}x${rows} for ${PAIRS_BY_DIFFICULTY[level]} pairs`;
      })
      .join(", ");
    throw new Error(
      `Memory grids must hold exactly two cards per pair (${detail}). Check memory/difficulty.ts.`,
    );
  }
}
