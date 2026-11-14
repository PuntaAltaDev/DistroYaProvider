import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Marco } from '@/components/ui/marco';
import { useAppTheme } from '@/theme';

import { permitirAvisos } from './avisos';

/**
 * Se muestra una sola vez, después de contratar el primer plan: explica para qué son los avisos
 * antes de que aparezca el pedido de permiso del sistema (que solo se puede mostrar una vez).
 */
export function PermisoAvisosScreen({ alResponder }: { alResponder: (activos: boolean) => void }) {
  const { spacing } = useAppTheme();
  const [pidiendo, setPidiendo] = useState(false);

  const activar = async () => {
    setPidiendo(true);
    alResponder(await permitirAvisos());
  };

  return (
    <Marco accion={{ label: 'Activar avisos', onPress: activar, loading: pidiendo }}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Te avisamos']} acento="a tiempo." clave="permiso-avisos" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Antes de que venza tu plan, para que tu perfil no deje de aparecer en el buscador.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(320).duration(400)}>
        <Pressable
          onPress={() => alResponder(false)}
          disabled={pidiendo}
          hitSlop={8}
          accessibilityRole="button">
          <AppText variant="callout" color="textSecondary">
            Ahora no
          </AppText>
        </Pressable>
      </Animated.View>
    </Marco>
  );
}
