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
        // A tried key keeps its answer on it: the child reads the result where
        // their eyes already are, on the key they just pressed.
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
