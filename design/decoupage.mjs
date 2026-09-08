// Détourage d'une planche de personnages générée (fond blanc -> alpha).
//
// Partagé par design/Clomo/decoupe.mjs et design/memory/decoupe.mjs. Extrait le
// 2026-09-09, quand une deuxième série de planches est arrivée ; l'algorithme et
// ses seuils sont inchangés depuis Clomo, seule la duplication a disparu.
//
// Ne modifie JAMAIS les .jpeg d'origine : ils sont la source, on rejoue ce script
// si les réglages doivent changer.
//
// Trois points non négociables, mesurés sur ces planches :
//  - Le fond est retiré par DIFFUSION DEPUIS LES BORDS, pas par « tout ce qui est
//    blanc ». ~0,1 % des pixels quasi-blancs sont enfermés dans le sujet (reflets
//    des yeux, dents, pages du livre) : un filtre global les percerait. Le ventre
//    crème, lui, est trop saturé pour être confondu avec le fond.
//  - Les poses se chevauchent en X sur la planche : on masque par composante
//    connexe (lab[gi] !== c.id), sinon le recadrage embarque le voisin.
//  - Le seuil de surface (0,4 % de la planche) sépare les personnages du TEXTE.
//    Les planches en portent — légendes « 1. Seating », titre « Playground Mascot:
//    "Hootie" » — et il ne doit pas finir dans un sprite. Mesuré le 2026-09-09 :
//    33 et 26 composantes de texte rejetées, 4 personnages gardés par planche.
//
// Le bord anti-aliasé reçoit un alpha proportionnel à l'écart au blanc, puis on
// dépremultiplie contre le blanc — sans ça, halo blanc visible sur fond foncé.

import sharp from 'sharp';
import { mkdirSync } from 'fs';

const PAD = 16;

/**
 * @param {object} options
 * @param {string} options.dir     dossier des .jpeg source
 * @param {string} options.out     dossier de sortie (créé si besoin)
 * @param {Record<string,string[]>} options.sheets  fichier -> noms, dans l'ordre
 *        gauche->droite des composantes détectées
 * @param {number} [options.max]   plus grand côté en sortie, en pixels
 */
export async function decouper({ dir, out, sheets, max = 768 }) {
  mkdirSync(out, { recursive: true });

  for (const [file, names] of Object.entries(sheets)) {
    const img = sharp(`${dir}/${file}`);
    const { width: W, height: H } = await img.metadata();
    const { data } = await img.raw().toColourspace('srgb').toBuffer({ resolveWithObject: true });

    // fond = quasi-blanc ET desature ; le ventre creme (sature) n'entre jamais dedans
    const isBg = new Uint8Array(W * H);
    for (let i = 0, o = 0; i < W * H; i++, o += 3) {
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const mi = Math.min(r, g, b), ma = Math.max(r, g, b);
      isBg[i] = (mi > 232 && ma - mi < 14) ? 1 : 0;
    }

    // "dehors" = fond ATTEINT depuis un bord (protege yeux/dents/pages)
    const outside = new Uint8Array(W * H); const st = [];
    for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
    while (st.length) {
      const i = st.pop(); if (outside[i] || !isBg[i]) continue; outside[i] = 1;
      const x = i % W, y = (i / W) | 0;
      if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1);
      if (y > 0) st.push(i - W); if (y < H - 1) st.push(i + W);
    }

    // composantes connexes -> une par personnage (le texte tombe sous le seuil)
    const lab = new Int32Array(W * H).fill(-1); const comps = [];
    for (let s = 0; s < W * H; s++) {
      if (outside[s] || lab[s] >= 0) continue;
      const id = comps.length, q = [s]; lab[s] = id;
      let x0 = W, y0 = H, x1 = 0, y1 = 0, cnt = 0;
      while (q.length) {
        const i = q.pop(), x = i % W, y = (i / W) | 0; cnt++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1])
          if (j >= 0 && !outside[j] && lab[j] < 0) { lab[j] = id; q.push(j); }
      }
      comps.push({ id, x0, y0, x1, y1, cnt });
    }

    const keep = comps.filter((c) => c.cnt > W * H * 0.004).sort((a, b) => a.x0 - b.x0);
    if (keep.length !== names.length) {
      console.warn(`  !! ${file}: ${keep.length} composantes pour ${names.length} noms`);
    }

    for (let k = 0; k < keep.length; k++) {
      const c = keep[k], name = names[k] ?? `pose-${k + 1}`;
      const x0 = Math.max(0, c.x0 - PAD), y0 = Math.max(0, c.y0 - PAD);
      const x1 = Math.min(W - 1, c.x1 + PAD), y1 = Math.min(H - 1, c.y1 + PAD);
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      const rgba = Buffer.alloc(w * h * 4);
      let feathered = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const gi = (y0 + y) * W + (x0 + x), so = gi * 3, dof = (y * w + x) * 4;
        // n'appartient pas A CE personnage (fond, ou le voisin) -> transparent
        if (lab[gi] !== c.id) { rgba[dof + 3] = 0; continue; }
        let r = data[so], g = data[so + 1], b = data[so + 2], a = 255;
        const onEdge = (x > 0 && lab[gi - 1] !== c.id) || (x < w - 1 && lab[gi + 1] !== c.id) ||
                       (y > 0 && lab[gi - W] !== c.id) || (y < h - 1 && lab[gi + W] !== c.id);
        if (onEdge) {
          const mi = Math.min(r, g, b);
          if (mi > 200) {
            a = Math.max(0, Math.min(255, Math.round(255 * (255 - mi) / (255 - 200))));
            if (a > 4) { // C = a*F + (1-a)*blanc  ->  F = (C - (1-a)*255)/a
              const inv = (255 - a) / 255, f = (v) => Math.max(0, Math.min(255, Math.round((v - inv * 255) / (a / 255))));
              r = f(r); g = f(g); b = f(b); feathered++;
            }
          }
        }
        rgba[dof] = r; rgba[dof + 1] = g; rgba[dof + 2] = b; rgba[dof + 3] = a;
      }
      const scale = Math.min(1, max / Math.max(w, h));
      const pipe = sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
        .resize({ width: Math.round(w * scale), height: Math.round(h * scale), fit: 'fill', kernel: 'lanczos3' });
      await pipe.clone().png({ compressionLevel: 9 }).toFile(`${out}/${name}.png`);
      await pipe.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`${out}/${name}.webp`);
      console.log(`  ${name.padEnd(20)} ${w}x${h} -> ${Math.round(w * scale)}x${Math.round(h * scale)}  (${feathered} px de bord adoucis)`);
    }
  }
}
