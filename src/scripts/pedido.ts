// Página de pedido: líneas editables + datos → mensaje de WhatsApp.
// Punto de extensión para pasarelas: ver docs/INTEGRACIONES.md (enviarPedido).
import { carrito } from './carrito';
import { variante, etiquetaTalla } from './datos';
import { lineaHTML, controlarLineas, resumen, validar, limpiarError, abrirWhatsApp, avisar } from './app';
import { formatoCOP } from '@/lib/formato';
import { waLink, msgPedido, type LineaPedido, type DatosPedido } from '@/lib/whatsapp';

const lista = document.querySelector<HTMLElement>('[data-p-lineas]');
const form = document.querySelector<HTMLFormElement>('[data-p-form]');

/**
 * Envía el pedido. Hoy: WhatsApp. Cuando exista una pasarela (Addi, Wompi…),
 * este es el único lugar a cambiar: crear la orden en el servidor y redirigir.
 */
function enviarPedido(lineas: LineaPedido[], datos: DatosPedido) {
  const url = waLink(msgPedido(lineas, datos));
  abrirWhatsApp(url);
  return url;
}

if (lista && form) {
  const vacio = document.querySelector<HTMLElement>('[data-p-vacio]')!;
  const lleno = document.querySelector<HTMLElement>('[data-p-lleno]')!;
  const sub = document.querySelector<HTMLElement>('[data-p-subtotal]')!;
  const nota = document.querySelector<HTMLElement>('[data-p-nota]')!;
  const err = document.querySelector<HTMLElement>('[data-p-err]')!;
  const ok = document.querySelector<HTMLElement>('[data-p-ok]')!;
  let ultimaURL = '';

  controlarLineas(lista);
  carrito.suscribir((lineas) => {
    const activo = document.activeElement as HTMLElement | null;
    const focoKey = activo?.closest<HTMLElement>('[data-key]')?.dataset.key;
    const focoSel = activo?.matches('[data-talla]') ? '[data-talla]' : activo?.dataset.q ? `[data-q="${activo.dataset.q}"]` : null;
    lista.innerHTML = lineas.map((l) => lineaHTML(l, false)).join('');
    if (focoKey && focoSel) {
      const li = lista.querySelector(`[data-key="${CSS.escape(focoKey)}"]`) ?? lista.querySelector('[data-key]');
      (li?.querySelector(focoSel) as HTMLElement | null)?.focus();
    }
    vacio.hidden = lineas.length > 0;
    lleno.hidden = lineas.length === 0;
    const r = resumen(lineas);
    sub.textContent = r.subtotal ? formatoCOP(r.subtotal) : 'Por confirmar';
    const notas = [
      r.sinPrecio && `${r.sinPrecio} ${r.sinPrecio === 1 ? 'par tiene' : 'pares tienen'} precio por confirmar.`,
      r.sinTalla && 'Elige la talla de cada producto.',
    ].filter(Boolean);
    nota.hidden = !notas.length;
    nota.textContent = notas.join(' ');
  });

  form.addEventListener('input', (e) => limpiarError(e.target as HTMLInputElement));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.hidden = true;
    const lineas = carrito.lineas;
    if (!lineas.length) return;
    if (lineas.some((l) => !l.talla)) {
      err.textContent = 'Falta la talla en algún producto: elígela en la lista.';
      err.hidden = false;
      lista.querySelector<HTMLSelectElement>('[data-key] select:invalid, [data-key] select')?.focus();
      return;
    }
    if (!validar(form)) return;
    const d = new FormData(form);
    const pedido: LineaPedido[] = lineas.map((l) => {
      const info = variante(l.slug, l.v)!;
      return { nombre: info.p.n, color: info.v.c, talla: l.talla ? etiquetaTalla(l.talla) : null, cantidad: l.q, precio: info.precio };
    });
    ultimaURL = enviarPedido(pedido, {
      nombre: String(d.get('nombre')).trim(),
      ciudad: String(d.get('ciudad')).trim(),
      pago: String(d.get('pago') || ''),
      notas: String(d.get('notas') || '').trim(),
    });
    form.hidden = true;
    ok.hidden = false;
    ok.focus();
  });

  document.querySelector('[data-p-reabrir]')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (ultimaURL) location.href = ultimaURL;
  });
  document.querySelector('[data-p-vaciar]')?.addEventListener('click', () => {
    carrito.vaciar();
    avisar('Carrito vacío. ¡Gracias por tu pedido!');
    form.hidden = false;
    ok.hidden = true;
  });
}
