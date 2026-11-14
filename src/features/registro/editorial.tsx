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
        <View style={[styles.fila, { gap: spacing.lg }]}>
          <CambioDeModo />
          <AppText variant="caption" style={styles.derecha}>
            {derecha}
          </AppText>
        </View>
      </View>
      {conAvance ? (
        <Animated.View
          style={[
            styles.avance,
            { backgroundColor: colors.primary },
            avanceStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

/** Circulito mitad lleno: cambia entre claro y oscuro. Solo para revisar el diseño. */
function CambioDeModo() {
  const { scheme, setMode, colors } = useAppTheme();
  const oscuro = scheme === 'dark';

  return (
    <Pressable
      onPress={() => setMode(oscuro ? 'light' : 'dark')}
      hitSlop={15}
      accessibilityRole="switch"
      accessibilityState={{ checked: oscuro }}
      accessibilityLabel="Modo oscuro">
      <View style={[styles.modo, { borderColor: colors.textSecondary }]}>
        <View style={[styles.modoMitad, { backgroundColor: colors.textSecondary }]} />
      </View>
    </Pressable>
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

/** Titular grande: Inter 600 y la última frase en Inter 200. Cada línea entra desde abajo. */
export function Titular({ lineas, acento, clave }: TitularProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  // El tamaño acompaña el ancho del teléfono, con un mínimo y un máximo.
  const size = Math.min(Math.max(Math.min(width, 520) * 0.12, 40), 58);
  const base = {
    fontFamily: fonts.semibold,
    fontSize: size,
    lineHeight: size * 1.06,
    letterSpacing: -size * 0.035,
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
          { fontFamily: fonts.light, color: colors.accent },
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
  modo: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, overflow: 'hidden' },
  modoMitad: { width: '50%', height: '100%' },
});
