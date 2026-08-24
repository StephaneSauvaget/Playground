import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
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

export function Hangman() {
  const { t } = useI18n();
  const { round, error, guess, playAgain } = useHangmanRound();
  const { rulesOpen, openRules, closeRules } = useRules("hangman");

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
      <GameOverModal round={round} onPlayAgain={playAgain} />
      {rulesOpen && <RulesModal onStart={closeRules} />}
    </div>
  );
}
