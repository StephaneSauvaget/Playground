import { useI18n } from "../../i18n/I18nContext";
import { stripAccents } from "./normalize";

interface UsedLettersProps {
  guessedLetters: string[];
  display: (string | null)[];
}

export function UsedLetters({ guessedLetters, display }: UsedLettersProps) {
  const { t } = useI18n();

  if (guessedLetters.length === 0) return null;

  const foundLetters = new Set(display.filter((letter) => letter !== null).map(stripAccents));

  return (
    <div className="used-letters">
      <span className="used-letters-label">{t("hangman.usedLetters")}</span>
      <div className="used-letters-list">
        {guessedLetters.map((letter) => (
          <span key={letter} className={foundLetters.has(letter) ? "used-letter correct" : "used-letter wrong"}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
