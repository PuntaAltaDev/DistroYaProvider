import { Platform } from 'react-native';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { aGuardada, DIA } from '@/features/suscripcion/datos';
import { programarAviso } from '@/lib/notificaciones';

/** Lo que se puede simular: cada cosa reemplaza una respuesta del servidor o del administrador. */
export type Simulacion = { etiqueta: string; hacer: () => void | Promise<void> };

/** Motivo de prueba para el rechazo. Con la API lo escribe el administrador. */
const MOTIVO_DE_PRUEBA = 'El logo no se ve bien y falta un teléfono de contacto.';

/** Las simulaciones que tienen sentido según en qué punto está la cuenta. */
export function useSimulaciones(): Simulacion[] {
  const { cuenta, actualizar } = useCuenta();
  if (!cuenta.iniciada) return [];

  const lista: Simulacion[] = [];

  if (cuenta.estado === 'pendiente') {
    lista.push(
      {
        etiqueta: 'Aprobar el perfil',
        hacer: () => actualizar({ estado: 'aprobado', fechaAprobacion: new Date().toISOString() }),
      },
      {
        etiqueta: 'Rechazar el perfil',
        hacer: () => actualizar({ estado: 'rechazado', motivoRechazo: MOTIVO_DE_PRUEBA }),
      },
    );
  }

  if (cuenta.estado === 'aprobado') {
    /** Deja un plan mensual que vence dentro de `dias` días (negativo: ya venció). */
    const planQueVence = (dias: number) => {
      const fin = new Date(Date.now() + dias * DIA);
      actualizar({
        suscripcion: aGuardada({
          planName: 'Mensual',
          startDate: new Date(fin.getTime() - 30 * DIA),
          endDate: fin,
        }),
      });
    };
    lista.push(
      { etiqueta: 'Plan: vence en 3 días', hacer: () => planQueVence(3) },
      { etiqueta: 'Plan: vencido', hacer: () => planQueVence(-2) },
      { etiqueta: 'Plan: sin plan', hacer: () => actualizar({ suscripcion: undefined }) },
    );
    // En web no hay avisos del teléfono.
    if (Platform.OS !== 'web') {
      lista.push({
        etiqueta: 'Aviso del teléfono en 5 segundos',
        hacer: () =>
          programarAviso({
            id: 'prueba',
            titulo: 'Tu plan vence en 7 días',
            texto: 'Aviso de prueba.',
            fecha: new Date(Date.now() + 5000),
          }),
      });
    }
  }

  return lista;
}
