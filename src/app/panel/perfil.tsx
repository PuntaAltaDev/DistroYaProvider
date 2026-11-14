import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { PerfilScreen } from '@/features/panel/perfil-screen';

/** "/panel/perfil": ver y editar los datos del negocio. */
export default function Perfil() {
  const { cuenta, actualizar } = useCuenta();
  return (
    <PerfilScreen
      form={cuenta.form}
      alVolver={() => router.back()}
      // Todavía no hay servidor: el perfil se guarda en el teléfono. Acá va la llamada a la API.
      alGuardar={(form) => actualizar({ form })}
    />
  );
}
