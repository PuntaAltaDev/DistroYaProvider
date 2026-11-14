import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { fonts, useAppTheme } from '@/theme';

import { LARGO_CODIGO, limpiarCodigo } from './validacion';

type CampoCodigoProps = {
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  /** Se llama una sola vez cuando se completan todos los números. */
  alCompletar?: (codigo: string) => void;
};

/**
 * El código, en una casilla por número. Por debajo hay un solo campo de texto (invisible):
 * así funcionan el pegado y el autocompletado del código que llega por SMS o email.
 */
export function CampoCodigo({ valor, alCambiar, error, alCompletar }: CampoCodigoProps) {
  const { colors, spacing, motion } = useAppTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [enfocado, setEnfocado] = useState(false);
  const activa = Math.min(valor.length, LARGO_CODIGO - 1);

  // Al aparecer, queda listo para escribir (después de la animación de entrada).
  useEffect(() => {
    const espera = setTimeout(() => inputRef.current?.focus(), 450);
    return () => clearTimeout(espera);
  }, []);

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}
        style={[styles.fila, { gap: spacing.md }]}>
        {Array.from({ length: LARGO_CODIGO }, (_, i) => {
          const resaltada = enfocado && i === activa;
          const linea = error ? colors.danger : resaltada ? colors.primary : colors.borderStrong;
          return (
            <View
              key={i}
              style={[
                styles.casilla,
                { borderBottomColor: linea, borderBottomWidth: resaltada ? 2 : 1 },
              ]}>
              <AppText style={[styles.digito, { color: colors.text }]}>{valor[i] ?? ''}</AppText>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={valor}
          onChangeText={(texto) => {
            const limpio = limpiarCodigo(texto);
            alCambiar(limpio);
            if (limpio.length === LARGO_CODIGO && valor.length < LARGO_CODIGO)
              alCompletar?.(limpio);
          }}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          accessibilityLabel="Código"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={LARGO_CODIGO}
          caretHidden
          style={styles.entrada}
        />
      </Pressable>

      {error ? (
        <Animated.View entering={FadeInDown.duration(motion.duration.base)}>
          <AppText variant="footnote" color="danger">
            {error}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row' },
  casilla: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' },
  digito: {
    fontFamily: fonts.medium,
    fontSize: 28,
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
  // Cubre toda la fila, pero no se ve: recibe el toque y el teclado.
  entrada: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    outlineStyle: 'none',
  } as object,
});
