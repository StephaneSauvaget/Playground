import { Router } from "express";
import { dealBoard } from "./deal.js";
import { DEFAULT_DIFFICULTY, isDifficulty } from "./difficulty.js";

export const memoryRouter = Router();

/**
 * The whole API surface of this game. There is deliberately no `/finish` and no
 * move counter: the workshop cut both — nothing displays a number, and a score the
 * server cannot verify is not a score. `/reveal` on Hangman has had no caller since
 * the initial commit; this game does not repeat that.
 */
memoryRouter.post("/rounds", (req, res) => {
  const { difficulty } = req.body ?? {};

  if (difficulty !== undefined && !isDifficulty(difficulty)) {
    res.status(400).json({ error: "'difficulty' must be one of: easy, normal, hard" });
    return;
  }

  res.status(201).json(dealBoard(difficulty ?? DEFAULT_DIFFICULTY));
});
