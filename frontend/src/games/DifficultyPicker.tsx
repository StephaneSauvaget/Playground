import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "./difficulty";

interface DifficultyPickerProps {
  /** Highlighted as the previous pick, so the child doesn't rebuild the choice from scratch. */
  current: Difficulty | null;
  /** What each level means in THIS game. Site owns the names, the game owns the meaning. */
  helpKeys: Record<Difficulty, TranslationKey>;
  onSelect: (difficulty: Difficulty) => void;
}

// The whole point of the preview: a 6-year-old can't read "long words with lots of
// different letters", but they can see that one row of dashes is longer than another.
// It is also literally what the game screen will show them next.
const PREVIEW_DASHES: Record<Difficulty, number> = { easy: 3, normal: 5, hard: 8 };

export function DifficultyPicker({ current, helpKeys, onSelect }: DifficultyPickerProps) {
  const { t } = useI18n();

  return (
    <div className="difficulty-picker">
      <h2>{t("difficulty.question")}</h2>
      <div className="difficulty-options">
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            className={`difficulty-option ${level}`}
            aria-current={level === current ? "true" : undefined}
            onClick={() => onSelect(level)}
          >
            <span className="difficulty-preview" aria-hidden="true">
              {Array.from({ length: PREVIEW_DASHES[level] }, (_, i) => (
                <span key={i} className="difficulty-dash" />
              ))}
            </span>
            <span className="difficulty-name">{t(DIFFICULTY_LABELS[level])}</span>
            <span className="difficulty-help">{t(helpKeys[level])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
