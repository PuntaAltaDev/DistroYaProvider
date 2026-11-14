/**
 * Ayuda: contacto y preguntas frecuentes.
 * DATOS DE PRUEBA: el número y el email son de mentira hasta que el negocio defina los reales.
 * Con la API, pueden venir del servidor para cambiarlos sin publicar otra versión.
 */
export const CONTACTO = {
  /** Número de WhatsApp en formato internacional, sin "+" ni espacios. */
  whatsapp: '5490000000000',
  email: 'soporte@distroya.example',
};

/** Mensaje con el que se abre el chat o el email. */
export const MENSAJE_INICIAL = 'Hola, tengo una consulta sobre DistroYa Proveedores.';

export const PREGUNTAS: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿Cuánto tarda la aprobación?',
    respuesta: 'Revisamos cada perfil en el día hábil. Te avisamos cuando esté activo.',
  },
  {
    pregunta: '¿Qué pasa si vence mi plan?',
    respuesta:
      'Tu perfil deja de aparecer en el buscador hasta que lo renueves. Tus datos y tu lista no se borran.',
  },
  {
    pregunta: '¿Cómo actualizo mi lista de precios?',
    respuesta: 'Desde el inicio, en "Lista de precios". La anterior queda en el historial.',
  },
  {
    pregunta: '¿Cómo cambio los datos de mi negocio?',
    respuesta: 'Desde el inicio, en "Mi perfil".',
  },
  {
    pregunta: '¿Cómo apago los avisos?',
    respuesta: 'En Ajustes, con el interruptor "Avisos de vencimiento".',
  },
  {
    pregunta: '¿Cómo elimino mi cuenta?',
    respuesta: 'En Ajustes, "Eliminar cuenta". Se borra todo y no se puede deshacer.',
  },
];
