import { useEffect } from 'react';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
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
  const fin = conAvisos ? cuenta.suscripcion?.endDate : undefined;

  useEffect(() => {
    const recordatorios = fin ? recordatoriosDelPlan(new Date(fin)) : [];
    for (const id of IDS_RECORDATORIOS) {
      if (!recordatorios.some((r) => r.id === id)) void cancelarAviso(id);
    }
    for (const recordatorio of recordatorios) void programarAviso(recordatorio);
  }, [fin]);

  return null;
}
