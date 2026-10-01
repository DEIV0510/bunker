// Filtros del listado: búsqueda, marca y orden, reflejados en la URL (?q=&marca=&orden=).
import { normalizar } from '@/lib/formato';

const form = document.querySelector<HTMLFormElement>('[data-filtros]');
const grid = document.querySelector<HTMLElement>('[data-grid]');
const count = document.querySelector<HTMLElement>('[data-count]');
const vacio = document.querySelector<HTMLElement>('[data-vacio]');

if (form && grid && count && vacio) {
  const items = [...grid.querySelectorAll<HTMLElement>('.listado__item')];
  const q = form.querySelector<HTMLInputElement>('[name="q"]');
  const marca = form.querySelector<HTMLSelectElement>('[name="marca"]');
  const orden = form.querySelector<HTMLSelectElement>('[name="orden"]');

  // Estado inicial desde la URL (también lo que llega del buscador del header).
  const params = new URLSearchParams(location.search);
  if (q) q.value = params.get('q') ?? '';
  if (marca && params.get('marca')) marca.value = params.get('marca')!;
  if (orden && params.get('orden')) orden.value = params.get('orden')!;

  const aplicar = (escribirURL = true) => {
    const terms = normalizar(q?.value.trim() ?? '').split(/\s+/).filter(Boolean);
    const m = marca?.value ?? '';
    let visibles = 0;
    for (const it of items) {
      const hay = normalizar(`${it.dataset.nombre} ${it.dataset.k}`);
      const ok = (!m || it.dataset.marca === m) && terms.every((t) => hay.includes(t));
      it.hidden = !ok;
      if (ok) visibles++;
    }
    const o = orden?.value ?? '';
    // Los modelos sin precio van siempre al final.
    const precio = (el: HTMLElement, sinPrecio: number) => (el.dataset.precio ? Number(el.dataset.precio) : sinPrecio);
    const sorted = [...items].sort((a, b) => {
      if (o === 'az') return a.dataset.nombre!.localeCompare(b.dataset.nombre!, 'es');
      if (o === 'precio-asc') return precio(a, Infinity) - precio(b, Infinity);
      if (o === 'precio-desc') return precio(b, -1) - precio(a, -1);
      return Number(a.dataset.i) - Number(b.dataset.i);
    });
    grid.append(...sorted);
    count.textContent = `${visibles} ${visibles === 1 ? 'modelo' : 'modelos'}${terms.length ? ` para «${q!.value.trim()}»` : ''}`;
    vacio.hidden = visibles > 0;
    grid.hidden = visibles === 0;
    if (escribirURL) {
      const u = new URL(location.href);
      for (const [k, v] of [['q', q?.value.trim() ?? ''], ['marca', m], ['orden', o]] as const) {
        if (v) u.searchParams.set(k, v);
        else u.searchParams.delete(k);
      }
      history.replaceState(null, '', u);
    }
  };

  let t = 0;
  form.addEventListener('input', (e) => {
    if ((e.target as HTMLElement).matches('[name="q"]')) {
      clearTimeout(t);
      t = window.setTimeout(aplicar, 160);
    } else aplicar();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicar();
  });
  document.querySelector('[data-limpiar]')?.addEventListener('click', () => {
    form.reset();
    aplicar();
    (q ?? marca)?.focus();
  });
  aplicar(false);
}
