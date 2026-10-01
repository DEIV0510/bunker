// ─────────────────────────────────────────────────────────────────────────────
// INFORMACIÓN COMERCIAL DE BUNKERSNEAKERS — fuente única para todo el sitio.
// null = dato SIN CONFIRMAR: el sitio no lo muestra (o muestra un texto que
// remite a WhatsApp) y en `npm run dev` aparece marcado como PENDIENTE.
// Productos, precios y tallas: src/data/productos.json
// ─────────────────────────────────────────────────────────────────────────────

export const negocio = {
  nombre: 'BUNKERSNEAKERS',
  nombreCorto: 'Bunker',
  descripcion:
    'Sneakers importados en Bogotá: clásicos deportivos y streetwear en tendencia. Compra en la web o por WhatsApp desde el C.C. Puerto Príncipe.',
  lang: 'es-CO',
  locale: 'es_CO',

  /** Único número comercial. Formato internacional sin + ni espacios. */
  whatsapp: {
    numero: '573238158007',
    visible: '+57 323 815 8007',
  },

  ubicacion: {
    lugar: 'Centro Comercial Puerto Príncipe',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    /** Local, piso o dirección exacta: sin confirmar. */
    local: null as string | null,
    /** Horario de atención: sin confirmar. */
    horario: null as string | null,
  },

  /** Redes oficiales. Solo se muestran las que tengan URL confirmada. */
  redes: {
    instagram: null as string | null,
    tiktok: null as string | null,
  },

  envios: {
    /** El brief indica envío gratis en Bogotá. Condiciones exactas: sin confirmar. */
    gratisBogota: true,
    condicionesBogota: null as string | null,
    /** Tiempos de entrega por zona: sin confirmar. */
    tiempos: null as string | null,
    /** Costo para el resto del país: se cotiza por WhatsApp hasta tener tarifa. */
    costoNacional: null as string | null,
  },

  /**
   * Medios de pago previstos. estado:
   *  'activo'    → se ofrece normalmente
   *  'consultar' → se menciona, pero se confirma por WhatsApp (sin integración en la web)
   *  'oculto'    → no se muestra
   */
  pagos: [
    { id: 'transferencia', nombre: 'Transferencia', corto: 'transferencia', detalle: 'Te enviamos los datos de pago por WhatsApp.', estado: 'activo' },
    { id: 'contraentrega', nombre: 'Contraentrega', corto: 'contraentrega según cobertura', detalle: 'Según cobertura de la transportadora en tu ciudad.', estado: 'consultar' },
    { id: 'addi', nombre: 'Addi', corto: 'Addi (pregunta si aplica)', detalle: 'Compra en cuotas sujeta a aprobación de Addi. Pregunta si está disponible para tu pedido.', estado: 'consultar' },
  ] as { id: string; nombre: string; corto: string; detalle: string; estado: 'activo' | 'consultar' | 'oculto' }[],

  cambios: {
    /** Política de cambios (plazo, estado del producto, quién paga el envío): sin confirmar. */
    politica: null as string | null,
  },

  mayoristas: {
    /** Mínimo de pares, descuentos o tarifas: sin confirmar. No se inventan. */
    minimo: null as string | null,
    condiciones: null as string | null,
  },

  legal: {
    razonSocial: null as string | null,
    nit: null as string | null,
    correo: null as string | null,
  },

  /** Fotos reales de clientes (con permiso). Vacío = se muestra la invitación a enviar fotos. */
  comunidad: [] as { imagen: string; alt: string; credito?: string }[],

  /** Reseñas verificadas. Vacío = no se muestra ninguna. */
  resenas: [] as { autor: string; texto: string; fuente: string }[],
};

export type Pago = (typeof negocio.pagos)[number];
export const pagosVisibles = negocio.pagos.filter((p) => p.estado !== 'oculto');

/** Frases cortas reutilizables (barra superior, beneficios, carrito). */
export const textos = {
  envioBogota: negocio.envios.gratisBogota ? 'Envío gratis en Bogotá' : null,
  envioNacional: 'Envíos al resto de Colombia: costo y tiempo según tu ciudad',
  pagos: pagosVisibles.map((p) => p.nombre).join(' · '),
  /** «Paga por transferencia, contraentrega según cobertura o Addi (pregunta si aplica)» */
  pagosLinea: `Paga por ${pagosVisibles.map((p) => p.corto).join(', ').replace(/, ([^,]+)$/, ' o $1')}`,
};

/** Preguntas frecuentes. confirmada: false = respuesta provisional (se marca en dev). */
export const faqs: { q: string; a: string; confirmada: boolean }[] = [
  {
    q: '¿Cómo realizo mi compra?',
    a: 'Elige tu modelo, selecciona la talla y agrégalo al carrito. Al finalizar, el pedido llega a nuestro WhatsApp con los datos que llenaste; ahí te confirmamos disponibilidad, valor final y pago. Si prefieres, escríbenos directo desde cualquier producto.',
    confirmada: true,
  },
  {
    q: '¿Qué medios de pago están disponibles?',
    a: 'Transferencia y contraentrega según la cobertura de tu ciudad. Addi está previsto como opción de pago en cuotas: pregúntanos si aplica para tu pedido. Aún no hay pago en línea dentro de la web.',
    confirmada: false,
  },
  {
    q: '¿Cómo funcionan las cuotas con Addi?',
    a: 'Addi permite pagar en cuotas y la aprobación la hace Addi, no nosotros. Escríbenos por WhatsApp y te contamos si la opción está activa para tu compra y cómo hacer la solicitud.',
    confirmada: false,
  },
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Depende de tu ciudad y de la transportadora. Antes de despachar te confirmamos por WhatsApp el tiempo estimado y, fuera de Bogotá, el costo del envío.',
    confirmada: false,
  },
  {
    q: '¿Puedo solicitar contraentrega?',
    a: 'Sí, según la cobertura de la transportadora en tu ciudad. Elige «Contraentrega» al finalizar el pedido y te confirmamos si está disponible para tu dirección.',
    confirmada: false,
  },
  {
    q: '¿Cómo funcionan los cambios de talla?',
    a: 'Para evitar cambios, te asesoramos con la talla antes de comprar (revisa la guía de tallas). Las condiciones de cambio —plazo, estado del producto y costo del envío— te las confirmamos por WhatsApp antes del pago.',
    confirmada: false,
  },
  {
    q: '¿Cómo consulto disponibilidad?',
    a: 'En cada producto elige color y talla y toca «Comprar por WhatsApp»: el mensaje sale con el modelo y la talla que buscas. Te respondemos con la disponibilidad real.',
    confirmada: true,
  },
  {
    q: '¿Cómo puedo comprar al por mayor?',
    a: 'Llena el formulario de compra al por mayor con tu ciudad, la cantidad aproximada y los modelos que te interesan. Te enviamos por WhatsApp las condiciones para tu pedido.',
    confirmada: true,
  },
];
