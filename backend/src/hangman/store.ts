import { randomUUID } from "node:crypto";
import { words, type WordEntry } from "../data/words.js";
import { DEFAULT_DIFFICULTY, DIFFICULTIES, difficultyOf, type Difficulty } from "./difficulty.js";
import { stripAccents } from "./normalize.js";
import type { PublicRoundView, RoundStatus } from "./types.js";

// Same for every difficulty, and deliberately so: HangmanFigure draws exactly six
// body parts, and a child of six reads "the drawing is nearly done", not "4 of 6".
// Difficulty is carried by the word, never by this number.
export const MAX_WRONG_GUESSES = 6;

const VOWELS = "aeiouy";

const pools: Record<Difficulty, WordEntry[]> = {
  easy: [],
  normal: [],
  hard: [],
};
for (const entry of words) pools[difficultyOf(entry)].push(entry);

export function poolSizes(): Record<Difficulty, number> {
  return { easy: pools.easy.length, normal: pools.normal.length, hard: pools.hard.length };
}

interface Round {
  id: string;
  word: string;
  hint: string;
  difficulty: Difficulty;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  status: RoundStatus;
}

export class HangmanError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

// In-memory only: rounds are lost on server restart and never evicted.
// Fine for local dev; swap for a real store before this needs to survive restarts or scale.
const rounds = new Map<string, Round>();

function pickWord(difficulty: Difficulty) {
  const pool = pools[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Easy gets one vowel revealed for free. It is the workshop's only "help" lever:
 * the child sees letters already showing without having to read a label, and it
 * costs the frontend nothing — `display` and the keyboard already render whatever
 * is in `guessedLetters`.
 */
function freeVowel(word: string): string | null {
  const present = [...new Set(stripAccents(word))].filter((letter) => VOWELS.includes(letter));
  if (present.length === 0) return null;
  return present[Math.floor(Math.random() * present.length)];
}

function buildDisplay(round: Round): (string | null)[] {
  return [...round.word].map((letter) => (round.guessedLetters.has(stripAccents(letter)) ? letter : null));
}

function toPublicView(round: Round): PublicRoundView {
  return {
    roundId: round.id,
    hint: round.hint,
    difficulty: round.difficulty,
    wordLength: round.word.length,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    guessedLetters: [...round.guessedLetters],
    wrongGuesses: round.wrongGuesses,
    status: round.status,
    display: buildDisplay(round),
    ...(round.status !== "in_progress" ? { word: round.word } : {}),
  };
}

function getRound(roundId: string): Round {
  const round = rounds.get(roundId);
  if (!round) throw new HangmanError(404, "Round not found");
  return round;
}

export function createRound(difficulty: Difficulty = DEFAULT_DIFFICULTY): PublicRoundView {
  const { word, hint } = pickWord(difficulty);
  const round: Round = {
    id: randomUUID(),
    word,
    hint,
    difficulty,
    guessedLetters: new Set(),
    wrongGuesses: 0,
    status: "in_progress",
  };

  if (difficulty === "easy") {
    const vowel = freeVowel(word);
    if (vowel) round.guessedLetters.add(vowel);
  }

  rounds.set(round.id, round);
  return toPublicView(round);
}

export function submitGuess(roundId: string, letter: string): PublicRoundView {
  const round = getRound(roundId);

  if (round.status !== "in_progress") {
    throw new HangmanError(409, "Round is already finished");
  }
  if (!/^[a-z]$/.test(letter)) {
    throw new HangmanError(400, "Letter must be a single a-z character");
  }
  if (round.guessedLetters.has(letter)) {
    throw new HangmanError(409, "Letter already guessed");
  }

  round.guessedLetters.add(letter);
  if (!stripAccents(round.word).includes(letter)) {
    round.wrongGuesses += 1;
  }

  const won = [...round.word].every((char) => round.guessedLetters.has(stripAccents(char)));
  const lost = round.wrongGuesses >= MAX_WRONG_GUESSES;
  if (won) round.status = "won";
  else if (lost) round.status = "lost";

  return toPublicView(round);
}

export function revealRound(roundId: string): PublicRoundView {
  const round = getRound(roundId);
  if (round.status === "in_progress") {
    round.status = "lost";
  }
  return toPublicView(round);
}
