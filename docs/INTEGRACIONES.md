# Integraciones

## Estado actual

| Función | Estado |
| --- | --- |
| Catálogo, fichas, filtros, buscador | Operativo (estático, sin servidor) |
| Carrito (agregar, talla, cantidad, eliminar, subtotal) | Operativo (localStorage del navegador) |
| Pedido | Operativo **por WhatsApp**: mensaje con productos, tallas, ciudad y medio de pago |
| Cotización al por mayor | Operativo por WhatsApp |
| Pago en línea (Addi, pasarela de tarjetas/PSE) | **No integrado**. No se simula ningún cobro |
| Transferencia | Datos de pago se envían por WhatsApp |
| Contraentrega | Se acuerda por WhatsApp según cobertura |
| Analítica / píxeles | Ninguno instalado (no hay banner de cookies porque no hay cookies) |

## Cómo conectar una pasarela (Addi, Wompi, Mercado Pago…)

Todo el envío del pedido pasa por **una sola función**: `enviarPedido()` en
`src/scripts/pedido.ts`. Para cobrar en línea:

1. Crear una función de servidor (p. ej. `api/orden.ts` en Vercel) que reciba las
   líneas del carrito, **recalcule precios desde `productos.json`** (nunca confiar en
   el precio que manda el navegador) y cree la orden/sesión en la pasarela.
2. Guardar las llaves privadas como variables de entorno del hosting
   (`ADDI_CLIENT_SECRET`, `WOMPI_PRIVATE_KEY`…). **Nunca** en el repositorio ni en el
   código del navegador; solo la llave pública puede ir al front.
3. En `enviarPedido()`, hacer `fetch('/api/orden', …)` y redirigir al checkout que
   devuelva la pasarela. Dejar WhatsApp como alternativa.
4. Manejar la confirmación con el webhook de la pasarela (firma verificada) y una
   página `/pedido/confirmado/`.
5. Cambiar en `negocio.ts` el `estado` del medio de pago a `'activo'` y actualizar
   la FAQ correspondiente.

Para Addi en particular, el comercio debe estar afiliado; Addi entrega credenciales
de sandbox y producción y su propio widget de «paga en cuotas» para la ficha.

## Publicación

Cualquier hosting estático sirve `dist/` (Vercel, Netlify, Cloudflare Pages,
Hostinger). En Vercel: framework Astro, build `npm run build`, salida `dist`,
variable `SITE_URL=https://<dominio>`.
