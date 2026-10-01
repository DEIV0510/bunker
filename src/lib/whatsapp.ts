// Enlaces y mensajes de WhatsApp. Se usa en el HTML estático y en el navegador.
// Un solo número comercial: negocio.whatsapp.numero.
import { negocio } from '@/data/negocio';

export const waLink = (texto?: string) =>
  `https://wa.me/${negocio.whatsapp.numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

const cop = (n: number) => `$${Math.round(n).toLocaleString('es-CO').replace(/,/g, '.')}`;

export const msgGeneral = () => 'Hola, quiero asesoría para elegir unos sneakers del Bunker.';

/**
 * Consulta de un producto. Si no hay talla elegida, no se inventa: se pregunta.
 * talla: etiqueta tal como se muestra (p. ej. «EU 42»).
 */
export function msgProducto(nombre: string, color?: string | null, talla?: string | null, precio?: number | null) {
  const modelo = color ? `${nombre} (${color})` : nombre;
  const base = talla
    ? `Hola, quiero consultar la disponibilidad del ${modelo} en talla ${talla}.`
    : `Hola, quiero consultar la disponibilidad del ${modelo}. ¿En qué tallas lo tienen?`;
  return precio ? `${base} Precio en la web: ${cop(precio)}.` : `${base} ¿Me confirmas el precio?`;
}

export function msgTalla(nombre?: string | null) {
  return nombre
    ? `Hola, tengo dudas con mi talla para el ${nombre}. ¿Me ayudas a elegirla?`
    : 'Hola, tengo dudas con mi talla. ¿Me ayudas a elegirla?';
}

export const msgComunidad = () =>
  'Hola, compré en el Bunker y quiero compartir una foto con mis sneakers para la sección de comunidad.';

export interface LineaPedido {
  nombre: string;
  color: string | null;
  talla: string | null;
  cantidad: number;
  precio: number | null;
}

export interface DatosPedido {
  nombre?: string;
  ciudad?: string;
  pago?: string;
  notas?: string;
}

export function msgPedido(lineas: LineaPedido[], datos: DatosPedido = {}) {
  const cuerpo = lineas
    .map((l, i) => {
      const det = [l.color, l.talla ? `Talla ${l.talla}` : 'Talla por confirmar', `Cantidad: ${l.cantidad}`].filter(Boolean).join(' · ');
      const valor = l.precio ? cop(l.precio * l.cantidad) : 'Precio por confirmar';
      return `${i + 1}. ${l.nombre}\n   ${det}\n   ${valor}`;
    })
    .join('\n');
  const conPrecio = lineas.filter((l) => l.precio);
  const subtotal = conPrecio.reduce((s, l) => s + (l.precio ?? 0) * l.cantidad, 0);
  const pendientes = lineas.length - conPrecio.length;
  const totalTxt = subtotal
    ? `\n\nSubtotal: ${cop(subtotal)}${pendientes ? ` + ${pendientes} producto(s) por cotizar` : ''}`
    : '';
  const extra = [
    datos.nombre && `Nombre: ${datos.nombre}`,
    datos.ciudad && `Ciudad: ${datos.ciudad}`,
    datos.pago && `Pago: ${datos.pago}`,
    datos.notas && `Notas: ${datos.notas}`,
  ]
    .filter(Boolean)
    .join('\n');
  return `Hola, quiero hacer este pedido en el Bunker:\n\n${cuerpo}${totalTxt}${extra ? `\n\n${extra}` : ''}\n\n¿Me confirmas disponibilidad, envío y pago?`;
}

export function msgMayor(d: { nombre: string; ciudad: string; cantidad: string; modelos: string }) {
  return [
    'Hola, quiero cotizar al por mayor.',
    '',
    `Nombre: ${d.nombre}`,
    `Ciudad: ${d.ciudad}`,
    `Cantidad aproximada: ${d.cantidad} pares`,
    `Modelos de interés: ${d.modelos || 'Quiero ver opciones'}`,
  ].join('\n');
}
