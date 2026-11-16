import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { desdeGuardada } from '@/features/suscripcion/datos';
import { SuscripcionScreen } from '@/features/suscripcion/suscripcion-screen';

/** "/panel/plan": la licencia (Free o la que asignó el administrador), cuánto queda y los avisos. */
export default function Plan() {
  const { cuenta } = useCuenta();
  return (
    <SuscripcionScreen
      suscripcion={desdeGuardada(cuenta.suscripcion)}
      alVolver={() => router.back()}
    />
  );
}
