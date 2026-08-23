export const en = {
  "home.title": "Playground",
  "home.subtitle": "Pick a game and have fun!",
  "home.hangman.title": "Hangman",
  "home.hangman.description": "Guess the secret word, one letter at a time!",
  "home.play": "Play",

  "hangman.title": "Hangman",
  "hangman.backHome": "← Back to games",
  "hangman.loading": "Loading…",
  "hangman.errorConnect": "Can't reach the game. Is the server running?",
  "hangman.errorGuess": "That letter didn't go through. Try again!",
  "hangman.retry": "Retry",
  "hangman.incorrectGuesses": "Mistakes",
  "hangman.win.title": "You found it! 🎉",
  "hangman.win.message": "The word was:",
  "hangman.lose.title": "So close!",
  "hangman.lose.message": "The word was:",
  "hangman.playAgain": "Play again",
  "hangman.hintShow": "Show hint",
  "hangman.hintHide": "Hide hint",
  "hangman.usedLetters": "Letters tried",

  "rules.title": "How to play",
  "rules.body": "A secret word is hiding behind the dashes. Click on letters to try to find it! If you're right, the letter shows up. If you're wrong, part of the little drawing appears. Try to guess the whole word before the drawing is finished!",
  "rules.start": "Let's play!",
} as const;

export type TranslationKey = keyof typeof en;

export const fr: Record<TranslationKey, string> = {
  "home.title": "Aire de jeux",
  "home.subtitle": "Choisis un jeu et amuse-toi !",
  "home.hangman.title": "Pendu",
  "home.hangman.description": "Devine le mot secret, lettre par lettre !",
  "home.play": "Jouer",

  "hangman.title": "Pendu",
  "hangman.backHome": "← Retour aux jeux",
  "hangman.loading": "Chargement…",
  "hangman.errorConnect": "Impossible de rejoindre le jeu. Le serveur est-il lancé ?",
  "hangman.errorGuess": "Cette lettre n'a pas fonctionné. Essaie encore !",
  "hangman.retry": "Réessayer",
  "hangman.incorrectGuesses": "Erreurs",
  "hangman.win.title": "Bravo, tu as trouvé ! 🎉",
  "hangman.win.message": "Le mot était :",
  "hangman.lose.title": "Presque !",
  "hangman.lose.message": "Le mot était :",
  "hangman.playAgain": "Rejouer",
  "hangman.hintShow": "Voir l'indice",
  "hangman.hintHide": "Cacher l'indice",
  "hangman.usedLetters": "Lettres essayées",

  "rules.title": "Comment jouer ?",
  "rules.body": "Un mot secret se cache derrière des tirets. Clique sur les lettres pour essayer de le trouver ! Si tu as raison, la lettre apparaît. Si tu te trompes, un bout du petit dessin apparaît. Essaie de deviner tout le mot avant que le dessin soit terminé !",
  "rules.start": "C'est parti !",
};
