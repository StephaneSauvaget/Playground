export type RoundStatus = "in_progress" | "won" | "lost";

export interface PublicRoundView {
  roundId: string;
  hint: string;
  wordLength: number;
  maxWrongGuesses: number;
  guessedLetters: string[];
  wrongGuesses: number;
  status: RoundStatus;
  display: (string | null)[];
  word?: string;
}
