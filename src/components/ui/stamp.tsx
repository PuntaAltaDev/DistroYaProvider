import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { fonts, useAppTheme } from '@/theme';

type StampProps = {
  /** Lo que va en el centro: el número del paso o un ícono. */
  children: ReactNode;
  /** Texto que gira alrededor. Unas 35 letras llenan la vuelta. */
  texto?: string;
  size?: number;
};

const TEXTO_BASE = 'PROVEEDORES · DISTROYA · BEBIDAS · ';

/**
 * Sello circular ámbar de DistroYa, con un texto que gira despacio alrededor.
 * Es la firma visual del estilo editorial.
 */
export function Stamp({ children, texto = TEXTO_BASE, size = 88 }: StampProps) {
  const { colors } = useAppTheme();
  const sinMovimiento = useReducedMotion();
  const giro = useSharedValue(0);
  const letras = [...texto];

  useEffect(() => {
    if (sinMovimiento) return;
    giro.set(withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1));
    return () => cancelAnimation(giro);
  }, [giro, sinMovimiento]);

  const estiloGiro = useAnimatedStyle(() => ({
    transform: [{ rotate: `${giro.get()}deg` }],
  }));

  return (
    <View
      accessible={false}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
      ]}>
      <Animated.View style={[StyleSheet.absoluteFill, estiloGiro]}>
        {letras.map((letra, i) => (
          <View
            key={i}
            style={[
              StyleSheet.absoluteFill,
              styles.letra,
              { transform: [{ rotate: `${(360 / letras.length) * i}deg` }] },
            ]}>
            <Text
              style={[
                styles.letraTexto,
                { color: colors.onPrimary, fontSize: size * 0.088, marginTop: size * 0.06 },
              ]}>
              {letra}
            </Text>
          </View>
        ))}
      </Animated.View>
      {children}
    </View>
  );
}

/** Número en serif para el centro del sello. Aparece con un pequeño zoom al cambiar. */
export function StampNumber({ value }: { value: number }) {
  const { colors } = useAppTheme();
  return (
    <Animated.Text
      key={value}
      entering={ZoomIn.duration(260)}
      style={[styles.numero, { color: colors.onPrimary }]}>
      {String(value).padStart(2, '0')}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  letra: { alignItems: 'center' },
  letraTexto: { fontFamily: fonts.semibold, lineHeight: 12 },
  numero: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 36 },
});
