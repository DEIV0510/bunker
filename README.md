# BUNKERSNEAKERS — tienda web

Tienda de sneakers importados de Bunkersneakers (C.C. Puerto Príncipe, Bogotá).
Sitio estático con [Astro](https://astro.build) + TypeScript sin framework de UI:
HTML ya renderizado para cada página (rápido, indexable y con vista previa al
compartir por WhatsApp) y unos 6 KB comprimidos de JavaScript propio (carrito, buscador,
diálogos), más 1–2 KB en fichas, listados y pedido.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5451  (modo revisión: marca los datos PENDIENTES en rosa)
npm run build      # genera dist/
npm run preview    # sirve dist/ en http://localhost:5452 tal como quedará publicado
npm run check      # tipos + build + enlaces internos rotos
```

Node 22.12 o superior.

## Dónde se edita cada cosa

| Qué | Archivo |
| --- | --- |
| Productos, precios, tallas, colores, fotos, lanzamientos, Selección Bunker | `src/data/productos.json` |
| WhatsApp, ubicación, redes, envíos, pagos, cambios, mayoristas, datos legales, FAQ, fotos de comunidad y reseñas | `src/data/negocio.ts` |
| Tablas de tallas oficiales (Nike, adidas, New Balance, Vans) | `src/data/tallas.ts` |
| Categorías (nombre, descripción, foto de portada) | `src/lib/catalogo.ts` → `categorias` |
| Textos de los mensajes de WhatsApp | `src/lib/whatsapp.ts` |
| Dominio (canonical, Open Graph, sitemap) | `astro.config.mjs` o variable `SITE_URL` |

Reglas del catálogo (`productos.json`):

- `precio`: entero en pesos sin puntos (`285000`) o `null` → se muestra «Precio por confirmar» y no se publica oferta en datos estructurados.
- `tallas`: `null` → la ficha muestra tallas EU de referencia y pide disponibilidad; o una lista
  `[{ "eu": "40", "disponible": true }, { "eu": "41", "disponible": false }]` → las agotadas salen tachadas.
- Una variante (color) puede tener su propio `precio`/`tallas`; si no, hereda las del modelo.
- `lanzamiento: true` → aparece en «Nuevos lanzamientos» con su etiqueta. `seleccion: true` → «Selección Bunker».

## Fotos y marca

```bash
npm run images   # fotos de _material-whatsapp → public/img (AVIF + WebP, cuadradas y completas) + Open Graph por producto
npm run brand    # logotipo → public/marca/*.svg, favicon, íconos, perfil social
npm run fonts    # Anton + Inter recortadas → public/fonts
```

Para agregar una foto: copiarla a `_material-whatsapp/`, registrarla en
`scripts/imagenes.config.mjs` (id, punto focal y texto alternativo), usar el id en
`productos.json` y correr `npm run images`. Si un producto apunta a una foto que no
existe, el build falla a propósito.

El logotipo es propio (letras dibujadas en `scripts/marca-glifos.mjs`): la B es un
búnker cuyas contraformas son troneras; en color, las troneras van en verde ácido.
Versiones listas para usar en `public/marca/` (horizontal, apilada, símbolo,
monocromas y `perfil-social.png` para Instagram/TikTok/WhatsApp).

## Estructura

```
src/
  pages/            rutas: /, /sneakers/, /categoria/*, /marca/*, /producto/*, /carrito/,
                    /guia-de-tallas/, /por-mayor/, /preguntas-frecuentes/, /politicas/*, 404, sitemap, robots
  components/       Header, TopBar, Footer, Dialogos (menú, buscador, carrito), Intro (pantalla de carga),
                    ProductCard, Listado, GuiaTallas, Faq, FormMayor, Logo, Foto, Icono, home/*
  scripts/          app (común), carrito (estado), ficha, listado, pedido, datos
  styles/           tokens, base, componentes, marco, home, paginas
  data/             productos.json, negocio.ts, tallas.ts, media.json/logo.json/fuentes.json (generados)
scripts/            imagenes, marca, fuentes, serve-dist, check-links
docs/               PENDIENTES.md (datos por confirmar) · INTEGRACIONES.md (pagos y servicios)
```

## Compra

El carrito vive en el navegador (localStorage). «Enviar pedido» arma un mensaje de
WhatsApp con productos, tallas, ciudad y medio de pago preferido; la tienda confirma
disponibilidad, envío y pago. No hay cobro en línea: ver `docs/INTEGRACIONES.md`.
