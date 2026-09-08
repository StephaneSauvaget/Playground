import { useI18n } from "../../i18n/I18nContext";

interface PairDotsProps {
  found: number;
  total: number;
}

/**
 * One dot per pair, filling in as they are found — the same grammar as Hangman's
 * MistakeDots, in the positive. A six-year-old counts long before they read fluently,
 * which is also why there is no "3 / 6" anywhere and no move counter at all: the
 * workshop cut those on the grounds that a score turns a guaranteed win into a report
 * card. The text equivalent lives in the aria-label.
 */
export function PairDots({ found, total }: PairDotsProps) {
  const { t } = useI18n();

  return (
    <div className="pair-dots" role="img" aria-label={`${t("memory.pairsFound")} : ${found}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < found ? "pair-dot found" : "pair-dot"} />
      ))}
    </div>
  );
}
