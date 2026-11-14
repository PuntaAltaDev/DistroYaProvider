import { router } from 'expo-router';

import { PermisoAvisosScreen } from '@/features/avisos/permiso-avisos-screen';
import { useCuenta } from '@/features/cuenta/cuenta-provider';

/** "/panel/permiso-avisos": una sola vez, después del primer plan. Después muestra el plan. */
export default function PermisoAvisos() {
  const { actualizar } = useCuenta();
  return (
    <PermisoAvisosScreen
      alResponder={(activos) => {
        actualizar((actual) => ({ avisos: { activos, leidos: actual.avisos?.leidos ?? [] } }));
        router.replace('/panel/plan');
      }}
    />
  );
}
