import { Router } from "express";
import { createRound, HangmanError, revealRound, submitGuess } from "./store.js";

export const hangmanRouter = Router();

hangmanRouter.post("/rounds", (_req, res) => {
  res.status(201).json(createRound());
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
