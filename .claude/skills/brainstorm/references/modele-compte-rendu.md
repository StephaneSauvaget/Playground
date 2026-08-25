# Modèle de compte rendu d'atelier

Fichier produit à la fin d'un `/brainstorm`, dans
`docs/brainstorms/<AAAA-MM-JJ>-<sujet-en-kebab>.md`.

Il a deux lecteurs : l'auteur aujourd'hui, et celui qui rouvrira le sujet dans six mois
en se demandant « pourquoi on a fait ça ». Écris pour le second — c'est lui qui a le
moins de contexte et le plus besoin du document.

Règles : les dates en absolu (jamais « la semaine dernière »), les fichiers cités par
leur chemin, et **on n'efface pas les options écartées** — ce sont elles qui empêchent
de refaire deux fois le même débat.

---

```markdown
# <Sujet>

**Date :** AAAA-MM-JJ · **Mode :** complet | réduit

## La question

<Le brief du tour 0 : problème réel, périmètre, hors périmètre.>

**Hypothèses posées sans validation :** <celles tranchées par l'animateur.
 Si une se révèle fausse, la décision est à rouvrir.>

## Décision

<La décision du lead, telle qu'il l'a écrite. Impérative, concrète.>

**Ce qui a fait pencher la balance :** <l'argument décisif et son porteur.>

## Options écartées

| Option | Portée par | Pourquoi écartée |
|---|---|---|
| | | |

## Dissensus enregistré

<Qui reste en désaccord, sur quoi, et son argument — dans ses termes, pas adoucis.
 « Aucun » si l'atelier a convergé pleinement. Ce n'est pas une note de bas de page :
 c'est le premier endroit à relire si la décision se révèle mauvaise.>

## Objections de l'avocat du diable

<Celles qui sont tombées, avec ce qui les a fait tomber.
 Celles qui restent ouvertes et qu'on assume.>

## Ce qui n'a pas été tranché

<Les questions apparues pendant le débat et volontairement repoussées.
 Sans cette section, elles reviennent comme des surprises pendant l'implémentation.>

## Plan

1. <Étape — fichiers touchés>
2. …

**C'est fini quand :** <critère d'acceptation vérifiable, de l'agent tests.>

## Ce qui invaliderait cette décision

- <Signal concret qui devrait faire rouvrir le sujet.>
```
