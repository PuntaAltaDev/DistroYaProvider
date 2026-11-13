import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { AppText } from './app-text';
import { Icon } from './icon';

type ActionBarProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  /** Avance del registro, de 0 a 1. Dibuja una línea ámbar arriba de la barra. */
  progress?: number;
};

/**
 * Barra negra de acción, pegada al borde inferior (estilo editorial).
 * Toda la barra es el botón. La flecha se corre un poco al tocar.
 */
export function ActionBar({ label, onPress, loading = false, progress }: ActionBarProps) {
  const { colors, spacing, motion } = useAppTheme();
  const insets = useSafeAreaInsets();
  const empuje = useSharedValue(0);
  const avance = useSharedValue(progress ?? 0);

  useEffect(() => {
    avance.set(withSpring(progress ?? 0, motion.spring.gentle));
  }, [progress, avance, motion.spring.gentle]);

  const flechaStyle = useAnimatedStyle(() => ({ transform: [{ translateX: empuje.get() }] }));
  const avanceStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(avance.get(), 0), 1) * 100}%`,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPressIn={() => empuje.set(withSpring(8, motion.spring.snappy))}
      onPressOut={() => empuje.set(withSpring(0, motion.spring.snappy))}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{ backgroundColor: colors.text }}>
      {progress !== undefined ? (
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, avanceStyle]} />
        </View>
      ) : null}
      <View
        style={[
          styles.row,
          {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl + insets.bottom,
          },
        ]}>
        <AppText variant="headline" color="background">
          {label}
        </AppText>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Animated.View style={flechaStyle}>
            <Icon name="forward" size={24} color="primary" />
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 3 },
  fill: { height: 3 },
});
