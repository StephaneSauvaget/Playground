import type { ReactNode } from "react";

/**
 * The artwork side of the catalogue. The server names motifs
 * (backend/src/data/patterns.ts) and never knows a path; this file is the only place
 * that says what a name looks like.
 *
 * PLACEHOLDERS. Stéphane's source sheets are not in the repo yet. These are plain
 * inline SVG so the game is playable and screenshot-testable today — inline SVG, not
 * emoji, for the reason CLAUDE.md gives: emoji rendering depends on the OS having a
 * colour font, and it renders as tofu in this project's own headless setup.
 *
 * When the sheets land: cut them with design/Clomo/decoupe.mjs, drop the WebP in
 * frontend/src/assets/memory/, and replace each entry with an imported file —
 * `import renard from "../../assets/memory/renard.webp"` and `<img src={renard} …>`.
 * Importing rather than serving from public/ makes Vite fingerprint the filename, so a
 * wrong path breaks `npm run build` instead of 404-ing in production. Nothing else in
 * the game changes: only this file knows about pixels.
 */

/**
 * Mirrors the server's list. Declared, not verified — same trade as
 * games/difficulty.ts: TypeScript checks nothing at runtime, and the wire is checked
 * in api.ts instead.
 */
export const PATTERN_IDS = [
  "renard",
  "fleur",
  "etoile",
  "lune",
  "pomme",
  "poisson",
  "ballon",
  "gateau",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

/** Shared drawing box, so every motif lands at the same optical size. */
function Art({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="motif" aria-hidden="true">
      {children}
    </svg>
  );
}

export const PATTERNS = {
  renard: (
    <Art>
      <path d="M10 14 L14 6 L20 12 M38 14 L34 6 L28 12" />
      <path d="M10 14 C10 30 16 40 24 40 C32 40 38 30 38 14 Z" />
      <circle cx="18" cy="22" r="1.6" className="filled" />
      <circle cx="30" cy="22" r="1.6" className="filled" />
      <path d="M24 28 L21 31 M24 28 L27 31" />
    </Art>
  ),
  fleur: (
    <Art>
      <circle cx="24" cy="18" r="5" />
      <circle cx="14" cy="24" r="5" />
      <circle cx="34" cy="24" r="5" />
      <circle cx="18" cy="34" r="5" />
      <circle cx="30" cy="34" r="5" />
      <circle cx="24" cy="26" r="3.5" className="filled" />
    </Art>
  ),
  etoile: (
    <Art>
      <path d="M24 6 L29 19 L43 20 L32 29 L36 42 L24 34 L12 42 L16 29 L5 20 L19 19 Z" />
    </Art>
  ),
  lune: (
    <Art>
      <path d="M30 6 A18 18 0 1 0 30 42 A14 14 0 1 1 30 6 Z" />
    </Art>
  ),
  pomme: (
    <Art>
      <path d="M24 14 C18 8 8 12 8 24 C8 36 16 42 24 38 C32 42 40 36 40 24 C40 12 30 8 24 14 Z" />
      <path d="M24 14 L24 7" />
      <path d="M24 9 C28 5 33 5 34 6 C33 11 28 12 24 10" className="filled" />
    </Art>
  ),
  poisson: (
    <Art>
      <path d="M8 24 C14 12 30 12 36 24 C30 36 14 36 8 24 Z" />
      <path d="M36 24 L44 16 L44 32 Z" />
      <circle cx="16" cy="22" r="1.8" className="filled" />
    </Art>
  ),
  ballon: (
    <Art>
      <circle cx="24" cy="24" r="17" />
      <path d="M7 24 L41 24 M24 7 C15 15 15 33 24 41 M24 7 C33 15 33 33 24 41" />
    </Art>
  ),
  gateau: (
    <Art>
      <path d="M10 40 L10 24 L38 24 L38 40 Z" />
      <path d="M10 32 L38 32" />
      <path d="M24 24 L24 14" />
      <path d="M24 14 C21 11 24 8 24 6 C24 8 27 11 24 14 Z" className="filled" />
    </Art>
  ),
} as const satisfies Record<PatternId, ReactNode>;

export function artFor(patternId: string): ReactNode | null {
  return patternId in PATTERNS ? PATTERNS[patternId as PatternId] : null;
}
