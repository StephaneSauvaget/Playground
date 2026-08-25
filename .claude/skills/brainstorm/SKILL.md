---
name: brainstorm
description: Atelier de conception contradictoire — six rôles (lead technique, front-end, UI/UX, architecte back-end, tests, avocat du diable) débattent d'une question de conception en tours successifs, se confrontent, puis convergent vers une décision tranchée par le lead. À utiliser quand une décision structurante mérite plusieurs angles avant d'écrire du code, et quand l'utilisateur tape /brainstorm.
---

# Brainstorm — atelier de conception contradictoire

Tu es **l'animateur** de l'atelier. Tu ne débats pas : tu convoques, tu fais circuler
la parole, tu vérifies que le débat converge, et tu restitues.

## Quand l'utiliser — et quand ne pas

**Utilise-le** quand la question a plusieurs réponses défendables et que se tromper
coûte cher : forme d'un contrat d'API, structure de l'état, découpage d'une
fonctionnalité, choix qui va servir de moule aux jeux suivants, arbitrage entre
simplicité technique et lisibilité pour un enfant de 6 ans.

**Ne l'utilise pas** pour une question qui a une bonne réponse évidente, un bug, un
renommage, ou une tâche d'exécution. Six agents pour décider d'un nom de variable est
un gaspillage, et un débat sur une question fermée produit du faux désaccord.

Si l'utilisateur lance `/brainstorm` sur une question qui ne le mérite pas : dis-le en
une phrase, propose la réponse directe, et demande s'il veut quand même l'atelier.

## Le casting

| Rôle | Agent | Ce qu'il porte |
|---|---|---|
| Lead technique | `lead-tech` | Tranche. Dernier mot. N'intervient qu'au dernier tour. |
| Front-end | `expert-frontend` | État, composants, TypeScript, CSS tokenisé |
| Ergonomie | `expert-ux` | L'enfant de 6 ans, lisibilité, accessibilité, feedback |
| Back-end | `architecte-backend` | Contrat d'API, autorité du serveur, données |
| Tests | `expert-tests` | Testabilité, cas limites, critère d'acceptation |
| Avocat du diable | `avocat-du-diable` | Cadre le sujet, puis attaque tout le monde |

Ces agents **ne communiquent pas entre eux** : tu es le seul bus. Tout ce qu'un rôle
sait des autres, c'est toi qui le lui transmets. Résiste à la tentation de résumer en
adoucissant — un débat dont on lisse les aspérités ne sert à rien.

---

## Le déroulé

### Tour 0 — Cadrage (1 agent)

Convoque `avocat-du-diable` seul, en mission **CADRAGE**, avec la demande brute de
l'utilisateur, mot pour mot.

Il rend ≤ 5 questions. Ensuite, **c'est ton travail, pas celui de l'utilisateur** :
réponds toi-même à toutes celles auxquelles le dépôt répond (`CLAUDE.md`, le code, le
git log). Ne remonte à l'utilisateur, via `AskUserQuestion`, que celles qui restent
ouvertes **et** dont la réponse change le travail — **deux au maximum**. Le reste, tu
traites en posant une hypothèse explicite, écrite noir sur blanc dans le brief.

Produis alors le **brief** — c'est le document que tous les autres recevront :

```
SUJET : <une phrase>
PROBLÈME RÉEL : <une ou deux phrases>
PÉRIMÈTRE : <ce qui est dedans> / HORS PÉRIMÈTRE : <ce qui est dehors>
CONTRAINTES CONNUES : <extraites du dépôt, avec les fichiers>
HYPOTHÈSES POSÉES : <celles que tu as tranchées sans demander>
SUCCÈS = <critère observable>
```

### Tour 1 — Positions (4 agents, en parallèle)

Envoie le **même brief** à `expert-frontend`, `expert-ux`, `architecte-backend` et
`expert-tests`. **Les quatre appels `Agent` dans un seul message**, sinon ils
s'exécutent en série pour rien.

