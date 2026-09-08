# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A multi-game website **for young children (~6 years old)** — this drives real decisions, not just a note: big tap targets, short/simple wording in both languages, no scary or complex UI, a rules explanation before play, not just "hardcore" or dense text. Hangman is the first game built and establishes the conventions (folder layout, how a game talks to the backend, how round state works, i18n, the pre-game rules modal) that later games should follow — favor patterns that generalize to "add another game," not one-off solutions specific to Hangman. A prior throwaway Hangman prototype (plain HTML/CSS/JS) was deleted before this rebuild; it was scrapped intentionally and is not a reference for anything here.

## Working with the author

The author is a senior back-end PHP/Symfony developer who is new to React, Vite, and
front-end TypeScript, and has asked to be mentored while this project is built.
**Invoke the `mentor` skill (`.claude/skills/mentor/SKILL.md`) before doing any
front-end work** — it defines what to explain, at what depth, and in what format. It
does not apply to back-end work, which is already familiar ground for him.

## Stack

- **Frontend:** React + TypeScript, scaffolded with Vite (`npm create vite@latest frontend -- --template react-ts`), routed with `react-router-dom`.
- **Backend:** Node.js + Express + TypeScript, run via `tsx`.

## Visual theme ("Clomo")

The whole frontend follows the **"Clomo" theme** — named after Clomo, the fox-cub mascot the site is being built around — a soft cream/amber/forest palette adapted from the community "Ninja" theme on 21st.dev (`@ferreiraferreira14/themes/ninja-1786814780438`). It replaced the original "Bubblegum" theme on 2026-08-24: the candy pink/teal palette was swapped out because it clashed with the fox mascot. The sticker-shadow mechanic and the rounded radii were kept unchanged — **only the color values moved**, which cost 16 lines in `index.css` plus 9 targeted fixes, because the app is almost fully tokenized. Two of those 9 were invisible to `tsc`, oxlint and the eye, and only surfaced by screenshotting the running app: the word-display dashes (`border-bottom: 4px solid var(--primary)`, 1.71:1 on white) and a modal scrim that turned the whole cream page muddy. **Screenshot the app after any palette change** — a valid stylesheet proves nothing here.

**Caveat on provenance:** 21st.dev renders its theme tokens client-side and the page requires a session, so the palette could not be read from the source. The hex values were sampled pixel-by-pixel from the theme's public OpenGraph preview image (`https://21st.dev/community/themes/ninja-1786814780438/opengraph-image-1re4pe`) — the *colors* are exact, but which color plays which shadcn role is this project's own interpretation, not the theme author's. If the official token list ever becomes available, reconcile against it.

