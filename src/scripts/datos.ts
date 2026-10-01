// Catálogo mínimo embebido en cada página (#datos-catalogo): buscador y carrito.
import { tallasReferenciaEU } from '@/data/tallas';

export interface DV {
  id: string;
  c: string;
  p: number | null;
  i: string;
  t: [string, 0 | 1][] | null;
}
export interface DP {
  s: string;
  m: string;
  n: string;
  k: string;
  p: number | null;
  v: DV[];
}

let cache: DP[] | null = null;
export function catalogo(): DP[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(document.getElementById('datos-catalogo')?.textContent || '[]') as DP[];
  } catch {
    cache = [];
  }
  return cache;
}

export const buscar = (slug: string) => catalogo().find((p) => p.s === slug);

export function variante(slug: string, id: string) {
  const p = buscar(slug);
  const v = p?.v.find((x) => x.id === id);
  return p && v ? { p, v, precio: v.p ?? p.p ?? null } : null;
}

/** Tallas elegibles: las confirmadas disponibles o, si no hay datos, la referencia EU. */
export function tallasElegibles(v: DV): { lista: string[]; confirmadas: boolean } {
  if (v.t) return { lista: v.t.filter(([, d]) => d).map(([eu]) => eu), confirmadas: true };
  return { lista: tallasReferenciaEU, confirmadas: false };
}

export const etiquetaTalla = (t: string) => (/^\d/.test(t) ? `EU ${t}` : t);
