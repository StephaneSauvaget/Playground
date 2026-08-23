# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A multi-game website **for young children (~6 years old)** — this drives real decisions, not just a note: big tap targets, short/simple wording in both languages, no scary or complex UI, a rules explanation before play, not just "hardcore" or dense text. Hangman is the first game built and establishes the conventions (folder layout, how a game talks to the backend, how round state works, i18n, the pre-game rules modal) that later games should follow — favor patterns that generalize to "add another game," not one-off solutions specific to Hangman. A prior throwaway Hangman prototype (plain HTML/CSS/JS) was deleted before this rebuild; it was scrapped intentionally and is not a reference for anything here.

## Stack

- **Frontend:** React + TypeScript, scaffolded with Vite (`npm create vite@latest frontend -- --template react-ts`), routed with `react-router-dom`.
- **Backend:** Node.js + Express + TypeScript, run via `tsx`.

## Visual theme ("Bubblegum")

The whole frontend follows the "Bubblegum" theme from tweakcn/21st.dev (`@serafimcloud/themes/bubblegum`) — a candy-colored, sticker-shadow design system, chosen for a modern-but-playful look for young kids. Tokens live as CSS custom properties in `frontend/src/index.css` (`--primary` hot pink `#d04f99`, `--secondary` teal `#8acfd1`, `--accent` soft yellow `#fbe2a7`, `--card` cream `#fdedc9`, `--destructive` coral `#f96f70`, plus a custom `--success` green not in the original theme, added for correct-guess feedback). Font is Poppins, loaded via a Google Fonts `<link>` in `index.html` (verify it still renders correctly if that link is ever removed/changed — no local fallback is bundled).

The signature visual move is the **hard/solid "sticker" shadow**: `box-shadow: Npx Npx 0 0 var(--shadow-color)` — no blur, a flat offset block, like a card is popping off the page. Every card, button, and modal uses it, and interactive elements animate it on press: `:hover` nudges the element by `(-1px,-1px)` and grows the shadow by ~1px, `:active` pushes it to `(+2px,+2px)` and shrinks the shadow toward `0 0 0 0` — a satisfying "push the sticker down" tap effect. Follow this pattern (don't fall back to normal blurred `box-shadow`) for any new UI in this app, including future games.

Page backgrounds use a diagonal pink→teal gradient (`--bg-start`/`--bg-end`); content sits in cream (`--card`) panels with a solid hot-pink `--border`. This is a deliberate adaptation, not a literal copy of the source theme's tokens — the source theme's own `--radius` is a tight `0.4rem` (blocky), but this app keeps its own larger pill/rounded-corner radii (`--radius-sm`/`--radius-md`/`--radius-lg` in `index.css`) because that reads as more "enfantin" for the target audience; the palette and the shadow mechanic are what was carried over faithfully.

## Pages & routing

- `/` — `frontend/src/pages/HomePage.tsx`: lists every game as a big clickable card, sourced from `frontend/src/games/registry.ts` (a `GameDescriptor[]`: id, route path, an `Icon` component, and title/description translation keys). **Adding a game means adding one entry here** — the home page needs no other changes.
- `/games/hangman` — `frontend/src/games/hangman/Hangman.tsx`, the game itself.
- Card icons are inline SVG components (`HangmanFigure.tsx` reused at `wrongGuesses={3}` for its card), not emoji — emoji glyph rendering depends on the OS having a color-emoji font installed, which isn't guaranteed (confirmed broken in this project's own headless-browser testing setup). Follow the same approach for new games' icons.

## Internationalization (English/French, auto-detected)

Custom, dependency-free i18n under `frontend/src/i18n/`: `translations.ts` holds flat `en`/`fr` dictionaries keyed by dot-path strings (e.g. `"hangman.win.title"`), typed so `fr` must implement every key `en` has (`Record<TranslationKey, string>`). `I18nContext.tsx` detects the language once from `navigator.language` (`fr*` → French, everything else → English — there is no manual language switcher), sets `<html lang>`, and exposes `useI18n().t(key)`. There's no library (i18next etc.) because two static dictionaries didn't justify one — reconsider only if this grows past simple flat-string lookups (pluralization, interpolation, more locales).

Every user-facing string in the app must go through `t()`, including error messages — see `useHangmanRound.ts`, which stores an `error` as a `TranslationKey` (e.g. `"hangman.errorConnect"`) rather than a literal string, and the component calls `t(error)` at render time. Follow that pattern for new errors/copy: put the string in both dictionaries, never inline text in a component.

## Pre-game rules modal

`Hangman.tsx` renders `RulesModal.tsx` on top of the game (`showRules` state, starts `true`) until the child taps the "let's play" button — explains the rules in plain language before any interaction. The round itself loads normally underneath; the modal is a full-viewport overlay (reusing `.game-modal`) that blocks input until dismissed, it doesn't delay fetching. New games should do the same: a short rules modal shown before first interaction, not a wall of text, written at a 6-year-old's reading/listening level in both `en` and `fr`.

## Architecture: server-authoritative round state

The backend owns game data and round state; the frontend never sees the answer while a round is in progress. This is the pattern later games should follow too:

- The frontend calls `POST /api/games/hangman/rounds` to start a round. The backend picks a random word+hint, stores the round server-side (`backend/src/hangman/store.ts`), and returns a `PublicRoundView` — hint, word length, rules (`maxWrongGuesses`), and a `display` array of revealed letters/`null`s. The actual word is withheld.
- Guesses go through `POST /api/games/hangman/rounds/:roundId/guesses` (`backend/src/hangman/router.ts`), which validates and mutates the round server-side and returns the updated view. The word is included in the response only once `status` becomes `"won"` or `"lost"`.
- `POST /api/games/hangman/rounds/:roundId/reveal` force-ends a round (marks it `"lost"` and returns the word). Nothing on the frontend calls it right now — there is no time limit and no "give up" button — but it's kept as a generic round-ending endpoint for whichever feature needs it next.
- Round storage is an in-memory `Map` (`backend/src/hangman/store.ts`) — rounds are lost on server restart and never evicted. Fine for local dev; replace before this needs to survive restarts or scale.
- Frontend game state lives in `frontend/src/games/hangman/useHangmanRound.ts`, which wraps the two endpoints it uses (`frontend/src/games/hangman/api.ts`). Components (`Hangman.tsx`, `Keyboard.tsx`, `WordDisplay.tsx`, `HangmanFigure.tsx`, `GameOverModal.tsx`) are presentational and read from that hook's state.
- There is currently no time limit on a round (removed 2026-08-23; was a client-side countdown that force-ended the round via `/reveal` at zero). If it comes back, re-add `timeLimitSeconds` to `PublicRoundView`/`RoundView` and a countdown effect in the hook — don't just restyle the old `.timer` CSS class, it was removed along with the feature.
- The hangman figure is drawn as inline SVG (`HangmanFigure.tsx`), not images — no external asset dependency per wrong-guess stage.
- The backend's base URL is read from `VITE_API_BASE_URL` (`frontend/.env`); there's no proxy config, so both dev servers must be running for the frontend to work, and CORS is open (`cors()` with no options) since there's no auth or origin restriction yet.
- The hint is hidden by default in the UI (`HintButton.tsx`, top-right `?` toggle) — the frontend already has the hint in `round.hint` the whole time, this is a UI reveal-on-demand, not a privacy boundary like the word itself.
- `UsedLetters.tsx` (top-right, next to the hint button) shows every guessed letter as a colored chip — green if it's in the word, red if not — computed client-side by checking each guessed letter against `round.display` (via `frontend/src/games/hangman/normalize.ts`, a duplicate of the backend's accent-stripping helper — small enough that copying it beat sharing it). Purely a memory aid for kids; the backend doesn't need to know about it, `guessedLetters`/`display` already carry everything required.

## Word list (`backend/src/data/words.ts`)

1,123 French words, each with a French-language dictionary definition as its hint (e.g. `chat` → "(Félinologie) Mammifère carnivore félin..."). Generated once by an ad-hoc script (not committed): words came from Hermit Dave's frequency-ranked `FrequencyWords` corpus (MIT), definitions were fetched per-word from the French Wiktionary API (`fr.wiktionary.org`, CC BY-SA 4.0 — keep attribution if this data is ever displayed with sourcing/about info). It's machine-generated, not hand-curated — expect the occasional overly technical or awkward definition.

**Content-filtered for the target audience (2026-08-23).** The original 1,145-word auto-generated list had zero content moderation and included words like `sexy`, `putain`, `meurtre`, `suicide` — inappropriate for the ~6-year-old audience this site is built for. Every entry was scanned against a keyword blocklist (sexual/anatomy, violence/weapons, drugs/alcohol, profanity — see the removed-word list below) covering both the word and its hint text, then **each of the ~30 flagged entries was individually read and judged**, not auto-removed on keyword match alone: e.g. `animal`, `chasse`, `monstre`, `couteau`, `lance` were kept because the flagged term was either incidental dictionary wording (`"au sein de son espèce"` ≠ breasts) or an ordinary word/concept (a kitchen knife, a fairy-tale monster, hunting for Easter eggs), while `arme`, `règles` (whose fetched definition happened to be about menstruation, not "rules"), `parti` (fetched sense was slang for "drunk"), and `travailler` (fetched sense was about psychological torment) were removed even though the word itself is unremarkable, because the *specific hint that would be shown* wasn't. 22 entries were removed this way. **If the word list is regenerated or extended, redo this review — don't just re-run a keyword filter and trust it, and don't skip it because the automation "should" catch it now.**

Because French words routinely contain accents and the on-screen keyboard is plain a-z, guess matching is accent-insensitive: `backend/src/hangman/normalize.ts` strips diacritics for comparison, so guessing "e" reveals every "e"/"é"/"è"/"ê"/"ë" in the word at once (same for other accented letters). The word is still stored and displayed with its real accents — only the *matching* is normalized. Keep this in mind if the word list ever changes: any word using only `[a-zàâäéèêëïîôöùûüçÿñ]` works with this scheme; ligatures (œ, æ) or other characters would need either normalization support added or filtering out at word-list build time (the generation script already excludes them).

Adding a second game: give it its own `POST /api/games/<game>/rounds`-shaped API and its own `frontend/src/games/<game>/` folder following this same split (api client + state hook + presentational components), add its strings to both `en`/`fr` dictionaries, give it a rules modal, and register it in `frontend/src/games/registry.tsx` so it shows up on the home page. Pull something into `/shared` only once a second game actually needs it.

## Repo layout

```
/frontend   React + TypeScript app (Vite)
/backend    Node.js + Express API (TypeScript, run via tsx)
/shared     Shared TypeScript types/interfaces used by both (not yet created — add when duplication actually hurts)
```

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
