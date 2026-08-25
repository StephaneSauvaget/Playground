import { Router } from "express";
import { DEFAULT_DIFFICULTY, isDifficulty } from "./difficulty.js";
import { createRound, HangmanError, revealRound, submitGuess } from "./store.js";

export const hangmanRouter = Router();

hangmanRouter.post("/rounds", (req, res) => {
  const { difficulty } = req.body ?? {};

  // Whitelist, not a number: the client asks for a named level and the server
  // decides what that costs. Accepting a caller-supplied maxWrongGuesses would
  // let anyone with devtools hand themselves ninety-nine lives.
  if (difficulty !== undefined && !isDifficulty(difficulty)) {
    res.status(400).json({ error: "'difficulty' must be one of: easy, normal, hard" });
    return;
  }

  res.status(201).json(createRound(difficulty ?? DEFAULT_DIFFICULTY));
});

hangmanRouter.post("/rounds/:roundId/guesses", (req, res) => {
  const { letter } = req.body ?? {};
  if (typeof letter !== "string") {
    res.status(400).json({ error: "Body must include a string 'letter'" });
    return;
  }
  try {
    res.json(submitGuess(req.params.roundId, letter.toLowerCase()));
  } catch (err) {
    if (err instanceof HangmanError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    throw err;
  }
});

hangmanRouter.post("/rounds/:roundId/reveal", (req, res) => {
  try {
    res.json(revealRound(req.params.roundId));
  } catch (err) {
    if (err instanceof HangmanError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    throw err;
  }
});
