// Genera la identidad de BUNKERSNEAKERS a partir de las letras de marca-glifos.mjs:
// - src/data/logo.json → trazados que usa el componente <Logo /> (SVG en línea)
// - public/marca/*.svg  → versiones descargables (horizontal, apilada, símbolo)
// - public/favicon.svg, favicon.ico, apple-touch-icon.png, icon-*.png, manifest
// - public/marca/perfil-social.png → avatar 1080×1080 para Instagram/TikTok/WhatsApp
import fs from 'node:fs';
import sharp from 'sharp';
import { word, CAP, GAP } from './marca-glifos.mjs';

const C = { green: '#C6FF00', black: '#0B0B0B', gray: '#858585', grayDark: '#5C5C5C', bone: '#F4F2EC' };
fs.mkdirSync('public/marca', { recursive: true });

// ── Trazados ────────────────────────────────────────────────────────────────
const bunker = word('BUNKER');
const sneakers = word('SNEAKERS', bunker.width + GAP);
const W = sneakers.width + bunker.width + GAP;
const join = (parts) => parts.map((p) => p.d).join('');
const slits = bunker.parts[0].slits.join('');

const symbol = word('B');
const SW = symbol.width;

fs.writeFileSync(
  'src/data/logo.json',
  JSON.stringify(
    {
      w: W,
      h: CAP,
      bunker: join(bunker.parts),
      sneakers: join(sneakers.parts),
      slits,
      symbol: { w: SW, h: CAP, d: join(symbol.parts), slits: symbol.parts[0].slits.join('') },
    },
    null,
    2,
  ) + '\n',
);

// ── SVG descargables ────────────────────────────────────────────────────────
const svg = (w, h, body, title = 'BUNKERSNEAKERS') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img"><title>${title}</title>${body}</svg>\n`;
const path = (d, fill) => `<path fill-rule="evenodd" fill="${fill}" d="${d}"/>`;

function horizontal({ fg, gray, slit, bg }) {
  const pad = bg ? 6 : 0;
  const body =
    (bg ? `<rect width="${W + pad * 2}" height="${CAP + pad * 2}" fill="${bg}"/>` : '') +
    `<g transform="translate(${pad} ${pad})">${path(join(bunker.parts), fg)}${slit ? path(slits, slit) : ''}${path(join(sneakers.parts), gray)}</g>`;
  return svg(W + pad * 2, CAP + pad * 2, body);
}

// Apilada: BUNKER arriba, SNEAKERS abajo escalada al mismo ancho.
function stacked({ fg, gray, slit }) {
  const s2 = word('SNEAKERS');
  const k = bunker.width / s2.width;
  const gap = 4;
  const h = CAP + gap + CAP * k;
  const body =
    path(join(bunker.parts), fg) +
    (slit ? path(slits, slit) : '') +
    `<g transform="translate(0 ${CAP + gap}) scale(${k})">${path(join(s2.parts), gray)}</g>`;
  return svg(bunker.width, h, body);
}

function symbolSvg({ fg, slit, bg, size = 48 }) {
  // Símbolo centrado en un lienzo cuadrado con aire de 25 %.
  const scale = (size * 0.56) / CAP;
  const x = (size - SW * scale) / 2;
  const y = (size - CAP * scale) / 2;
  const body =
    (bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : '') +
    `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(5)})">${path(join(symbol.parts), fg)}${slit ? path(symbol.parts[0].slits.join(''), slit) : ''}</g>`;
  return svg(size, size, body, 'BUNKERSNEAKERS — símbolo');
}

