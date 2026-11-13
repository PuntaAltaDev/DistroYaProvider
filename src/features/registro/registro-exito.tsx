import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useAppTheme } from '@/theme';

type RegistroExitoProps = {
  nombre: string;
  alRevisar: () => void;
};

/** Pantalla final: el registro se envió y queda esperando la aprobación del administrador. */
export function RegistroExito({ nombre, alRevisar }: RegistroExitoProps) {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl, gap: spacing.xxl }]}>
      <View style={[styles.center, { gap: spacing.xl }]}>
        <Animated.View
          entering={ZoomIn.springify().damping(14)}
          style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Icon name="check" size={40} color="onPrimary" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={[styles.center, { gap: spacing.sm }]}>
          <AppText variant="title" style={styles.textCenter}>
            Registro enviado
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.textCenter}>
            Estamos revisando los datos de {nombre}. Te avisamos cuando tu perfil esté activo.
          </AppText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[
            styles.pill,
            {
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.pill,
              backgroundColor: colors.primarySoft,
            },
          ]}>
          <Icon name="clock" size={16} color="primaryText" />
          <AppText variant="callout" color="primaryText">
            Pendiente de aprobación
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <AppButton label="Revisar mis datos" variant="secondary" onPress={alRevisar} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  badge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center' },
});
