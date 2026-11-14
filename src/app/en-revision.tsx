import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { RegistroExito } from '@/features/registro/registro-exito';

/** "/en-revision": el registro se envió y espera la aprobación. */
export default function EnRevision() {
  const { cuenta } = useCuenta();
  return (
    <RegistroExito nombre={cuenta.form.razonSocial.trim()} alAyuda={() => router.push('/ayuda')} />
  );
}
