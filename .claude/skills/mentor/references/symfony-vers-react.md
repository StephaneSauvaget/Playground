# Glossaire Symfony → React / Vite

Fichier vivant : le compléter à chaque nouveau concept expliqué.

## Outillage

| Symfony / PHP | Front-end | Piège |
|---|---|---|
| `composer`, `composer.json` | `npm`, `package.json` | `package-lock.json` = `composer.lock`. Se commite. |
| `vendor/` | `node_modules/` | Jamais commité, jamais lu, souvent énorme. |
| `bin/console <cmd>` | `npm run <script>` | Les scripts sont déclarés à la main dans `package.json`, pas découverts. |
| Webpack Encore / AssetMapper | **Vite** | En dev, Vite ne « build » pas : il sert les modules ES natifs au navigateur. D'où le démarrage instantané. |
| PSR-4 + autowiring | `import` explicite | Aucune magie : rien n'est disponible sans import. Le compilateur le dit. |
| `.env` + `%env(FOO)%` | `.env` + `import.meta.env.VITE_FOO` | Le préfixe `VITE_` est obligatoire **et** signifie « envoyé au navigateur ». Jamais de secret dedans. |
| PHPStan / psalm | `tsc -b` (dans `npm run build`) | Le typage TS disparaît à l'exécution : c'est du contrôle à la compilation, zéro garantie au runtime. Un JSON d'API mal typé passe. |
| PHP CS Fixer | oxlint (`npm run lint`) | |
| `dump()` / `dd()` | `console.log` + React DevTools | |

## Concepts

| Symfony | React | Piège de l'analogie |
|---|---|---|
| Route `#[Route('/x')]` | `<Route path="/x">` de react-router | Aucune requête serveur : l'URL change, le JS échange un composant. Le serveur n'est jamais consulté. |
| Contrôleur | *Aucun équivalent direct* | Un composant n'est pas un contrôleur : il est ré-exécuté des dizaines de fois, pas une fois par requête. |
| Template Twig | JSX | JSX n'est **pas** un langage de template : c'est du JavaScript qui produit une description d'interface. Pas de `{% for %}`, on utilise `.map()`. |
| `{{ var }}` | `{expression}` | N'importe quelle expression JS, pas juste une variable. |
| `{% if %}` | `{cond && <X/>}` ou ternaire | |
| Service + injection | Hook personnalisé (`useHangmanRound`) | Un service est un singleton partagé ; un hook est ré-instancié par composant, avec son propre état. |
| Service partagé globalement | React Context (`I18nProvider`) | C'est le plus proche du conteneur : on fournit en haut, on consomme en bas sans passer par les paramètres. |
| Entité / Repository Doctrine | *Rien* | Il n'y a pas de source de vérité côté front. Les données viennent de l'API et vivent dans l'état — voir `types.ts` qui n'est qu'un **contrat déclaré**, pas vérifié. |
| Session / flash | `useState` | Volatile : un rafraîchissement de page efface tout. |
| EventSubscriber (`kernel.request`…) | `useEffect` | Pas déclenché par un événement métier mais par un **changement de valeur** listé dans les dépendances. |
| `translation/*.yaml` + `{% trans %}` | `translations.ts` + `t("clé")` | Ici les clés sont typées : un `t()` sur une clé inexistante ne compile pas. |

## Ce qui n'a pas d'équivalent Symfony (à comprendre pour de vrai)

**Le rendu est une fonction de l'état.** On ne modifie jamais le DOM à la main. On
change une valeur d'état, React ré-exécute le composant et applique la différence.
Réflexe à désapprendre : « aller chercher l'élément pour le mettre à jour ».

**Le composant est ré-exécuté entièrement** à chaque changement d'état — tout le corps
de la fonction, du début à la fin. Corollaire : toute valeur déclarée dedans est
recréée à chaque fois. C'est la raison d'être de `useState` (survivre au re-render) et
de `useCallback` (garder la *même* fonction d'un rendu à l'autre).

