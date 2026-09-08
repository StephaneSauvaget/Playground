import type { MemoryCard } from "./types";

/**
 * The rules of the game, and nothing else. No React, no fetch, no timers.
 *
 * Everything a Memory can get wrong lives in the transitions below — the third card
 * tapped while a mismatch is still showing, a double tap on the same card, a tap on a
 * card already matched. Keeping them in a pure function means they are readable in one
 * place instead of being spread across a component's event handlers.
 *
 * The workshop of 2026-09-08 asked for a test runner around this file and did not get
 * one, on the grounds that it would pile four new concepts onto game #2. That dissent
 * is recorded: if the board ever desynchronises after a run of taps, this is the file
 * to put under Vitest first.
 *
 * Dealing is not here — the server deals (backend/src/memory/deal.ts).
 */

export type Phase = "idle" | "resolving";

export interface BoardState {
  cards: readonly MemoryCard[];
  /** Cards currently face up and not yet resolved: 0, 1 or 2 of them. */
  selection: readonly string[];
  matched: ReadonlySet<string>;
  phase: Phase;
}

export type BoardEvent =
  | { type: "reset"; cards: readonly MemoryCard[] }
  | { type: "flip"; cardId: string }
  | { type: "hideMismatch" };

export function initialState(cards: readonly MemoryCard[]): BoardState {
  return { cards, selection: [], matched: new Set(), phase: "idle" };
}

/** Derived at render time, never stored — there is no way for it to drift. */
export function isWon(state: BoardState): boolean {
  return state.cards.length > 0 && state.matched.size === state.cards.length;
}

export function isFaceUp(state: BoardState, cardId: string): boolean {
  return state.matched.has(cardId) || state.selection.includes(cardId);
}

function patternOf(state: BoardState, cardId: string): string | undefined {
  return state.cards.find((card) => card.cardId === cardId)?.patternId;
}

/**
 * Clears a mismatched pair. Deliberately a no-op outside "resolving", so it can be
 * dispatched twice without damage — which is what happens when a backgrounded tab
 * fires its throttled timer late, after the child has already tapped on.
 */
function hideMismatch(state: BoardState): BoardState {
  if (state.phase !== "resolving") return state;
  return { ...state, selection: [], phase: "idle" };
}

function flip(state: BoardState, cardId: string): BoardState {
  // A third tap while a mismatch is showing resolves it and opens the tapped card, in
  // one go. The alternative — ignoring the tap until the delay elapses — is a tap with
  // no visible effect, which is exactly what makes a six-year-old hammer the screen.
  // The cost, raised by the workshop and accepted: a fast child never sees the pair
  // they just missed.
  if (state.phase === "resolving") return flip(hideMismatch(state), cardId);

  if (state.matched.has(cardId)) return state;
  if (state.selection.includes(cardId)) return state;
  if (state.selection.length >= 2) return state;

  const selection = [...state.selection, cardId];
  if (selection.length < 2) return { ...state, selection };

  const [first, second] = selection;
  if (patternOf(state, first) === patternOf(state, second)) {
    return {
      ...state,
      selection: [],
      matched: new Set([...state.matched, first, second]),
      phase: "idle",
    };
  }

  return { ...state, selection, phase: "resolving" };
}

export function reduce(state: BoardState, event: BoardEvent): BoardState {
  switch (event.type) {
    case "reset":
      return initialState(event.cards);
    case "flip":
      return flip(state, event.cardId);
    case "hideMismatch":
      return hideMismatch(state);
  }
}
