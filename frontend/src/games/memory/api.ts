import { DIFFICULTIES, type Difficulty } from "../difficulty";
import type { BoardView, MemoryCard, PatternEntry } from "./types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/games/memory`;

/**
 * Hangman's api.ts casts the response with `body as RoundView` and gets away with it:
 * a malformed word is a wrong string on screen, and you see it. A malformed board is
 * different — a missing card, a pattern dealt three times, a count that doesn't match
 * the grid — it renders *something*, and the game is quietly unwinnable.
 *
 * So this checks. It is also where "every pattern appears exactly twice" is verified,
 * the property the workshop wanted a test runner for; putting it on the wire boundary
 * means it holds for whatever the server actually sent, not for what a test imagined.
 */
class MalformedBoardError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string" || value === "") {
    throw new MalformedBoardError(`'${key}' must be a non-empty string`);
  }
  return value;
}

function requirePositiveInt(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new MalformedBoardError(`'${key}' must be a positive integer`);
  }
  return value;
}

function requireArray(source: Record<string, unknown>, key: string): unknown[] {
  const value = source[key];
  if (!Array.isArray(value)) throw new MalformedBoardError(`'${key}' must be an array`);
  return value;
}

function parseBoard(body: unknown): BoardView {
  if (!isRecord(body)) throw new MalformedBoardError("response is not an object");

  const difficulty = requireString(body, "difficulty");
  if (!DIFFICULTIES.includes(difficulty as Difficulty)) {
    throw new MalformedBoardError(`unknown difficulty '${difficulty}'`);
  }

  const patterns: PatternEntry[] = requireArray(body, "patterns").map((entry) => {
    if (!isRecord(entry)) throw new MalformedBoardError("pattern is not an object");
    return { id: requireString(entry, "id"), altKey: requireString(entry, "altKey") };
  });

  const cards: MemoryCard[] = requireArray(body, "cards").map((entry) => {
    if (!isRecord(entry)) throw new MalformedBoardError("card is not an object");
    return { cardId: requireString(entry, "cardId"), patternId: requireString(entry, "patternId") };
  });

  const pairs = requirePositiveInt(body, "pairs");
  const columns = requirePositiveInt(body, "columns");
  const rows = requirePositiveInt(body, "rows");

  if (cards.length !== pairs * 2) {
    throw new MalformedBoardError(`${cards.length} cards for ${pairs} pairs`);
  }
  if (columns * rows !== cards.length) {
    throw new MalformedBoardError(`grid ${columns}x${rows} cannot hold ${cards.length} cards`);
  }
  if (new Set(cards.map((card) => card.cardId)).size !== cards.length) {
    throw new MalformedBoardError("duplicate cardId");
  }

  const known = new Set(patterns.map((pattern) => pattern.id));
  for (const pattern of known) {
    const dealt = cards.filter((card) => card.patternId === pattern).length;
    if (dealt !== 2) throw new MalformedBoardError(`pattern '${pattern}' dealt ${dealt} times`);
  }
  for (const card of cards) {
    if (!known.has(card.patternId)) {
      throw new MalformedBoardError(`card refers to unknown pattern '${card.patternId}'`);
    }
  }

  return {
    roundId: requireString(body, "roundId"),
    difficulty: difficulty as Difficulty,
    pairs,
    columns,
    rows,
    patterns,
    cards,
  };
}

export async function startRound(difficulty: Difficulty): Promise<BoardView> {
  const res = await fetch(`${BASE_URL}/rounds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? `Request failed with ${res.status}`);
  return parseBoard(body);
}
