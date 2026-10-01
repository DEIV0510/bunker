// Acceso tipado al catálogo (src/data/productos.json) y utilidades de formato.
import data from '@/data/productos.json';
import media from '@/data/media.json';
import { formatoCOP } from '@/lib/formato';

export { formatoCOP };

export interface Talla {
  eu: string;
  disponible: boolean;
}

export interface Variante {
  id: string;
  color: string;
  nota?: string;
  tono: [string, string];
  imagenes: MediaId[];
  precio?: number | null;
  tallas?: Talla[] | null;
}

export interface Producto {
  slug: string;
  marca: string;
  modelo: string;
  categorias: CategoriaSlug[];
  lanzamiento: boolean;
  seleccion: boolean;
  descripcion: string;
  precio: number | null;
  tallas: Talla[] | null;
  variantes: Variante[];
}

export type MediaId = keyof typeof media;
export type CategoriaSlug = 'lanzamientos' | 'clasicos' | 'streetwear' | 'deportivos' | 'botas';

export const productos = data.productos as unknown as Producto[];

// El build falla si una foto referenciada no existe: mejor que una tarjeta rota.
for (const p of productos) {
  for (const v of p.variantes) {
    for (const id of v.imagenes) {
      if (!(id in media)) throw new Error(`productos.json: la foto «${id}» de ${p.slug} no existe en media.json (npm run images)`);
    }
  }
}

export const nombreCompleto = (p: Producto) => {
  // «Air Jordan 3 Retro» ya incluye la marca: no repetir «Jordan Air Jordan».
  const modelo = p.modelo;
  return modelo.toLowerCase().includes(p.marca.toLowerCase()) ? modelo : `${p.marca} ${modelo}`;
};

/** Precio efectivo: el de la variante o, si no tiene, el del modelo. */
export const precioDe = (p: Producto, v?: Variante) => v?.precio ?? p.precio ?? null;
export const tallasDe = (p: Producto, v?: Variante) => v?.tallas ?? p.tallas ?? null;

export const varianteDe = (p: Producto, id?: string | null) => p.variantes.find((v) => v.id === id) ?? p.variantes[0];

export const productoPorSlug = (slug: string) => productos.find((p) => p.slug === slug);

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ── Categorías ──────────────────────────────────────────────────────────────
export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
  corto: string;
  titulo: string;
  descripcion: string;
  portada: MediaId;
}

export const categorias: Categoria[] = [
  {
    slug: 'lanzamientos',
    nombre: 'Nuevos lanzamientos',
    corto: 'Lanzamientos',
    titulo: 'Nuevos lanzamientos de sneakers',
    descripcion: 'Los colorways más recientes que tenemos en el Bunker.',
    portada: 'nocta-glide-black-crimson',
  },
  {
    slug: 'clasicos',
    nombre: 'Sneakers clásicos',
    corto: 'Clásicos',
    titulo: 'Sneakers clásicos: Jordan, Air Force 1, Superstar',
    descripcion: 'Los modelos que nunca salen de la calle: Jordan retro, Air Force 1, Air Max y Superstar.',
    portada: 'aj12-flu-game',
  },
  {
    slug: 'streetwear',
    nombre: 'Streetwear',
    corto: 'Streetwear',
    titulo: 'Sneakers streetwear y colaboraciones',
    descripcion: 'Colaboraciones y siluetas en tendencia: NOCTA, sacai, Parra, Supreme y más.',
    portada: 'nocta-glide-black-white',
  },
  {
    slug: 'deportivos',
    nombre: 'Deportivos',
    corto: 'Deportivos',
    titulo: 'Sneakers deportivos: running, trail y básquet',
    descripcion: 'Modelos con tecnología de rendimiento para trail, running y básquet.',
    portada: 'nb-more-trail-v3',
  },
  {
    slug: 'botas',
    nombre: 'Botas',
    corto: 'Botas',
    titulo: 'Botas urbanas',
    descripcion: 'Botas de 6 pulgadas para la calle y el frío bogotano.',
    portada: 'timberland-supreme',
  },
];

export const enCategoria = (p: Producto, c: CategoriaSlug) => (c === 'lanzamientos' ? p.lanzamiento : p.categorias.includes(c));
export const productosDe = (c: CategoriaSlug) => productos.filter((p) => enCategoria(p, c));

// ── Marcas ──────────────────────────────────────────────────────────────────
export const marcas = [...new Set(productos.map((p) => p.marca))]
  .map((nombre) => ({ nombre, slug: slugify(nombre), cantidad: productos.filter((p) => p.marca === nombre).length }))
  .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre));

export const marcaPorSlug = (slug: string) => marcas.find((m) => m.slug === slug);

/** Número de inventario editorial (N.º 01…) según el orden del catálogo. */
export const numero = (p: Producto) => String(productos.indexOf(p) + 1).padStart(2, '0');

export const urlProducto = (p: Producto, v?: Variante) =>
  `/producto/${p.slug}/${v && v !== p.variantes[0] ? `?color=${v.id}` : ''}`;

/** Relacionados: misma categoría principal, luego misma marca, sin repetir. */
export function relacionados(p: Producto, n = 4) {
  const score = (q: Producto) =>
    (q.categorias.some((c) => p.categorias.includes(c)) ? 2 : 0) + (q.marca === p.marca ? 1 : 0);
  return productos
    .filter((q) => q !== p)
    .map((q) => [q, score(q)] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([q]) => q);
}

/** Datos mínimos para el navegador: buscador, carrito y fichas. */
export function datosCliente() {
  return productos.map((p) => ({
    s: p.slug,
    m: p.marca,
    n: nombreCompleto(p),
    k: [p.marca, p.modelo, ...p.categorias, ...p.variantes.map((v) => v.color)].join(' '),
    p: p.precio,
    v: p.variantes.map((v) => ({
      id: v.id,
      c: v.color,
      p: v.precio ?? null,
      i: (media as unknown as Record<string, { sq: { webp: [string, number][] } }>)[v.imagenes[0]].sq.webp[0][0],
      t: (v.tallas ?? p.tallas)?.map((t) => [t.eu, t.disponible ? 1 : 0] as const) ?? null,
    })),
  }));
}
export type DatosCliente = ReturnType<typeof datosCliente>;
