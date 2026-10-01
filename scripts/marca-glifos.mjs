// Letras propias del logotipo BUNKERSNEAKERS.
// Retícula: 24 unidades de alto · fustes de 6 · barras de 5 · chaflanes a 45°.
// La B es el símbolo: sus contraformas son dos troneras horizontales (la ranura
// de un búnker). En la versión a color las troneras se rellenan de verde ácido.

export const CAP = 24;
export const GAP = 2.5;

/** Cada glifo: ancho, contorno exterior y contraformas (se recortan con evenodd). */
export const glyphs = {
  B: {
    w: 17,
    outer: 'M0 0H12L16 4V9L14 11L17 14V20L13 24H0Z',
    holes: [
      [6, 5.5, 5.5, 3.5], // tronera superior: x, y, ancho, alto
      [6, 14.5, 6.5, 4.5], // tronera inferior
    ],
  },
  U: { w: 16, outer: 'M0 0H6V19H10V0H16V20L12 24H4L0 20Z' },
  N: { w: 16, outer: 'M0 24V0H6L10 11V0H16V24H10L6 13V24Z' },
  K: { w: 17, outer: 'M0 0H6V9L11 0H17L10.5 12L17 24H11L6 15V24H0Z' },
  E: { w: 15, outer: 'M0 0H15V5H6V9.5H13V14.5H6V19H15V24H0Z' },
  R: { w: 17, outer: 'M0 0H12L16 4V10L13 13L17 24H11L8 14.5H6V24H0Z', holes: [[6, 5, 5, 4.5]] },
  S: { w: 16, outer: 'M16 0V5H6V9.5H12L16 13.5V20L12 24H0V19H10V14.5H4L0 10.5V4L4 0Z' },
  A: { w: 17, outer: 'M0 24V6L6 0H11L17 6V24H11V18H6V24Z', holes: [[6, 7, 5, 6]] },
};

const rect = ([x, y, w, h], dx, dy) => `M${x + dx} ${y + dy}h${w}v${h}h${-w}Z`;

/** Desplaza un trazado absoluto simple (M/H/V/L/Z) en x/y. */
function shift(d, dx, dy) {
  return d.replace(/([MLHV])([^MLHVZ]*)/g, (_, cmd, args) => {
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === 'H') return `H${n[0] + dx}`;
    if (cmd === 'V') return `V${n[0] + dy}`;
    const out = [];
    for (let i = 0; i < n.length; i += 2) out.push(`${n[i] + dx} ${n[i + 1] + dy}`);
    return `${cmd}${out.join(' ')}`;
  });
}

/**
 * Compone una palabra. Devuelve el ancho y, por letra, el trazado (con
 * contraformas en evenodd) y las troneras sueltas (para pintarlas aparte).
 */
export function word(text, x0 = 0, y0 = 0, gap = GAP) {
  let x = x0;
  const parts = [];
  for (const ch of text) {
    const g = glyphs[ch];
    if (!g) throw new Error(`Sin glifo para «${ch}»`);
    const d = shift(g.outer, x, y0) + (g.holes || []).map((h) => rect(h, x, y0)).join('');
    parts.push({ ch, d, slits: ch === 'B' ? g.holes.map((h) => rect(h, x, y0)) : [] });
    x += g.w + gap;
  }
  return { width: x - gap - x0, parts };
}
