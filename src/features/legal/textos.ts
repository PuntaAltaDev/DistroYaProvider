/**
 * Términos y condiciones y política de privacidad.
 *
 * BORRADOR: estos textos los tiene que revisar un abogado antes de publicar la app.
 * Cuando cambien, se sube `VERSION_LEGAL`: la cuenta guarda qué versión aceptó cada proveedor.
 * Con la API, los textos y la versión vigente pueden venir del servidor.
 */

/** Fecha de la versión vigente, en formato ISO (año-mes-día). */
export const VERSION_LEGAL = '2026-11-14';

export type DocumentoLegal = 'terminos' | 'privacidad';

type Seccion = { titulo: string; texto: string };

export type TextoLegal = {
  /** Texto corto para la barra de arriba. */
  barra: string;
  lineas: string[];
  acento: string;
  secciones: Seccion[];
};

export const TEXTOS_LEGALES: Record<DocumentoLegal, TextoLegal> = {
  terminos: {
    barra: 'TÉRMINOS',
    lineas: ['Términos y'],
    acento: 'condiciones.',
    secciones: [
      {
        titulo: 'Qué es DistroYa',
        texto:
          'DistroYa conecta proveedores y distribuidores con comercios. Mostramos tu perfil y tu lista de precios para que los comercios te encuentren y te contacten directo. No intervenimos en las ventas, los precios ni las entregas.',
      },
      {
        titulo: 'Tu cuenta',
        texto:
          'Entrás con tu email o tu cuenta de Google. Sos responsable de lo que se haga desde tu cuenta y de que los datos de tu negocio sean ciertos y estén al día.',
      },
      {
        titulo: 'Aprobación del perfil',
        texto:
          'Revisamos cada perfil antes de publicarlo. Podemos rechazarlo o pedirte que corrijas datos si no son claros o no corresponden a un negocio real.',
      },
      {
        titulo: 'Plan y pagos',
        texto:
          'Tu perfil aparece en el buscador mientras tu plan esté vigente. Te avisamos antes de que venza. Si vence, el perfil deja de mostrarse hasta que lo renueves; tus datos no se borran.',
      },
      {
        titulo: 'Lo que publicás',
        texto:
          'Tu logo, tus datos y tu lista de precios son tuyos. Nos das permiso para mostrarlos en DistroYa mientras tengas la cuenta. No se puede publicar contenido falso, ilegal o de terceros sin permiso.',
      },
      {
        titulo: 'Baja de la cuenta',
        texto:
          'Podés eliminar tu cuenta cuando quieras desde Ajustes. También podemos darla de baja si no se cumplen estos términos.',
      },
      {
        titulo: 'Cambios',
        texto:
          'Si cambiamos estos términos, te lo avisamos en la app antes de que entren en vigencia.',
      },
    ],
  },
  privacidad: {
    barra: 'PRIVACIDAD',
    lineas: ['Política de'],
    acento: 'privacidad.',
    secciones: [
      {
        titulo: 'Qué datos guardamos',
        texto:
          'Tu email, los datos de tu negocio (nombre, logo, contacto, dirección y rubros), tu lista de precios y tu plan.',
      },
      {
        titulo: 'Para qué los usamos',
        texto:
          'Para mostrar tu perfil a los comercios, avisarte sobre tu cuenta y tu plan, y mejorar la app. No vendemos tus datos.',
      },
      {
        titulo: 'Qué ven los comercios',
        texto:
          'Tu perfil público: nombre, logo, contacto, dirección, rubros y lista de precios. Tu email de acceso no se muestra.',
      },
      {
        titulo: 'Con quién los compartimos',
        texto:
          'Con los servicios que usamos para que la app funcione (alojamiento, direcciones de Google y envío de avisos), solo para eso.',
      },
      {
        titulo: 'Tus derechos',
        texto:
          'Podés ver, corregir o borrar tus datos cuando quieras, desde la app o escribiéndonos. Ley 25.326 de Protección de los Datos Personales. La autoridad de control es la Agencia de Acceso a la Información Pública.',
      },
      {
        titulo: 'Avisos',
        texto:
          'Si los activás, te mandamos avisos sobre tu cuenta y el vencimiento de tu plan. Los podés apagar desde Ajustes.',
      },
    ],
  },
};
