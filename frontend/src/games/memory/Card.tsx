import { useI18n } from "../../i18n/I18nContext";
import type { TranslationKey } from "../../i18n/translations";
import { artFor } from "./patterns";

interface CardProps {
  patternId: string;
  altKey: string;
  faceUp: boolean;
  matched: boolean;
  onFlip: () => void;
}

/**
 * One card. It knows nothing about the rules — whether it may be tapped is decided by
 * memoryEngine.ts, which simply ignores a tap it doesn't want. The button stays
 * enabled so the child always gets the sticker press-down feedback; a dead button that
 * does nothing visible is what makes them hammer the screen.
 */
export function Card({ patternId, altKey, faceUp, matched, onFlip }: CardProps) {
  const { t } = useI18n();
  const label = faceUp ? t(altKey as TranslationKey) : t("memory.cardFaceDown");

  return (
    <button
      type="button"
      className={`memory-card${faceUp ? " face-up" : ""}${matched ? " matched" : ""}`}
      onClick={onFlip}
      aria-label={label}
      aria-pressed={faceUp}
    >
      <span className="card-inner">
        <span className="card-face card-back" aria-hidden="true">
          {/* The back is a motif of its own, so back and face differ by shape as well
              as colour — the flip animation is off under prefers-reduced-motion. */}
          <svg viewBox="0 0 48 48" className="motif" aria-hidden="true">
            <circle cx="24" cy="24" r="11" />
            <circle cx="24" cy="24" r="4" className="filled" />
          </svg>
        </span>
        <span className="card-face card-front">{artFor(patternId)}</span>
      </span>
    </button>
  );
}
