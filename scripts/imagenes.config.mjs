// Fotos reales de la carpeta del cliente (_material-whatsapp) → id estable.
// kind:
//   photo  → foto de ambiente; en tarjetas se recorta a cuadrado con su punto focal
//   studio → fondo plano de estudio: se recorta al zapato y se recompone en cuadrado
//            con el mismo color de fondo (sin ampliar)
//   pad    → panel apaisado: se completa a cuadrado con el color de su borde
// rect: recorte previo (paneles de un collage). focus: object-position en tarjetas.
export const SOURCE_DIR = '_material-whatsapp';
const f = (t) => `WhatsApp Image 2026-10-01 at ${t}.jpeg`;

export const WIDTHS = [360, 540, 720, 960, 1200];

export const images = [
  { id: 'af1-triple-white', file: f('10.03.43 AM'), kind: 'photo', focus: '50% 74%', alt: 'Nike Air Force 1 Low blancos colgados de los cordones frente a una reja metálica' },
  { id: 'lv-skate-purple', file: f('10.03.43 AM (1)'), kind: 'studio', alt: 'Louis Vuitton LV Skate Sneaker morado, vista lateral sobre fondo blanco' },
  { id: 'af1-certified-lover-boy', file: f('10.03.43 AM (2)'), kind: 'photo', focus: '50% 40%', alt: 'Detalle de la entresuela del Nike Air Force 1 Certified Lover Boy con la frase Love you forever' },
  { id: 'nb-more-trail-v3', file: f('10.03.44 AM'), kind: 'photo', focus: '50% 60%', alt: 'New Balance Fresh Foam X More Trail v3 verde oliva sobre un tronco en el bosque' },
  { id: 'air-max-portal', file: f('10.03.44 AM (1)'), kind: 'studio', alt: 'Par de Nike Air Max Portal color crema con detalles negros' },
  { id: 'sacai-vaporwaffle', file: f('10.03.44 AM (2)'), kind: 'photo', focus: '45% 55%', alt: 'Nike x sacai VaporWaffle negro y blanco sostenido en la mano' },
  { id: 'vans-knu-skool', file: f('10.03.44 AM (3)'), kind: 'photo', focus: '50% 50%', alt: 'Vans Knu Skool negros con franja blanca dentro de su caja' },
  { id: 'am90-triple-white', file: f('10.03.44 AM (4)'), kind: 'photo', focus: '50% 42%', alt: 'Nike Air Max 90 blancos en cuero puestos sobre el asfalto' },
  { id: 'nocta-glide-triple-black', file: f('10.03.45 AM'), kind: 'photo', focus: '50% 50%', alt: 'Par de Nike NOCTA Glide negro total sobre el pavimento' },
  { id: 'nocta-glide-black-crimson', file: f('10.03.45 AM (1)'), kind: 'photo', focus: '50% 52%', alt: 'Nike NOCTA Glide negro con suela roja sobre cajas de cartón' },
  { id: 'nocta-glide-black-white', file: f('10.03.45 AM (2)'), kind: 'photo', focus: '50% 56%', alt: 'Nike NOCTA Glide negro y blanco con textura de fibra de carbono y suela traslúcida' },
  { id: 'aj1-mid-se', file: f('10.03.45 AM (3)'), kind: 'photo', focus: '50% 62%', alt: 'Varios pares de Air Jordan 1 Mid SE en tonos arena y salmón' },
  { id: 'sb-dunk-parra', file: f('10.03.45 AM (4)'), kind: 'photo', focus: '50% 52%', alt: 'Nike SB Dunk Low x Parra blanco con swoosh bordado rosa, rojo y azul' },
  { id: 'timberland-supreme', file: f('10.03.45 AM (5)'), kind: 'photo', focus: '50% 52%', alt: 'Botas Timberland x Supreme de 6 pulgadas color trigo con relieve de placa diamante' },
  { id: 'superstar-black', file: f('10.03.45 AM (6)'), kind: 'photo', focus: '50% 52%', alt: 'Par de adidas Superstar negros con franjas blancas sobre concreto' },
  { id: 'aj3-valentines-day', file: f('10.03.46 AM'), kind: 'photo', focus: '50% 50%', alt: 'Air Jordan 3 Retro rosa edición San Valentín, vista lateral y trasera' },
  { id: 'aj3-cobalt-bliss', file: f('10.03.46 AM (1)'), kind: 'pad', rect: { left: 0, top: 676, width: 1080, height: 674 }, alt: 'Par de Air Jordan 3 Retro GS White Cobalt Bliss blanco con azul y detalles rosados' },
  { id: 'aj3-cobalt-bliss-talon', file: f('10.03.46 AM (1)'), kind: 'photo', rect: { left: 0, top: 0, width: 540, height: 598 }, focus: '50% 50%', alt: 'Talón del Air Jordan 3 White Cobalt Bliss con el Jumpman rosado y la palabra AIR' },
  { id: 'aj3-cobalt-bliss-suela', file: f('10.03.46 AM (1)'), kind: 'photo', rect: { left: 540, top: 0, width: 540, height: 598 }, focus: '50% 50%', alt: 'Suela del Air Jordan 3 White Cobalt Bliss en azul con talón rosado' },
  { id: 'aj12-flu-game', file: f('10.03.46 AM (2)'), kind: 'photo', focus: '50% 64%', alt: 'Air Jordan 12 Retro Flu Game negro y rojo puestos sobre una base blanca' },
  { id: 'aj12-gamma-blue', file: f('10.03.46 AM (3)'), kind: 'photo', rect: { left: 0, top: 0, width: 597, height: 597 }, focus: '50% 50%', alt: 'Air Jordan 12 Retro Gamma Blue negro y azul sobre su caja, vista lateral' },
  { id: 'aj12-gamma-blue-medial', file: f('10.03.46 AM (3)'), kind: 'photo', rect: { left: 603, top: 0, width: 597, height: 597 }, focus: '50% 50%', alt: 'Air Jordan 12 Retro Gamma Blue, vista lateral interna' },
  { id: 'aj12-gamma-blue-frente', file: f('10.03.46 AM (3)'), kind: 'photo', rect: { left: 0, top: 603, width: 597, height: 597 }, focus: '50% 50%', alt: 'Air Jordan 12 Retro Gamma Blue vistos de frente' },
  { id: 'aj12-gamma-blue-talon', file: f('10.03.46 AM (3)'), kind: 'photo', rect: { left: 603, top: 603, width: 597, height: 597 }, focus: '50% 50%', alt: 'Talones del Air Jordan 12 Retro Gamma Blue con el número 23' },
  { id: 'superstar-azul', file: f('10.03.46 AM (4)'), kind: 'photo', focus: '50% 50%', alt: 'adidas Superstar azul con estampado de tréboles y franjas blancas en la mano' },
];
