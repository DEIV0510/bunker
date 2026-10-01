// Comportamiento común a todas las páginas.
import { carrito, MAX_Q, type Linea } from './carrito';
import { catalogo, variante, tallasElegibles, etiquetaTalla } from './datos';
import { formatoCOP, normalizar } from '@/lib/formato';
import { waLink, msgMayor } from '@/lib/whatsapp';

declare global {
  interface Window {
    __bunker?: boolean;
  }
}
window.__bunker = true;
const html = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

// ── Aviso breve (toast) ─────────────────────────────────────────────────────
let toastTimer = 0;
export function avisar(texto: string) {
  const t = $('[data-toast]');
  if (!t) return;
  t.textContent = texto;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('is-on'), 3200);
}

/** Abre WhatsApp en otra pestaña; si el navegador la bloquea, en esta. */
export function abrirWhatsApp(url: string) {
  const w = window.open(url, '_blank');
  if (w) w.opener = null;
  else location.href = url;
}

// ── Diálogos ────────────────────────────────────────────────────────────────
export function abrir(nombre: string) {
  const d = document.getElementById(`dlg-${nombre}`) as HTMLDialogElement | null;
  if (!d || d.open) return;
  for (const otro of $$<HTMLDialogElement>('dialog[open]')) otro.close();
  d.showModal();
  if (nombre === 'buscar') $<HTMLInputElement>('#buscar-q')?.focus();
}
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const opener = t.closest<HTMLElement>('[data-abrir]');
  if (opener) {
    e.preventDefault();
    abrir(opener.dataset.abrir!);
    return;
  }
  if (t.closest('[data-cerrar]')) {
    t.closest('dialog')?.close();
    return;
  }
  // Clic en el fondo (fuera del contenido del diálogo).
  if (t instanceof HTMLDialogElement && t.open) {
    const r = t.getBoundingClientRect();
    const ev = e as MouseEvent;
    const dentro = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    if (!dentro) t.close();
  }
});
// Al navegar desde un enlace dentro de un diálogo, cerrarlo (vuelta atrás limpia).
for (const d of $$<HTMLDialogElement>('dialog')) {
  d.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href]');
    if (a && !a.hasAttribute('target')) d.close();
  });
}

// ── Contador del carrito y panel ────────────────────────────────────────────
const count = $('[data-cart-count]');
const countLabel = $('[data-cart-label]');
let ultimo = carrito.unidades();
carrito.suscribir(() => {
  const n = carrito.unidades();
  if (count) {
    count.textContent = String(n);
    count.hidden = n === 0;
    if (n > ultimo) {
      count.classList.remove('is-bump');
      void count.offsetWidth;
      count.classList.add('is-bump');
    }
  }
  if (countLabel) countLabel.textContent = n ? `Carrito, ${n} ${n === 1 ? 'par' : 'pares'}` : 'Carrito, vacío';
  ultimo = n;
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function opcionesTalla(l: Linea) {
  const info = variante(l.slug, l.v);
  if (!info) return '';
  const { lista, confirmadas } = tallasElegibles(info.v);
  const set = new Set(lista);
  if (l.talla) set.add(l.talla);
  return [
    `<option value="" ${l.talla ? '' : 'selected'} disabled>Elige talla</option>`,
    ...[...set].map((t) => `<option value="${esc(t)}" ${t === l.talla ? 'selected' : ''}>${esc(etiquetaTalla(t))}${confirmadas ? '' : ''}</option>`),
  ].join('');
}

export function lineaHTML(l: Linea, compacta = true) {
  const info = variante(l.slug, l.v)!;
  const { p, v, precio } = info;
  const href = `/producto/${p.s}/${v.id !== p.v[0].id ? `?color=${v.id}` : ''}`;
  const valor = precio ? `<span class="cart__price">${formatoCOP(precio * l.q)}</span>` : '<span class="cart__price cart__price--tbd">Precio por confirmar</span>';
  return `<li class="cart__line" data-key="${esc(l.key)}">
    <img class="cart__img" src="${esc(v.i)}" width="88" height="88" alt="" loading="lazy" decoding="async">
    <div class="cart__info">
      <p class="cart__name"><a href="${href}">${esc(p.n)}</a></p>
      <p class="cart__var">${esc(v.c)}</p>
      <div class="cart__ctrls">
        <label class="sr-only" for="t-${esc(l.key)}">Talla de ${esc(p.n)}</label>
        <select class="cart__size" id="t-${esc(l.key)}" data-talla>${opcionesTalla(l)}</select>
        <div class="qty" role="group" aria-label="Cantidad de ${esc(p.n)}">
          <button type="button" data-q="-1" ${l.q <= 1 ? 'disabled' : ''} aria-label="Quitar uno"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M5 12h14"/></svg></button>
          <output aria-live="polite">${l.q}</output>
          <button type="button" data-q="1" ${l.q >= MAX_Q ? 'disabled' : ''} aria-label="Agregar uno"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
        ${compacta ? '' : valor}
        <button class="icon-btn cart__rm" type="button" data-rm aria-label="Eliminar ${esc(p.n)} del carrito"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/><path d="M10.5 11v5M13.5 11v5"/></svg></button>
      </div>
      ${compacta ? valor : ''}
      ${l.talla ? '' : '<p class="field__err">Elige la talla para continuar.</p>'}
    </div>
  </li>`;
}

export function resumen(lineas: readonly Linea[]) {
  let subtotal = 0;
  let sinPrecio = 0;
  for (const l of lineas) {
    const info = variante(l.slug, l.v);
    if (info?.precio) subtotal += info.precio * l.q;
    else sinPrecio += l.q;
  }
  return { subtotal, sinPrecio, sinTalla: lineas.filter((l) => !l.talla).length };
}

/** Delegación de eventos para cualquier lista de líneas (panel y página de pedido). */
export function controlarLineas(root: HTMLElement) {
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const li = t.closest<HTMLElement>('[data-key]');
    if (!li) return;
    const key = li.dataset.key!;
    const l = carrito.lineas.find((x) => x.key === key);
    if (!l) return;
    const q = t.closest<HTMLElement>('[data-q]');
    if (q) carrito.cantidad(key, l.q + Number(q.dataset.q));
    if (t.closest('[data-rm]')) {
      carrito.quitar(key);
      avisar('Producto eliminado del carrito');
    }
  });
  root.addEventListener('change', (e) => {
    const s = e.target as HTMLSelectElement;
    if (!s.matches('[data-talla]')) return;
    const key = s.closest<HTMLElement>('[data-key]')!.dataset.key!;
    carrito.talla(key, s.value || null);
  });
}

