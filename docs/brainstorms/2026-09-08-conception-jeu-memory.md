# Conception du jeu #2 : le Memory

**Date :** 2026-09-08 · **Mode :** complet (tours 0 à 3, six rôles)

## La question

Concevoir le jeu #2 du site Playground — un Memory (jeu de paires) pour enfants de
~6 ans — de façon à ce que les conventions posées par le Pendu se généralisent
réellement, au lieu de se révéler propres au Pendu.

**Problème réel.** Le Pendu a défini un moule : manche serveur-autoritaire, difficulté
à trois niveaux, modale de règles portée par Clomo, i18n par clés, thème « Clomo ».
Le Memory est le premier jeu qui teste ce moule, et il en diffère sur trois axes
structurants :

1. il n'a **aucun secret à protéger** pendant la partie — la position des paires est
   révélée par le jeu lui-même en quelques dizaines de secondes ;
2. un Memory solo **se gagne toujours**, on ne peut pas le perdre ;
3. il se joue en **dizaines de gestes rapides sur un plateau persistant**, là où le
   Pendu est une suite de clics lents et indépendants.

**Périmètre :** où vit l'état d'une partie et quelle forme il a ; le contrat d'API ;
ce que « facile / normal / difficile » signifie ici ; ce qui remplace « gagné / perdu » ;
ce qu'on extrait du Pendu vers le niveau site ; le découpage des composants front.

**Hors périmètre :** la production de l'art des cartes (Stéphane fournit des planches,
détourage via `design/Clomo/decoupe.mjs`) ; comptes, quêtes, progression, duo et
multijoueur en ligne — features annoncées par Stéphane le 2026-09-08, à ne pas coder
mais à ne pas rendre impossibles ; le mode deux joueurs sur le même appareil (reporté
par Stéphane le 2026-09-08) ; tout chronomètre ou limite de temps (retiré volontairement
du Pendu le 2026-08-23).

**Hypothèses posées sans validation :**

- **H1 — les planches fourniront au moins 12 motifs distincts.** NON VÉRIFIÉE au moment
  du débat : au 2026-09-08, `design/Clomo/` ne contient que les deux planches du mascot
  et `design/Clomo/detoure/` que six sprites, **tous des poses de Clomo**. Il n'existe
  aucun motif de Memory dans le dépôt. La décision a été prise en conséquence : le
  plancher retenu est 8 motifs, pas 12. **Si les planches donnent moins de 8 motifs
  exploitables, les paliers de difficulté et la grille sont à rouvrir.**
- **H2** — jeu solo, une seule partie à la fois, aucun score conservé entre parties.
- **H3** — cible principale tablette et desktop, au doigt comme à la souris.

## Décision

1. **3e tape : résolution immédiate**, sans plancher temporel. La proposition
   front-end / tests est prise entière. Une tape pendant l'attente applique
   `hideMismatch` puis la tape, dans le même dispatch. Le délai de 1200 ms reste, mais
   seulement pour l'enfant **qui ne fait rien**.
2. **Catalogue de motifs côté serveur** : `backend/src/data/patterns.ts`, slugs
   `as const` plus une clé i18n d'`alt` par motif. Les pixels vivent côté front et sont
   mappés par `satisfies Record<PatternId, string>`, comme `POSES` dans
   `frontend/src/mascot/Clomo.tsx`. **Plancher : 8 motifs**, vérifié par
   `assertMemoryPatternsAreUsable()` au démarrage, sur le modèle de
   `backend/src/hangman/pools.ts`. Le serveur **ne lit aucun fichier image** : c'est ce
   qui évite le couplage entre les deux jeux.
3. **Aucune persistance de partie.** F5 = nouvelle donne. Rien dans `localStorage`
   hormis ce que `frontend/src/mascot/useRules.ts` y met déjà.
4. **Paires = contenu.** La règle du 2026-08-26 est **réécrite**, pas contournée :
   *le niveau ne touche jamais les constantes de règle* — deux cartes par tour, aucune
   limite d'essais. Paliers **3 / 6 / 8 paires**, annoncés par le serveur, jamais codés
   en dur côté front.
5. **Pas de Vitest.** Le réducteur pur `memoryEngine.ts` (`deal()` + `reduce()`) est
   écrit quand même — l'architecture testable est adoptée, le runner est reporté.
6. **Extraction CSS minimale** : uniquement le bloc `DifficultyPicker`
   (`frontend/src/games/hangman/hangman.css`, lignes 348 à 460, les deux `@media`
   compris), **réécrit à la main** vers `frontend/src/games/games.css`.
   `.game-over-clomo` ne bouge pas, `.game-modal` non plus.

