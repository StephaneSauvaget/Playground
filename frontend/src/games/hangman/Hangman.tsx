import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import { GameOverModal } from "./GameOverModal";
import { HangmanFigure } from "./HangmanFigure";
import { HintButton } from "./HintButton";
import { Keyboard } from "./Keyboard";
import { RulesModal } from "./RulesModal";
import { UsedLetters } from "./UsedLetters";
import { WordDisplay } from "./WordDisplay";
import { useHangmanRound } from "./useHangmanRound";
import "./hangman.css";

export function Hangman() {
  const { t } = useI18n();
  const { round, error, guess, playAgain } = useHangmanRound();
  const [showRules, setShowRules] = useState(true);

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
      <Link to="/" className="back-home-link">
        {t("hangman.backHome")}
      </Link>
      <div className="container">
        <div className="top-right-controls">
          <UsedLetters guessedLetters={round.guessedLetters} display={round.display} />
          <HintButton key={round.roundId} hint={round.hint} />
        </div>
        <div className="hangman-box">
          <HangmanFigure wrongGuesses={round.wrongGuesses} />
          <h1>{t("hangman.title")}</h1>
        </div>
        <div className="game-box">
          <WordDisplay display={round.display} />
          <h4 className="guesses-text">
            {t("hangman.incorrectGuesses")}: <b>{round.wrongGuesses} / {round.maxWrongGuesses}</b>
          </h4>
          <Keyboard
            guessedLetters={round.guessedLetters}
            disabled={round.status !== "in_progress"}
            onGuess={guess}
          />
        </div>
      </div>
      <GameOverModal round={round} onPlayAgain={playAgain} />
      {showRules && <RulesModal onStart={() => setShowRules(false)} />}
    </div>
  );
}
