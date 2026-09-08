import { useI18n } from "../../i18n/I18nContext";
import { Clomo } from "../../mascot/Clomo";

/**
 * There is no losing screen, because a solo Memory cannot be lost. The reward is the
 * finished board showing through behind the card, plus Clomo — no number, no stars,
 * no time.
 */
export function WinModal({ onPlayAgain }: { onPlayAgain: () => void }) {
  const { t } = useI18n();

  return (
    <div className="game-modal show">
      <div className="content">
        <Clomo pose="bravo" height={150} className="memory-win-clomo" />
        <h4>{t("memory.win.title")}</h4>
        <button type="button" className="play-again" onClick={onPlayAgain}>
          {t("memory.playAgain")}
        </button>
      </div>
    </div>
  );
}
