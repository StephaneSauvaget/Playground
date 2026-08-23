import { useCallback, useEffect, useState } from "react";
import type { TranslationKey } from "../../i18n/translations";
import { guessLetter, startRound } from "./api";
import type { RoundView } from "./types";

export function useHangmanRound() {
  const [round, setRound] = useState<RoundView | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRound(await startRound());
    } catch {
      setError("hangman.errorConnect");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const guess = useCallback(
    async (letter: string) => {
      if (!round || round.status !== "in_progress") return;
      try {
        setRound(await guessLetter(round.roundId, letter));
      } catch {
        setError("hangman.errorGuess");
      }
    },
    [round],
  );

  return { round, error, guess, playAgain: load };
}