**Ce qui a fait pencher la balance :** l'angle mort commun relevé par l'avocat du
diable. Les quatre spécialistes débattaient du serveur comme d'un **arbitre
anti-triche** — or à six ans personne ne triche. Ce que le serveur du Pendu porte
réellement, c'est le **contenu éditorialement revu** : 697 mots, deux passes de
modération, `pools.ts`. Dans les quatre propositions initiales, le contenu du Memory
partait vivre dans le bundle front : on gardait la forme de l'URL et on perdait la
seule chose que le moule protégeait. C'est cette relecture qui a produit le catalogue
de slugs côté serveur, et c'est elle qui fait disparaître le couplage entre les jeux.

## Options écartées

| Option | Portée par | Pourquoi écartée |
|---|---|---|
| Serveur autoritaire, un aller-retour par retournement | (personne, écartée dès le tour 1 par les quatre) | Latence de 100–200 ms sur un jeu de tapotage, double-tap parasite, animation pilotée par le réseau ; pour protéger un secret que l'enfant obtient en 30 secondes |
| Pas de serveur du tout, tout dans le bundle front | Front-end (tour 1) | Fait perdre le `roundId` émis par le serveur, dont les quêtes et la progression annoncées auront besoin ; et fait perdre le contenu revu côté serveur (angle mort) |
| `POST /rounds/:id/finish {moves}` | Back-end (tour 1, retiré par lui-même au tour 2) | Jumeau exact de `/reveal`, qui existe depuis le commit initial `2a96a99` sans un seul appelant. `moves` n'est affiché nulle part et le serveur déclare lui-même ne pas pouvoir le vérifier |
| Compteur de coups, score, étoiles | (proposé implicitement par le contrat back-end) | « Un compteur de coups transforme une victoire garantie en bulletin de notes » (ergonomie). Sorti de l'affichage **et** du contrat d'API : un chiffre qui existe finit affiché |
| Blocage du 3e tap par `phase === "resolving"` | Front-end (tour 1, retiré par lui-même au tour 2) | Un tap sans effet visible est ce qui fait taper un enfant partout ; et un ignoré silencieux est invérifiable |
| Plancher de visibilité à 600 ms avant que la 3e tape ne résolve | Ergonomie (concession du tour 2) | Un état de plus dans un hook que l'auteur devra maintenir seul ; complexité non justifiée pour un débutant React |
| Reprise de la partie après F5 — trois variantes : `localStorage` (front-end), donne seedée stateless `GET /deal?seed` (tests), `Map` serveur à TTL (back-end) | trois rôles, trois réponses incompatibles | Personne n'avait posé la vraie question : *faut-il seulement reprendre ?* Recommencer est le bon comportement à six ans |
| Palier « difficile » à 10 paires / grille 6×4 de 24 cartes | Ergonomie, tests | H1 non vérifiée — aucun motif dans le dépôt — et 24 cartes dépassent la tablette en paysage |
| Vitest sur `frontend/` dès le jeu #2 | Tests | Bonne architecture, mauvais moment : quatre concepts neufs d'un coup pour un auteur débutant en React et mentoré |
| Extraction des ~130 lignes de `.game-modal` / `.play-again` / `.top-left-controls` vers `games/games.css` | Front-end | Bornes fausses (voir plus bas), `.game-over-clomo` entrelacé au milieu, et surtout : le jeu #2 ne doit pas devenir le prétexte d'une refonte du jeu #1 |
| `Map` serveur non évincée pour les rounds Memory | Back-end (tour 1, abandonnée au tour 2) | `backend/src/hangman/store.ts:46` fuit déjà ; le contrat retenu rend le round inutile à stocker |

## Dissensus enregistré

**Tests — perdant net, et c'est assumé.** Il maintient qu'un plateau persistant casse
par **désynchronisation après N gestes**, un bug qu'aucune capture d'écran ne montre —
contrairement à tous les bugs que ce projet a attrapés jusqu'ici, qui étaient visuels.
Son argument n'a pas été réfuté : le Pendu pouvait se passer de runner parce que sa
règle est une suite de tours indépendants ; le Memory n'a pas cette propriété. Le lead
reconnaît le risque et choisit de le payer plutôt que d'empiler quatre concepts neufs
sur un auteur débutant en React. **C'est le premier endroit à relire si le Memory se
met à mal se comporter.**

**Ergonomie.** Perd le plancher de 600 ms. Maintient que l'enfant rapide, avec la
résolution immédiate, **ne verra jamais la paire qu'il vient de rater** — 150 ms au
lieu de 1200 — et n'apprendra donc rien de son erreur. L'avocat du diable partage cette
objection et la formule ainsi : on a remplacé un *ignorer* silencieux par un *oubli*
silencieux.

