// Carrito: estado en memoria + localStorage, sincronizado entre pestañas.
// Se guarda solo la referencia (modelo, color, talla, cantidad); nombre, foto y
// precio se leen siempre del catálogo actual, así nunca quedan desactualizados.
import { variante } from './datos';

export interface Linea {
  key: string;
  slug: string;
  v: string;
  talla: string | null;
  q: number;
}

const KEY = 'bunker:carrito:v1';
export const MAX_Q = 10;
type Listener = (lineas: readonly Linea[]) => void;

const esLinea = (x: unknown): x is Linea => {
  const l = x as Linea;
  return !!l && typeof l.slug === 'string' && typeof l.v === 'string' && Number.isInteger(l.q) && l.q > 0;
};

export const claveDe = (slug: string, v: string, talla: string | null) => `${slug}|${v}|${talla ?? '-'}`;

function leer(): Linea[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    // Solo líneas que existen en el catálogo actual.
    return arr.filter(esLinea).filter((l) => variante(l.slug, l.v)).map((l) => ({ ...l, key: claveDe(l.slug, l.v, l.talla) }));
  } catch {
    return [];
  }
}

let lineas: Linea[] = leer();
const subs = new Set<Listener>();

function guardar() {
  try {
    localStorage.setItem(KEY, JSON.stringify(lineas));
  } catch {
    /* modo privado o sin espacio: el carrito sigue en memoria */
  }
  for (const fn of subs) fn(lineas);
}

/** Une líneas repetidas (misma clave) sumando cantidades. */
function unir(arr: Linea[]) {
  const map = new Map<string, Linea>();
  for (const l of arr) {
    const prev = map.get(l.key);
    map.set(l.key, prev ? { ...prev, q: Math.min(prev.q + l.q, MAX_Q) } : l);
  }
  return [...map.values()];
}

export const carrito = {
  get lineas(): readonly Linea[] {
    return lineas;
  },
  unidades: () => lineas.reduce((n, l) => n + l.q, 0),
  agregar(slug: string, v: string, talla: string | null, q = 1) {
    const key = claveDe(slug, v, talla);
    lineas = unir([...lineas, { key, slug, v, talla, q: Math.min(Math.max(1, q), MAX_Q) }]);
    guardar();
  },
  cantidad(key: string, q: number) {
    lineas = q <= 0 ? lineas.filter((l) => l.key !== key) : lineas.map((l) => (l.key === key ? { ...l, q: Math.min(q, MAX_Q) } : l));
    guardar();
  },
  talla(key: string, talla: string | null) {
    lineas = unir(lineas.map((l) => (l.key === key ? { ...l, talla, key: claveDe(l.slug, l.v, talla) } : l)));
    guardar();
  },
  quitar(key: string) {
    lineas = lineas.filter((l) => l.key !== key);
    guardar();
  },
  vaciar() {
    lineas = [];
    guardar();
  },
  suscribir(fn: Listener) {
    subs.add(fn);
    fn(lineas);
    return () => subs.delete(fn);
  },
};

window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  lineas = leer();
  for (const fn of subs) fn(lineas);
});
