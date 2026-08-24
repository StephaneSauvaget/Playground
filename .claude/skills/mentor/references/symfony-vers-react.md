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
