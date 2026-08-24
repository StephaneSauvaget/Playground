import { useState } from "react";
import type { TranslationKey } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { Clomo } from "./Clomo";
import "./clomo.css";

interface ClomoRulesProps {
  /** One short sentence per bubble. Keep them at a 6-year-old's listening level. */
  steps: readonly TranslationKey[];
  onStart: () => void;
}

/**
 * Clomo explaining a game's rules, one speech bubble at a time.
 * Shared by every game: pass your own `steps`, the pagination is handled here.
 */
export function ClomoRules({ steps, onStart }: ClomoRulesProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <div className="game-modal show">
      <div className="clomo-rules">
        <Clomo pose="coucou" height={190} className="clomo-rules-mascot" />

        <div className="speech-bubble">
          <button
            type="button"
            className="speech-close"
            onClick={onStart}
            aria-label={t("rules.close")}
          >
            {/* inline SVG rather than a glyph, like every other icon in the app */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7 L17 17 M17 7 L7 17" />
            </svg>
          </button>

          <h4 className="speech-title">{t("rules.title")}</h4>
          <p className="speech-text">{t(steps[step])}</p>

          <div className="speech-nav">
            <span className="speech-dots" aria-hidden="true">
              {steps.map((key, i) => (
                <span key={key} className={i === step ? "dot current" : "dot"} />
              ))}
            </span>
            <button
              type="button"
              className="play-again"
              onClick={() => (isLast ? onStart() : setStep(step + 1))}
            >
              {isLast ? t("rules.start") : t("rules.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
