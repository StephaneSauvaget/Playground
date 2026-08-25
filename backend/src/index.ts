import express from "express";
import cors from "cors";
import { hangmanRouter } from "./hangman/router.js";
import { assertHangmanPoolsAreUsable } from "./hangman/pools.js";

assertHangmanPoolsAreUsable();

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/games/hangman", hangmanRouter);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