Tokens live as CSS custom properties in `frontend/src/index.css`: `--primary` amber `#fcb960` (Clomo's fur), `--secondary` mint `#e8f5e9`, `--accent` warm beige `#e0d6c9`, `--card` white, `--card-foreground` dark brown `#3e2723`, `--border` and `--success` forest green `#2e7d32`, `--shadow-color` warm taupe `#b09a84`. Two tokens are **additions not present in the source theme**: `--success` (carried over from Bubblegum, for correct-guess feedback) and `--destructive` `#c62828` (the Ninja palette contains no red at all, and wrong-guess feedback needs one). Font is Poppins, loaded via a Google Fonts `<link>` in `index.html` (verify it still renders correctly if that link is ever removed/changed — no local fallback is bundled).

**`--primary` is a surface color only — never use it as a text or icon color.** Amber `#fcb960` on white is 1.71:1, far below the WCAG AA floor. `--primary-strong` `#a1520a` (5.63:1 on white) exists for exactly that: text, icon strokes, and bold spans that need to read as "Clomo orange" on a light background. For the same reason `--primary-foreground` is dark brown, not white — white on amber is unreadable. Every foreground/background pair currently in the CSS was checked against WCAG AA before the palette was committed; re-check with the same method if any token value changes.

The signature visual move is the **hard/solid "sticker" shadow**: `box-shadow: Npx Npx 0 0 var(--shadow-color)` — no blur, a flat offset block, like a card is popping off the page. Every card, button, and modal uses it, and interactive elements animate it on press: `:hover` nudges the element by `(-1px,-1px)` and grows the shadow by ~1px, `:active` pushes it to `(+2px,+2px)` and shrinks the shadow toward `0 0 0 0` — a satisfying "push the sticker down" tap effect. Follow this pattern (don't fall back to normal blurred `box-shadow`) for any new UI in this app, including future games. `--shadow-color` must stay dark enough to be visible against **both** ends of the page gradient — the first candidate (`#d8c9b5`) was rejected at 1.13:1 against `--bg-end`, where the shadow would have vanished.

Page backgrounds use a very soft diagonal cream→beige gradient (`--bg-start` `#fdfbf7` → `--bg-end` `#e0d6c9`); content sits in white (`--card`) panels with a solid forest-green `--border`, and color is spent only where it carries meaning (amber for the primary action, green for correct, red for wrong). The larger pill/rounded radii (`--radius-sm`/`--radius-md`/`--radius-lg`) are this app's own choice, kept from the Bubblegum era because they read as more "enfantin" for the target audience.

## Mascot ("Clomo")

Clomo is the site's fox-cub mascot; the "Clomo" color theme is named after him. Source art lives in `design/Clomo/` as two Gemini-generated JPEG sheets (2816×1536, several poses per sheet, white background) — **treat those as read-only originals**; every derived file is regenerated from them, never edited in place.

`design/Clomo/decoupe.mjs` (needs `npm i sharp`) cuts the sheets into six transparent sprites in `design/Clomo/detoure/`, as PNG and WebP, 768px on the long side: `clomo-coucou`, `clomo-ordinateur`, `clomo-court`, `clomo-bravo`, `clomo-lecture-a`, `clomo-lecture-b`. **That folder is gitignored** — it is regenerable output, and its ~5MB was stripped from the history before the first push (2026-08-25). Rebuild it with `npm i sharp && node design/Clomo/decoupe.mjs`. The four poses the app actually uses are committed separately under `frontend/src/assets/clomo/`, because those are application assets the build depends on, not intermediate output. The cutting algorithm itself moved to `design/decoupage.mjs` on 2026-09-09, when the Memory sheets became a second caller; `design/Clomo/decoupe.mjs` is now just the list of sheets and names. That shared module's header documents why the background removal floods in from the image borders instead of keying on white, why sprites are masked by connected component, and why the surface threshold is what keeps the sheets' printed captions out of the sprites — all three are load-bearing, re-read them before changing any threshold.

Clomo's fur sits at hue 18–27° and `--primary-strong` `#a1520a` at 28.6°, so the mascot and the UI orange are the same family by measurement, not by luck. `--primary` `#fcb960` (34.2°) reads as a pale tint of him.

Four poses are wired into the app, as WebP under `frontend/src/assets/clomo/`: `coucou` (Clomo explaining the rules), `ordinateur` (home page header, his laptop reads "Playground"), `bravo` (hangman win) and `court` (hangman loss — a fox bounding along reads as "come on, try again", which is why the loss screen gets a cheerful pose rather than a sad one). The two `lecture` poses stay unused, see the caveat below. They are `import`ed rather than served from `public/` so Vite fingerprints the filenames (`clomo-bravo-DCe0EH6y.webp`) and a wrong path breaks `npm run build` instead of 404-ing in production. The "no external asset dependency" rule elsewhere in this file is about *remote* assets and emoji fonts; bundled mascot art is fine.

`frontend/src/mascot/Clomo.tsx` is the only thing that should reference those files: `<Clomo pose="bravo" height={150} />`. It lives outside `games/` because the mascot belongs to the site, not to Hangman. Each pose declares its intrinsic width/height so the `<img>` reserves the right box before the file loads (the poses have different aspect ratios — `height` is the prop, width follows), and its `alt` text is a `TranslationKey` like every other string. Adding a pose means dropping the WebP in and adding one entry to `POSES` plus its `clomo.alt.*` strings in both dictionaries.

**Caveat on the two `lecture` poses:** the book art contains machine-generated text — `clomo-lecture-b`'s reads "CLOMO'S BIG BOOK OF CODING" (English, on a French site for 6-year-olds) and `clomo-lecture-a`'s is illegible gibberish. Prefer the other four poses, or regenerate these with no text on the book.

## Pages & routing

- `/` — `frontend/src/pages/HomePage.tsx`: lists every game as a big clickable card, sourced from `frontend/src/games/registry.ts` (a `GameDescriptor[]`: id, route path, an `Icon` component, and title/description translation keys). **Adding a game means adding one entry here** — the home page needs no other changes.
- `/games/hangman` — `frontend/src/games/hangman/Hangman.tsx`, the game itself.
- `/games/memory` — `frontend/src/games/memory/Memory.tsx`, game #2. See `docs/brainstorms/2026-09-08-conception-jeu-memory.md` for why it is built the way it is.
- Card icons are inline SVG components (`HangmanFigure.tsx` reused at `wrongGuesses={3}` for its card), not emoji — emoji glyph rendering depends on the OS having a color-emoji font installed, which isn't guaranteed (confirmed broken in this project's own headless-browser testing setup). Follow the same approach for new games' icons. **This applies to translation strings too, not just icons:** `hangman.win.title` used to end in a 🎉 that rendered as a tofu box, caught by screenshotting the win modal on 2026-08-25 and removed — Clomo's `bravo` pose now carries that celebration. Don't put emoji in `translations.ts`.

## Internationalization (English/French, auto-detected)

Custom, dependency-free i18n under `frontend/src/i18n/`: `translations.ts` holds flat `en`/`fr` dictionaries keyed by dot-path strings (e.g. `"hangman.win.title"`), typed so `fr` must implement every key `en` has (`Record<TranslationKey, string>`). `I18nContext.tsx` detects the language once from `navigator.language` (`fr*` → French, everything else → English — there is no manual language switcher), sets `<html lang>`, and exposes `useI18n().t(key)`. There's no library (i18next etc.) because two static dictionaries didn't justify one — reconsider only if this grows past simple flat-string lookups (pluralization, interpolation, more locales).

Every user-facing string in the app must go through `t()`, including error messages — see `useHangmanRound.ts`, which stores an `error` as a `TranslationKey` (e.g. `"hangman.errorConnect"`) rather than a literal string, and the component calls `t(error)` at render time. Follow that pattern for new errors/copy: put the string in both dictionaries, never inline text in a component.

## Pre-game rules modal (Clomo's speech bubble)

`Hangman.tsx` renders `RulesModal.tsx` on top of the game until the child dismisses it — with the close cross at the top right of the bubble, or by paging through to "let's play". The round loads normally underneath; the modal is a full-viewport overlay (reusing `.game-modal`) that blocks input until dismissed, it doesn't delay fetching.

**Shown automatically on the first visit only.** `frontend/src/mascot/useRules.ts` owns that: it stores `playground.rules-seen.<gameId>` in `localStorage` and returns `{ rulesOpen, openRules, closeRules }`. This is deliberately **not** backend state — `backend/src/hangman/store.ts` holds round state, has no notion of a user, and is lost on restart; "this browser has read the notice" belongs to the browser. Every `localStorage` access is wrapped in try/catch, because it throws in private browsing and when site data is blocked; it degrades to "not seen yet" so a child can always play (verified against a context where the accessor throws).

Because the notice stops appearing on its own, **every game must give a way back to it** — Hangman has a "rules" button next to "back to games" in `.top-left-controls`. Without it the rules become unreachable for the next child on the same device. Reuse `useRules(gameId)` in game #2 and the whole behaviour comes with it.

The rules are **spoken by Clomo, one short sentence per speech bubble**, paginated rather than shown as one block — a wall of text does not work for a 6-year-old, and a bubble big enough to hold it stops reading as a speech bubble. `frontend/src/mascot/ClomoRules.tsx` owns the mascot, the bubble, the step dots and the Next → "let's play" button; it is **game-agnostic** and takes `steps: readonly TranslationKey[]`. Each game keeps a thin `RulesModal.tsx` whose only job is to name its own steps — that is the pattern for game #2: write three short sentences, add them to both dictionaries as `<game>.rules.stepN`, and pass them to `ClomoRules`.

`.speech-text` carries a `min-height` so the bubble does not resize as the child pages through; if a new game's sentences are longer, adjust that value rather than letting the bubble jump. The bubble tail is two stacked CSS triangles (border colour behind, card colour in front) and flips from pointing left to pointing up under 560px, where Clomo moves above the bubble.

## Architecture: server-authoritative round state

The backend owns game data and round state; the frontend never sees the answer while a round is in progress. This is the pattern later games should follow too:

- The frontend calls `POST /api/games/hangman/rounds` to start a round. The backend picks a random word+hint, stores the round server-side (`backend/src/hangman/store.ts`), and returns a `PublicRoundView` — hint, word length, rules (`maxWrongGuesses`), and a `display` array of revealed letters/`null`s. The actual word is withheld.
- Guesses go through `POST /api/games/hangman/rounds/:roundId/guesses` (`backend/src/hangman/router.ts`), which validates and mutates the round server-side and returns the updated view. The word is included in the response only once `status` becomes `"won"` or `"lost"`.
- `POST /api/games/hangman/rounds/:roundId/reveal` force-ends a round (marks it `"lost"` and returns the word). Nothing on the frontend calls it right now — there is no time limit and no "give up" button — but it's kept as a generic round-ending endpoint for whichever feature needs it next.
- Round storage is an in-memory `Map` (`backend/src/hangman/store.ts`) — rounds are lost on server restart and never evicted. Fine for local dev; replace before this needs to survive restarts or scale.
- Frontend game state lives in `frontend/src/games/hangman/useHangmanRound.ts`, which wraps the two endpoints it uses (`frontend/src/games/hangman/api.ts`). Components (`Hangman.tsx`, `Keyboard.tsx`, `WordDisplay.tsx`, `HangmanFigure.tsx`, `GameOverModal.tsx`) are presentational and read from that hook's state.
- There is currently no time limit on a round (removed 2026-08-23; was a client-side countdown that force-ended the round via `/reveal` at zero). If it comes back, re-add `timeLimitSeconds` to `PublicRoundView`/`RoundView` and a countdown effect in the hook — don't just restyle the old `.timer` CSS class, it was removed along with the feature.
- The hangman figure is drawn as inline SVG (`HangmanFigure.tsx`), not images — no external asset dependency per wrong-guess stage. It is split into two `<g>`: the gallows strokes with `currentColor` (so `.game-card-icon svg { color }` can tint the whole thing on the home card), the body with its own `--primary-strong` stroke in `hangman.css`. Strokes are 8-9px with round caps *and* joins — the original 3px lines read as spindly next to 1.5px borders and 6px sticker shadows.
- Each new body part animates in with `hangman-pop`. This works only because `PARTS` uses stable React keys: existing elements are never re-inserted, so only the newly added one animates. If those keys ever become index-based, every part will re-pop on every wrong guess. The animation is disabled under `prefers-reduced-motion`.
- The backend's base URL is read from `VITE_API_BASE_URL` (`frontend/.env`); there's no proxy config, so both dev servers must be running for the frontend to work, and CORS is open (`cors()` with no options) since there's no auth or origin restriction yet.
- The hint is hidden by default in the UI (`HintButton.tsx`, top-right `?` toggle) — the frontend already has the hint in `round.hint` the whole time, this is a UI reveal-on-demand, not a privacy boundary like the word itself.
- Whether a guessed letter was a hit is derived client-side from `round.display`, in `frontend/src/games/hangman/letterStatus.ts` (`foundLetterSet`). It strips accents via `normalize.ts` — a duplicate of the backend's helper, small enough that copying it beat sharing it — because guessing "e" reveals "é"/"è"/"ê" and the key must still light up green. It sits in its own file, despite having a single caller, because it is the one place that rule is written down on the frontend. The backend doesn't need to know about any of this; `guessedLetters`/`display` already carry everything required.
- There was a `UsedLetters.tsx` panel top-right listing the tried letters as coloured chips. It was **deleted on 2026-08-25**, once the keyboard started colouring tried keys in place: the panel then showed the same letters in the same colours, twice on one screen. Don't reintroduce it — if a tried letter is ever hard to read, fix the key.
- The keyboard colours each tried key green or red in place, so the answer lives on the key the child just pressed. `.keyboard button[disabled].correct/.wrong` overrides the generic `[disabled] { opacity: .45 }` washout on specificity, not on source order.
- Mistakes are shown as `MistakeDots.tsx` — one dot per allowed mistake, filling red — not as "4 / 6". A 6-year-old counts well before they read fluently. The figure's `aria-label` and the dots' own `aria-label` carry the text equivalent.

## Difficulty levels (the pattern for game #2)

Three levels — `"easy" | "normal" | "hard"` — decided by a design workshop on 2026-08-26 (`docs/brainstorms/2026-08-26-niveaux-de-difficulte-pendu.md`, which records the dissent too). Two rules came out of it and both generalize:

- **The level never changes `maxWrongGuesses`.** It stays 6 for every level. `HangmanFigure.tsx` draws exactly six body parts, so 8 mistakes would leave errors 7 and 8 drawing nothing while the dots keep filling; and a 6-year-old does not compare 6 to 8 anyway — they watch whether the drawing is filling up fast. The originally proposed 8/6/4 was rejected on both counts.
- **The level acts on the content, not on the rules.** For Hangman that means the word: `backend/src/hangman/difficulty.ts` derives a word's level from its length and its distinct-letter count (after `stripAccents`, so "é" and "e" count once — matching what guessing actually does). Nothing is tagged in `words.ts`, so regenerating the list cannot leave a stale tag behind.

`difficulty` is a body parameter of `POST /api/games/<game>/rounds`, validated server-side against a whitelist, defaulting to `"normal"`; it is never remembered server-side, because the store has no notion of a user. Easy also gets one vowel pre-revealed — the single "help" lever, and it cost the frontend nothing since `display` and the keyboard already render whatever is in `guessedLetters`.

Deriving instead of tagging trades one risk for another: a pool can silently shrink to nothing when the word list changes. `backend/src/hangman/pools.ts` therefore **throws at boot** if any pool drops below 50 words. There is no test runner; a server that refuses to start is a loud failure, a pool of three words is a silent one. Current sizes: easy 140, normal 467, hard 90.

`frontend/src/games/DifficultyPicker.tsx` lives outside `games/hangman/` on purpose: the site owns the three names (`difficulty.*` translation keys), each game supplies what its levels mean (`hangman.difficulty.*.help`) — the same split as `ClomoRules` vs each game's `RulesModal`. The picker shows rows of 3/5/8 dashes rather than any number, because that is the one difference a child who cannot read yet can actually see. `Hangman.tsx` renders it while `difficulty === null` and only then mounts `useHangmanRound(difficulty)`; "play again" returns to it with the last choice highlighted.

## Memory (game #2)

Designed in the workshop of 2026-09-08 (`docs/brainstorms/2026-09-08-conception-jeu-memory.md`, dissent included). What generalizes, and what does not:

- **The server deals and forgets.** `POST /api/games/memory/rounds` returns the whole board face up — there is no `store.ts`, no round state, no `/finish`, no move counter. Hangman keeps rounds server-side because it must hide a word; a Memory's answer is its layout and the child uncovers it in half a minute, so hiding it would only have bought a network round-trip per tap. A reload deals a new board, deliberately. The `roundId` is still issued by the server: it is the one thing the announced quests/progression features cannot invent after the fact.
- **What the server really protects is reviewed content, not a secret.** That is why the motif catalogue lives in `backend/src/data/patterns.ts` rather than in the frontend bundle, mirroring `words.ts`. The frontend owns only the pixels (`frontend/src/games/memory/patterns.ts`, WebP `import`ed so a wrong id breaks `npm run build`).
- **The rules live in a pure reducer**, `frontend/src/games/memory/memoryEngine.ts` — `(state, event) => state`, no React, no fetch, no timers. `useMemoryBoard.ts` holds only React state, the fetch, and the single `setTimeout`, which is armed by a phase rather than by a click handler so it cannot be armed twice. `isWon` and "is this card face up" are derived at render, never stored. **A third tap while a mismatched pair is showing resolves it and opens the tapped card**, rather than being ignored: a tap with no visible effect is what makes a six-year-old hammer the screen. The cost, raised in the workshop and accepted, is that a fast child never sees the pair they just missed.
- **No test runner, again.** The workshop's tests role argued for Vitest around `memoryEngine.ts` and lost, on the grounds that game #2 should not pile four new concepts onto an author new to React. That dissent is recorded, and it is the first thing to revisit if the board ever desynchronises after a run of taps. What replaces it: `assertMemoryPatternsAreUsable()` at boot, the deserialization guard in `frontend/src/games/memory/api.ts` (which is where "every motif is dealt exactly twice" is actually checked — Hangman's naked `body as RoundView` cast is not good enough for a board), and screenshots.
- **The art is three animals in four poses, not eight unrelated drawings.** The sheets delivered on 2026-09-09 (`design/`, cut by `design/memory/decoupe.mjs`) forced the second difficulty lever the workshop had left open: `backend/src/memory/deal.ts` draws motifs family by family, round-robin, so an easy board is always one pose per species and only a hard one mixes look-alikes. `backend/src/memory/pools.ts` refuses to start below 8 motifs **or** below one family per pair on the easiest board. `hibou-lecture` was cut for the same reason as Clomo's own reading poses: machine-generated English text on the book.
- Level names, the picker and the modal shell are site-level and now live in `frontend/src/games/games.css`, imported by the components that use them (`DifficultyPicker.tsx`, `ClomoRules.tsx`) rather than by whichever page happens to pull in a game's stylesheet. `DifficultyPicker` takes a `previews: Record<Difficulty, ReactNode>` — the site owns the slot, each game draws what its levels look like (Hangman: dashes; Memory: the board in miniature).

