import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Icon } from '@/components/ui/icon';
import { Marco } from '@/components/ui/marco';
import { useAppTheme } from '@/theme';

import { abrirUrl } from './contacto';
import { CONTACTO, MENSAJE_INICIAL, PREGUNTAS } from './contenido';

const texto = encodeURIComponent(MENSAJE_INICIAL);

const CANALES = [
  {
    nombre: 'WhatsApp',
    detalle: 'Respuesta en el día',
    url: `https://wa.me/${CONTACTO.whatsapp}?text=${texto}`,
  },
  {
    nombre: 'Email',
    detalle: CONTACTO.email,
    url: `mailto:${CONTACTO.email}?subject=${encodeURIComponent('Consulta')}&body=${texto}`,
  },
];

/** Ayuda y contacto: escribir por WhatsApp o email, y las preguntas más comunes. */
export function AyudaScreen({ alVolver }: { alVolver: () => void }) {
  const { colors, spacing } = useAppTheme();

  return (
    <Marco alVolver={alVolver}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['¿Te']} acento="ayudamos?" clave="ayuda" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Escribinos o buscá tu duda abajo.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          CONTACTO
        </AppText>
        <View style={[styles.grupo, { borderTopColor: colors.border }]}>
          {CANALES.map((canal) => (
            <Pressable
              key={canal.nombre}
              onPress={() => abrirUrl(canal.url)}
              accessibilityRole="link"
              accessibilityLabel={`Escribir por ${canal.nombre}`}
              style={({ pressed }) => [
                styles.fila,
                {
                  paddingVertical: spacing.md,
                  borderBottomColor: colors.border,
                  backgroundColor: pressed ? colors.primarySoft : 'transparent',
                },
              ]}>
              <View style={{ gap: spacing.xxs }}>
                <AppText variant="headline">{canal.nombre}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {canal.detalle}
                </AppText>
              </View>
              <Icon name="forward" size={18} color="primaryText" />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(360).duration(400)} style={{ gap: spacing.lg }}>
        <AppText variant="overline" color="textSecondary">
          PREGUNTAS FRECUENTES
        </AppText>
        {PREGUNTAS.map(({ pregunta, respuesta }) => (
          <View key={pregunta} style={{ gap: spacing.xxs }}>
            <AppText variant="headline">{pregunta}</AppText>
            <AppText variant="subhead" color="textSecondary">
              {respuesta}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  grupo: { borderTopWidth: StyleSheet.hairlineWidth },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
