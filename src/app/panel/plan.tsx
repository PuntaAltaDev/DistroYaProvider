import { Redirect, router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { desdeGuardada } from '@/features/suscripcion/datos';
import { SuscripcionScreen } from '@/features/suscripcion/suscripcion-screen';

/** "/panel/plan": el plan contratado y cuándo vence. Sin plan, lleva a elegir uno. */
export default function Plan() {
  const { cuenta } = useCuenta();
  const suscripcion = desdeGuardada(cuenta.suscripcion);
  if (!suscripcion) return <Redirect href="/panel/planes" />;

  return (
    <SuscripcionScreen
      suscripcion={suscripcion}
      alRenovar={() => router.push('/panel/planes')}
      alAyuda={() => router.push('/ayuda')}
      alVolver={() => router.back()}
    />
  );
}
