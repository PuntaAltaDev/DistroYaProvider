import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fonts, useAppTheme } from '@/theme';

import { AppText } from './app-text';
import type { TextFieldRef } from './text-field';

type LineFieldProps = Omit<TextInputProps, 'style'> & {
  /** Etiqueta chica en mayúsculas, arriba del texto. */
  label: string;
  error?: string;
  helper?: string;
  inputRef?: TextFieldRef;
};

/**
 * Campo "línea" del estilo editorial: etiqueta chica en mayúsculas,
 * texto grande y una sola línea negra abajo que se pone ámbar al escribir.
 */
export function LineField({
  label,
  error,
  helper,
  inputRef: externalRef,
  onFocus,
  onBlur,
  ...rest
}: LineFieldProps) {
  const { colors, spacing, motion } = useAppTheme();
  const localRef = useRef<ComponentRef<typeof TextInput>>(null);
  const inputRef = externalRef ?? localRef;
  const [focused, setFocused] = useState(false);
  const active = useSharedValue(0);

  useEffect(() => {
    active.set(withTiming(focused ? 1 : 0, { duration: motion.duration.fast }));
  }, [focused, active, motion.duration.fast]);

  const idle = error ? colors.danger : colors.textMuted;
  const activeColor = error ? colors.danger : colors.primary;
  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(active.get(), [0, 1], [idle, activeColor]),
  }));

  // Cursor propio: un rectangulito ámbar que titila al final del texto.
  const sinMovimiento = useReducedMotion();
  const titileo = useSharedValue(1);
  const valor = typeof rest.value === 'string' ? rest.value : '';
  const [anchoTexto, setAnchoTexto] = useState(0);

  useEffect(() => {
    titileo.set(1);
    if (!focused || sinMovimiento) return;
    // Mientras escribís queda prendido; cuando parás, vuelve a titilar.
    titileo.set(
      withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 60 }),
            withDelay(440, withTiming(1, { duration: 60 })),
            withDelay(440, withTiming(1, { duration: 0 })),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(titileo);
  }, [focused, sinMovimiento, titileo, valor]);

  const cursorStyle = useAnimatedStyle(() => ({ opacity: titileo.get() }));

  // Al entrar a la pantalla, el campo queda listo para escribir (después de la animación de entrada).
  const enfocarAlEntrar = rest.autoFocus;
  useEffect(() => {
    if (!enfocarAlEntrar) return;
    const espera = setTimeout(() => inputRef.current?.focus(), 450);
    return () => clearTimeout(espera);
  }, [enfocarAlEntrar, inputRef]);

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false} style={{ gap: spacing.xs }}>
        <AppText
          variant="overline"
          color={error ? 'danger' : focused ? 'primaryText' : 'textSecondary'}
          style={styles.label}>
          {label.toUpperCase()}
        </AppText>
        <View>
          {/* Copia invisible del texto, solo para medir dónde termina y poner ahí el cursor. */}
          <Text
            aria-hidden
            onLayout={(e) => setAnchoTexto(e.nativeEvent.layout.width)}
            style={[styles.input, styles.medida]}>
            {valor}
          </Text>
          <TextInput
            {...rest}
            ref={inputRef}
            accessibilityLabel={label}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            caretHidden
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[
              styles.input,
              // Con el campo vacío, el ejemplo arranca después del cursor para que no lo pise.
              { color: colors.text, paddingLeft: focused && !valor ? ANCHO_CURSOR + 6 : 0 },
            ]}
          />
          {focused ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.cursor,
                { left: valor ? anchoTexto + 2 : 0, backgroundColor: colors.primary },
                cursorStyle,
              ]}
            />
          ) : null}
        </View>
        <Animated.View style={[styles.line, lineStyle]} />
      </Pressable>

      {error ? (
        <Animated.View entering={FadeInDown.duration(motion.duration.base)}>
          <AppText variant="footnote" color="danger">
            {error}
          </AppText>
        </Animated.View>
      ) : helper ? (
        <AppText variant="footnote" color="textSecondary">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const ANCHO_CURSOR = 8;

const styles = StyleSheet.create({
  label: { letterSpacing: 2 },
  line: { height: 1 },
  medida: { position: 'absolute', opacity: 0, alignSelf: 'flex-start' },
  cursor: { position: 'absolute', top: 8, width: ANCHO_CURSOR, height: 26 },
  // `outlineStyle` saca el recuadro azul del navegador en la versión web.
  input: {
    fontFamily: fonts.medium,
    fontSize: 22,
    paddingVertical: 6,
    paddingHorizontal: 0,
    outlineStyle: 'none',
  } as object,
});
