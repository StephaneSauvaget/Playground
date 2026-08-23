import { useI18n } from "../../i18n/I18nContext";

export function RulesModal({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();

  return (
    <div className="game-modal show">
      <div className="content rules-content">
        <h4>{t("rules.title")}</h4>
        <p>{t("rules.body")}</p>
        <button type="button" className="play-again" onClick={onStart}>
          {t("rules.start")}
        </button>
      </div>
    </div>
  );
}