const cartLines = $('[data-cart-lines]');
if (cartLines) {
  controlarLineas(cartLines);
  carrito.suscribir((lineas) => {
    // Conservar el foco al re-renderizar (controles de cantidad/talla).
    const activo = document.activeElement as HTMLElement | null;
    const focoKey = activo?.closest<HTMLElement>('[data-key]')?.dataset.key;
    const focoSel = activo?.matches('[data-talla]') ? '[data-talla]' : activo?.dataset.q ? `[data-q="${activo.dataset.q}"]` : null;
    cartLines.innerHTML = lineas.map((l) => lineaHTML(l)).join('');
    if (focoKey && focoSel) {
      const li = cartLines.querySelector(`[data-key="${CSS.escape(focoKey)}"]`) ?? cartLines.querySelector('[data-key]');
      (li?.querySelector(focoSel) as HTMLElement | null)?.focus();
    }
    const vacio = lineas.length === 0;
    $('[data-cart-empty]')!.hidden = !vacio;
    $('[data-cart-foot]')!.hidden = vacio;
    const n = carrito.unidades();
    $('[data-cart-head-count]')!.textContent = n ? `(${n})` : '';
    const r = resumen(lineas);
    $('[data-cart-subtotal]')!.textContent = r.subtotal ? formatoCOP(r.subtotal) : 'Por confirmar';
    const pend = $('[data-cart-pending]')!;
    const notas = [
      r.sinPrecio && `${r.sinPrecio} ${r.sinPrecio === 1 ? 'par tiene' : 'pares tienen'} precio por confirmar: te lo damos por WhatsApp.`,
      r.sinTalla && 'Falta elegir la talla en algún producto.',
    ].filter(Boolean);
    pend.hidden = notas.length === 0;
    pend.textContent = notas.join(' ');
  });
}

// ── Buscador ────────────────────────────────────────────────────────────────
const fBuscar = $<HTMLFormElement>('[data-buscar]');
const inBuscar = $<HTMLInputElement>('#buscar-q');
const resBuscar = $('[data-buscar-res]');
const stBuscar = $('[data-buscar-status]');
const sugBuscar = $('[data-buscar-sug]');
function buscarAhora() {
  if (!inBuscar || !resBuscar || !stBuscar || !sugBuscar) return;
  const q = normalizar(inBuscar.value.trim());
  if (!q) {
    resBuscar.innerHTML = '';
    stBuscar.textContent = '';
    sugBuscar.hidden = false;
    return;
  }
  const terms = q.split(/\s+/);
  const hits = catalogo().filter((p) => {
    const hay = normalizar(`${p.n} ${p.k}`);
    return terms.every((t) => hay.includes(t));
  });
  sugBuscar.hidden = hits.length > 0;
  stBuscar.textContent = hits.length
    ? `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}`
    : `Sin resultados para «${inBuscar.value.trim()}». Prueba con la marca, el modelo o el color.`;
  resBuscar.innerHTML = hits
    .slice(0, 8)
    .map((p) => {
      const precio = p.v[0].p ?? p.p;
      return `<li><a href="/producto/${p.s}/"><img src="${esc(p.v[0].i)}" width="56" height="56" alt="" loading="lazy"><span><span class="r-m">${esc(p.m)}</span><span class="r-n">${esc(p.n)}</span></span><span class="r-p">${precio ? formatoCOP(precio) : `${p.v.length} ${p.v.length === 1 ? 'color' : 'colores'}`}</span></a></li>`;
    })
    .join('');
}
inBuscar?.addEventListener('input', buscarAhora);
fBuscar?.addEventListener('submit', (e) => {
  if (!inBuscar?.value.trim()) e.preventDefault();
});

