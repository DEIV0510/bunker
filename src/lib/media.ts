// Datos de imagen listos para <picture>: anchos medidos del archivo real.
import media from '@/data/media.json';
import type { MediaId } from '@/lib/catalogo';

type Set = [string, number][];
interface Version {
  avif: Set;
  webp: Set;
}
interface Entry {
  alt: string;
  kind: 'photo' | 'studio' | 'pad';
  bg: string;
  full: Version & { w: number; h: number };
  sq: Version & { s: number };
}

export const getMedia = (id: MediaId) => (media as unknown as Record<string, Entry>)[id];

const srcset = (set: Set) => set.map(([url, w]) => `${url} ${w}w`).join(', ');

export function pictureData(id: MediaId, version: 'full' | 'sq') {
  const m = getMedia(id);
  const v = m[version];
  const w = version === 'full' ? m.full.w : m.sq.s;
  const h = version === 'full' ? m.full.h : m.sq.s;
  // Respaldo: la WebP de ~720 px (o la mayor si no llega).
  const fallback = v.webp.find(([, ww]) => ww >= 700)?.[0] ?? v.webp[v.webp.length - 1][0];
  return { avif: srcset(v.avif), webp: srcset(v.webp), src: fallback, width: w, height: h, alt: m.alt, bg: m.bg, kind: m.kind };
}

/** Miniatura cuadrada pequeña (≈360 px). */
export const thumb = (id: MediaId) => getMedia(id).sq.webp[0][0];
