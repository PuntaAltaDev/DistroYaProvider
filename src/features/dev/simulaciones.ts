import { Platform } from 'react-native';

import { RUTA_AVISOS } from '@/features/avisos/avisos';
import { sumarDifusion } from '@/features/avisos/difusiones';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { aGuardada, DIA, DIAS_FREE, licenciaFree, PLAN_FREE } from '@/features/suscripcion/datos';
import { programarAviso } from '@/lib/notificaciones';

/** Lo que se puede simular: cada cosa reemplaza una respuesta del servidor o del administrador. */
export type Simulacion = { etiqueta: string; hacer: () => void | Promise<void> };

/** Motivo de prueba para el rechazo. Con la API lo escribe el administrador. */
const MOTIVO_DE_PRUEBA = 'El logo no se ve bien y falta un teléfono de contacto.';

/** Aviso de prueba del administrador. Con la API lo escribe desde el panel. */
const DIFUSION_DE_PRUEBA = {
  titulo: 'Nuevos comercios en tu zona',
  texto: 'Esta semana se sumaron 40 almacenes en Bahía Blanca. Revisá que tu lista esté al día.',
};

/** Las simulaciones que tienen sentido según en qué punto está la cuenta. */
export function useSimulaciones(): Simulacion[] {
  const { cuenta, actualizar } = useCuenta();
  if (!cuenta.iniciada) return [];

  const lista: Simulacion[] = [];

  if (cuenta.estado === 'pendiente') {
    lista.push(
      {
        etiqueta: 'Aprobar el perfil',
        hacer: () =>
          // Con la API, el servidor crea la licencia Free al aprobar.
          actualizar({
            estado: 'aprobado',
            fechaAprobacion: new Date().toISOString(),
            suscripcion: aGuardada(licenciaFree()),
          }),
      },
      {
        etiqueta: 'Rechazar el perfil',
        hacer: () => actualizar({ estado: 'rechazado', motivoRechazo: MOTIVO_DE_PRUEBA }),
      },
    );
  }

  if (cuenta.estado === 'aprobado') {
    /** Deja la licencia con ese nombre, que vence dentro de `dias` días (negativo: ya venció). */
    const licencia = (planName: string, dias: number, duracion: number) => {
      const fin = new Date(Date.now() + dias * DIA);
      actualizar({
        suscripcion: aGuardada({
          planName,
          startDate: new Date(fin.getTime() - duracion * DIA),
          endDate: fin,
        }),
      });
    };
    lista.push(
      {
        etiqueta: 'Free: recién aprobado (15 días)',
        hacer: () => actualizar({ suscripcion: aGuardada(licenciaFree()) }),
      },
      { etiqueta: 'Free: quedan 3 días', hacer: () => licencia(PLAN_FREE, 3, DIAS_FREE) },
      { etiqueta: 'Free: terminó', hacer: () => licencia(PLAN_FREE, -2, DIAS_FREE) },
      { etiqueta: 'Plan mensual: quedan 25 días', hacer: () => licencia('Mensual', 25, 30) },
      { etiqueta: 'Plan mensual: vence en 3 días', hacer: () => licencia('Mensual', 3, 30) },
      {
        etiqueta: 'Sin licencia (cuenta vieja)',
        hacer: () => actualizar({ suscripcion: undefined }),
      },
      {
        etiqueta: 'Llega un aviso de DistroYa',
        hacer: () => {
          const fecha = new Date().toISOString();
          actualizar((actual) => ({
            difusiones: sumarDifusion(
              {
                id: fecha,
                titulo: DIFUSION_DE_PRUEBA.titulo,
                texto: DIFUSION_DE_PRUEBA.texto,
                fecha,
              },
              actual.difusiones,
            ),
          }));
        },
      },
    );
    // En web no hay avisos del teléfono.
    if (Platform.OS !== 'web') {
      lista.push({
        etiqueta: 'Aviso del teléfono en 5 segundos',
        hacer: () =>
          programarAviso({
            id: 'prueba',
            titulo: 'Tu prueba gratis termina en 7 días',
            texto: 'Aviso de prueba.',
            fecha: new Date(Date.now() + 5000),
            url: RUTA_AVISOS,
          }),
      });
    }
  }

  return lista;
}
