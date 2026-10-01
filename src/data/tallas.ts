// Tablas de tallas OFICIALES de cada marca, copiadas de sus guías el 2026-10-01.
// Cada marca usa su propia equivalencia: no existe una tabla universal.
// cm = largo del pie medido (talón a dedo más largo), salvo donde se indica.

export interface TablaTallas {
  id: string;
  titulo: string;
  fuente: string;
  url: string;
  columnas: string[];
  filas: (string | number)[][];
  nota?: string;
}

export const tablas: TablaTallas[] = [
  {
    id: 'nike-hombre',
    titulo: 'Nike · Jordan — hombre',
    fuente: 'nike.com',
    url: 'https://www.nike.com/size-fit/mens-footwear',
    columnas: ['US', 'UK', 'EU', 'Pie (cm)'],
    filas: [
      ['6', '5.5', '38.5', '23.7'],
      ['6.5', '6', '39', '24.1'],
      ['7', '6', '40', '24.5'],
      ['7.5', '6.5', '40.5', '25'],
      ['8', '7', '41', '25.4'],
      ['8.5', '7.5', '42', '25.8'],
      ['9', '8', '42.5', '26.2'],
      ['9.5', '8.5', '43', '26.7'],
      ['10', '9', '44', '27.1'],
      ['10.5', '9.5', '44.5', '27.5'],
      ['11', '10', '45', '27.9'],
      ['11.5', '10.5', '45.5', '28.3'],
      ['12', '11', '46', '28.8'],
    ],
    nota: 'La talla en cm que trae la caja Nike (CM/JP) no es el largo del pie: compara tu medida con la columna «Pie (cm)».',
  },
  {
    id: 'nike-mujer',
    titulo: 'Nike · Jordan — mujer',
    fuente: 'nike.com',
    url: 'https://www.nike.com/size-fit/womens-footwear',
    columnas: ['US W', 'UK', 'EU', 'Pie (cm)'],
    filas: [
      ['5', '2.5', '35.5', '22'],
      ['5.5', '3', '36', '22.4'],
      ['6', '3.5', '36.5', '22.9'],
      ['6.5', '4', '37.5', '23.3'],
      ['7', '4.5', '38', '23.7'],
      ['7.5', '5', '38.5', '24.1'],
      ['8', '5.5', '39', '24.5'],
      ['8.5', '6', '40', '25'],
      ['9', '6.5', '40.5', '25.4'],
      ['9.5', '7', '41', '25.8'],
      ['10', '7.5', '42', '26.2'],
    ],
    nota: 'En Nike la talla de mujer es 1,5 más que la de hombre (W 8,5 ≈ M 7).',
  },
  {
    id: 'adidas',
    titulo: 'adidas — hombre / unisex',
    fuente: 'adidas.com',
    url: 'https://www.adidas.com/us/help/size_charts/men-shoes',
    columnas: ['US M', 'US W', 'UK', 'EU', 'Pie (cm)'],
    filas: [
      ['6', '7', '5.5', '38 2/3', '23.8'],
      ['6.5', '7.5', '6', '39 1/3', '24.2'],
      ['7', '8', '6.5', '40', '24.6'],
      ['7.5', '8.5', '7', '40 2/3', '25'],
      ['8', '9', '7.5', '41 1/3', '25.5'],
      ['8.5', '9.5', '8', '42', '25.9'],
      ['9', '10', '8.5', '42 2/3', '26.3'],
      ['9.5', '10.5', '9', '43 1/3', '26.7'],
      ['10', '11', '9.5', '44', '27.1'],
      ['10.5', '11.5', '10', '44 2/3', '27.6'],
      ['11', '12', '10.5', '45 1/3', '28'],
      ['11.5', '12.5', '11', '46', '28.4'],
      ['12', '13', '11.5', '46 2/3', '28.8'],
    ],
    nota: 'adidas usa tercios en EU y la talla de mujer es 1 más que la de hombre.',
  },
  {
    id: 'new-balance',
    titulo: 'New Balance — hombre / unisex',
    fuente: 'newbalance.com',
    url: 'https://www.newbalance.com/size-guide.html',
    columnas: ['US', 'UK', 'EU', 'Largo (cm)'],
    filas: [
      ['6', '5.5', '38.5', '24'],
      ['6.5', '6', '39.5', '24.5'],
      ['7', '6.5', '40', '25'],
      ['7.5', '7', '40.5', '25.5'],
      ['8', '7.5', '41.5', '26'],
      ['8.5', '8', '42', '26.5'],
      ['9', '8.5', '42.5', '27'],
      ['9.5', '9', '43', '27.5'],
      ['10', '9.5', '44', '28'],
      ['10.5', '10', '44.5', '28.5'],
      ['11', '10.5', '45', '29'],
      ['11.5', '11', '45.5', '29.5'],
      ['12', '11.5', '46.5', '30'],
    ],
    nota: 'New Balance publica «largo (cm)» sin aclarar si es pie o zapato: tómalo como referencia.',
  },
  {
    id: 'vans',
    titulo: 'Vans — unisex',
    fuente: 'vans.com',
    url: 'https://www.vans.com/en-us/help/size-charts',
    columnas: ['US M', 'UK', 'EU', 'JP (cm)'],
    filas: [
      ['6.5', '6', '38.5', '24.5'],
      ['7', '6.5', '39', '25'],
      ['7.5', '7', '40', '25.5'],
      ['8', '7.5', '40.5', '26'],
      ['8.5', '8', '41', '26.5'],
      ['9', '8.5', '42', '27'],
      ['9.5', '9', '42.5', '27.5'],
      ['10', '9.5', '43', '28'],
      ['10.5', '10', '44', '28.5'],
      ['11', '10.5', '44.5', '29'],
      ['11.5', '11', '45', '29.5'],
      ['12', '11.5', '46', '30'],
    ],
    nota: 'Vans da el largo del pie solo en pulgadas; JP es la talla en cm de la etiqueta.',
  },
];

/** Tabla sugerida según la marca del producto. */
export const tablaPorMarca = (marca: string) =>
  ({ Nike: 'nike-hombre', Jordan: 'nike-hombre', adidas: 'adidas', 'New Balance': 'new-balance', Vans: 'vans' })[marca] ?? 'nike-hombre';

/**
 * Tallas de REFERENCIA (EU) para pedir disponibilidad mientras un producto no
 * tenga sus tallas confirmadas en productos.json. No indican existencias.
 */
export const tallasReferenciaEU = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
