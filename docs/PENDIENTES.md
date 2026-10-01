# Información comercial por confirmar

Nada de esto se inventó: mientras falte, el sitio lo omite o remite a WhatsApp.
En `npm run dev` cada dato pendiente aparece marcado en rosa («PENDIENTE: …»).

## Catálogo (`src/data/productos.json`)

- [ ] **Precios** de los 15 modelos (hoy todos en `null` → «Precio por confirmar»).
- [ ] **Tallas disponibles** por modelo/color (hoy en `null` → tallas EU de referencia + consulta).
- [ ] **Nombres de modelo y colorway**: se identificaron a partir de las fotos. Confirmar en especial
      las colaboraciones (NOCTA, sacai, Parra, Supreme, Louis Vuitton) y los nombres de color
      «Valentine's Day», «White / Cobalt Bliss» (GS), «Gamma Blue», «Flu Game», «Sail / Black».
- [ ] **Cuáles son lanzamientos** (`lanzamiento: true`): hoy marcados NOCTA Glide, Air Jordan 3 y
      Air Max Portal por ser siluetas/colores recientes.
- [ ] **Selección Bunker** (`seleccion: true`): hoy Jordan 12, Superstar, sacai VaporWaffle y Parra Dunk.
- [ ] **Derechos de las fotos**: varias imágenes de la carpeta parecen material de prensa o de las
      marcas (fondo de estudio, gráficas con texto). Confirmar que se pueden usar o reemplazarlas
      por fotos propias del local.
- [ ] Más fotos por producto (hoy 1 por color, salvo Jordan 12 Gamma Blue y Jordan 3 Cobalt Bliss).

## Negocio (`src/data/negocio.ts`)

- [ ] **Local / piso** dentro del C.C. Puerto Príncipe y **horario**.
- [ ] **Instagram / TikTok** oficiales (URL confirmada). Sin URL no se muestra ningún enlace.
- [ ] **Envíos**: condiciones del envío gratis en Bogotá, tarifas y tiempos al resto del país.
- [ ] **Contraentrega**: ciudades / transportadora con cobertura.
- [ ] **Addi**: si está activo y cómo se solicita (hoy «pregunta si aplica»).
- [ ] **Política de cambios**: plazo, estado del producto, quién paga el envío.
- [ ] **Mayoristas**: mínimo de pares, descuentos o condiciones (hoy no se publica ninguno).
- [ ] **Datos legales**: razón social, NIT, correo de contacto.
- [ ] **Fotos de clientes y reseñas verificadas** para «Bunker en la calle» (`comunidad`, `resenas`).
- [ ] Respuestas de FAQ marcadas `confirmada: false` (pagos, Addi, envíos, contraentrega, cambios).

## Sitio

- [ ] **Dominio definitivo** → `SITE_URL` (hoy provisional: `https://bunkersneakers.vercel.app`).
- [ ] Revisión legal de `/politicas/*` antes de publicar (privacidad Ley 1581/2012, retracto Ley 1480/2011).
- [ ] La frase «no es una tienda oficial de esas marcas» de Términos: confirmar que aplica.
