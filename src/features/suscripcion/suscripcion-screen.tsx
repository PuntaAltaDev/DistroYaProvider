import { useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Icon } from '@/components/ui/icon';
import { Marco } from '@/components/ui/marco';
import { InterruptorAvisos } from '@/features/avisos/interruptor-avisos';
import { abrirWhatsApp } from '@/features/ayuda/contacto';
import { fonts, useAppTheme } from '@/theme';

import {
  DIAS_FREE,
  diasRestantes,
  esFree,
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

/**
 * Tamaño de la fecha para que entre entera en una línea, aun con meses largos y en pantallas
 * angostas: 28 como máximo, y baja según cuántas letras tiene y cuánto lugar hay.
 */
function fuenteFecha(texto: string, ancho: number) {
  const size = Math.min(28, Math.max(16, Math.floor(ancho / (texto.length * 0.58))));
  return { fontSize: size, lineHeight: size * 1.25, letterSpacing: -size * 0.03 };
}

type SuscripcionScreenProps = {
  /** Su licencia. Sin ella (cuentas viejas) se explica cómo activarla. */
  suscripcion?: Suscripcion;
  alVolver: () => void;
};

/**
 * "Mi plan": qué licencia tiene (Free o la que le asignó el administrador), cuánto le queda,
 * cuándo debe renovar y, al pie, los avisos de vencimiento. No se paga acá: para activar o
 * renovar se escribe a soporte por WhatsApp.
 */
export function SuscripcionScreen({ suscripcion, alVolver }: SuscripcionScreenProps) {
  const { colors, spacing, motion } = useAppTheme();
  const { width } = useWindowDimensions();
  /** Lo que mide la columna de contenido (la pantalla tiene un máximo de 520 y márgenes a los lados). */
  const ancho = Math.min(width, 520) - spacing.xl * 2;

  const estado = suscripcion ? estadoDe(suscripcion) : undefined;
  const free = suscripcion ? esFree(suscripcion) : false;
  const dias = suscripcion ? diasRestantes(suscripcion) : 0;
  const queda = suscripcion ? fraccionRestante(suscripcion) : 0;
  const vencida = estado === 'vencida';
  const colorAviso = vencida ? 'danger' : estado === 'por-vencer' ? 'primaryText' : 'textSecondary';

  // La barra del tiempo que queda se llena al entrar y se va acortando con los días.
  const avance = useSharedValue(0);
  useEffect(() => {
    avance.set(withDelay(350, withSpring(queda, motion.spring.gentle)));
  }, [avance, queda, motion.spring.gentle]);
  const avanceStyle = useAnimatedStyle(() => ({ width: `${avance.get() * 100}%` }));

  const accionWhatsApp = !suscripcion
    ? 'Activar mi plan por WhatsApp'
    : free && !vencida
      ? 'Activar un plan por WhatsApp'
      : 'Renovar por WhatsApp';
  const mensaje =
    free || !suscripcion
      ? 'Hola, quiero activar un plan de DistroYa Proveedores.'
      : 'Hola, quiero renovar mi plan de DistroYa Proveedores.';

  return (
    <Marco alVolver={alVolver}>
      <View style={{ gap: spacing.md }}>
        <Titular
          lineas={['Tu plan']}
          acento={estado ? (free && vencida ? 'terminó.' : TITULO[estado]) : 'no está activo.'}
          clave="plan"
        />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            {!suscripcion
              ? 'Todavía no tenés una licencia.'
              : free
                ? `Licencia Free · ${DIAS_FREE} días de prueba`
                : `Plan ${suscripcion.planName.toLowerCase()} desde el ${fechaCorta(suscripcion.startDate)}`}
          </AppText>
        </Animated.View>
      </View>

      {suscripcion ? (
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ gap: spacing.xl }}>
          {/* Contador: cuánto tiempo queda. */}
          <View style={{ gap: spacing.sm }}>
            <AppText variant="overline" color="textSecondary">
              TE QUEDAN
            </AppText>
            <AppText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.contador, { color: vencida ? colors.danger : colors.text }]}>
              {dias === 1 ? '1 día' : `${dias} días`}
            </AppText>
            <View style={[styles.pista, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.relleno,
                  { backgroundColor: vencida ? colors.danger : colors.primary },
                  avanceStyle,
                ]}
              />
            </View>
            <AppText variant="footnote" color={colorAviso}>
              {vencida
                ? 'Tu perfil no aparece en el buscador. Activá un plan para volver.'
                : estado === 'por-vencer'
                  ? 'Activá o renová a tiempo para seguir apareciendo.'
                  : 'Tu perfil aparece en el buscador.'}
            </AppText>
          </View>

          {/* Cuándo hay que renovar. */}
          <View style={{ gap: spacing.sm }}>
            <AppText variant="overline" color="textSecondary">
              {vencida ? 'VENCIÓ EL' : free ? 'LA PRUEBA TERMINA EL' : 'RENOVÁ ANTES DEL'}
            </AppText>
            <AppText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.fecha,
                fuenteFecha(fechaLarga(suscripcion.endDate), ancho),
                { color: colors.text },
              ]}>
              {fechaLarga(suscripcion.endDate)}
            </AppText>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <AppText variant="subhead" color="danger">
            Tu perfil no aparece en el buscador. Escribinos para activar tu plan.
          </AppText>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(380).duration(400)}>
        <Pressable
          onPress={() => abrirWhatsApp(mensaje)}
          accessibilityRole="link"
          style={[
            styles.fila,
            { borderTopColor: colors.border, borderBottomColor: colors.border },
          ]}>
          <AppText variant="body" color="primaryText">
            {accionWhatsApp}
          </AppText>
          <Icon name="forward" size={18} color="primaryText" />
        </Pressable>
      </Animated.View>

      {/* Al pie: los avisos de vencimiento. */}
      <Animated.View entering={FadeInDown.delay(440).duration(400)} style={{ gap: spacing.sm }}>
        <InterruptorAvisos />
        <AppText variant="footnote" color="textSecondary">
          Te avisamos en el teléfono 7 días antes y el día del vencimiento.
        </AppText>
      </Animated.View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  contador: {
    fontFamily: fonts.semibold,
    fontSize: 44,
    lineHeight: 55,
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'],
  },
  fecha: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  pista: { height: 1, justifyContent: 'center' },
  relleno: { height: 2.5 },
  fila: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
