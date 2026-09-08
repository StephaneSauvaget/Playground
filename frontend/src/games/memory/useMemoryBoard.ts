import { useCallback, useEffect, useReducer, useState } from "react";
import type { TranslationKey } from "../../i18n/translations";
import type { Difficulty } from "../difficulty";
import { startRound } from "./api";
import { initialState, isWon, reduce, type BoardState } from "./memoryEngine";
import type { BoardView } from "./types";

/**
 * How long a mismatched pair stays visible when the child does nothing. It is a
 * ceiling, not a wait: tapping another card resolves the pair immediately (see
 * memoryEngine.ts), so this only ever applies to a child who is still looking.
 */
const MISMATCH_MS = 1200;

interface LoadedBoard {
  forDifficulty: Difficulty;
  view: BoardView;
}

/**
 * Same shape as useHangmanRound: `difficulty` is nullable, null meaning "nothing
 * chosen yet, fetch nothing", and the fetched board is stored together with the
 * difficulty it belongs to so a stale board is simply not returned while the new one
 * loads.
 *
 * Everything this hook adds on top of the fetch is the two things a pure reducer
 * cannot hold: React state, and the single timer.
 */
export function useMemoryBoard(difficulty: Difficulty | null) {
  const [loaded, setLoaded] = useState<LoadedBoard | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [state, dispatch] = useReducer(reduce, initialState([]));

  const load = useCallback(async () => {
    if (!difficulty) return;
    setError(null);
    try {
      const view = await startRound(difficulty);
      setLoaded({ forDifficulty: difficulty, view });
      dispatch({ type: "reset", cards: view.cards });
    } catch {
      setError("memory.errorConnect");
    }
  }, [difficulty]);

  useEffect(() => {
    load();
  }, [load]);

  const board = loaded && loaded.forDifficulty === difficulty ? loaded.view : null;

  // The one and only timer in this game. It is armed by a phase, not by a click
  // handler, so it cannot be armed twice; and the cleanup disarms it as soon as the
  // phase leaves "resolving" — which is what a third tap does.
  useEffect(() => {
    if (state.phase !== "resolving") return;
    const timer = setTimeout(() => dispatch({ type: "hideMismatch" }), MISMATCH_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.selection]);

  const flip = useCallback((cardId: string) => dispatch({ type: "flip", cardId }), []);

  return { board, state, error, flip, won: isWon(state), playAgain: load };
}

export type { BoardState };
