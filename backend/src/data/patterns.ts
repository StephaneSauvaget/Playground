/**
 * The Memory card catalogue: identity and label only, never pixels.
 *
 * The server names motifs, the frontend owns the artwork — `frontend/src/games/memory/
 * patterns.ts` maps each id to an imported WebP with `satisfies`, so an id the art
 * doesn't cover breaks `npm run build` instead of 404-ing in production.
 *
 * Why the catalogue lives server-side at all, given that the whole board is sent in
 * clear: what the Hangman server really protects is not a secret, it is *reviewed
 * content* — 697 hand-written hints, two moderation passes, `hangman/pools.ts`. Moving
 * the Memory motifs into the frontend bundle would have kept the shape of the URL and
 * lost the only thing the pattern actually guarded. See
 * docs/brainstorms/2026-09-08-conception-jeu-memory.md.
 *
 * `altKey` is a frontend TranslationKey, resolved with `t()` at render time, exactly
 * like `clomo.alt.*`. The server never holds user-facing text.
 *
 * PROVISIONAL LIST. The source sheets are not in the repo yet; these eight ids were
 * chosen so the rest of the game could be written before the artwork lands. When the
 * sheets are cut, reconcile this list with what they actually contain — and keep the
 * editorial review that `data/words.ts` documents: these images are shown to a
 * six-year-old.
 */
export interface PatternEntry {
  id: string;
  altKey: string;
}

export const patterns = [
  { id: "renard", altKey: "memory.pattern.renard.alt" },
  { id: "fleur", altKey: "memory.pattern.fleur.alt" },
  { id: "etoile", altKey: "memory.pattern.etoile.alt" },
  { id: "lune", altKey: "memory.pattern.lune.alt" },
  { id: "pomme", altKey: "memory.pattern.pomme.alt" },
  { id: "poisson", altKey: "memory.pattern.poisson.alt" },
  { id: "ballon", altKey: "memory.pattern.ballon.alt" },
  { id: "gateau", altKey: "memory.pattern.gateau.alt" },
] as const satisfies readonly PatternEntry[];

export type PatternId = (typeof patterns)[number]["id"];
