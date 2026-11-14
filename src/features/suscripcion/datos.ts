/**
 * Suscripción del proveedor. Los nombres siguen los del backend de Seba (PlanName, StartDate, EndDate).
 * Por ahora son datos simulados; después vienen de la API.
 */
export type Suscripcion = {
  planName: string;
  startDate: Date;
  endDate: Date;
};

export type EstadoSuscripcion = 'activa' | 'por-vencer' | 'vencida';

const DIA = 24 * 60 * 60 * 1000;

/** A partir de cuántos días antes del vencimiento se avisa. */
export const DIAS_AVISO = 7;

/** Datos de prueba: plan mensual que arrancó hoy. */
export function suscripcionDePrueba(): Suscripcion {
  const hoy = new Date();
  return {
    planName: 'Mensual',
    startDate: hoy,
    endDate: new Date(hoy.getTime() + 30 * DIA),
  };
}

/** Días que faltan para el vencimiento (0 si ya venció). */
export function diasRestantes(s: Suscripcion, ahora = new Date()) {
  return Math.max(0, Math.ceil((s.endDate.getTime() - ahora.getTime()) / DIA));
}

/** Parte del período que queda, de 0 a 1. */
export function fraccionRestante(s: Suscripcion, ahora = new Date()) {
  const total = s.endDate.getTime() - s.startDate.getTime();
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (s.endDate.getTime() - ahora.getTime()) / total));
}

export function estadoDe(s: Suscripcion, ahora = new Date()): EstadoSuscripcion {
  if (s.endDate.getTime() <= ahora.getTime()) return 'vencida';
  return diasRestantes(s, ahora) <= DIAS_AVISO ? 'por-vencer' : 'activa';
}

/** Una lista de precios subida. Del historial solo se guarda el nombre y la fecha, no el PDF. */
export type ArchivoLista = {
  nombre: string;
  fecha: Date;
  tamano?: number;
};

/** Cuántas listas anteriores se muestran. */
export const HISTORIAL_MAX = 5;

/** Al subir una lista nueva, la actual pasa primera al historial, que queda en 5 como máximo. */
export const sumarAlHistorial = (anterior: ArchivoLista, historial: ArchivoLista[]) =>
  [{ nombre: anterior.nombre, fecha: anterior.fecha }, ...historial].slice(0, HISTORIAL_MAX);

/** Historial de prueba, hasta que esté la API. */
export function historialDePrueba(): ArchivoLista[] {
  const haceDias = (n: number) => new Date(Date.now() - n * DIA);
  return [
    { nombre: 'lista-precios-octubre.pdf', fecha: haceDias(21) },
    { nombre: 'lista-precios-septiembre.pdf', fecha: haceDias(52) },
    { nombre: 'precios-agosto-2026.pdf', fecha: haceDias(84) },
  ];
}

/** "13 de diciembre" */
export const fechaLarga = (d: Date) =>
  d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

/** "13/11/2026" */
export const fechaCorta = (d: Date) =>
  d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
