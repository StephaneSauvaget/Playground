import { useCallback, useEffect, useState } from "react";
import type { TranslationKey } from "../../i18n/translations";
import type { Difficulty } from "../difficulty";
import { guessLetter, startRound } from "./api";
import type { RoundView } from "./types";

interface LoadedRound {
  /** Which difficulty this view was fetched for. */
  forDifficulty: Difficulty;
  view: RoundView;
}

/**
 * `difficulty` is nullable on purpose: null means "the child hasn't chosen yet",
 * and the hook then starts nothing. Without it the round would load on mount,
 * before any choice could be made.
 *
 * The fetched round is stored together with the difficulty it belongs to, so a
 * round from the previous level is simply not returned while the new one loads —
 * no need to blank the state from inside the effect.
 */
export function useHangmanRound(difficulty: Difficulty | null) {
  const [loaded, setLoaded] = useState<LoadedRound | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);

  const load = useCallback(async () => {
    if (!difficulty) return;
    setError(null);
    try {
      setLoaded({ forDifficulty: difficulty, view: await startRound(difficulty) });
    } catch {
      setError("hangman.errorConnect");
    }
  }, [difficulty]);

  useEffect(() => {
    load();
  }, [load]);

  const round = loaded && loaded.forDifficulty === difficulty ? loaded.view : null;

  const guess = useCallback(
    async (letter: string) => {
      if (!round || round.status !== "in_progress") return;
      try {
        setLoaded({ forDifficulty: round.difficulty, view: await guessLetter(round.roundId, letter) });
      } catch {
        setError("hangman.errorGuess");
      }
    },
    [round],
  );

  return { round, error, guess, playAgain: load };
}
