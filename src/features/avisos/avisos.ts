import type { Cuenta } from '@/features/cuenta/cuenta';
import {
  DIA,
  DIAS_AVISO,
  desdeGuardada,
  diasRestantes,
  estadoDe,
  esFree,
  fechaCorta,
  type Suscripcion,
} from '@/features/suscripcion/datos';
import { estadoPermiso, pedirPermiso, type AvisoProgramado } from '@/lib/notificaciones';

/**
 * Avisos del proveedor (UC9). Hay dos clases:
 * - Los de la bandeja: salen del estado de la cuenta (plan, aprobación). Con la API, los manda el servidor.
 * - Los del teléfono: recordatorios locales del vencimiento, programados en el teléfono.
 *   Cuando esté el backend, se suman los push que manda el servidor.
 */

/** A qué pantalla del panel lleva tocar el aviso. */
export type DestinoAviso = 'plan' | 'perfil';

export type Aviso = {
  /** Cambia si cambia el hecho (ej.: otra fecha de vencimiento), así vuelve a contar como nuevo. */
  id: string;
  titulo: string;
  texto: string;
  fecha: Date;
  destino: DestinoAviso;
};

/** Los avisos de la bandeja, del más nuevo al más viejo. */
export function avisosDe(cuenta: Cuenta, ahora = new Date()): Aviso[] {
  const aprobacion = new Date(cuenta.fechaAprobacion ?? cuenta.fechaEnvio ?? ahora);
  const suscripcion = desdeGuardada(cuenta.suscripcion);
  const avisos: Aviso[] = [
    {
      id: 'aprobado',
      titulo: 'Tu perfil está activo',
      texto:
        suscripcion && esFree(suscripcion)
          ? `Ya te pueden encontrar los comercios. Tenés ${diasRestantes(suscripcion, ahora)} días de prueba gratis.`
          : 'Ya te pueden encontrar los comercios.',
      fecha: aprobacion,
      destino: 'perfil',
    },
  ];

  // Sin licencia (cuentas viejas) no hay aviso: "Mi plan" explica cómo activarla.
  if (suscripcion) {
    const estado = estadoDe(suscripcion, ahora);
    const fin = suscripcion.endDate.toISOString();
    const free = esFree(suscripcion);
    if (estado === 'vencida') {
      avisos.push({
        id: `vencido-${fin}`,
        titulo: free ? 'Tu prueba gratis terminó' : 'Tu plan venció',
        texto: free
          ? 'Tu perfil no aparece en el buscador. Escribinos para activar tu plan.'
          : 'Tu perfil no aparece en el buscador. Renovalo para volver.',
        fecha: suscripcion.endDate,
        destino: 'plan',
      });
    } else if (estado === 'por-vencer') {
      const dias = diasRestantes(suscripcion, ahora);
      avisos.push({
        id: `por-vencer-${fin}`,
        titulo: free
          ? dias === 1
            ? 'Tu prueba gratis termina mañana'
            : `Tu prueba gratis termina en ${dias} días`
          : dias === 1
            ? 'Tu plan vence mañana'
            : `Tu plan vence en ${dias} días`,
        texto: `${free ? 'Termina' : 'Vence'} el ${fechaCorta(suscripcion.endDate)}. ${free ? 'Escribinos' : 'Renovalo'} para seguir apareciendo.`,
        fecha: new Date(suscripcion.endDate.getTime() - DIAS_AVISO * DIA),
        destino: 'plan',
      });
    }
  }

  return avisos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export const sinLeer = (avisos: Aviso[], leidos: string[] = []) =>
  avisos.filter((a) => !leidos.includes(a.id));

/** Ids de los recordatorios del teléfono (para cancelarlos aunque ya no correspondan). */
export const IDS_RECORDATORIOS = ['plan-por-vencer', 'plan-vencido'] as const;

/** Adonde lleva un aviso del teléfono al tocarlo: la bandeja. */
export const RUTA_AVISOS = '/panel/avisos';

/** Hora del día a la que llegan los recordatorios. */
const HORA_RECORDATORIO = 10;

/**
 * Recordatorios del teléfono para un vencimiento: 7 días antes a las 10, y el día que vence
 * (a las 10, o cuando vence si es más tarde: nunca de madrugada). Solo los que todavía no pasaron.
 */
export function recordatoriosDelPlan(
  suscripcion: Suscripcion,
  ahora = new Date(),
): AvisoProgramado[] {
  const fin = suscripcion.endDate;
  const free = esFree(suscripcion);
  const antes = new Date(fin.getTime() - DIAS_AVISO * DIA);
  antes.setHours(HORA_RECORDATORIO, 0, 0, 0);
  const ese = new Date(fin);
  ese.setHours(HORA_RECORDATORIO, 0, 0, 0);
  const vencido = new Date(Math.max(fin.getTime(), ese.getTime()));
  const recordatorios: AvisoProgramado[] = [
    {
      id: 'plan-por-vencer',
      titulo: free
        ? `Tu prueba gratis termina en ${DIAS_AVISO} días`
        : `Tu plan vence en ${DIAS_AVISO} días`,
      texto: free
        ? 'Escribinos para que tu perfil siga apareciendo en el buscador.'
        : 'Renovalo para que tu perfil siga apareciendo en el buscador.',
      fecha: antes,
      url: RUTA_AVISOS,
    },
    {
      id: 'plan-vencido',
      titulo: free ? 'Tu prueba gratis terminó' : 'Tu plan venció',
      texto: free
        ? 'Tu perfil dejó de aparecer en el buscador. Escribinos para activar tu plan.'
        : 'Tu perfil dejó de aparecer en el buscador. Renovalo para volver.',
      fecha: vencido,
      url: RUTA_AVISOS,
    },
  ];
  return recordatorios.filter((r) => r.fecha.getTime() > ahora.getTime());
}

/**
 * Pide el permiso si todavía se puede. Devuelve si los avisos del teléfono quedan permitidos.
 * Si el usuario ya los negó, el sistema no vuelve a preguntar: hay que ir a los ajustes del teléfono.
 */
export async function permitirAvisos(): Promise<boolean> {
  const estado = await estadoPermiso();
  if (estado === 'concedido') return true;
  if (estado === 'sin-preguntar') return pedirPermiso();
  return false;
}
