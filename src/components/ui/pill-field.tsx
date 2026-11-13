import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { fonts, useAppTheme } from '@/theme';

import { AppText } from './app-text';
import type { TextFieldRef } from './text-field';

type PillFieldProps = Omit<TextInputProps, 'style'> & {
  /** Nombre del campo para lectores de pantalla (la pregunta ya está en el titular). */
  label: string;
  error?: string;
  helper?: string;
  inputRef?: TextFieldRef;
};

/**
 * Campo "píldora" del estilo editorial: borde negro redondeado, sin etiqueta.
 * La pregunta la hace el titular; este campo solo recibe la respuesta.
 */
export function PillField({
  label,
  error,
  helper,
  inputRef: externalRef,
  onFocus,
  onBlur,
  ...rest
}: PillFieldProps) {
  const { colors, spacing, motion } = useAppTheme();
  const localRef = useRef<ComponentRef<typeof TextInput>>(null);
  const inputRef = externalRef ?? localRef;
  const [focused, setFocused] = useState(false);
  const active = useSharedValue(0);

  useEffect(() => {
    active.set(withTiming(focused ? 1 : 0, { duration: motion.duration.fast }));
  }, [focused, active, motion.duration.fast]);

  const idle = error ? colors.danger : colors.text;
  const activeColor = error ? colors.danger : colors.primary;
  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(active.get(), [0, 1], [idle, activeColor]),
  }));

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <Animated.View style={[styles.box, { paddingHorizontal: spacing.xl }, boxStyle]}>
          <TextInput
            {...rest}
            ref={inputRef}
            accessibilityLabel={label}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[styles.input, { color: colors.text }]}
          />
        </Animated.View>
      </Pressable>

      {error ? (
        <Animated.View entering={FadeInDown.duration(motion.duration.base)}>
          <AppText variant="footnote" color="danger" style={{ paddingHorizontal: spacing.xl }}>
            {error}
          </AppText>
        </Animated.View>
      ) : helper ? (
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: spacing.xl }}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 58, borderRadius: 999, borderWidth: 1.5, justifyContent: 'center' },
  // `outlineStyle` saca el recuadro azul del navegador en la versión web.
  input: {
    fontFamily: fonts.medium,
    fontSize: 17,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as object,
});
