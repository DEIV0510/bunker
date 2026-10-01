// Ficha de producto: color, talla, cantidad, carrito, WhatsApp y barra fija móvil.
import { carrito, MAX_Q } from './carrito';
import { etiquetaTalla } from './datos';
import { abrir, avisar } from './app';
import { formatoCOP } from '@/lib/formato';
import { waLink, msgProducto } from '@/lib/whatsapp';

interface Datos {
  slug: string;
  nombre: string;
  variantes: { id: string; color: string; precio: number | null; nota: string; url: string }[];
}

const root = document.querySelector<HTMLElement>('[data-ficha]');
const datos = JSON.parse(document.getElementById('ficha-datos')?.textContent || 'null') as Datos | null;

if (root && datos) {
  const raiz: HTMLElement = root;
  const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
  const form = $<HTMLFormElement>('[data-compra]', raiz)!;
  const err = $('[data-f-err]', raiz)!;
  const qtyOut = $('[data-f-qty]', raiz)!;
  const barra = $('[data-barra]');

  const params = new URLSearchParams(location.search);
  let v = datos.variantes.find((x) => x.id === params.get('color')) ?? datos.variantes[0];
  let qty = 1;

  const tallaActual = () => $<HTMLInputElement>(`[data-tallas-v="${v.id}"] input:checked`, raiz)?.value ?? null;

  function pintarWA() {
    const t = tallaActual();
    const href = waLink(msgProducto(datos!.nombre, v.color, t ? etiquetaTalla(t) : null, v.precio));
    for (const a of $$<HTMLAnchorElement>('[data-f-wa]')) a.href = href;
  }

  function pintarTalla() {
    const t = tallaActual();
    for (const s of $$('[data-f-talla-sel]', raiz)) s.textContent = t ? `· ${etiquetaTalla(t)}` : '';
    if (t) err.hidden = true;
    pintarWA();
  }

  function cambiarVariante(id: string, escribirURL = true) {
    const nueva = datos!.variantes.find((x) => x.id === id);
    if (!nueva) return;
    const tPrev = tallaActual();
    v = nueva;
    for (const g of $$('[data-gal]', raiz)) {
      const on = g.dataset.gal === v.id;
      g.hidden = !on;
      // En un carrusel horizontal la carga diferida no trae las fotos laterales.
      if (on) for (const img of $$<HTMLImageElement>('img', g)) img.loading = 'eager';
    }
    for (const f of $$('[data-tallas-v]', raiz)) f.hidden = f.dataset.tallasV !== v.id;
    // Conservar la talla si existe en el nuevo color.
    if (tPrev) {
      const inp = $<HTMLInputElement>(`[data-tallas-v="${v.id}"] input[value="${CSS.escape(tPrev)}"]:not(:disabled)`, raiz);
      if (inp) inp.checked = true;
    }
    for (const el of $$('[data-f-color], [data-f-color2]', raiz)) el.textContent = v.color;
    const nota = $('[data-f-nota]', raiz)!;
    nota.textContent = v.nota;
    nota.hidden = !v.nota;
    const precio = $('[data-f-precio]', raiz)!;
    precio.textContent = v.precio ? formatoCOP(v.precio) : 'Precio por confirmar';
    precio.classList.toggle('ficha__precio--tbd', !v.precio);
    $('[data-f-precio-nota]', raiz)!.hidden = !!v.precio;
    const bp = $('[data-b-precio]');
    if (bp) bp.textContent = precio.textContent;
    const bimg = $<HTMLImageElement>('[data-b-img]');
    const thumb = $<HTMLImageElement>(`input[name="color"][value="${v.id}"] ~ img`, raiz);
    if (bimg && thumb) bimg.src = thumb.src;
    const radio = $<HTMLInputElement>(`input[name="color"][value="${v.id}"]`, raiz);
    if (radio) radio.checked = true;
    if (escribirURL) {
      const u = new URL(location.href);
      if (v === datos!.variantes[0]) u.searchParams.delete('color');
      else u.searchParams.set('color', v.id);
      history.replaceState(null, '', u);
    }
    pintarTalla();
  }

  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'color') cambiarVariante(t.value);
    else if (t.name.startsWith('talla-')) pintarTalla();
  });

  // Cantidad
  function pintarQty() {
    qtyOut.textContent = String(qty);
    $<HTMLButtonElement>('[data-qty="-1"]', raiz)!.disabled = qty <= 1;
    $<HTMLButtonElement>('[data-qty="1"]', raiz)!.disabled = qty >= MAX_Q;
  }
  raiz.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-qty]');
    if (!b) return;
    qty = Math.min(MAX_Q, Math.max(1, qty + Number(b.dataset.qty)));
    pintarQty();
  });

  function pedirTalla() {
    err.hidden = false;
    const primera = $<HTMLInputElement>(`[data-tallas-v="${v.id}"] input:not(:disabled)`, raiz);
    primera?.closest('fieldset')?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    primera?.focus({ preventScroll: true });
  }

  function agregar() {
    const t = tallaActual();
    if (!t) {
      pedirTalla();
      return;
    }
    carrito.agregar(datos!.slug, v.id, t, qty);
    avisar(`Agregado: ${datos!.nombre} · ${etiquetaTalla(t)}`);
    abrir('carrito');
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    agregar();
  });
  $('[data-b-add]')?.addEventListener('click', agregar);

  // Galería: miniaturas ↔ carrusel con scroll-snap
  for (const g of $$('[data-gal]', raiz)) {
    const track = $('[data-gal-track]', g)!;
    const thumbs = $$<HTMLButtonElement>('[data-ir]', g);
    const counter = $('[data-gal-count]', g);
    if (!thumbs.length) continue;
    const marcar = (i: number) => {
      thumbs.forEach((t, k) => (k === i ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
      if (counter) counter.textContent = `${i + 1}/${thumbs.length}`;
    };
    for (const t of thumbs) {
      t.addEventListener('click', () => {
        const i = Number(t.dataset.ir);
        track.scrollTo({ left: track.clientWidth * i, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        marcar(i);
      });
    }
    let raf = 0;
    track.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => marcar(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      },
      { passive: true },
    );
  }

  // Barra fija inferior (móvil): aparece cuando los botones principales salen
  // de pantalla por arriba y se oculta al llegar al pie (no tapa avisos legales).
  const ctas = $('[data-f-ctas]', raiz);
  const pie = $('.ftr');
  // Se mide en el scroll (no con IntersectionObserver): un salto de scroll de
  // «abajo del todo» a «ya pasé los botones» no cambia la intersección y el
  // observer no avisaría.
  if (barra && ctas && pie) {
    let on = false;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const pasado = ctas.getBoundingClientRect().bottom < 0;
      const enPie = pie.getBoundingClientRect().top < innerHeight;
      const next = pasado && !enPie;
      if (next === on) return;
      on = next;
      barra.classList.toggle('is-on', on);
      barra.toggleAttribute('inert', !on);
      barra.setAttribute('aria-hidden', on ? 'false' : 'true');
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir, { passive: true });
    medir();
  }

  if (v !== datos.variantes[0]) cambiarVariante(v.id, false);
  pintarQty();
  pintarTalla();
}