**L'immuabilité.** `setRound(nouvelObjet)`, jamais `round.status = "won"`. React
compare les références pour savoir s'il doit redessiner : muter en place ne déclenche
rien.

**Le tableau de dépendances** de `useEffect` / `useCallback`. C'est la question « à
partir de quel changement dois-je rejouer ce code ? ». Mal rempli, c'est la source
n°1 de bugs React : effet qui ne se rejoue jamais, ou boucle infinie.

**Les props sont en lecture seule et descendent.** Un enfant ne modifie pas son parent ;
il reçoit une fonction de rappel et l'appelle. `Keyboard` ne connaît pas la partie, il
reçoit `onGuess`.

**`key` dans les listes.** Identifie chaque élément entre deux rendus. Sans clé stable,
React confond les éléments et l'état visuel se mélange.

**`StrictMode` (dans `main.tsx`) exécute les effets deux fois en développement**, pour
révéler les effets non idempotents. Ce n'est pas un bug, et ça n'arrive pas en
production — mais ça surprend au premier `console.log` affiché en double.

## CSS : custom properties, et le piège des valeurs en dur

**`--foo: red` n'est pas une variable Sass.** Sass résout `$foo` à la compilation et
recopie la valeur partout ; à l'exécution il n'y a plus de variable. Une custom
property est un **vrai héritage CSS** : déclarée sur `:root`, résolue par le navigateur
au moment du rendu, elle descend dans tout le document et peut être redéfinie sur un
sous-arbre, ou changée en JS au runtime.

**Où l'analogie « paramètre de configuration » ment :** `var(--foo)` sur un élément
qui n'a aucun `--foo` dans sa chaîne d'ancêtres ne lève **aucune** erreur. La
propriété devient simplement invalide, et l'élément hérite ou retombe sur `initial`.
Aucun conteneur ne t'engueule au démarrage : ça casse silencieusement, à l'écran.
C'est le piège n°1 quand on renomme un token.

**Une valeur écrite en dur est une dépendance invisible au thème.** Vu pour de vrai
dans ce projet : `.home-page { color: #fff }` était correct tant que le fond était un
dégradé rose saturé, et est devenu du blanc sur crème — invisible — au changement de
palette. Rien ne le signale : ni le compilateur, ni le linter, ni le build. Réflexe à
prendre : toute couleur écrite en dur est un pari sur la valeur d'une *autre* couleur.

**Un token porte un rôle, pas une valeur.** `--primary` (fond de bouton ambre) et
`--primary-strong` (le même orange, assombri pour servir de texte) sont deux rôles
distincts qui se trouvent être « la couleur de la marque ». Les fusionner parce
qu'ils *semblent* être la même chose casse soit le fond, soit la lisibilité. Même
logique que ne pas réutiliser un paramètre Symfony pour deux besoins non liés sous
prétexte qu'il contient la bonne valeur aujourd'hui.

**Le contraste est une contrainte chiffrable, pas une affaire de goût.** WCAG AA exige
4.5:1 pour du texte normal, 3:1 pour du gros texte et des icônes. Ça se calcule (voir
la formule de luminance relative) et donc ça se vérifie automatiquement — on ne
« regarde pas si ça passe ». Sur cette app, `#ffffff` sur l'ambre `#fcb960` donne
1.71:1 : inutilisable, et impossible à deviner à l'oeil.

## Un effet qu'on empêche de partir (vu sur les niveaux de difficulté)

`useHangmanRound(difficulty)` charge une partie dans un `useEffect`. Tant que
`difficulty` vaut `null`, la fonction sort immédiatement : **l'effet part quand même,
il ne fait rien**. C'est la façon idiomatique de dire « pas encore ».

Le réflexe Symfony serait de ne pas appeler le service. Ici on ne contrôle pas *si* le
composant s'exécute — React le ré-exécute quand il veut — on ne contrôle que ce que
l'effet fait. Le garde est **dans** l'effet, jamais autour.

