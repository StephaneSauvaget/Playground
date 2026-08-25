# Niveaux de difficulté dans le pendu

**Date :** 2026-08-26 · **Mode :** complet (11 exécutions d'agent)

## La question

Introduire trois niveaux de difficulté dans le pendu avant d'attaquer le jeu #2, et
surtout : que met-on dans un niveau **autre** que le nombre de coups et le temps ?
Proposition initiale de l'auteur : Facile 8 coups / Normal 6 / Difficile 4.

**Problème réel : aucun.** L'auteur l'a confirmé au cadrage — personne n'a encore
vraiment joué, « c'est une envie ». L'atelier a donc travaillé sans problème observé,
ce qui est une faiblesse assumée de cette décision, pas un détail.

**Périmètre :** le pendu, avec une forme réutilisable pour le jeu #2.
**Hors périmètre :** créer `/shared` ; réintroduire un temps limite (retiré
volontairement le 2026-08-23 — un compte à rebours stresse exactement ce public).

**Hypothèses posées sans validation :**

- On s'autorisait à enrichir `words.ts`. *La décision finale n'en a pas eu besoin.*
- Forme généralisable au jeu #2, implémentation pendu seulement (CLAUDE.md :
  « Pull into /shared once a second game actually needs it »).
- C'est l'enfant qui choisit son niveau — **tranché par l'auteur**, pas par l'atelier.

## Décision

Trois niveaux, et **le niveau ne joue que sur le mot**.

1. `maxWrongGuesses` reste **6** dans tous les niveaux. La proposition 8/6/4 est rejetée.
2. Le niveau est un paramètre de `POST /rounds` (`"easy" | "normal" | "hard"`, whitelist
   serveur, défaut `"normal"`), jamais mémorisé côté serveur.
3. La difficulté d'un mot est **dérivée à la volée** (longueur + lettres distinctes
   après `stripAccents`), via une fonction pure `poolForDifficulty`. `words.ts` ne
   change pas.
4. **Un seul axe d'aide, en Facile uniquement** : le serveur pré-révèle une voyelle au
   démarrage — elle entre dans `guessedLetters` sans coûter d'erreur. Le front n'a rien
   à faire, `display` et le clavier la portent déjà.
5. L'enfant choisit **avant** que la partie démarre : `Hangman.tsx` affiche un écran de
   choix tant que `difficulty === null` et ne monte `useHangmanRound(difficulty)`
   qu'ensuite. « Rejouer » ramène cet écran, dernier niveau pré-sélectionné.
6. Condition de livraison : un invariant au démarrage du backend qui **jette** si un
   pool descend sous 50 mots.

**Ce qui a fait pencher la balance :** le constat de l'expert UX — « à 6 ans, l'enfant
ne compare pas 6 et 8, il regarde si le dessin va vite » — appuyé par le fait vérifié
que `HangmanFigure.tsx:8-15` contient exactement 6 `PARTS`. Le nombre de coups est à la
fois invisible pour le joueur et coûteux pour le code : il perd sur les deux tableaux.

**Pools mesurés sur les 1123 mots** (longueur, lettres distinctes après `stripAccents`) :
facile ≤5 lettres et ≤4 distinctes = **271 mots** ; normal = **697** ; difficile
≥8 lettres et ≥7 distinctes = **155**.

## Options écartées

| Option | Portée par | Pourquoi écartée |
|---|---|---|
| Facile 8 / Normal 6 / Difficile 4 coups | Proposition initiale | Casse `HangmanFigure` à 8 (les erreurs 7 et 8 ne dessinent rien, la potence se fige pendant que les points continuent) ; invisible pour un enfant de 6 ans ; refactor gratuit. |
| Tags de difficulté stockés dans `words.ts` | Back-end (tour 1) | 1123 lignes à maintenir et désynchronisation silencieuse à la prochaine régénération. |
| Réécriture des hints Wiktionary en langage enfant | UX | Chantier de contenu réel, séparé, non bloquant pour les niveaux. **Reste à faire.** |
| Clavier réduit en Facile | envisagé, rejeté par UX | Une touche absente se lit « le jeu est cassé » chez ce public. |
| Persistance du niveau (localStorage ou serveur) | Front-end (tour 1) | Pas de notion d'utilisateur ; `useRules` persiste « a vu les règles », pas une préférence de jeu. L'écran de choix à chaque partie suffit. |
| Temps limite en Difficile | — | Hors périmètre : retiré volontairement le 2026-08-23. |
| Installer un test runner maintenant | Tests | L'invariant au boot couvre le seul risque dur (pool vide). |

## Dissensus enregistré

