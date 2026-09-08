// Découpe des planches d'animaux qui servent de motifs au Memory.
//
//   npm i sharp && node design/memory/decoupe.mjs
//
// Les .jpeg source sont dans design/memory/ (déposés le 2026-09-09) ; la sortie va dans
// design/memory/detoure/, qui est gitignoré — c'est de l'intermédiaire régénérable.
// Les fichiers que l'app utilise vraiment sont recopiés dans
// frontend/src/assets/memory/, parce que le build en dépend.
//
// Chaque planche porte quatre poses d'un même animal, plus du texte (légendes
// « 1. Seating », titre « Playground Mascot: "Hootie" ») que le seuil de surface
// de design/decoupage.mjs élimine — vérifié : 4 personnages gardés par planche.
//
// L'ordre des noms suit l'ordre gauche->droite des composantes, pas l'ordre de
// lecture de la planche : sur la planche du faon, la pose couchée est en bas à
// gauche et sort donc en deuxième.

import { decouper } from '../decoupage.mjs';

const DIR = new URL('.', import.meta.url).pathname;

await decouper({
  dir: DIR,
  out: `${DIR}detoure`,
  sheets: {
    'Gemini_Generated_Image_l01jvol01jvol01j.jpeg': ['faon-assis', 'faon-couche', 'faon-debout', 'faon-saute'],
    'Gemini_Generated_Image_ssykbussykbussyk.jpeg': ['hibou-branche', 'hibou-lecture', 'hibou-vole', 'hibou-dort'],
    'Gemini_Generated_Image_w153s5w153s5w153.jpeg': ['lapin-coucou', 'lapin-saute', 'lapin-assis', 'lapin-debout'],
  },
});