Piège : `if (!difficulty) return;` doit être dans la fonction, pas avant le
`useEffect`/`useState`. Les hooks doivent être appelés dans le même ordre à chaque
rendu, toujours — un hook derrière un `if` casse React. C'est la règle qui n'a aucun
équivalent PHP : l'ordre d'appel *est* l'identité de l'état.

## Dériver pendant le rendu plutôt que corriger dans un effet

Version d'abord écrite, refusée par oxlint (`react(set-state-in-effect)`) :

```ts
useEffect(() => {
  setRound(null);   // effacer la partie précédente
  load();
}, [load]);
```

Version retenue : stocker la donnée **avec ce qui l'identifie**, et conclure au rendu.

```ts
const [loaded, setLoaded] = useState<{ forDifficulty: Difficulty; view: RoundView } | null>(null);
const round = loaded && loaded.forDifficulty === difficulty ? loaded.view : null;
```

La règle générale : **si une valeur se calcule à partir de l'état, elle n'est pas de
l'état.** Un `useState` qu'un `useEffect` doit remettre d'aplomb est presque toujours
une valeur dérivée déguisée en état — et chaque `setState` dans un effet provoque un
rendu de plus.

L'analogie honnête côté Symfony est un *getter calculé* sur une entité plutôt qu'une
propriété persistée qu'un listener doit resynchroniser. Le piège : en PHP la
désynchronisation se voit en base ; ici elle se voit à l'écran, l'espace d'un rendu, et
personne ne la reproduit.

## Passer du balisage en paramètre : `ReactNode` (vu sur `DifficultyPicker`)

Le sélecteur de difficulté appartient au site, mais l'aperçu qu'il affiche appartient
au jeu : le Pendu montre une rangée de tirets, le Memory une mini-grille de dos de
cartes. La version d'origine codait les tirets en dur dans le composant partagé —
tenable tant qu'il n'y avait qu'un jeu.

```tsx
previews: Record<Difficulty, ReactNode>;
// ...
<span className="difficulty-preview">{previews[level]}</span>
```

**Le concept :** en React, du balisage est une **valeur** comme une autre. `<Dashes />`
n'est pas « du HTML », c'est un appel de fonction qui rend un objet décrivant quoi
afficher ; il se range dans un `Record`, se passe en prop, se stocke dans une variable.
`ReactNode` est le type de « tout ce que React sait afficher » — un élément, une
chaîne, un nombre, un tableau, `null`.

**L'analogie Symfony :** c'est un bloc Twig passé à un template parent, ou une
implémentation injectée derrière une interface. Le parent définit *l'emplacement*,
l'appelant fournit *le contenu*.

**Où l'analogie ment :** un bloc Twig est inerte jusqu'au rendu du template. Ici
`<Dashes count={3} />` est déjà construit au moment où tu écris `DIFFICULTY_PREVIEWS`,
à l'import du module — donc **une seule fois**, pas à chaque rendu. C'est sans
conséquence pour un aperçu statique ; ça le deviendrait si le contenu dépendait de
l'état, et il faudrait alors le construire dans le corps du composant.

**L'alternative écartée :** une prop fonction, `renderPreview: (level) => ReactNode`.
Plus souple, inutile ici — il n'y a rien à calculer, juste trois valeurs à fournir. Un
`Record` se lit comme une table de correspondance et reste symétrique de `helpKeys`,
qui existait déjà juste à côté.

## Une feuille de style importée par son composant

`DifficultyPicker.tsx` fait `import "./games.css"`. Le composant tire son propre style,
au lieu que le style soit importé par la page qui l'utilise.

