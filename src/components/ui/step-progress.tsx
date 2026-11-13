import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/theme';

import { AppText } from './app-text';

type StepProgressProps = {
  /** Paso actual, empezando en 1. */
  current: number;
  /** Cantidad total de pasos. */
  total: number;
  /** Nombre del paso actual (opcional). */
  label?: string;
};

/** Barra de avance del registro por pasos. Se llena con un movimiento suave. */
export function StepProgress({ current, total, label }: StepProgressProps) {
  const { colors, radius, spacing, motion } = useAppTheme();
  const safeCurrent = Math.min(Math.max(current, 0), total);
  const progress = useSharedValue(safeCurrent / total);

  useEffect(() => {
    progress.set(withSpring(safeCurrent / total, motion.spring.gentle));
  }, [safeCurrent, total, progress, motion.spring.gentle]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(progress.get(), 0), 1) * 100}%`,
  }));

  return (
    <View
      style={{ gap: spacing.sm }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: safeCurrent }}>
      <View style={styles.row}>
        <AppText variant="caption" color="primaryText">
          PASO {safeCurrent} DE {total}
        </AppText>
        {label ? (
          <AppText variant="caption" color="textSecondary">
            {label}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radius.pill }, fillStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 4, overflow: 'hidden' },
  fill: { height: 4 },
});
