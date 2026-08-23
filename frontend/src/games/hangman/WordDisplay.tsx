export function WordDisplay({ display }: { display: (string | null)[] }) {
  return (
    <ul className="word-display">
      {display.map((letter, index) => (
        <li key={index} className={letter ? "letter guessed" : "letter"}>
          {letter}
        </li>
      ))}
    </ul>
  );
}
