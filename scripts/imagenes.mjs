// Genera las variantes web de las fotos reales de BUNKERSNEAKERS.
// - full: foto completa (fichas de producto y hero), AVIF + WebP en anchos reales.
// - sq:   versión cuadrada (tarjetas, miniaturas, buscador, carrito): recorte por
//         punto focal, o recomposición sobre su propio fondo en fotos de estudio.
// - Nunca amplía: los anchos mayores al original se descartan.
// - Nombres con hash (caché inmutable) en public/img/.
// - src/data/media.json con los anchos MEDIDOS del archivo final.
// - public/og/*.jpg: imagen para compartir (1200×630) de la portada y de cada modelo.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { images, SOURCE_DIR, WIDTHS } from './imagenes.config.mjs';
import { textPath, wrap, capHeight } from './texto-svg.mjs';

const OUT_DIR = 'public/img';
const OG_DIR = 'public/og';
const MANIFEST = 'src/data/media.json';
const catalog = JSON.parse(fs.readFileSync('src/data/productos.json', 'utf8')).productos;
const logo = JSON.parse(fs.readFileSync('src/data/logo.json', 'utf8'));

for (const d of [OUT_DIR, OG_DIR]) {
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}
fs.mkdirSync('.cache', { recursive: true });

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

async function write(pipeline, name, ext, opts) {
  const buf = await pipeline.clone()[ext](opts).toBuffer();
  const file = `${name}.${hash(buf)}.${ext}`;
  fs.writeFileSync(path.join(OUT_DIR, file), buf);
  const meta = await sharp(buf).metadata();
  return { url: `/img/${file}`, w: meta.width, h: meta.height, bytes: buf.length };
}

/** Color medio del borde (8 px) de una imagen: fondo de estudio o de panel. */
async function edgeColor(buf) {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (y > 8 && y < info.height - 9 && x > 8 && x < info.width - 9) continue;
      const i = (y * info.width + x) * 3;
      sum[0] += data[i];
      sum[1] += data[i + 1];
      sum[2] += data[i + 2];
      n++;
    }
  }
  const [r, g, b] = sum.map((s) => Math.round(s / n));
  return { r, g, b };
}

