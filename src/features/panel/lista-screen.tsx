import { useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { clientes } from '@/features/difusion/difusion';
import type { ArchivoLista } from '@/features/suscripcion/datos';
import { ListaDePrecios } from '@/features/suscripcion/lista-precios';

import { Marco } from '@/components/ui/marco';

type ListaScreenProps = {
  actual?: ArchivoLista;
  historial: ArchivoLista[];
  alSubir: (nuevo: ArchivoLista) => void;
  /** Cuántos clientes lo tienen de favorito: a ellos les avisa el servidor cuando sube una lista. */
  favoritos: number;
  alVolver: () => void;
};

/** La lista de precios actual y las anteriores. */
export function ListaScreen({ actual, historial, alSubir, favoritos, alVolver }: ListaScreenProps) {
  const [subio, setSubio] = useState(false);
  return (
    <Marco alVolver={alVolver} accion={{ label: 'Volver', onPress: alVolver }}>
      <Titular lineas={['Tu lista']} acento="de precios." clave="lista" />
      <Animated.View entering={FadeInDown.delay(260).duration(400)}>
        <ListaDePrecios
          actual={actual}
          historial={historial}
          alSubir={(nueva) => {
            alSubir(nueva);
            setSubio(true);
          }}
        />
      </Animated.View>
      {subio && favoritos > 0 ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <AppText variant="footnote" color="primaryText">
            Les avisamos de tu lista nueva a {clientes(favoritos)} que te tienen de favorito.
          </AppText>
        </Animated.View>
      ) : null}
    </Marco>
  );
}
