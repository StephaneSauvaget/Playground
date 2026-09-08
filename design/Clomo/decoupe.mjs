// Découpe des planches de Clomo, le renardeau mascotte du site.
//
//   npm i sharp && node design/Clomo/decoupe.mjs
//
// L'algorithme et ses seuils vivent dans design/decoupage.mjs, partagé avec les
// planches du Memory depuis le 2026-09-09 ; les commentaires qui expliquent
// pourquoi le fond est retiré par diffusion depuis les bords y sont restés.

import { decouper } from '../decoupage.mjs';

const DIR = new URL('.', import.meta.url).pathname;

await decouper({
  dir: DIR,
  out: `${DIR}detoure`,
  // noms dans l'ordre gauche->droite de chaque planche
  sheets: {
    'Gemini_Generated_Image_7xgnyn7xgnyn7xgn.jpeg': ['clomo-lecture-a', 'clomo-lecture-b'],
    'Gemini_Generated_Image_ew8yueew8yueew8y.jpeg': ['clomo-coucou', 'clomo-ordinateur', 'clomo-court', 'clomo-bravo'],
  },
});
