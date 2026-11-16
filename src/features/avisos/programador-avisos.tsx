import { useEffect } from 'react';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { desdeGuardada } from '@/features/suscripcion/datos';
import { cancelarAviso, programarAviso } from '@/lib/notificaciones';

import { IDS_RECORDATORIOS, recordatoriosDelPlan } from './avisos';

/**
 * Mantiene al día los recordatorios del teléfono según la cuenta: si está aprobado, quiere avisos
 * y tiene plan, programa los del vencimiento; si no (cerró sesión, apagó los avisos, no hay plan),
 * los cancela. Al renovar, cambia la fecha y se reprograman. No dibuja nada: va en `app/_layout.tsx`.
 */
export function ProgramadorAvisos() {
  const { cuenta } = useCuenta();
  const conAvisos = cuenta.iniciada && cuenta.estado === 'aprobado' && !!cuenta.avisos?.activos;
  const suscripcion = conAvisos ? desdeGuardada(cuenta.suscripcion) : undefined;
  const fin = suscripcion?.endDate.toISOString();
  const nombre = suscripcion?.planName;

  useEffect(() => {
    const recordatorios = suscripcion ? recordatoriosDelPlan(suscripcion) : [];
    for (const id of IDS_RECORDATORIOS) {
      if (!recordatorios.some((r) => r.id === id)) void cancelarAviso(id);
    }
    for (const recordatorio of recordatorios) void programarAviso(recordatorio);
    // Se reprograman solo cuando cambia el vencimiento o el tipo de plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fin, nombre]);

  return null;
}
