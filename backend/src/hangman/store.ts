import { randomUUID } from "node:crypto";
import { words } from "../data/words.js";
import { stripAccents } from "./normalize.js";
import type { PublicRoundView, RoundStatus } from "./types.js";

export const MAX_WRONG_GUESSES = 6;

interface Round {
  id: string;
  word: string;
  hint: string;
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

function pickWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function buildDisplay(round: Round): (string | null)[] {
  return [...round.word].map((letter) => (round.guessedLetters.has(stripAccents(letter)) ? letter : null));
}

function toPublicView(round: Round): PublicRoundView {
  return {
    roundId: round.id,
    hint: round.hint,
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

export function createRound(): PublicRoundView {
  const { word, hint } = pickWord();
  const round: Round = {
    id: randomUUID(),
    word,
    hint,
    guessedLetters: new Set(),
    wrongGuesses: 0,
    status: "in_progress",
  };
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
