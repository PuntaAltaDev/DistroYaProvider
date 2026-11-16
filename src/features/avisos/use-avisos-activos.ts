import { useState } from 'react';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { haptics } from '@/lib/haptics';

import { permitirAvisos } from './avisos';

/**
 * Si el proveedor quiere avisos de vencimiento en el teléfono. Al activarlos pide el permiso del
 * sistema (si todavía se puede). `bloqueados`: los quiere, pero el teléfono los tiene bloqueados.
 */
export function useAvisosActivos() {
  const { cuenta, actualizar } = useCuenta();
  const [bloqueados, setBloqueados] = useState(false);

  const cambiar = async (quiere: boolean) => {
    haptics.select();
    const activos = quiere && (await permitirAvisos());
    setBloqueados(quiere && !activos);
    actualizar((actual) => ({ avisos: { activos, leidos: actual.avisos?.leidos ?? [] } }));
  };

  return { activos: !!cuenta.avisos?.activos, bloqueados, cambiar };
}
