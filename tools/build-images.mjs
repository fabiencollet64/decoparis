// Pipeline d'images DecoParis (maquette).
// Usage : node tools/build-images.mjs
// - Si images/src/<nom>.jpg|png existe, il est utilise comme original.
// - Sinon un visuel de substitution (degrade brun/taupe) est genere.
// Sorties : images/<nom>-<largeur>.{avif,webp,jpg}
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'images/src');
const outDir = resolve(root, 'images');
mkdirSync(outDir, { recursive: true });

// nom, ratio (w/h), largeurs, libelle du placeholder, teinte
const SPECS = [
  { name: 'hero-facade', ratio: 16 / 10, widths: [960, 1600], label: 'Photo du hero (facade haussmannienne) a inserer', hue: 'warm' },
  { name: 'hero-facade-mobile', ratio: 3 / 4, widths: [480, 800], label: 'Photo du hero, recadrage mobile', hue: 'warm' },
  // Dessins de profils sur fond blanc (site actuel) : on les inscrit dans le cadre sans recadrer.
  { name: 'gamme-modenature', ratio: 4 / 3, widths: [480, 960], label: 'Visuel Decoprofil Modenature a inserer', hue: 'stone', fit: 'contain' },
  { name: 'gamme-coffrage', ratio: 4 / 3, widths: [480, 960], label: 'Visuel Decoprofil Coffrage a inserer', hue: 'taupe', fit: 'contain' },
  { name: 'gamme-interieur', ratio: 4 / 3, widths: [480, 960], label: 'Visuel Moulurama Interieur a inserer', hue: 'cream', fit: 'contain' },
  { name: 'chantier-1', ratio: 4 / 3, widths: [480, 960], label: 'Photo chantier 1 a inserer', hue: 'warm' },
  { name: 'chantier-2', ratio: 4 / 3, widths: [480, 960], label: 'Photo chantier 2 a inserer', hue: 'stone' },
  { name: 'chantier-3', ratio: 4 / 3, widths: [480, 960], label: 'Photo chantier 3 a inserer', hue: 'taupe' },
  { name: 'og-image', ratio: 1200 / 630, widths: [1200], label: 'Image Open Graph a inserer', hue: 'warm' },
];

const HUES = {
  warm: ['#3a2d26', '#5a4638', '#8a7260'],
  stone: ['#3b3733', '#625a52', '#9a8f84'],
  taupe: ['#44382f', '#6b5a4e', '#a3917f'],
  cream: ['#5c4e43', '#8c7a6a', '#c9b8a8'],
};

function placeholderSvg(w, h, label, hue) {
  const [c1, c2, c3] = HUES[hue];
  // Fines lignes horizontales evoquant corniches et bandeaux.
  const lines = [0.22, 0.26, 0.58, 0.61, 0.63, 0.84]
    .map((y) => `<rect x="0" y="${(h * y).toFixed(0)}" width="${w}" height="${Math.max(2, h * 0.006).toFixed(0)}" fill="${c3}" opacity="0.35"/>`)
    .join('');
  const fs = Math.round(Math.min(w, h) * 0.035);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.45" r="0.8">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${lines}
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <text x="${w / 2}" y="${h - fs * 1.4}" text-anchor="middle" font-family="sans-serif" font-size="${fs}" fill="#f5f1ec" opacity="0.55">${label}</text>
</svg>`;
}

for (const spec of SPECS) {
  const candidates = ['jpg', 'jpeg', 'png', 'webp'].map((e) => resolve(srcDir, `${spec.name}.${e}`));
  const src = candidates.find((p) => existsSync(p));
  for (const w of spec.widths) {
    const h = Math.round(w / spec.ratio);
    let img;
    if (src) {
      img = spec.fit === 'contain'
        ? sharp(src).flatten({ background: '#ffffff' }).resize(w, h, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' })
        : sharp(src).resize(w, h, { fit: 'cover', position: 'attention' });
    } else {
      img = sharp(Buffer.from(placeholderSvg(w, h, spec.label, spec.hue)));
    }
    const base = resolve(outDir, `${spec.name}-${w}`);
    const q = w >= 1600 ? 62 : 68;
    await img.clone().avif({ quality: q - 12, effort: 6 }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: q }).toFile(`${base}.webp`);
    await img.clone().jpeg({ quality: q, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`);
    console.log(`${spec.name}-${w} (${w}x${h}) ${src ? 'original' : 'placeholder'}`);
  }
}

// Logo : images/src/logo.png (logo officiel) sinon le monogramme SVG de substitution.
// Sorties : logo-decoparis-512.png (donnees structurees) et logo-decoparis-header.png (en-tete, 2x).
const logoSrc = ['png', 'jpg', 'svg'].map((e) => resolve(srcDir, `logo.${e}`)).find((p) => existsSync(p)) || resolve(outDir, 'logo-decoparis.svg');
await sharp(logoSrc).flatten({ background: '#ffffff' }).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png({ compressionLevel: 9, palette: true }).toFile(resolve(outDir, 'logo-decoparis-512.png'));
await sharp(logoSrc).flatten({ background: '#ffffff' }).resize({ height: 112, kernel: 'lanczos3' }).png({ compressionLevel: 9, palette: true }).toFile(resolve(outDir, 'logo-decoparis-header.png'));
console.log('logo-decoparis-512.png, logo-decoparis-header.png');
