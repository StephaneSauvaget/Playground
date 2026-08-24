import { useCallback, useState } from "react";

const storageKey = (gameId: string) => `playground.rules-seen.${gameId}`;

/**
 * localStorage throws in private browsing and when site data is blocked.
 * A child who can't be told "you've seen this" must still be able to play,
 * so every access degrades to "not seen yet" rather than propagating.
 */
function hasSeenRules(gameId: string): boolean {
  try {
    return localStorage.getItem(storageKey(gameId)) === "1";
  } catch {
    return false;
  }
}

function rememberRulesSeen(gameId: string): void {
  try {
    localStorage.setItem(storageKey(gameId), "1");
  } catch {
    // Nothing to do — the rules simply show again on the next visit.
  }
}

/**
 * Rules visibility for one game, remembered per browser.
 * Shown automatically on the first visit only; after that the game's own
 * "rules" button reopens them on demand — closing must never make them
 * unreachable for the next child using the same device.
 */
export function useRules(gameId: string) {
  // Lazy initialiser: storage is read once on mount, not on every render.
  const [rulesOpen, setRulesOpen] = useState(() => !hasSeenRules(gameId));

  const closeRules = useCallback(() => {
    rememberRulesSeen(gameId);
    setRulesOpen(false);
  }, [gameId]);

  const openRules = useCallback(() => setRulesOpen(true), []);

  return { rulesOpen, openRules, closeRules };
}
