import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { fonts, useAppTheme } from '@/theme';

/** Barra de arriba: marca a la izquierda, dato a la derecha y una línea negra debajo. */
export function BarraSuperior({ derecha, alVolver }: { derecha: string; alVolver?: () => void }) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={[
        styles.barra,
        {
          marginHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          borderBottomColor: colors.text,
        },
      ]}>
      <View style={[styles.fila, { gap: spacing.md }]}>
        {alVolver ? (
          <Pressable
            onPress={alVolver}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Volver al paso anterior">
            <Icon name="back" size={20} />
          </Pressable>
        ) : null}
        <AppText variant="overline">
          DISTROYA<AppText variant="overline" color="primary">.</AppText>
        </AppText>
      </View>
      <AppText variant="caption" style={styles.derecha}>
        {derecha}
      </AppText>
    </View>
  );
}

type TitularProps = {
  /** Líneas normales del titular (cortas, van al lado del sello). */
  lineas: string[];
  /** Última línea, en cursiva ámbar. */
  acento: string;
  /** Cambia en cada paso para que la animación de entrada se repita. */
  clave: string | number;
};

/** Titular gigante en serif. Cada línea entra desde abajo, una después de la otra. */
export function Titular({ lineas, acento, clave }: TitularProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  // El tamaño acompaña el ancho del teléfono, con un mínimo y un máximo.
  const size = Math.min(Math.max(Math.min(width, 520) * 0.15, 46), 64);
  const base = { fontFamily: fonts.serif, fontSize: size, lineHeight: size * 0.98 };

  return (
    <View accessibilityRole="header">
      {lineas.map((linea, i) => (
        <Animated.Text
          key={`${clave}-${i}`}
          entering={FadeInDown.delay(i * 70).duration(420)}
          style={[base, { color: colors.text }]}>
          {linea}
        </Animated.Text>
      ))}
      <Animated.Text
        key={`${clave}-acento`}
        entering={FadeInDown.delay(lineas.length * 70).duration(420)}
        style={[base, { fontFamily: fonts.serifItalic, color: colors.primaryText }]}>
        {acento}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  fila: { flexDirection: 'row', alignItems: 'center' },
  derecha: { letterSpacing: 2 },
});
