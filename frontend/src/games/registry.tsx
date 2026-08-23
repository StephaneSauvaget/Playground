import type { ComponentType } from "react";
import { HangmanFigure } from "./hangman/HangmanFigure";
import type { TranslationKey } from "../i18n/translations";

export interface GameDescriptor {
  id: string;
  path: string;
  Icon: ComponentType;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export const games: GameDescriptor[] = [
  {
    id: "hangman",
    path: "/games/hangman",
    Icon: () => <HangmanFigure wrongGuesses={3} />,
    titleKey: "home.hangman.title",
    descriptionKey: "home.hangman.description",
  },
];
