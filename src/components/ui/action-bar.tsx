import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { AppText } from './app-text';
import { Icon } from './icon';

type ActionBarProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

/** Espera antes del primer empujoncito y pausa entre uno y otro. */
const ESPERA_INVITAR_MS = 1600;
const PAUSA_INVITAR_MS = 2600;

/**
 * Barra negra de acción, pegada al borde inferior (estilo editorial).
 * Toda la barra es el botón. La flecha se adelanta un poco cada tanto, para invitar a tocar,
 * y se corre al tocar. Si el teléfono pide menos movimiento, solo se mueve al tocar.
 */
export function ActionBar({ label, onPress, loading = false }: ActionBarProps) {
  const { colors, spacing, motion } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reducir = useReducedMotion();
  const empuje = useSharedValue(0);

  /** Empujoncito que se repite mientras la barra está a la vista. */
  const invitar = () =>
    withDelay(
      ESPERA_INVITAR_MS,
      withRepeat(
        withSequence(
          withTiming(7, { duration: 220, easing: Easing.out(Easing.quad) }),
          withSpring(0, motion.spring.snappy),
          withDelay(PAUSA_INVITAR_MS, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );

  useEffect(() => {
    if (!reducir) empuje.set(invitar());
    // `invitar` solo arma la animación; alcanza con volver a empezar si cambia `reducir`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducir, empuje]);

  /** Al soltar, vuelve a su lugar y retoma la invitación (al tocar, la animación se corta). */
  const soltar = () => {
    const volver = withSpring(0, motion.spring.snappy);
    empuje.set(reducir ? volver : withSequence(volver, invitar()));
  };

  const flechaStyle = useAnimatedStyle(() => ({ transform: [{ translateX: empuje.get() }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPressIn={() => empuje.set(withSpring(8, motion.spring.snappy))}
      onPressOut={soltar}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{ backgroundColor: colors.actionBg }}>
      <View
        style={[
          styles.row,
          {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl + insets.bottom,
          },
        ]}>
        <AppText variant="headline" color="actionText">
          {label}
        </AppText>
        {loading ? (
          <ActivityIndicator color={colors.actionAccent} />
        ) : (
          <Animated.View style={flechaStyle}>
            <Icon name="forward" size={24} color="actionAccent" />
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
