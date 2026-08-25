import type { Difficulty } from "../difficulty";

export type RoundStatus = "in_progress" | "won" | "lost";

export interface RoundView {
  roundId: string;
  hint: string;
  difficulty: Difficulty;
  wordLength: number;
  maxWrongGuesses: number;
  guessedLetters: string[];
  wrongGuesses: number;
  status: RoundStatus;
  display: (string | null)[];
  word?: string;
}