const hex = ({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

async function master(entry) {
  let img = sharp(path.join(SOURCE_DIR, entry.file)).rotate().removeAlpha();
  if (entry.rect) img = sharp(await img.extract(entry.rect).png().toBuffer());
  const buf = await img.png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

/** Cuadrado sin ampliar: recorte por foco, recomposición de estudio o relleno de panel. */
async function square(entry, m) {
  if (entry.kind === 'studio') {
    const bg = await edgeColor(m.buf);
    const trimmed = await sharp(m.buf).trim({ background: bg, threshold: 18 }).png().toBuffer();
    const t = await sharp(trimmed).metadata();
    // El zapato ocupa ~84 % del ancho; el lienzo nunca supera el original.
    const side = Math.min(Math.max(m.width, m.height), Math.round(Math.max(t.width / 0.84, t.height / 0.7)));
    const left = Math.round((side - t.width) / 2);
    const top = Math.round((side - t.height) / 2 + side * 0.04);
    const buf = await sharp({ create: { width: side, height: side, channels: 3, background: bg } })
      .composite([{ input: trimmed, left, top }])
      .png()
      .toBuffer();
    return { buf, side, bg: hex(bg), recomposed: true };
  }
  if (entry.kind === 'pad') {
    const bg = await edgeColor(m.buf);
    const side = Math.max(m.width, m.height);
    const buf = await sharp(m.buf)
      .extend({
        top: Math.floor((side - m.height) / 2),
        bottom: Math.ceil((side - m.height) / 2),
        left: Math.floor((side - m.width) / 2),
        right: Math.ceil((side - m.width) / 2),
        background: bg,
      })
      .png()
      .toBuffer();
    return { buf, side, bg: hex(bg) };
  }
  const side = Math.min(m.width, m.height);
  const [fx, fy] = (entry.focus || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
  const left = Math.round((m.width - side) * fx);
  const top = Math.round((m.height - side) * fy);
  const buf = await sharp(m.buf).extract({ left, top, width: side, height: side }).png().toBuffer();
  return { buf, side, bg: hex(await edgeColor(buf)) };
}

async function variants(buf, baseW, name, widths) {
  const base = sharp(buf);
  const targets = [...new Set([...widths.filter((w) => w < baseW - 40), baseW])].sort((a, b) => a - b);
  const avif = [];
  const webp = [];
  let bytes = 0;
  for (const w of targets) {
    const resized = w === baseW ? base.clone() : base.clone().resize({ width: w, kernel: 'lanczos3' }).sharpen({ sigma: 0.5 });
    const a = await write(resized, `${name}-${w}`, 'avif', { quality: 56, effort: 6 });
    const b = await write(resized, `${name}-${w}`, 'webp', { quality: 80, effort: 5 });
    avif.push([a.url, a.w]);
    webp.push([b.url, b.w]);
    bytes += a.bytes;
  }
  return { avif, webp, bytes };
}

const manifest = {};
const sqBuffers = {};
let totalAvif = 0;

for (const entry of images) {
  const m = await master(entry);
  const sq = await square(entry, m);
  sqBuffers[entry.id] = sq.buf;

  // En estudio la foto completa ES la recomposición (más aire, sin cielo vacío).
  const fullBuf = sq.recomposed ? sq.buf : m.buf;
  const fullMeta = await sharp(fullBuf).metadata();
  const full = await variants(fullBuf, fullMeta.width, `${entry.id}`, WIDTHS);
  const sqv = sq.recomposed
    ? { avif: full.avif.filter(([, w]) => w <= 960), webp: full.webp.filter(([, w]) => w <= 960), bytes: 0 }
    : await variants(sq.buf, sq.side, `${entry.id}-sq`, [360, 540, 720]);
  totalAvif += full.bytes + sqv.bytes;

  manifest[entry.id] = {
    alt: entry.alt,
    kind: entry.kind,
    bg: sq.bg,
    full: { w: fullMeta.width, h: fullMeta.height, avif: full.avif, webp: full.webp },
    sq: { s: sq.recomposed ? fullMeta.width : sq.side, avif: sqv.avif, webp: sqv.webp },
  };
  console.log(entry.id.padEnd(28), `${fullMeta.width}x${fullMeta.height}`.padEnd(10), `sq ${sq.side}`.padEnd(8), full.avif.map(([, w]) => w).join('/'));
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${images.length} fotos · AVIF total ${(totalAvif / 1024).toFixed(0)} KB`);

// ── Open Graph 1200×630 ────────────────────────────────────────────────────
const BONE = '#F4F2EC';
const GRAY = '#9A9A9A';
const GREEN = '#C6FF00';

async function og(file, { kicker, title, sub, photo }) {
  const W = 1200;
  const H = 630;
  const L = 64;
  const textW = 470;
  const logoScale = 1.45;
  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="#0B0B0B"/>`);
  parts.push(
    `<g transform="translate(${L} 60) scale(${logoScale})"><path fill-rule="evenodd" fill="${BONE}" d="${logo.bunker}"/><path fill="${GREEN}" d="${logo.slits}"/><path fill-rule="evenodd" fill="#858585" d="${logo.sneakers}"/></g>`,
  );
  let size = 76;
  let lines = wrap(title.toUpperCase(), size, textW);
  while (lines.length > 3 && size > 48) {
    size -= 6;
    lines = wrap(title.toUpperCase(), size, textW);
  }
  const lh = size * 1.02;
  const blockH = (lines.length - 1) * lh + capHeight(size);
  let y = 330 - blockH / 2 + capHeight(size);
  const k = textPath(kicker.toUpperCase(), 26, L, y - capHeight(size) - 26, 1.5);
  parts.push(`<path fill="${GREEN}" d="${k.d}"/>`);
  for (const line of lines) {
    parts.push(`<path fill="${BONE}" d="${textPath(line, size, L, y).d}"/>`);
    y += lh;
  }
  if (sub) parts.push(`<path fill="${GRAY}" d="${textPath(sub.toUpperCase(), 26, L, y - lh + 50, 1).d}"/>`);
  parts.push(`<rect x="${L}" y="${H - 72}" width="40" height="6" fill="${GREEN}"/>`);
  parts.push(`<path fill="${GRAY}" d="${textPath('BOGOTÁ · C.C. PUERTO PRÍNCIPE', 22, L + 56, H - 62, 1.5).d}"/>`);
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('')}</svg>`);
  const side = 630;
  const pic = await sharp(photo).resize(side, side, { fit: 'cover' }).toBuffer();
  await sharp(svg)
    .composite([{ input: pic, left: W - side, top: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OG_DIR, file));
}

await og('portada.jpg', {
  kicker: 'Sneakers importados',
  title: 'Sneaker culture desde el Bunker',
  sub: 'Jordan · Nike · adidas · New Balance · Vans',
  photo: sqBuffers['af1-triple-white'],
});
for (const p of catalog) {
  const v = p.variantes[0];
  await og(`${p.slug}.jpg`, {
    kicker: p.marca,
    title: p.modelo.replace(/[«»]/g, ''),
    sub: p.variantes.length > 1 ? `${p.variantes.length} colores` : v.color,
    photo: sqBuffers[v.imagenes[0]],
  });
}
console.log(`Open Graph: ${catalog.length + 1} imágenes → ${OG_DIR}`);

// Hoja de contacto de los recortes cuadrados (revisión, no se publica)
const T = 180;
const cols = 7;
const tiles = await Promise.all(
  images.map(async (e) => ({ input: await sharp(sqBuffers[e.id]).resize(T, T).png().toBuffer(), id: e.id })),
);
const rows = Math.ceil(tiles.length / cols);
const comp = [];
tiles.forEach((t, i) => {
  const x = (i % cols) * (T + 8) + 8;
  const y = Math.floor(i / cols) * (T + 26) + 8;
  comp.push({ input: t.input, left: x, top: y });
  comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="16"><text x="0" y="12" font-family="Arial" font-size="11" fill="#fff">${t.id}</text></svg>`), left: x, top: y + T + 4 });
});
await sharp({ create: { width: cols * (T + 8) + 8, height: rows * (T + 26) + 8, channels: 3, background: '#333' } })
  .composite(comp)
  .png()
  .toFile('.cache/recortes.png');
console.log('Hoja de contacto → .cache/recortes.png');
