import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Icon } from '@/components/ui/icon';
import { Marco } from '@/components/ui/marco';
import { LinkAyuda } from '@/features/ayuda/link-ayuda';
import { useAppTheme } from '@/theme';

/** Pantalla final: el registro se envió y queda esperando la aprobación del administrador. */
export function RegistroExito({ nombre, alAyuda }: { nombre: string; alAyuda: () => void }) {
  const { colors, spacing } = useAppTheme();

  return (
    <Marco derecha="EN REVISIÓN">
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Listo.', 'Ya estás']} acento="en camino." clave="exito" />
        <Animated.View entering={FadeIn.delay(260).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Estamos revisando los datos de {nombre}. Te avisamos cuando tu perfil esté activo.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(380).duration(400)}
        style={[
          styles.estado,
          { gap: spacing.sm, paddingVertical: spacing.md, borderColor: colors.text },
        ]}>
        <Icon name="clock" size={18} color="primaryText" />
        <AppText variant="callout">Pendiente de aprobación</AppText>
      </Animated.View>

      <LinkAyuda onPress={alAyuda} />
    </Marco>
  );
}

const styles = StyleSheet.create({
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
});