## Word list (`backend/src/data/words.ts`)

**697 French words, each with a hint written by hand for a ~6-year-old** (`ciel` → "Le grand espace bleu au-dessus de nos têtes."). The *words* still come from Hermit Dave's frequency-ranked `FrequencyWords` corpus (MIT). The *hints* no longer come from Wiktionary: they were rewritten on 2026-08-26 and the fetched definitions were dropped entirely, so there is no longer any CC BY-SA text in this file to attribute.

**Why they were rewritten.** The hint is now shown to the child on the end-of-round card (`GameOverModal.tsx`), win *and* loss, so it has to teach the word rather than encode it. The fetched Wiktionary definitions could not: they averaged 62 characters of adult dictionary prose, 315 opened on a domain gloss (`(Entomologie)`), 228 ran past 90 characters, and **107 literally contained the answer** (`allée` → "Action d'aller"). One short sentence each now, average 42 characters, and **no hint contains its own word's root** — that check is worth re-running, it is the failure mode this list started with.

**The same pass removed 426 of the 1,123 entries**, each read and judged individually rather than by keyword: inflected forms whose infinitive was already listed (`aime`/`aimer`, `appelé`/`appeler`, `allée`/`aller`), function words a child can neither guess nor learn from (`absolument`, `apparemment`, `quiconque`), first names and plainly wrong senses the fetch had picked up (`alice`, `billy`, `angleterre` = a fabric, `appelle` = "manque de peau", `clark` = a forklift), and subjects unsuited to the audience. Keeping them would have meant showing a 6-year-old a definition of `absolument` as a reward for winning.

