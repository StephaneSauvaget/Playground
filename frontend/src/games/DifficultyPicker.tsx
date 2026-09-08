import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "./difficulty";
import "./games.css";

interface DifficultyPickerProps {
  /** Highlighted as the previous pick, so the child doesn't rebuild the choice from scratch. */
  current: Difficulty | null;
  /** What each level means in THIS game. Site owns the names, the game owns the meaning. */
  helpKeys: Record<Difficulty, TranslationKey>;
  /**
   * What each level LOOKS like in this game — the only difference a child who can't
   * read yet is able to see. Hangman draws a row of dashes, Memory a mini grid of card
   * backs. Purely decorative, so the picker hides it from assistive tech.
   */
  previews: Record<Difficulty, ReactNode>;
  onSelect: (difficulty: Difficulty) => void;
}

export function DifficultyPicker({
  current,
  helpKeys,
  previews,
  onSelect,
}: DifficultyPickerProps) {
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
              {previews[level]}
            </span>
            <span className="difficulty-name">{t(DIFFICULTY_LABELS[level])}</span>
            <span className="difficulty-help">{t(helpKeys[level])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
