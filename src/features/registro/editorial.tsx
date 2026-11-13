import { useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { fonts, useAppTheme } from '@/theme';

type BarraSuperiorProps = {
  derecha: string;
  alVolver?: () => void;
  /** Avance de 0 a 1. Si está, la línea de abajo crece con cada paso, en ámbar. */
  progreso?: number;
};

/** Barra de arriba: marca a la izquierda, dato a la derecha y una línea debajo. */
export function BarraSuperior({
  derecha,
  alVolver,
  progreso,
}: BarraSuperiorProps) {
  const { colors, spacing, motion } = useAppTheme();
  const conAvance = progreso !== undefined;
  const avance = useSharedValue(progreso ?? 0);

  useEffect(() => {
    avance.set(withSpring(progreso ?? 0, motion.spring.gentle));
  }, [progreso, avance, motion.spring.gentle]);

  const avanceStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(avance.get(), 0), 1) * 100}%`,
  }));

  return (
    <View style={{ marginHorizontal: spacing.xl }}>
      <View
        style={[
          styles.barra,
          {
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomWidth: conAvance ? 0 : 1,
            borderBottomColor: colors.text,
          },
        ]}
      >
        <View style={[styles.fila, { gap: spacing.md }]}>
          {alVolver ? (
            <Pressable
              onPress={alVolver}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel="Volver al paso anterior"
            >
              <Icon name="back" size={20} />
            </Pressable>
          ) : null}
          <AppText variant="overline">
            PROVEEDORES
            <AppText variant="overline" color="primary">
              .
            </AppText>
          </AppText>
        </View>
        <AppText variant="caption" style={styles.derecha}>
          {derecha}
        </AppText>
      </View>
      {conAvance ? (
        <Animated.View
          style={[
            styles.avance,
            { backgroundColor: colors.primaryText },
            avanceStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

type TitularProps = {
  /** Líneas normales del titular (cortas). */
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
  const size = Math.min(Math.max(Math.min(width, 520) * 0.17, 50), 76);
  const base = {
    fontFamily: fonts.serif,
    fontSize: size,
    lineHeight: size * 0.98,
  };

  return (
    <View accessibilityRole="header">
      {lineas.map((linea, i) => (
        <Animated.Text
          key={`${clave}-${i}`}
          entering={FadeInDown.delay(i * 70).duration(420)}
          style={[base, { color: colors.text }]}
        >
          {linea}
        </Animated.Text>
      ))}
      <Animated.Text
        key={`${clave}-acento`}
        entering={FadeInDown.delay(lineas.length * 70).duration(420)}
        style={[
          base,
          { fontFamily: fonts.serifItalic, color: colors.primaryText },
        ]}
      >
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
  },
  fila: { flexDirection: 'row', alignItems: 'center' },
  avance: { height: 2.5 },
  derecha: { letterSpacing: 2 },
});