**Content-filtered for the target audience (2026-08-23).** The original 1,145-word auto-generated list had zero content moderation and included words like `sexy`, `putain`, `meurtre`, `suicide` — inappropriate for the ~6-year-old audience this site is built for. Every entry was scanned against a keyword blocklist (sexual/anatomy, violence/weapons, drugs/alcohol, profanity — see the removed-word list below) covering both the word and its hint text, then **each of the ~30 flagged entries was individually read and judged**, not auto-removed on keyword match alone: e.g. `animal`, `chasse`, `monstre`, `couteau`, `lance` were kept because the flagged term was either incidental dictionary wording (`"au sein de son espèce"` ≠ breasts) or an ordinary word/concept (a kitchen knife, a fairy-tale monster, hunting for Easter eggs), while `arme`, `règles` (whose fetched definition happened to be about menstruation, not "rules"), `parti` (fetched sense was slang for "drunk"), and `travailler` (fetched sense was about psychological torment) were removed even though the word itself is unremarkable, because the *specific hint that would be shown* wasn't. 22 entries were removed this way. The 2026-08-26 rewrite re-ran the same review against the *new* hint texts, since those are what the child now reads. **If the word list is regenerated or extended, redo BOTH passes — the content review and the "does the hint contain the answer" check. Don't just re-run a keyword filter and trust it, and don't skip it because the automation "should" catch it now.**