**Le concept :** avec Vite, un `import` de CSS est un **effet de bord de module ES**.
Le bundler voit la dépendance, injecte la feuille, et la dédoublonne si dix composants
l'importent. Ce n'est *pas* un scoping : les règles restent globales et
`.difficulty-option` peut toujours entrer en collision. Ce qui est garanti, c'est la
*présence* du style dès que le composant est dans le graphe, jamais son isolation.

**Pourquoi ça compte ici :** ces règles vivaient dans `games/hangman/hangman.css`, et
`DifficultyPicker` — composant de niveau site — n'en dépendait que par accident : il
n'était utilisé que par une page qui, elle, importait ce fichier. Le jeu #2 aurait
obtenu le composant tout nu. Le déplacement rend la dépendance explicite au lieu de
l'espérer.

**L'analogie Symfony :** un asset déclaré par le composant qui en a besoin plutôt que
listé à la main dans le layout. Elle ment sur un point : ici rien ne vérifie qu'une
classe est définie. Une règle manquante ne lève rien — ça ne se voit qu'à l'écran,
d'où la capture systématique après tout déplacement de CSS.

## `useReducer` : sortir la règle du composant (vu sur le Memory)

Le Pendu garde son état dans des `useState` et laisse le serveur arbitrer. Le Memory
ne peut pas : le serveur distribue puis oublie, donc la règle du jeu est côté client.
Elle vit dans `games/memory/memoryEngine.ts`, une fonction **pure** :

```ts
export function reduce(state: BoardState, event: BoardEvent): BoardState
```

et le composant ne fait plus que l'appeler :

```ts
const [state, dispatch] = useReducer(reduce, initialState([]));
dispatch({ type: "flip", cardId });
```

**Le concept :** `useReducer` est l'autre façon de tenir de l'état, à côté de
`useState`. Au lieu d'écrire « voici la nouvelle valeur », on envoie un **événement** et
c'est une fonction séparée qui décide de la conséquence. React garde la valeur, appelle
la fonction, et re-rend.

**L'analogie Symfony :** un Message + son Handler. `dispatch` est le bus, `reduce` le
handler, `BoardEvent` le message. Comme dans Messenger, l'intérêt n'est pas le
découplage pour lui-même : c'est que le handler se teste sans rien démarrer.

**Où l'analogie ment :** un handler Symfony a le droit d'écrire en base, d'appeler un
service, de logger. `reduce` **n'a le droit de rien** — pas de `fetch`, pas de
`Date.now()`, pas de `Math.random()`, pas de `setTimeout`. React peut l'appeler deux
fois avec les mêmes arguments (c'est ce que fait `StrictMode` en développement) et doit
obtenir exactement le même résultat. D'où la forme du reste : le mélange des cartes est
fait par le serveur, et le minuteur qui referme une paire ratée est **hors** du
réducteur — il ne fait que `dispatch({ type: "hideMismatch" })` le moment venu.

**Le type union discriminé.** `BoardEvent` est
`{type:"reset";…} | {type:"flip";…} | {type:"hideMismatch"}`. Dans le `switch`,
TypeScript sait que dans la branche `"flip"` il existe un `cardId`, et pas ailleurs.
C'est ce qui remplace ici l'interface + les classes de messages de Messenger, sans
écrire une classe par événement.

**L'alternative écartée :** tout garder dans le composant, avec un `useState` par
morceau (`selection`, `matched`, `phase`) et la règle éparpillée dans les gestionnaires
de clic. C'est plus court à écrire et c'est le bug classique du Memory : trois sources
de vérité qui se désynchronisent après une série de tapes rapides, sans que rien ne
s'affiche de travers.

**Un piège de rendu, au passage.** `isWon` et « cette carte est-elle face visible ? »
ne sont **pas** stockés : ils se recalculent à partir de `matched` et `selection` au
moment du rendu. Une valeur dérivée qu'on stocke est une valeur qui peut mentir ; c'est
la même leçon que la section « Dériver pendant le rendu plutôt que corriger dans un
effet » plus haut, appliquée à autre chose qu'un effet.
