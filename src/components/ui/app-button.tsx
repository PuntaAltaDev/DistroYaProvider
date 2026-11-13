import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { AppText } from './app-text';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  /** Texto del botón. */
  label: string;
  /** `primary` = ámbar (uno por pantalla). `secondary` = borde. `ghost` = solo texto. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Muestra un indicador de carga y bloquea el toque. */
  loading?: boolean;
  /** Ícono opcional a la izquierda del texto. */
  icon?: ReactNode;
};

/** Botón de DistroYa: se achica con un rebote suave al tocarlo y vibra apenas. */
export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  onPress,
  ...rest
}: AppButtonProps) {
  const { colors, radius, sizes, spacing, motion } = useAppTheme();
  const scale = useSharedValue(1);
  const blocked = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const background = {
    primary: colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
  }[variant];
  const pressedBackground = {
    primary: colors.primaryPressed,
    secondary: colors.surfaceAlt,
    ghost: colors.primarySoft,
  }[variant];
  const textColor = variant === 'primary' ? 'onPrimary' : variant === 'ghost' ? 'primaryText' : 'text';

  return (
    <Animated.View style={[animatedStyle, blocked && styles.blocked]}>
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!blocked, busy: loading }}
        disabled={blocked}
        onPressIn={() => scale.set(withSpring(motion.pressScale, motion.spring.snappy))}
        onPressOut={() => scale.set(withSpring(1, motion.spring.snappy))}
        onPress={(event) => {
          haptics.tap();
          onPress?.(event);
        }}
        style={({ pressed }) => [
          styles.base,
          {
            height: sizes.buttonHeight,
            borderRadius: radius.md,
            paddingHorizontal: spacing.xl,
            gap: spacing.sm,
            backgroundColor: pressed ? pressedBackground : background,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: colors.borderStrong,
          },
        ]}>
        {loading ? (
          <ActivityIndicator color={colors[textColor]} />
        ) : (
          <>
            {icon}
            <AppText variant="headline" color={textColor}>
              {label}
            </AppText>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  blocked: { opacity: 0.5 },
});
