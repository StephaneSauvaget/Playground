/**
 * The Memory card catalogue: identity and label only, never pixels.
 *
 * The server names motifs, the frontend owns the artwork —
 * `frontend/src/games/memory/patterns.ts` maps each id to an imported WebP with
 * `satisfies`, so an id the art doesn't cover breaks `npm run build` instead of
 * 404-ing in production.
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
 * `family` is what the art turned out to be. The 2026-09-08 workshop assumed eight
 * unrelated drawings; the sheets Stéphane delivered on 2026-09-09 are three animals in
 * four poses each. Two fawns are far harder to tell apart than a fawn and an owl, so
 * the family is carried here and `memory/deal.ts` uses it to spread an easy board
 * across species and to let a hard one mix poses within one. That is the "visual
 * distance between motifs" lever the workshop recorded as neither adopted nor
 * rejected — the artwork settled it.
 *
 * One pose was cut: `hibou-lecture` has machine-generated English text on the book
 * ("Coding Adventures"), the same defect CLAUDE.md records for Clomo's own reading
 * poses. Regenerate it with a blank book if a twelfth motif is ever needed.
 */
export interface PatternEntry {
  id: string;
  family: string;
  altKey: string;
}

export const patterns = [
  { id: "faon-assis", family: "faon", altKey: "memory.pattern.faon-assis.alt" },
  { id: "faon-couche", family: "faon", altKey: "memory.pattern.faon-couche.alt" },
  { id: "faon-debout", family: "faon", altKey: "memory.pattern.faon-debout.alt" },
  { id: "faon-saute", family: "faon", altKey: "memory.pattern.faon-saute.alt" },
  { id: "hibou-branche", family: "hibou", altKey: "memory.pattern.hibou-branche.alt" },
  { id: "hibou-dort", family: "hibou", altKey: "memory.pattern.hibou-dort.alt" },
  { id: "hibou-vole", family: "hibou", altKey: "memory.pattern.hibou-vole.alt" },
  { id: "lapin-assis", family: "lapin", altKey: "memory.pattern.lapin-assis.alt" },
  { id: "lapin-coucou", family: "lapin", altKey: "memory.pattern.lapin-coucou.alt" },
  { id: "lapin-debout", family: "lapin", altKey: "memory.pattern.lapin-debout.alt" },
  { id: "lapin-saute", family: "lapin", altKey: "memory.pattern.lapin-saute.alt" },
] as const satisfies readonly PatternEntry[];

export type PatternId = (typeof patterns)[number]["id"];

export const families = [...new Set(patterns.map((pattern) => pattern.family))];
