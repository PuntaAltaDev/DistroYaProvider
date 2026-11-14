import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { RegistroRechazado } from '@/features/registro/registro-rechazado';

/** "/rechazado": el administrador pidió correcciones. */
export default function Rechazado() {
  const { cuenta, actualizar } = useCuenta();
  return (
    <RegistroRechazado
      nombre={cuenta.form.razonSocial.trim()}
      motivo={cuenta.motivoRechazo ?? 'Revisá tus datos.'}
      // Vuelve al registro (las rutas lo llevan solas). El motivo queda guardado para mostrarlo
      // mientras corrige; se borra al reenviar.
      alCorregir={() => actualizar({ estado: 'borrador', paso: 0 })}
      alAyuda={() => router.push('/ayuda')}
    />
  );
}
