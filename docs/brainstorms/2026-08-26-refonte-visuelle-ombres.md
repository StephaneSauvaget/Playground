# Refonte visuelle : sortir de l'ombre « sticker »

**Date :** 2026-08-26 · **Mode :** complet (11 exécutions d'agent)

> ## ⏸ STATUT : décidé, implémenté, **puis écarté sur pièce** — le design d'avant est conservé
>
> Le plan ci-dessous a été entièrement exécuté le 2026-08-26 et vérifié par captures
> avant/après des six écrans. **L'auteur a regardé le résultat et a préféré garder le
> design existant.** Les modifications ont été annulées : les 27 `box-shadow` sont
> toujours en place, `CLAUDE.md` décrit toujours l'ombre sticker comme le geste signature.
> **Rien de ce document n'est appliqué dans le code.**
>
> Ce n'est pas un échec de l'atelier : c'est le critère d'invalidation que le lead avait
> lui-même écrit (« l'utilisateur juge la page plate ou inachevée après capture ») qui
> s'est déclenché, exactement comme prévu. Et le risque annoncé par l'avocat du diable
> s'est matérialisé à l'écran : **l'ombre partie, le liseré vert récupère tout le poids
> visuel** — le sélecteur de difficulté devient trois cartes blanches sur une carte
> blanche, séparées par un simple filet.
>
> **Le sujet sera repris avec des éléments supplémentaires.** À la reprise, partir d'ici
> plutôt que de rejouer l'atelier : le cadrage (la palette réclamée est déjà celle en
> place, l'ombre n'est pas glossy), les faits vérifiés, et surtout les options déjà
> écartées avec leur raison restent valables. Les deux pistes non testées, qui ne
> touchent aucun hex, sont notées dans « Ce qui n'a pas été tranché ».
>
> Captures avant/après conservées dans `design/captures/` (non versionné).

## La question

L'utilisateur trouve ses cartes « démodées, glossy 2013 » et demande « quelque chose
d'épuré avec des couleurs automnales vert, marron, orange, crème », en conservant la
mascotte renard.

**Le cadrage a renversé la demande sur deux faits :**

1. **La palette réclamée est déjà celle en place, au hex près.** Vert forêt `#2e7d32`,
   marron `#3e2723`, ambre `#fcb960` / `#a1520a`, crème `#fdfbf7` → `#e0d6c9`.
   « Couleurs automnales vert, marron, orange, crème » décrit l'existant, pas une cible.
2. **L'ombre n'est pas glossy.** `box-shadow: Npx Npx 0 0` — flou 0, aucun dégradé,
   aucun `rgba` de brillance, aucun `filter`. Le style « glossy 2013 » n'existe nulle
   part dans ce CSS.

Interrogé sur ce qui le gênait réellement — contour vert, ombre décalée, densité, ou
contraste mascotte/interface — l'utilisateur a tranché : **l'ombre décalée**.

**Hypothèses posées sans validation :**

- H1 : les valeurs hex ne bougent pas ; le travail porte sur la forme.
- H2 : on le fait maintenant, avant le jeu #2, pour ne pas dupliquer une convention
  qu'on veut changer. *Confirmée par le back-end : migrer après doublerait le travail.*
- H3 : tout remplacement doit conserver un retour d'appui perceptible.
- H4 : « épuré » est un goût d'adulte — **aucun enfant n'a encore joué**.

## Décision

**Toutes les ombres partent** : les 27 `box-shadow` et le `text-shadow` du titre, états
`:hover` compris. **Aucune ombre floue ne les remplace.** La profondeur passe par le
contour existant, le rayon et le dégradé de page. Aucun nouveau token, aucun hex modifié.

**Geste d'appui des 26 touches** : `:active` natif garde `transform: translate(2px, 2px)`
**tel quel**, plus `background: var(--primary)` et `color: var(--primary-foreground)`.
Sur une touche de ~48px, 2px de déplacement des bords reste perceptible en périphérie du
doigt ; le flash ambre couvre le cas où le doigt masque la touche. Même règle sur les
boutons de modale et le sélecteur de difficulté. **Pas de `scale()`.** Pas d'état React :
`:active` natif suffit, `<button>` porte déjà la sémantique.

**`:focus-visible` : condition de livraison**, même commit — une règle globale dans
`index.css`, `outline: 3px solid var(--primary-strong); outline-offset: 2px`.

**Contour vert : dans le périmètre, en audit seulement.** Ni sa valeur ni son épaisseur
ne bougent ; si une capture montre une surface qui disparaît, ticket séparé.

**Ce qui a fait pencher la balance :** le front-end **s'est rétracté lui-même**. Il avait
proposé de remplacer l'ombre plate par une ombre floue ; mis face à l'objection, il a
concédé que l'ombre portée floue est l'idiome Material des années 2010 — c'est-à-dire un
retour exact à l'esthétique que l'utilisateur fuit. La convergence vers « zéro ombre »
n'est pas un ralliement paresseux : l'UX avait concédé indépendamment que l'affordance
des surfaces statiques tient au contour et au rayon, pas au décalage.

## Options écartées

| Option | Portée par | Pourquoi écartée |
|---|---|---|
| Ombre douce à flou via `color-mix` | Front-end (tour 1) | C'est l'idiome Material 2014 : ramène précisément l'esthétique rejetée. Retirée par son propre auteur. |
| `transform: scale(0.97)` sur `:active` | Front-end (tour 1) | Sur une touche de 48px, déplace les bords de **0,7px** — six fois moins que le `translate(2px,2px)` existant, sous le seuil de perception. Retirée par son auteur. |
| Deux tons de surface inventés | envisagé | Violerait H1, et blanc contre `#fdfbf7` ne se distinguent pas de toute façon. |
| Nouveaux tokens de profondeur | Front-end | Une fois les ombres parties, il n'y a plus rien à tokeniser. |
| Refonte du contour vert | UX (« condition, pas chantier séparé ») | L'utilisateur ne l'a pas désigné, et H4 rappelle qu'aucun enfant n'a joué. Audit à la capture, pas refonte. |
| État React pour l'appui (`aria-pressed`) | question du back-end | `:active` natif suffit. |

## Dissensus enregistré

- **UX** maintient que `translate(2px,2px)` **seul** est insuffisant quand le doigt
  couvre la touche : selon lui seul un changement de silhouette visible en périphérie du
  doigt compte, et il demandait `scale ≤ 0.90` ou un déplacement plus franc. Le flash
  ambre est la concession qui lui est faite, et **elle n'est validée par aucun enfant réel**.
- **L'avocat du diable** maintient que ce flash ambre est un **ajout déguisé en
  conservation** : `.keyboard button:active` ne touche aujourd'hui jamais `background`.
  C'est exact, vérifié, et assumé par le lead.
- **Nuance sur `:focus-visible`** : le lead le qualifie de « régression créée ici ». C'est
  vrai pour `.game-card`, dont le focus n'est porté que par l'ombre — mais les 26 touches
  n'ont **jamais** eu de règle `:focus-visible`. C'est donc à la fois une régression et un
  trou préexistant ; la règle globale décidée corrige les deux.

## Objections de l'avocat du diable

**Tombées :**

- **À UX** : « préserver un changement de fond franc » — ce changement de fond n'existe
  pas, `.keyboard button:active` (hangman.css:255) ne modifie que `transform` et
  `box-shadow`. Vérifié. UX ne l'a pas contesté.
- **À TESTS** : le script de contraste proposé protégeait contre le risque du 2026-08-24
  (changement de palette), pas contre celui-ci, puisque H1 gèle les couleurs. Tests a
  concédé, et a aussi concédé que ses « paires token/token dans `index.css` » n'existent
  pas — les vraies paires texte/fond sont dans les 794 lignes des fichiers de composants.
- **À TESTS** : `.force-active` injectée en production est une dette inutile ;
  `Input.dispatchMouseEvent` avec `mousePressed` sans `mouseReleased` fait la même preuve.
  Concédé.

**Vérifiées et retenues :**

- **`:focus-visible` n'existe qu'UNE fois dans tout le site** (`pages/home.css:65`), porté
  par `transform` + `box-shadow`, sans aucun `outline`. `hangman.css` n'en a aucune.
- **`--success` n'a qu'UN seul usage** (hangman.css:276) contre **15** pour `--border`.
  Les deux tokens partagent la valeur `#2e7d32` mais se séparent sans douleur — l'idée
  qu'y toucher casserait le vert « correct » est fausse.

**Ouverte et assumée — l'angle mort commun :**

- **L'ombre partie, le liseré vert 1,5px devient l'unique séparateur et récupère tout le
  poids visuel.** Ce n'est pas du scope creep, c'est mécanique : un modal blanc sur une
  carte blanche, sans ombre, n'a plus que ce trait vert pour exister. Le lead a choisi
  d'auditer plutôt que de traiter — c'est le premier point à regarder sur les captures.

## Ce qui n'a pas été tranché

**Les deux pistes que la capture a rendues évidentes et qui n'ont pas été essayées** —
toutes deux sans créer la moindre valeur hex, donc compatibles avec H1 :

1. **Épaissir le contour** des cartes intérieures (1,5 → 2px) : le minimum, à moindres frais.
2. **Poser les cartes intérieures sur `--secondary` (#e8f5e9) ou `--accent` (#e0d6c9)**
   plutôt que sur `--card` blanc, pour obtenir la profondeur par la valeur au lieu du
   trait. Le lead avait écarté « deux tons de surface » en croyant qu'il faudrait les
   inventer — ces deux tokens existent déjà et sont déjà utilisés ailleurs. **C'est
   probablement l'angle mort de l'arbitrage.**

Le reste, non tranché :

- L'épaisseur et la dominance du contour vert une fois les ombres parties.
- Le contraste entre la mascotte (rendu 3D brillant) et une interface devenue encore plus
  plate — c'était une des quatre pistes proposées à l'utilisateur, il ne l'a pas retenue.
- Le vide de la page d'accueil (60 % sous la carte) : hors sujet ici, mais visible.

## Plan

1. `frontend/src/index.css` — ajouter la règle globale `:focus-visible`.
2. `frontend/src/pages/home.css` — supprimer les 4 `box-shadow`, le `text-shadow`, et le
   `box-shadow` de la règle `:focus-visible` ligne 65 (garder le `transform` du hover).
3. `frontend/src/mascot/clomo.css` — supprimer le `box-shadow`.
4. `frontend/src/games/hangman/hangman.css` — supprimer les 22 `box-shadow` ; sur
   `.keyboard button:active:not([disabled])` garder le `transform` et ajouter le fond
   ambre ; idem boutons de modale et sélecteur de difficulté.
5. `CLAUDE.md` — réécrire le paragraphe « signature visual move », **même commit** : ce
   paragraphe n'a pas de propriétaire et aucun compilateur ne rappellera à l'ordre.
6. Captures CDP : accueil, plateau, modale de règles, modale de fin, plus une touche
   maintenue enfoncée.

**C'est fini quand :** les quatre écrans sont capturés sans ombre, la touche pressée
montre un déplacement et un fond ambre, et aucune surface ne disparaît dans le fond.

## Ce qui invaliderait cette décision

- Une capture où la modale de fin ou une carte ne se détache plus du fond.
- L'utilisateur juge la page « plate » ou « inachevée » une fois les captures vues.
- Un enfant testé n'identifie pas la touche qu'il vient de presser.
