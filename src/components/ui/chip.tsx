import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { fonts, useAppTheme } from '@/theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

/** Etiqueta seleccionable (para los tags/rubros). Cambia de color con una transición suave. */
export function Chip({ label, selected, onToggle }: ChipProps) {
  const { colors, radius, spacing, motion } = useAppTheme();
  const progress = useSharedValue(selected ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, { duration: motion.duration.fast }));
  }, [selected, progress, motion.duration.fast]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      [colors.background, colors.primarySoft],
    ),
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.borderStrong, colors.primary]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [colors.text, colors.primaryText]),
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPressIn={() => scale.set(withSpring(0.94, motion.spring.snappy))}
      onPressOut={() => scale.set(withSpring(1, motion.spring.snappy))}
      onPress={() => {
        haptics.select();
        onToggle();
      }}>
      <Animated.View
        style={[
          {
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          },
          boxStyle,
        ]}>
        <Animated.Text style={[{ fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 }, textStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
