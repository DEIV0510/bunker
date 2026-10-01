// Fuentes autoalojadas: Anton (titulares) e Inter variable (texto e interfaz).
// - Recorta cada fuente a los glifos del español que usa el sitio.
// - Inter queda solo con el eje de peso 400–800.
// - Nombre con hash (caché inmutable) en public/fonts/.
// - Genera src/styles/fuentes.css con @font-face + fuentes de respaldo con
//   métricas ajustadas (capsize): al cambiar de fuente no se mueve el diseño.
// - Genera src/data/fuentes.json con las rutas para el <link rel="preload">.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import subsetFont from 'subset-font';
import { createFontStack } from '@capsizecss/core';
import anton from '@capsizecss/metrics/anton';
import inter from '@capsizecss/metrics/inter';
import arial from '@capsizecss/metrics/arial';

const OUT_DIR = 'public/fonts';
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let chars = '';
for (let c = 0x20; c <= 0x7e; c++) chars += String.fromCharCode(c); // ASCII imprimible
for (let c = 0xa0; c <= 0xff; c++) chars += String.fromCharCode(c); // á é í ó ú ñ ü ¿ ¡ « » · ×
chars += [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2022, 0x2192, 0x2190, 0x2191, 0x2193, 0x2116, 0x2212]
  .map((c) => String.fromCharCode(c))
  .join('');

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

async function build(src, base, opts = {}) {
  const input = fs.readFileSync(src);
  const out = await subsetFont(input, chars, { targetFormat: 'woff2', ...opts });
  const name = `${base}.${hash(out)}.woff2`;
  fs.writeFileSync(path.join(OUT_DIR, name), out);
  console.log(`${name}: ${(input.length / 1024).toFixed(1)} KB → ${(out.length / 1024).toFixed(1)} KB`);
  return `/fonts/${name}`;
}

const antonHref = await build('node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2', 'anton');
const interHref = await build('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'inter', {
  variationAxes: { wght: { min: 400, max: 800 } },
});

// Respaldo con métricas de la fuente real: Arial escalada para ocupar lo mismo.
const display = createFontStack([anton, arial], { fontFaceFormat: 'styleString' });
const text = createFontStack([inter, arial], { fontFaceFormat: 'styleString' });

const css = `/* Generado por scripts/fuentes.mjs — no editar a mano. */
@font-face {
  font-family: 'Anton';
  src: url('${antonHref}') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('${interHref}') format('woff2');
  font-weight: 400 800;
  font-style: normal;
  font-display: swap;
}
${display.fontFaces}
${text.fontFaces}
:root {
  --font-display: ${display.fontFamily}, Impact, 'Arial Narrow', sans-serif;
  --font-text: ${text.fontFamily}, system-ui, sans-serif;
}
`;

fs.writeFileSync('src/styles/fuentes.css', css);
fs.writeFileSync('src/data/fuentes.json', JSON.stringify({ anton: antonHref, inter: interHref }, null, 2) + '\n');
console.log('→ src/styles/fuentes.css, src/data/fuentes.json');
