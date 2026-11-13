import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { fonts, useAppTheme } from '@/theme';

import { AppText } from './app-text';

type TextFieldProps = Omit<TextInputProps, 'placeholder' | 'style'> & {
  /** Nombre del campo. Flota hacia arriba cuando se escribe. */
  label: string;
  /** Mensaje de error. Si existe, el campo se marca en rojo. */
  error?: string;
  /** Texto de ayuda debajo del campo. */
  helper?: string;
};

/**
 * Campo de texto de DistroYa.
 * La etiqueta empieza adentro del campo y sube, achicándose, al tocarlo.
 * El borde pasa a ámbar cuando está activo.
 */
export function TextField({
  label,
  error,
  helper,
  value,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { colors, radius, sizes, spacing, motion, typography } = useAppTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  const hasText = !!value;
  /** 0 = etiqueta adentro (campo vacío). 1 = etiqueta arriba. */
  const lifted = useSharedValue(hasText ? 1 : 0);
  /** 0 = borde normal. 1 = borde ámbar (activo). */
  const active = useSharedValue(0);

  useEffect(() => {
    lifted.set(withTiming(focused || hasText ? 1 : 0, { duration: motion.duration.fast }));
    active.set(withTiming(focused ? 1 : 0, { duration: motion.duration.fast }));
  }, [focused, hasText, lifted, active, motion.duration.fast]);

  const borderIdle = error ? colors.danger : colors.border;
  const borderActive = error ? colors.danger : colors.primary;
  const labelIdle = colors.textSecondary;
  const labelActive = error ? colors.danger : colors.primaryText;

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(active.get(), [0, 1], [borderIdle, borderActive]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    top: interpolate(lifted.get(), [0, 1], [18, 8]),
    fontSize: interpolate(lifted.get(), [0, 1], [16, 12]),
    color: interpolateColor(active.get(), [0, 1], [labelIdle, labelActive]),
  }));

  return (
    <View style={{ gap: spacing.xs }}>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <Animated.View
          style={[
            styles.box,
            boxStyle,
            {
              height: sizes.inputHeight,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.background,
              borderWidth: focused || error ? 1.5 : 1,
            },
          ]}>
          <Animated.Text
            numberOfLines={1}
            style={[styles.label, { left: spacing.lg, fontFamily: fonts.medium }, labelStyle]}>
            {label}
          </Animated.Text>
          <TextInput
            {...rest}
            ref={inputRef}
            value={value}
            accessibilityLabel={label}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            style={[styles.input, typography.body, { color: colors.text }]}
          />
        </Animated.View>
      </Pressable>

      {error ? (
        <Animated.View entering={FadeInDown.duration(motion.duration.base)} exiting={FadeOut}>
          <AppText variant="footnote" color="danger" style={{ paddingHorizontal: spacing.xs }}>
            {error}
          </AppText>
        </Animated.View>
      ) : helper ? (
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: spacing.xs }}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { justifyContent: 'flex-end' },
  label: { position: 'absolute' },
  // `outlineStyle` saca el recuadro azul que agrega el navegador en la versión web.
  input: { paddingBottom: 8, paddingTop: 0, outlineStyle: 'none' } as object,
});