Because French words routinely contain accents and the on-screen keyboard is plain a-z, guess matching is accent-insensitive: `backend/src/hangman/normalize.ts` strips diacritics for comparison, so guessing "e" reveals every "e"/"é"/"è"/"ê"/"ë" in the word at once (same for other accented letters). The word is still stored and displayed with its real accents — only the *matching* is normalized. Keep this in mind if the word list ever changes: any word using only `[a-zàâäéèêëïîôöùûüçÿñ]` works with this scheme; ligatures (œ, æ) or other characters would need either normalization support added or filtering out at word-list build time (the generation script already excludes them).

Adding a second game: give it its own `POST /api/games/<game>/rounds`-shaped API and its own `frontend/src/games/<game>/` folder following this same split (api client + state hook + presentational components), add its strings to both `en`/`fr` dictionaries, give it a rules modal, and register it in `frontend/src/games/registry.tsx` so it shows up on the home page. Pull something into `/shared` only once a second game actually needs it.

## Repo layout

```
/frontend   React + TypeScript app (Vite)
/backend    Node.js + Express API (TypeScript, run via tsx)
/shared     Shared TypeScript types/interfaces used by both (not yet created — add when duplication actually hurts)
```

## Git workflow

Three levels, adopted 2026-08-25:

- **`main`** — releases only. Never commit to it directly, and never merge a feature into it. It receives `develop` when a version is cut.
- **`develop`** — the integration branch and **the default target for everything**. Branch from it, merge back into it.
- **feature branches** — one per piece of work, branched from `develop`, merged back with `git merge --no-ff` so the branch stays visible in the history, then **deleted**. Use `git branch -d` (lowercase), never `-D`: the safe form refuses to delete a branch that is not fully merged, which is exactly the check you want here.

