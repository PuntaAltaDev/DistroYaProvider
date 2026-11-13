import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Marco } from '@/features/panel/marco';
import { Titular } from '@/features/registro/editorial';
import { fonts, useAppTheme } from '@/theme';

import {
  diasRestantes,
  estadoDe,
  fechaCorta,
  fechaLarga,
  fraccionRestante,
  type EstadoSuscripcion,
  type Suscripcion,
} from './datos';

const TITULO: Record<EstadoSuscripcion, string> = {
  activa: 'está activo.',
  'por-vencer': 'vence pronto.',
  vencida: 'venció.',
};

type SuscripcionScreenProps = {
  suscripcion: Suscripcion;
  alVolver: () => void;
};

/** Estado de la suscripción del proveedor: qué plan tiene y cuándo vence (EndDate). */
export function SuscripcionScreen({ suscripcion, alVolver }: SuscripcionScreenProps) {
  const { colors, spacing, motion } = useAppTheme();

  const estado = estadoDe(suscripcion);
  const dias = diasRestantes(suscripcion);
  const queda = fraccionRestante(suscripcion);
  const colorAviso = estado === 'vencida' ? 'danger' : estado === 'por-vencer' ? 'primaryText' : 'textSecondary';

  // La línea de tiempo restante se llena al entrar.
  const avance = useSharedValue(0);
  useEffect(() => {
    avance.set(withDelay(350, withSpring(queda, motion.spring.gentle)));
  }, [avance, queda, motion.spring.gentle]);
  const avanceStyle = useAnimatedStyle(() => ({ width: `${avance.get() * 100}%` }));

  return (
    <Marco derecha="MI PLAN" alVolver={alVolver} accion={{ label: 'Volver', onPress: alVolver }}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Tu plan']} acento={TITULO[estado]} clave="plan" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Plan {suscripcion.planName.toLowerCase()} desde el {fechaCorta(suscripcion.startDate)}
          </AppText>
        </Animated.View>
      </View>

      {/* Vencimiento: la fecha grande y cuánto tiempo queda. */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          {estado === 'vencida' ? 'VENCIÓ EL' : 'VENCE EL'}
        </AppText>
        <AppText numberOfLines={1} adjustsFontSizeToFit style={[styles.fecha, { color: colors.text }]}>
          {fechaLarga(suscripcion.endDate)}
        </AppText>
        <View style={[styles.pista, { backgroundColor: colors.textMuted }]}>
          <Animated.View
            style={[
              styles.relleno,
              { backgroundColor: estado === 'vencida' ? colors.danger : colors.primaryText },
              avanceStyle,
            ]}
          />
        </View>
        <AppText variant="footnote" color={colorAviso}>
          {estado === 'vencida'
            ? 'Tu perfil no aparece en el buscador. Escribinos para renovarlo.'
            : dias === 1
              ? 'Falta 1 día.'
              : `Faltan ${dias} días.`}
          {estado === 'por-vencer' ? ' Escribinos para renovarlo a tiempo.' : ''}
        </AppText>
      </Animated.View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  fecha: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34 },
  pista: { height: 1, justifyContent: 'center' },
  relleno: { height: 2.5 },
});
