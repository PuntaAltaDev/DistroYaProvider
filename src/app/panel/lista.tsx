import { router } from 'expo-router';

import { ALCANCE_DE_PRUEBA } from '@/features/difusion/difusion';
import { useListas } from '@/features/panel/listas';
import { ListaScreen } from '@/features/panel/lista-screen';

/** "/panel/lista": la lista de precios vigente y las anteriores. */
export default function Lista() {
  const { actual, historial, subir } = useListas();
  return (
    <ListaScreen
      actual={actual}
      historial={historial}
      alSubir={subir}
      favoritos={ALCANCE_DE_PRUEBA.favoritos}
      alVolver={() => router.back()}
    />
  );
}
