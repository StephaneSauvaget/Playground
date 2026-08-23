import type { RoundView } from "./types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/games/hangman`;

async function handle(res: Response): Promise<RoundView> {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `Request failed with ${res.status}`);
  return body as RoundView;
}

export function startRound(): Promise<RoundView> {
  return fetch(`${BASE_URL}/rounds`, { method: "POST" }).then(handle);
}

export function guessLetter(roundId: string, letter: string): Promise<RoundView> {
  return fetch(`${BASE_URL}/rounds/${roundId}/guesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter }),
  }).then(handle);
}
