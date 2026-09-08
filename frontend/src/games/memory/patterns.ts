import faonAssis from "../../assets/memory/faon-assis.webp";
import faonCouche from "../../assets/memory/faon-couche.webp";
import faonDebout from "../../assets/memory/faon-debout.webp";
import faonSaute from "../../assets/memory/faon-saute.webp";
import hibouBranche from "../../assets/memory/hibou-branche.webp";
import hibouDort from "../../assets/memory/hibou-dort.webp";
import hibouVole from "../../assets/memory/hibou-vole.webp";
import lapinAssis from "../../assets/memory/lapin-assis.webp";
import lapinCoucou from "../../assets/memory/lapin-coucou.webp";
import lapinDebout from "../../assets/memory/lapin-debout.webp";
import lapinSaute from "../../assets/memory/lapin-saute.webp";

/**
 * The artwork side of the catalogue. The server names motifs
 * (backend/src/data/patterns.ts) and never knows a path; this file is the only place
 * in the game that says what a name looks like.
 *
 * The files are `import`ed rather than served from public/ so Vite fingerprints them
 * (`faon-assis-DCe0EH6y.webp`): a wrong path breaks `npm run build` instead of 404-ing
 * in production. Same reason as the Clomo poses in mascot/Clomo.tsx.
 *
 * Cut from the sheets in design/ with `node design/memory/decoupe.mjs`. Adding a motif
 * means dropping the WebP in, adding one line here and one to PATTERN_IDS, plus its
 * `memory.pattern.*.alt` strings in both dictionaries — and the matching entry on the
 * server, or the board will never deal it.
 */

/**
 * Mirrors the server's list. Declared, not verified — same trade as games/difficulty.ts:
 * TypeScript checks nothing at runtime, so api.ts checks the board on arrival instead.
 */
export const PATTERN_IDS = [
  "faon-assis",
  "faon-couche",
  "faon-debout",
  "faon-saute",
  "hibou-branche",
  "hibou-dort",
  "hibou-vole",
  "lapin-assis",
  "lapin-coucou",
  "lapin-debout",
  "lapin-saute",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

/** `satisfies`, so a missing motif is a compile error and never a broken image. */
export const PATTERNS = {
  "faon-assis": faonAssis,
  "faon-couche": faonCouche,
  "faon-debout": faonDebout,
  "faon-saute": faonSaute,
  "hibou-branche": hibouBranche,
  "hibou-dort": hibouDort,
  "hibou-vole": hibouVole,
  "lapin-assis": lapinAssis,
  "lapin-coucou": lapinCoucou,
  "lapin-debout": lapinDebout,
  "lapin-saute": lapinSaute,
} satisfies Record<PatternId, string>;

export function artFor(patternId: string): string | null {
  return patternId in PATTERNS ? PATTERNS[patternId as PatternId] : null;
}
