import { foundLetterSet } from "./letterStatus";

const LETTERS = [..."abcdefghijklmnopqrstuvwxyz"];

interface KeyboardProps {
  guessedLetters: string[];
  display: (string | null)[];
  disabled: boolean;
  onGuess: (letter: string) => void;
}

export function Keyboard({ guessedLetters, display, disabled, onGuess }: KeyboardProps) {
  const found = foundLetterSet(display);
  const guessed = new Set(guessedLetters);

  return (
    <div className="keyboard">
      {LETTERS.map((letter) => {
        // A tried key keeps its answer on it, so the child reads the board
        // instead of cross-checking the used-letters panel.
        const status = !guessed.has(letter) ? "" : found.has(letter) ? " correct" : " wrong";

        return (
          <button
            key={letter}
            type="button"
            className={`key${status}`}
            disabled={disabled || guessed.has(letter)}
            onClick={() => onGuess(letter)}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
