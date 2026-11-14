import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Logo } from '@/components/ui/logo';
import { useAppTheme } from '@/theme';
import { palette } from '@/theme/tokens';

/** Cada cuánto vuelve a pasar el brillo sobre el logo. */
const PAUSA_BRILLO_MS = 4200;
/** Qué tan fuerte es el brillo: apenas se nota. */
const OPACIDAD_BRILLO = 0.18;

/** Cuánto se inclina el carrito al saludar, hacia cada lado. */
const GRADOS_SALUDO = 15;
/** Duración de cada medio vaivén del saludo. */
const PASO_SALUDO_MS = 170;

/**
 * El logo entra con un pequeño rebote, el carrito saluda (se inclina a un lado y al otro)
 * y después un brillo cruza el cuadrado de vez en cuando, como luz sobre una superficie.
 * Si el teléfono pide reducir el movimiento, queda quieto.
 */
export function LogoAnimado({ size, fondo }: { size: number; fondo: string }) {
  const reducir = useReducedMotion();
  const escala = useSharedValue(reducir ? 1 : 0.86);
  const giro = useSharedValue(0);
  const brillo = useSharedValue(0);

  useEffect(() => {
    if (reducir) return;
    escala.set(withSpring(1, { damping: 14, stiffness: 140 }));
    // El saludo, al terminar la entrada: izquierda, derecha, izquierda, derecha y al centro.
    const paso = (grados: number) =>
      withTiming(grados, { duration: PASO_SALUDO_MS, easing: Easing.inOut(Easing.quad) });
    giro.set(
      withDelay(
        600,
        withSequence(
          paso(-GRADOS_SALUDO),
          paso(GRADOS_SALUDO),
          paso(-GRADOS_SALUDO),
          paso(GRADOS_SALUDO),
          paso(0),
        ),
      ),
    );
    // El brillo arranca cuando termina el saludo.
    brillo.set(
      withDelay(
        600 + PASO_SALUDO_MS * 5 + 150,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
            withDelay(PAUSA_BRILLO_MS, withTiming(0, { duration: 0 })),
          ),
          -1,
        ),
      ),
    );
  }, [reducir, escala, giro, brillo]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }] }));
  const carritoStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.get()}deg` }] }));
  const brilloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      brillo.get(),
      [0, 0.15, 0.85, 1],
      [0, OPACIDAD_BRILLO, OPACIDAD_BRILLO, 0],
    ),
    transform: [
      { translateX: interpolate(brillo.get(), [0, 1], [-size * 0.6, size * 1.3]) },
      { rotate: '20deg' },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.cuadrado,
        { width: size, height: size, borderRadius: (size * 30) / 130, backgroundColor: fondo },
        logoStyle,
      ]}>
      {/* El cuadrado queda quieto (es el fondo de esta vista); solo gira el carrito. */}
      <Animated.View style={carritoStyle}>
        <Logo size={size} fondo="transparent" />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.brillo,
          { top: -size * 0.25, width: size * 0.28, height: size * 1.5 },
          brilloStyle,
        ]}
      />
    </Animated.View>
  );
}

/** Línea divisoria que se dibuja de izquierda a derecha. */
export function LineaQueSeDibuja({ demora }: { demora: number }) {
  const { colors } = useAppTheme();
  const reducir = useReducedMotion();
  const avance = useSharedValue(reducir ? 1 : 0);

  useEffect(() => {
    if (reducir) return;
    avance.set(
      withDelay(demora, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })),
    );
  }, [reducir, demora, avance]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ scaleX: avance.get() }] }));

  return (
    <View>
      <Animated.View style={[styles.linea, { backgroundColor: colors.border }, estilo]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cuadrado: { overflow: 'hidden' },
  /** Luz blanca y tenue: se ve igual en claro y en oscuro porque cae sobre el cuadrado oscuro. */
  brillo: { position: 'absolute', left: 0, backgroundColor: palette.white },
  linea: { height: StyleSheet.hairlineWidth, transformOrigin: 'left' },
});