```bash
git checkout develop && git checkout -b <feature>
# ... work, commit ...
git checkout develop && git merge --no-ff <feature>
git branch -d <feature>
```

So: when asked to commit, branch off `develop` rather than committing on the spot, and merge into `develop`, not `main`. `main` moves only on an explicit release.

The author has said Claude can run git commands directly (2026-08-25) — branch, commit, merge and delete without asking each time.

The remote is `https://github.com/StephaneSauvaget/Playground.git`. It is a **public** repository and was still empty as of 2026-08-25 — nothing has ever been pushed. Pushing therefore publishes everything in the history to the open internet, including `design/Clomo/` and this file. Confirm before a push that would publish new material; it is not covered by the blanket permission above.

## Commands

Frontend (run from `/frontend`):
- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) and produce a production build in `dist/`
- `npm run lint` — lint via oxlint (see `.oxlintrc.json`)
- `npm run preview` — preview a production build locally

Backend (run from `/backend`):
- `npm run dev` — run the API with `tsx watch` (auto-restarts on change), listening on `http://localhost:3001` by default (override with `PORT`)
- `npm run build` — compile TypeScript to `dist/` via `tsc`
- `npm run start` — run the compiled output from `dist/index.js`

There is no test runner configured in either package yet — add one (and this section) when the first tests are written.
