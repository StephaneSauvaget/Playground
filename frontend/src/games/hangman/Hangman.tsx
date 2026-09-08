import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import type { TranslationKey } from "../../i18n/translations";
import { DifficultyPicker } from "../DifficultyPicker";
import type { Difficulty } from "../difficulty";
import { GameOverModal } from "./GameOverModal";
import { HangmanFigure } from "./HangmanFigure";
import { HintButton } from "./HintButton";
import { Keyboard } from "./Keyboard";
import { MistakeDots } from "./MistakeDots";
import { RulesModal } from "./RulesModal";
import { WordDisplay } from "./WordDisplay";
import { useRules } from "../../mascot/useRules";
import { useHangmanRound } from "./useHangmanRound";
import "./hangman.css";

const DIFFICULTY_HELP: Record<Difficulty, TranslationKey> = {
  easy: "hangman.difficulty.easy.help",
  normal: "hangman.difficulty.normal.help",
  hard: "hangman.difficulty.hard.help",
};

// The whole point of the preview: a 6-year-old can't read "long words with lots of
// different letters", but they can see that one row of dashes is longer than another.
// It is also literally what the game screen will show them next — which is why it is
// Hangman's business and not the picker's.
const PREVIEW_DASHES: Record<Difficulty, number> = { easy: 3, normal: 5, hard: 8 };

const DIFFICULTY_PREVIEWS: Record<Difficulty, ReactNode> = {
  easy: <Dashes count={PREVIEW_DASHES.easy} />,
  normal: <Dashes count={PREVIEW_DASHES.normal} />,
  hard: <Dashes count={PREVIEW_DASHES.hard} />,
};

function Dashes({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="difficulty-dash" />
      ))}
    </>
  );
}

export function Hangman() {
  const { t } = useI18n();
  // null = nothing chosen yet, so nothing is fetched. `lastChoice` survives that
  // reset only to pre-highlight the previous pick.
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [lastChoice, setLastChoice] = useState<Difficulty | null>(null);
  const { round, error, guess, playAgain } = useHangmanRound(difficulty);
  const { rulesOpen, openRules, closeRules } = useRules("hangman");

  const choose = (level: Difficulty) => {
    setLastChoice(level);
    setDifficulty(level);
  };

  if (!difficulty) {
    return (
      <div className="hangman-game">
        <div className="top-left-controls">
          <Link to="/" className="back-home-link">
            {t("hangman.backHome")}
          </Link>
          <button type="button" className="rules-button" onClick={openRules}>
            {t("rules.reopen")}
          </button>
        </div>
        <div className="container">
          <div className="hangman-box">
            <HangmanFigure wrongGuesses={3} />
            <h1>{t("hangman.title")}</h1>
          </div>
          <DifficultyPicker
            current={lastChoice}
            helpKeys={DIFFICULTY_HELP}
            previews={DIFFICULTY_PREVIEWS}
            onSelect={choose}
          />
        </div>
        {rulesOpen && <RulesModal onStart={closeRules} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="hangman-game">
        <p className="error">{t(error)}</p>
        <button type="button" onClick={playAgain}>
          {t("hangman.retry")}
        </button>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="hangman-game">
        <p>{t("hangman.loading")}</p>
      </div>
    );
  }

  return (
    <div className="hangman-game">
      <div className="top-left-controls">
        <Link to="/" className="back-home-link">
          {t("hangman.backHome")}
        </Link>
        <button type="button" className="rules-button" onClick={openRules}>
          {t("rules.reopen")}
        </button>
        <button type="button" className="rules-button" onClick={() => setDifficulty(null)}>
          {t("difficulty.change")}
        </button>
      </div>
      <div className="container">
        <div className="top-right-controls">
          <HintButton key={round.roundId} hint={round.hint} />
        </div>
        <div className="hangman-box">
          <HangmanFigure wrongGuesses={round.wrongGuesses} />
          <h1>{t("hangman.title")}</h1>
        </div>
        <div className="game-box">
          <WordDisplay display={round.display} />
          <MistakeDots
            wrongGuesses={round.wrongGuesses}
            maxWrongGuesses={round.maxWrongGuesses}
          />
          <Keyboard
            guessedLetters={round.guessedLetters}
            display={round.display}
            disabled={round.status !== "in_progress"}
            onGuess={guess}
          />
        </div>
      </div>
      <GameOverModal round={round} onPlayAgain={() => setDifficulty(null)} />
      {rulesOpen && <RulesModal onStart={closeRules} />}
    </div>
  );
}
