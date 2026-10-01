// Títulos de página: «Base | BUNKERSNEAKERS Bogotá» y, si no cabe en ~65
// caracteres (lo que muestra Google), se recorta el sufijo antes que el contenido.
export function titulo(base: string, extra?: string) {
  const conExtra = extra ? `${base} ${extra}` : base;
  for (const t of [`${conExtra} | BUNKERSNEAKERS Bogotá`, `${conExtra} | BUNKERSNEAKERS`, `${base} | BUNKERSNEAKERS`]) {
    if (t.length <= 65) return t;
  }
  return `${base} | BUNKERSNEAKERS`;
}
