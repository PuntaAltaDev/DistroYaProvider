import { useCuenta } from '@/features/cuenta/cuenta-provider';

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
      { etiqueta: 'Aprobar el perfil', hacer: () => actualizar({ estado: 'aprobado' }) },
      {
        etiqueta: 'Rechazar el perfil',
        hacer: () => actualizar({ estado: 'rechazado', motivoRechazo: MOTIVO_DE_PRUEBA }),
      },
    );
  }

  return lista;
}
