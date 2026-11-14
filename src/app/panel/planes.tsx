import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { aGuardada, desdeGuardada } from '@/features/suscripcion/datos';
import { contratar } from '@/features/suscripcion/planes';
import { PlanesScreen } from '@/features/suscripcion/planes-screen';

/** "/panel/planes": elegir el primer plan, o renovarlo / cambiarlo. */
export default function Planes() {
  const { cuenta, actualizar } = useCuenta();
  const actual = desdeGuardada(cuenta.suscripcion);

  return (
    <PlanesScreen
      actual={actual}
      alVolver={() => router.back()}
      alContratar={(plan) => {
        // Con la API, la suscripción nueva la devuelve el servidor después del pago.
        actualizar({ suscripcion: aGuardada(contratar(plan, actual)) });
        // La primera vez, antes de ver el plan, se le pregunta por los avisos.
        if (!cuenta.avisos) router.replace('/panel/permiso-avisos');
        else router.dismissTo('/panel/plan');
      }}
    />
  );
}
