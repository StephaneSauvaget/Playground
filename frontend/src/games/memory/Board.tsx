import { Card } from "./Card";
import { isFaceUp, type BoardState } from "./memoryEngine";
import type { BoardView } from "./types";

interface BoardProps {
  board: BoardView;
  state: BoardState;
  onFlip: (cardId: string) => void;
}

export function Board({ board, state, onFlip }: BoardProps) {
  const altOf = (patternId: string) =>
    board.patterns.find((pattern) => pattern.id === patternId)?.altKey ?? "";

  return (
    <div
      className="memory-board"
      // The column count is data, not a class: three levels would otherwise mean three
      // near-identical CSS rules. The row count comes for free from the flow.
      style={{ "--columns": board.columns } as React.CSSProperties}
    >
      {board.cards.map((card) => (
        <Card
          key={card.cardId}
          patternId={card.patternId}
          altKey={altOf(card.patternId)}
          faceUp={isFaceUp(state, card.cardId)}
          matched={state.matched.has(card.cardId)}
          onFlip={() => onFlip(card.cardId)}
        />
      ))}
    </div>
  );
}
