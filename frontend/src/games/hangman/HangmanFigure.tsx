import { useI18n } from "../../i18n/I18nContext";

/**
 * Drawn in two groups so the wood and the character can be coloured apart:
 * the gallows follows `currentColor` (which lets the home-page card tint the
 * whole icon), the body has its own stroke in hangman.css.
 */
const PARTS = [
  <circle key="head" cx={150} cy={70} r={19} />,
  <line key="body" x1={150} y1={89} x2={150} y2={144} />,
  <line key="left-arm" x1={150} y1={104} x2={121} y2={127} />,
  <line key="right-arm" x1={150} y1={104} x2={179} y2={127} />,
  <line key="left-leg" x1={150} y1={144} x2={121} y2={176} />,
  <line key="right-leg" x1={150} y1={144} x2={179} y2={176} />,
];

export function HangmanFigure({ wrongGuesses }: { wrongGuesses: number }) {
  const { t } = useI18n();

  return (
    <svg
      viewBox="0 0 220 200"
      className="hangman-figure"
      role="img"
      aria-label={`${t("hangman.incorrectGuesses")}: ${wrongGuesses}`}
    >
      <g
        className="hangman-gallows"
        stroke="currentColor"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1={16} y1={187} x2={104} y2={187} />
        <line x1={44} y1={187} x2={44} y2={15} />
        <path d="M44 15 H150 V47" />
      </g>
      <g
        className="hangman-body"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PARTS.slice(0, wrongGuesses)}
      </g>
    </svg>
  );
}
