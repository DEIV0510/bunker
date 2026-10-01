import type { APIRoute } from 'astro';
import { productos, categorias, marcas } from '@/lib/catalogo';

// Solo páginas indexables (sin /carrito/ ni 404).
export const GET: APIRoute = ({ site }) => {
  const rutas = [
    '/',
    '/sneakers/',
    ...categorias.map((c) => `/categoria/${c.slug}/`),
    ...marcas.map((m) => `/marca/${m.slug}/`),
    ...productos.map((p) => `/producto/${p.slug}/`),
    '/guia-de-tallas/',
    '/por-mayor/',
    '/preguntas-frecuentes/',
    '/politicas/envios/',
    '/politicas/cambios/',
    '/politicas/privacidad/',
    '/politicas/terminos/',
  ];
  const base = site ?? new URL('http://localhost:5451');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas
    .map((r) => `  <url><loc>${new URL(r, base).href}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
