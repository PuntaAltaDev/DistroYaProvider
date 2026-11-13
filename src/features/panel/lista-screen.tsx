import Animated, { FadeInDown } from 'react-native-reanimated';

import { Titular } from '@/features/registro/editorial';
import type { ArchivoLista } from '@/features/suscripcion/datos';
import { ListaDePrecios } from '@/features/suscripcion/lista-precios';

import { Marco } from './marco';

type ListaScreenProps = {
  actual?: ArchivoLista;
  historial: ArchivoLista[];
  alSubir: (nuevo: ArchivoLista) => void;
  alVolver: () => void;
};

/** La lista de precios actual y las anteriores. */
export function ListaScreen({ actual, historial, alSubir, alVolver }: ListaScreenProps) {
  return (
    <Marco derecha="LISTA DE PRECIOS" alVolver={alVolver} accion={{ label: 'Volver', onPress: alVolver }}>
      <Titular lineas={['Tu lista']} acento="de precios." clave="lista" />
      <Animated.View entering={FadeInDown.delay(260).duration(400)}>
        <ListaDePrecios actual={actual} historial={historial} alSubir={alSubir} />
      </Animated.View>
    </Marco>
  );
}