const files = {
  'logo-horizontal-fondo-oscuro.svg': horizontal({ fg: C.bone, gray: C.gray, slit: C.green }),
  'logo-horizontal-fondo-claro.svg': horizontal({ fg: C.black, gray: C.grayDark, slit: C.green }),
  'logo-horizontal-verde.svg': horizontal({ fg: C.black, gray: C.black, bg: C.green }),
  'logo-horizontal-negro.svg': horizontal({ fg: C.black, gray: C.black }),
  'logo-horizontal-blanco.svg': horizontal({ fg: '#FFFFFF', gray: '#FFFFFF' }),
  'logo-apilado-fondo-oscuro.svg': stacked({ fg: C.bone, gray: C.gray, slit: C.green }),
  'logo-apilado-fondo-claro.svg': stacked({ fg: C.black, gray: C.grayDark, slit: C.green }),
  'simbolo-fondo-oscuro.svg': symbolSvg({ fg: C.bone, slit: C.green }),
  'simbolo-negro.svg': symbolSvg({ fg: C.black }),
  'simbolo-verde.svg': symbolSvg({ fg: C.black, bg: C.green }),
};
for (const [name, body] of Object.entries(files)) fs.writeFileSync(`public/marca/${name}`, body);

// ── Favicon e íconos ────────────────────────────────────────────────────────
const tile = (size, k = 0.56) => {
  const scale = (size * k) / CAP;
  const x = (size - SW * scale) / 2;
  const y = (size - CAP * scale) / 2;
  return svg(
    size,
    size,
    `<rect width="${size}" height="${size}" fill="${C.black}"/><g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(5)})">${path(join(symbol.parts), C.bone)}${path(symbol.parts[0].slits.join(''), C.green)}</g>`,
    'BUNKERSNEAKERS',
  );
};

fs.writeFileSync('public/favicon.svg', tile(32, 0.72));
const png = (body, size) => sharp(Buffer.from(body), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const png32 = await png(tile(32, 0.72), 32);
// .ico con un PNG adentro (válido desde Windows Vista y en todos los navegadores actuales)
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6);
ico.writeUInt8(32, 7);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14);
ico.writeUInt32LE(22, 18);
fs.writeFileSync('public/favicon.ico', Buffer.concat([ico, png32]));
fs.writeFileSync('public/apple-touch-icon.png', await png(tile(180, 0.6), 180));
fs.writeFileSync('public/icon-192.png', await png(tile(192, 0.6), 192));
fs.writeFileSync('public/icon-512.png', await png(tile(512, 0.6), 512));
fs.writeFileSync('public/icon-maskable-512.png', await png(tile(512, 0.44), 512));
fs.writeFileSync('public/marca/perfil-social.png', await png(tile(1080, 0.5), 1080));

fs.writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'BUNKERSNEAKERS',
      short_name: 'Bunker',
      lang: 'es-CO',
      start_url: '/',
      display: 'standalone',
      background_color: C.black,
      theme_color: C.black,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);

// Hoja de revisión (no se publica)
fs.mkdirSync('.cache', { recursive: true });
await sharp({ create: { width: 1240, height: 560, channels: 3, background: '#2a2a2a' } })
  .composite([
    { input: await sharp(Buffer.from(files['logo-horizontal-fondo-oscuro.svg']), { density: 400 }).resize({ width: 1200 }).png().toBuffer(), left: 20, top: 20 },
    { input: await sharp(Buffer.from(files['logo-horizontal-fondo-claro.svg']), { density: 400 }).resize({ width: 600 }).flatten({ background: C.bone }).png().toBuffer(), left: 20, top: 160 },
    { input: await sharp(Buffer.from(files['logo-apilado-fondo-oscuro.svg']), { density: 400 }).resize({ width: 260 }).png().toBuffer(), left: 660, top: 160 },
    { input: await sharp(Buffer.from(files['simbolo-verde.svg']), { density: 400 }).resize({ width: 160 }).png().toBuffer(), left: 960, top: 160 },
    { input: await png(tile(180, 0.6), 180), left: 20, top: 360 },
    { input: png32, left: 220, top: 360 },
  ])
  .png()
  .toFile('.cache/marca-revision.png');
console.log(`logo ${W}×${CAP} · símbolo ${SW}×${CAP} · ${Object.keys(files).length} SVG · íconos y manifest listos`);