// ── Selección Bunker: cambio de color ───────────────────────────────────────
document.addEventListener('change', (e) => {
  const r = e.target as HTMLInputElement;
  const item = r.closest<HTMLElement>('[data-sel]');
  if (!item || r.type !== 'radio') return;
  for (const img of $$('[data-v]', item)) img.hidden = img.dataset.v !== r.value;
  const color = $('[data-sel-color]', item);
  if (color) color.textContent = r.dataset.color || '';
  for (const a of $$<HTMLAnchorElement>('[data-sel-link], [data-sel-cta]', item)) a.href = r.dataset.href || a.href;
  const precio = $('[data-sel-precio]', item);
  if (precio) {
    const n = Number(r.dataset.precio);
    precio.textContent = n ? formatoCOP(n) : 'Precio por confirmar';
  }
});

// ── Guía de tallas: una tabla a la vez ──────────────────────────────────────
for (const g of $$('[data-tallas]')) {
  const sync = () => {
    const v = $<HTMLInputElement>('input:checked', g)?.value;
    for (const p of $$('[data-tabla]', g)) p.hidden = p.dataset.tabla !== v;
  };
  g.addEventListener('change', sync);
  sync();
}

/**
 * Quita el error de un campo en cuanto se corrige, mientras se escribe (no al
 * perder el foco: eso movía el diseño justo cuando se tocaba el botón siguiente).
 */
export function limpiarError(el: HTMLInputElement) {
  if (!el.required || el.getAttribute('aria-invalid') !== 'true') return;
  const ok = el.checkValidity() && el.value.trim().length >= (el.minLength > 0 ? el.minLength : 1);
  if (!ok) return;
  el.setAttribute('aria-invalid', 'false');
  const err = document.getElementById(`${el.id}-err`);
  if (err) err.hidden = true;
}

// ── Formulario al por mayor → WhatsApp ──────────────────────────────────────
export function validar(form: HTMLFormElement) {
  let primero: HTMLElement | null = null;
  for (const el of $$<HTMLInputElement>('[required]', form)) {
    const ok = el.checkValidity() && el.value.trim().length >= (el.minLength > 0 ? el.minLength : 1);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    const err = document.getElementById(`${el.id}-err`);
    if (err) err.hidden = ok;
    if (!ok && !primero) primero = el;
  }
  (primero as HTMLElement | null)?.focus();
  return !primero;
}
for (const form of $$<HTMLFormElement>('[data-form-mayor]')) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validar(form)) return;
    const d = new FormData(form);
    const url = waLink(
      msgMayor({
        nombre: String(d.get('nombre')).trim(),
        ciudad: String(d.get('ciudad')).trim(),
        cantidad: String(d.get('cantidad')).trim(),
        modelos: String(d.get('modelos') || '').trim(),
      }),
    );
    abrirWhatsApp(url);
    avisar('Abrimos WhatsApp con tu cotización.');
  });
  form.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-pick]');
    if (!b) return;
    const ta = form.querySelector<HTMLTextAreaElement>('textarea[name="modelos"]')!;
    const val = b.dataset.pick!;
    if (!ta.value.includes(val)) ta.value = ta.value.trim() ? `${ta.value.trim()}, ${val}` : val;
    b.setAttribute('aria-pressed', 'true');
  });
  form.addEventListener('input', (e) => limpiarError(e.target as HTMLInputElement));
}

// ── WhatsApp flotante: no tapa los botones del hero ─────────────────────────
const waFloat = $('[data-wa-flotante]');
const heroCtas = $('.hero__ctas');
if (waFloat && heroCtas && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => waFloat.classList.toggle('is-off', e.isIntersecting)).observe(heroCtas);
}

// ── Revelado al hacer scroll ────────────────────────────────────────────────
const reveals = $$('[data-reveal]');
if ('IntersectionObserver' in window && html.classList.contains('mo')) {
  // Escalonado dentro de cada grupo de hermanos.
  for (const el of reveals) {
    const hermanos = [...(el.parentElement?.children ?? [])].filter((x) => x.hasAttribute('data-reveal'));
    const i = hermanos.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`);
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  for (const el of reveals) io.observe(el);
} else {
  for (const el of reveals) el.classList.add('is-in');
}

// La pantalla de carga se controla desde el script en línea de Base.astro.
