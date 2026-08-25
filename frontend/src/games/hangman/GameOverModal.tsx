import { useI18n } from "../../i18n/I18nContext";
import { Clomo } from "../../mascot/Clomo";
import type { RoundView } from "./types";

interface GameOverModalProps {
  round: RoundView;
  onPlayAgain: () => void;
}

export function GameOverModal({ round, onPlayAgain }: GameOverModalProps) {
  const { t } = useI18n();
  if (round.status === "in_progress") return null;

  const won = round.status === "won";

  return (
    <div className="game-modal show">
      <div className="content">
        <Clomo pose={won ? "bravo" : "court"} height={150} className="game-over-clomo" />
        <h4>{won ? t("hangman.win.title") : t("hangman.lose.title")}</h4>
        <p>
          {won ? t("hangman.win.message") : t("hangman.lose.message")} <b>{round.word}</b>
        </p>
        {/* The definition is shown on a loss too: that child needs the word more, not less. */}
        <p className="word-definition">
          <span className="definition-label">{t("hangman.definition")}</span>
          {round.hint}
        </p>
        <button type="button" className="play-again" onClick={onPlayAgain}>
          {t("hangman.playAgain")}
        </button>
      </div>
    </div>
  );
}