- **Tests** — l'invariant au démarrage **n'est pas un test**. Il maintient qu'aucune
  règle automatique ne mesure le seul critère qui compte : *un enfant de 6 ans
  connaît-il ce mot ?* Acté explicitement : notre règle mesure la **forme** du mot, pas
  la familiarité. `clark` (« chariot élévateur motorisé », 5 lettres, 5 distinctes)
  tombera en « normal ».
- **UX** — une voyelle offerte reste un **axe faible** face à la longueur du mot. Il
  avait bloqué en exigeant un second axe ressenti ; il l'obtient dans sa forme la moins
  chère, et le dit insuffisant.
- **Le lead lui-même** — l'invariant au boot est une **proposition neuve, non débattue**
  par l'atelier. Il l'a signalé comme telle.

## Objections de l'avocat du diable

**Tombées :**

- « Toucher `maxWrongGuesses` casse le dessin aux deux extrêmes » (front-end) était faux
  à moitié : à 4 la figure est simplement incomplète, c'est cosmétique. Un seul extrême
  casse vraiment. Le front-end a concédé.
- « Il suffit que `maxWrongGuesses` dépende du paramètre reçu » (back-end) : aucune
  borne côté front, `MistakeDots` affiche ce que le serveur annonce, la whitelist est la
  seule barrière. Le back-end a concédé après avoir vérifié `HangmanFigure`.
- « Longueur et lettres répétées sont deux leviers » (UX) : c'est **une seule variable**,
  le nombre de lettres distinctes — `aussi` (5 lettres, 4 distinctes) coûte autant que
  `chat` (4/4). C'est cette objection qui a produit l'axe d'aide.

**Vérifiées et retenues :**

- **`wordLength` traverse toute la stack et n'est lu nulle part côté front** — il
  n'apparaît que dans `frontend/src/games/hangman/types.ts:6`. L'argument « le champ est
  déjà là » du contrat public est donc déjà mort une fois. À garder en tête avant
  d'ajouter quoi que ce soit à `PublicRoundView`.

**Ouvertes et assumées :**

- **L'angle mort commun** : les quatre rôles ont gradué la difficulté *à résoudre* ;
  aucun n'a dit ce que « difficile » **produit** — plus de défaites, chez un enfant de
  6 ans, pour une fonctionnalité que personne n'a demandée en jouant.
- **La question évitée** : trois niveaux, ou simplement un mot mieux choisi ? Le lead a
  tranché que le niveau *est* le choix du mot — ce qui répond en partie, sans répondre
  à « fallait-il trois étiquettes ».

## Ce qui n'a pas été tranché

- La réécriture des hints en langage compréhensible par un enfant. Reconnue nécessaire
  par l'UX **et** le back-end, indépendamment des niveaux. C'est probablement la vraie
  amélioration du pendu.
- Les seuils exacts des pools (≤5/≤4 et ≥8/≥7) : posés par mesure, jamais éprouvés.
- Ce que devient `DifficultyPicker` au jeu #2 s'il n'a pas de notion de « mot ».

## Plan

1. `backend/src/hangman/difficulty.ts` — le type `Difficulty` et `poolForDifficulty(word, level)`, pure.
2. `backend/src/hangman/store.ts` — `createRound(difficulty)`, filtrage du pool, pré-révélation d'une voyelle en `easy`.
3. `backend/src/index.ts` — invariant de taille des pools au démarrage.
4. `backend/src/hangman/router.ts` et `types.ts` — lire et valider `difficulty` dans le body.
5. `frontend/src/games/hangman/api.ts` et `useHangmanRound.ts` — passer `difficulty`, ne démarrer le round qu'une fois le niveau connu.
6. `frontend/src/games/hangman/DifficultyPicker.tsx` — présentationnel, générique comme `ClomoRules` — et le gate dans `Hangman.tsx`.
7. `frontend/src/i18n/translations.ts` — `hangman.difficulty.*` en `en` et `fr`, sans emoji.

**C'est fini quand :** les trois niveaux tirent un mot du bon pool, l'invariant passe au
démarrage, et **une capture d'écran par niveau** confirme que la potence, les points
d'erreur et la voyelle offerte s'affichent correctement — c'est la seule vérification
qui attrape la classe de bug documentée dans `CLAUDE.md`.

## Ce qui invaliderait cette décision

- Un enfant réel qui choisit « difficile » et abandonne après deux défaites.
- L'invariant qui jette après un enrichissement de `words.ts` : la règle dérivée serait
  trop étroite, il faudrait repasser à des tags.
- Le jeu #2 qui n'a pas de notion de difficulté « par mot » : `DifficultyPicker`
  resterait alors local au pendu, et l'objectif de moule serait manqué.
