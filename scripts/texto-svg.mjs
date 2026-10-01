// Texto convertido a trazados con la fuente Anton (para imágenes Open Graph):
// así sharp/librsvg no depende de las fuentes instaladas en la máquina.
import * as fontkit from 'fontkit';

const font = fontkit.openSync('node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2');

/** Trazado SVG de una línea de texto. y = línea base. */
export function textPath(str, size, x = 0, y = 0, tracking = 0) {
  const run = font.layout(str);
  const k = size / font.unitsPerEm;
  let cx = 0;
  const ds = [];
  run.glyphs.forEach((g, i) => {
    ds.push(g.path.scale(k, -k).translate(x + cx, y).toSVG());
    cx += run.positions[i].xAdvance * k + tracking;
  });
  return { d: ds.join(''), width: cx - tracking };
}

/** Parte un texto en líneas que quepan en maxWidth (por palabras). */
export function wrap(str, size, maxWidth, tracking = 0) {
  const words = str.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && textPath(next, size, 0, 0, tracking).width > maxWidth) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Altura de mayúsculas de Anton en proporción al tamaño (para alinear bloques). */
export const capHeight = (size) => (font.capHeight / font.unitsPerEm) * size;
