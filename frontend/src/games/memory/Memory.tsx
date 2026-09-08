import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import type { TranslationKey } from "../../i18n/translations";
import { DifficultyPicker } from "../DifficultyPicker";
import type { Difficulty } from "../difficulty";
import { useRules } from "../../mascot/useRules";
import { Board } from "./Board";
import { PairDots } from "./PairDots";
import { RulesModal } from "./RulesModal";
import { useMemoryBoard } from "./useMemoryBoard";
import { WinModal } from "./WinModal";
import "./memory.css";

const DIFFICULTY_HELP: Record<Difficulty, TranslationKey> = {
  easy: "memory.difficulty.easy.help",
  normal: "memory.difficulty.normal.help",
  hard: "memory.difficulty.hard.help",
};

// The picker's preview is whatever the game can show a child who can't read yet.
// Hangman shows dashes; here it is the board itself, in miniature — the one difference
// between the three levels that is visible before choosing.
function MiniBoard({ columns, rows }: { columns: number; rows: number }) {
  return (
    <span
      className="mini-board"
      style={{ "--columns": columns } as React.CSSProperties}
    >
      {Array.from({ length: columns * rows }, (_, i) => (
        <span key={i} className="mini-card" />
      ))}
    </span>
  );
}

// Mirrors GRID_BY_DIFFICULTY in backend/src/memory/difficulty.ts. Only the preview
// depends on it: the real board is laid out from the columns/rows the server sends.
const DIFFICULTY_PREVIEWS: Record<Difficulty, ReactNode> = {
  easy: <MiniBoard columns={3} rows={2} />,
  normal: <MiniBoard columns={4} rows={3} />,
  hard: <MiniBoard columns={4} rows={4} />,
};

export function Memory() {
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [lastChoice, setLastChoice] = useState<Difficulty | null>(null);
  const { board, state, error, flip, won, playAgain } = useMemoryBoard(difficulty);
  const { rulesOpen, openRules, closeRules } = useRules("memory");

  const choose = (level: Difficulty) => {
    setLastChoice(level);
    setDifficulty(level);
  };

  const controls = (
    <div className="top-left-controls">
      <Link to="/" className="back-home-link">
        {t("memory.backHome")}
      </Link>
      <button type="button" className="rules-button" onClick={openRules}>
        {t("rules.reopen")}
      </button>
      {difficulty && (
        <button type="button" className="rules-button" onClick={() => setDifficulty(null)}>
          {t("difficulty.change")}
        </button>
      )}
    </div>
  );

  if (!difficulty) {
    return (
      <div className="memory-game">
        {controls}
        <div className="container">
          <h1>{t("memory.title")}</h1>
          <DifficultyPicker
            current={lastChoice}
            helpKeys={DIFFICULTY_HELP}
            previews={DIFFICULTY_PREVIEWS}
            onSelect={choose}
          />
        </div>
        {rulesOpen && <RulesModal onStart={closeRules} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="memory-game">
        {controls}
        <div className="container">
          <p className="error">{t(error)}</p>
          <button type="button" onClick={playAgain}>
            {t("memory.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="memory-game">
        {controls}
        <div className="container">
          <p>{t("memory.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-game">
      {controls}
      <div className="container">
        <h1>{t("memory.title")}</h1>
        <Board board={board} state={state} onFlip={flip} />
        <PairDots found={state.matched.size / 2} total={board.pairs} />
      </div>
      {won && <WinModal onPlayAgain={() => setDifficulty(null)} />}
      {rulesOpen && <RulesModal onStart={closeRules} />}
    </div>
  );
}
