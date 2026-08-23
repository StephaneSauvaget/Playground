const LETTERS = [..."abcdefghijklmnopqrstuvwxyz"];

interface KeyboardProps {
  guessedLetters: string[];
  disabled: boolean;
  onGuess: (letter: string) => void;
}

export function Keyboard({ guessedLetters, disabled, onGuess }: KeyboardProps) {
  return (
    <div className="keyboard">
      {LETTERS.map((letter) => (
        <button
          key={letter}
          type="button"
          disabled={disabled || guessedLetters.includes(letter)}
          onClick={() => onGuess(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