**Back-end.** Perd `finish` et `moves`. Garde le `roundId` et le fait que c'est le
serveur qui tire le mélange. Ne bloque pas.

**Front-end.** Perd l'extraction CSS large et la persistance `localStorage`. Ne bloque
pas.

## Objections de l'avocat du diable

**Tombées :**

- *« Déplacer le CSS tel quel, zéro ligne réécrite » est faux.* **Vérifiée et exacte.**
  Le bloc difficulté va de la ligne 348 à la ligne 460 de
  `frontend/src/games/hangman/hangman.css`, pas 352‑445 : la coupe proposée tombait
  **à l'intérieur** du `@media (max-width: 560px)` ouvert ligne 440 et abandonnait le
  `@media (prefers-reduced-motion: reduce)` des lignes 456‑460 — extraction
  syntaxiquement cassée et perte du responsive du sélecteur. Deux faits ajoutés par
  l'animateur : `.game-over-clomo` (ligne 304) est du Pendu pur et se trouve **au
  milieu** des classes `.game-modal` de niveau site ; et `hangman.css:349` portait déjà
  le commentaire *« Lives in hangman.css for now because Hangman is its only caller;
  move it out (with DifficultyPicker.tsx) the day game #2 imports the component »* —
  le dépôt avait prévu ce déménagement. Conséquence : extraction **réécrite à la main**,
  et limitée au seul bloc du sélecteur.
- *`/finish {moves}` est le jumeau de `/reveal`, sans appelant depuis le commit initial.*
  Le back-end a concédé et retiré l'endpoint **et** le champ.
- *Le boot-guard couple les deux jeux* — `assertMemoryPatternsAreUsable()` avant
  `app.listen()` ferait que le manque d'images du Memory **empêche le Pendu de
  démarrer**. Tombe grâce à la décision 2 : le serveur ne connaît que des slugs et ne
  lit aucun fichier image, donc le garde-fou porte sur une liste de chaînes, pas sur
  des assets.
- *« Vitest, bonne architecture au pire moment. »* Retenue : le runner est reporté,
  l'architecture testable est adoptée quand même.

**Restées ouvertes, et assumées :**

- **L'oubli silencieux de la 3e tape.** Voir le dissensus de l'ergonomie. Assumé.
- **« Paires = contenu » est une rationalisation.** Son argument : un mot plus long ne
  change pas ce que fait l'enfant, alors que 3 paires (appariement immédiat) et 10
  paires (mémoire spatiale) sont deux tâches cognitives différentes. Son défi — *citez
  une chose qui compterait comme changement de règle dans un Memory si le nombre de
  cartes n'en est pas une* — **n'a jamais reçu de réponse.** Le lead ne l'esquive pas :
  il **réécrit la règle** du 2026-08-26 en « le niveau ne touche jamais les constantes
  de règle » (deux cartes par tour, aucune limite d'essais), ce qui est une
  reformulation plus étroite et non une application de la règle d'origine. À relire si
  le jeu #3 pose à nouveau la question.
- **Le contenu part dans le bundle front.** Partiellement traité par le catalogue de
  slugs côté serveur, mais il reste vrai que les motifs du Memory n'ont pas d'équivalent
  aux deux passes de modération éditoriale de `backend/src/data/words.ts`.

## Ce qui n'a pas été tranché

- **La revue éditoriale des motifs.** `CLAUDE.md` impose deux passes de contrôle sur le
  contenu du Pendu ; rien d'équivalent n'a été défini pour les images du Memory. À
  traiter à l'arrivée des planches.
- **Le second levier de difficulté** proposé par le back-end — la *distance visuelle*
  entre motifs (facile = familles éloignées, difficile = variantes proches). Reconnu
  intéressant par l'ergonomie, mais « invisible avant de choisir, donc jamais seul ».
  Non retenu, non écarté.
- **Le garde de désérialisation** dans `frontend/src/games/memory/api.ts` est décidé
  dans son principe (le cast nu de `frontend/src/games/hangman/api.ts:6` ne suffit pas
  pour un tableau de cartes), mais sa forme exacte reste à écrire. Le Pendu, lui, garde
  son cast nu.
- **Le comportement de l'onglet passé en arrière-plan** (timer gelé, cartes restées
  face visible). L'ergonomie veut que le délai reparte de zéro au retour ; le front-end
  répond que `hideMismatch` idempotent suffit. Non arbitré explicitement.
