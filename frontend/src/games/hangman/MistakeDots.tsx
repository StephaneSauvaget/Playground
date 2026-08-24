import { useI18n } from "../../i18n/I18nContext";

interface MistakeDotsProps {
  wrongGuesses: number;
  maxWrongGuesses: number;
}

/**
 * The mistake counter as dots rather than "4 / 6": a 6-year-old counts long
 * before they read fluently, so the state has to be graspable without reading.
 * The figure stays the text equivalent for screen readers.
 */
export function MistakeDots({ wrongGuesses, maxWrongGuesses }: MistakeDotsProps) {
  const { t } = useI18n();

  return (
    <div
      className="mistake-dots"
      role="img"
      aria-label={`${t("hangman.incorrectGuesses")}: ${wrongGuesses} / ${maxWrongGuesses}`}
    >
      {Array.from({ length: maxWrongGuesses }, (_, i) => (
        // index keys are right here: a fixed-length range, never reordered,
        // only the class changes
        <span key={i} className={i < wrongGuesses ? "mistake-dot used" : "mistake-dot"} />
      ))}
    </div>
  );
}
