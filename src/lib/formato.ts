// Formato de precios compartido entre el HTML estático y el navegador.
/** $285.000 — mismo formato en todo el sitio. */
export const formatoCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO', { maximumFractionDigits: 0 }).replace(/,/g, '.')}`;

/** Normaliza para buscar sin tildes ni mayúsculas. */
export const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