- **La fuite de `backend/src/hangman/store.ts:46`** (Map jamais évincée), signalée par
  le back-end. Hors sujet du Memory puisque celui-ci n'a plus d'état serveur, mais
  toujours vraie pour le Pendu.

## Plan

### Avant l'arrivée des images — tout sauf le rendu des cartes

1. **Back-end** — `backend/src/data/patterns.ts` (8 slugs `as const` + une clé i18n
   d'`alt` par motif), `backend/src/memory/types.ts`, `backend/src/memory/difficulty.ts`
   (paliers 3 / 6 / 8), `backend/src/memory/pools.ts`
   (`assertMemoryPatternsAreUsable()` : slugs uniques, `patterns.length >= 8`),
   `backend/src/memory/router.ts` (`POST /api/games/memory/rounds`), montage et appel
   du garde-fou dans `backend/src/index.ts`.
2. **Dette CSS** — créer `frontend/src/games/games.css`, y **réécrire à la main** le
   bloc du sélecteur de difficulté (source : `hangman.css` 348‑460, les deux `@media`
   compris), l'importer depuis `frontend/src/games/DifficultyPicker.tsx`, le retirer de
   `hangman.css`, puis **vérifier le Pendu à l'écran** — pas seulement `tsc` et oxlint.
   Ajouter la prop `preview: ReactNode` à `DifficultyPicker` en remplacement de
   `PREVIEW_DASHES` codé en dur (`DifficultyPicker.tsx:17`), et faire passer les tirets
   du Pendu par cette prop.
3. **Front, logique** — `frontend/src/games/memory/types.ts`,
   `frontend/src/games/memory/api.ts` (avec le garde de désérialisation),
   `frontend/src/games/memory/memoryEngine.ts` (réducteur pur : `deal(patterns, pairs,
   rng)` et `reduce(state, event)` sur `{board, selection, matched, phase}`),
   `frontend/src/games/memory/useMemoryBoard.ts` (~30 lignes : `useState`, `useEffect`,
   l'unique `setTimeout` de 1200 ms qui dispatche `hideMismatch`, et le `fetch`).
4. **Habillage** — `frontend/src/games/memory/RulesModal.tsx` avec les trois phrases de
   Clomo ci-dessous, les chaînes `en` et `fr` dans
   `frontend/src/i18n/translations.ts`, et l'entrée dans
   `frontend/src/games/registry.tsx`.

Les trois phrases des règles, telles que rédigées par l'ergonome :

> 1. « Toutes les images se cachent par deux. »
> 2. « Retourne deux cartes pour voir si elles sont pareilles. »
> 3. « Si elles sont pareilles, elles restent ! Sinon, retiens bien où elles étaient. »

### À l'arrivée des planches

5. Détourage via `design/Clomo/decoupe.mjs`, dépôt des WebP dans
   `frontend/src/assets/memory/`, `frontend/src/games/memory/patterns.ts` avec le
   `satisfies Record<PatternId, string>` (un slug inconnu doit casser `npm run build`,
   pas produire un 404).
6. `Card.tsx`, `Board.tsx`, `MotifImage.tsx`, `WinModal.tsx`, `Memory.tsx`,
   `frontend/src/games/memory/memory.css`.
7. Deux captures d'écran, dont une avec `prefers-reduced-motion` forcé.

**C'est fini quand :** les trois paliers 3 / 6 / 8 se jouent de bout en bout sans
scroll sur tablette en paysage ; la 3e tape pendant le délai résout la paire ratée
**et** ouvre la carte tapée, visiblement ; un double-tap sur la même carte et un tap
sur une carte déjà appariée ne font rien ; le serveur refuse de démarrer si
`patterns.ts` descend sous 8 slugs ou contient un doublon ; `npm run build` échoue si
un WebP manque ; le Pendu s'affiche toujours correctement après le déménagement CSS,
vérifié **à l'écran** ; et les captures montrent la grille lisible avec et sans
animation.

## Ce qui invaliderait cette décision

- **Moins de 8 motifs exploitables** une fois les planches détourées : les paliers
  3 / 6 / 8 et la grille sont à revoir, et H1 s'effondre.
- **Un bug de désynchronisation du plateau** après une série de gestes : Vitest passe
  de « reporté » à « immédiat », et le dissensus des tests devient la décision.
- **Un enfant qui redemande sa grille après un F5** : la persistance est rouverte, avec
  les trois options écartées (localStorage, seed, TTL) toujours sur la table.
- **L'arrivée effective des comptes et des quêtes** : le `roundId` cesse d'être une
  précaution et devient une dépendance ; `finish` — ou un vrai journal des coups —
  redevient discutable, cette fois avec un consommateur réel.