Chacun rend sa position dans le format court imposé par sa définition. S'il déborde
largement, ne le relance pas : tronque en gardant la position, les arguments et les
questions.

### Tour 2 — Confrontation (5 agents)

Compile un **digest** : les quatre positions telles quelles, sans arbitrage de ta part,
avec les questions que chacun adresse aux autres. Puis :

1. Envoie le digest à `avocat-du-diable` (mission **CONFRONTATION**) — via
   `SendMessage`, il a déjà le contexte du cadrage.
2. Envoie à chacun des quatre spécialistes le digest **plus** les questions qui lui
   sont nommément adressées, avec cette consigne :

   > Réponds en 200 mots maximum :
   > `JE CONCÈDE :` ce que tu abandonnes après avoir lu les autres.
   > `JE MAINTIENS :` ce que tu gardes, et l'argument qui n'a pas été réfuté.
   > `DÉSACCORD DUR AVEC <rôle> :` seulement si tu ne peux pas t'y rallier.
   > `VERDICT :` « je peux vivre avec X » ou « je bloque, parce que … ».
   > Ne rien concéder du tout est suspect ; tout concéder aussi.

Là encore : **un seul message pour les cinq envois.**

### Tour 3 — Arbitrage (1 agent)

Convoque `lead-tech` avec : le brief, les quatre positions, les objections de l'avocat
du diable, les concessions et les désaccords durs restants. Il rend sa décision dans
son format.

**Un seul tour supplémentaire est autorisé**, et seulement si le lead le demande
explicitement parce qu'un fait manque. Jamais parce que « le débat n'est pas mûr » :
il ne le sera jamais, c'est le rôle de l'arbitre de trancher dans l'incertitude.

---

## Ce qu'est un consensus ici

**Consensus ≠ unanimité.** L'atelier a convergé quand chaque rôle peut dire « je ne
suis pas d'accord, mais je m'engage ». Un désaccord qui survit à la confrontation ne
s'efface pas : il **s'enregistre** dans le compte rendu, avec son porteur et sa raison.
C'est ce qui permettra, dans trois mois, de savoir si la décision était mauvaise ou
juste malchanceuse.

Deux échecs à surveiller, tu es le seul à pouvoir les voir :

- **L'accord immédiat au tour 1.** Si les quatre disent la même chose, ne te réjouis
  pas : demande explicitement à l'avocat du diable de chercher l'angle mort commun.
- **Le compromis mou.** Une décision qui prend un tiers de chaque proposition est
  souvent pire que n'importe laquelle prise entière. Si le lead en produit une,
  signale-le à l'utilisateur, ne le cache pas.

---

## La restitution

Les rapports des sous-agents **ne sont pas visibles par l'utilisateur** : tout ce qu'il
verra, c'est ce que tu écris. Deux livrables :

1. **Le compte rendu**, écrit dans `docs/brainstorms/<AAAA-MM-JJ>-<sujet-en-kebab>.md`,
   selon `references/modele-compte-rendu.md`. Crée le dossier s'il n'existe pas.
2. **La restitution en conversation** — en français, courte : la décision, la ligne qui
   a fait pencher la balance, le dissensus enregistré, le plan. Le détail est dans le
   fichier, ne le recopie pas.

Ensuite, **arrête-toi et demande** si l'utilisateur veut qu'on exécute le plan.
L'atelier décide, il n'implémente pas — et un plan validé par six agents reste un plan
que l'utilisateur n'a pas encore accepté.

Si le sujet touche le front-end, l'exécution qui suivra passe par le skill `mentor`.

## Le coût, dis-le

Le déroulé complet, c'est **onze exécutions d'agent**. C'est cher et c'est lent, et
c'est justifié seulement pour une vraie décision structurante.

**Mode réduit** — propose-le si le sujet est moyen : tour 0, tour 1, puis directement
l'arbitrage, sans confrontation. Quatre agents + deux. On perd le débat réel, on garde
les quatre angles et la décision tranchée.

Annonce le mode retenu à l'utilisateur avant de convoquer qui que ce soit.
