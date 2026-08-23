const PARTS = [
  <circle key="head" cx="150" cy="70" r="20" />,
  <line key="body" x1="150" y1="90" x2="150" y2="150" />,
  <line key="left-arm" x1="150" y1="105" x2="120" y2="130" />,
  <line key="right-arm" x1="150" y1="105" x2="180" y2="130" />,
  <line key="left-leg" x1="150" y1="150" x2="120" y2="180" />,
  <line key="right-leg" x1="150" y1="150" x2="180" y2="180" />,
];

export function HangmanFigure({ wrongGuesses }: { wrongGuesses: number }) {
  return (
    <svg viewBox="0 0 220 200" className="hangman-figure" role="img" aria-label={`${wrongGuesses} wrong guesses`}>
      <g stroke="currentColor" strokeWidth={3} fill="none" strokeLinecap="round">
        <line x1="10" y1="190" x2="110" y2="190" />
        <line x1="40" y1="190" x2="40" y2="10" />
        <line x1="40" y1="10" x2="150" y2="10" />
        <line x1="150" y1="10" x2="150" y2="50" />
      </g>
      <g stroke="currentColor" strokeWidth={3} fill="none" strokeLinecap="round">
        {PARTS.slice(0, wrongGuesses)}
      </g>
    </svg>
  );
}
