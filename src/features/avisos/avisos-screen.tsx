import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Icon } from '@/components/ui/icon';
import { Marco } from '@/components/ui/marco';
import { fechaCorta } from '@/features/suscripcion/datos';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import type { Aviso, DestinoAviso } from './avisos';

type AvisosScreenProps = {
  avisos: Aviso[];
  /** Ids de los que no estaban leídos al abrir la bandeja: van marcados con un punto. */
  nuevos: string[];
  alAbrir: (destino: DestinoAviso) => void;
  /** Abre la pantalla para escribirles a los clientes. */
  alEnviar: () => void;
  /** Una línea sobre el último aviso enviado, si mandó alguno. */
  ultimoEnviado?: string;
  alVolver: () => void;
};

/**
 * Avisos: arriba, enviar un aviso a los clientes; abajo, la bandeja de entrada (lo que le llega
 * de DistroYa). Al tocar un aviso de la bandeja, lleva a la pantalla que corresponde.
 */
export function AvisosScreen({
  avisos,
  nuevos,
  alAbrir,
  alEnviar,
  ultimoEnviado,
  alVolver,
}: AvisosScreenProps) {
  const { colors, spacing } = useAppTheme();
  return (
    <Marco alVolver={alVolver}>
      <Titular lineas={['Tus']} acento="avisos." clave="avisos" />

      <Animated.View entering={FadeInDown.delay(180).duration(400)}>
        <Pressable
          onPress={() => {
            haptics.tap();
            alEnviar();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.fila,
            {
              gap: spacing.md,
              paddingVertical: spacing.lg,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.primarySoft : 'transparent',
            },
          ]}>
          <View style={[styles.flex, { gap: spacing.xxs }]}>
            <AppText variant="headline">Enviar aviso a clientes</AppText>
            <AppText variant="subhead" color="textSecondary" numberOfLines={1}>
              {ultimoEnviado ?? 'Promos y novedades, a su teléfono'}
            </AppText>
          </View>
          <Icon name="forward" size={18} color="primaryText" />
        </Pressable>
      </Animated.View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          BANDEJA DE ENTRADA
        </AppText>
        {avisos.length === 0 ? (
          <AppText variant="subhead" color="textSecondary">
            No tenés avisos.
          </AppText>
        ) : (
          <View>
            {avisos.map((aviso, i) => (
              <Animated.View key={aviso.id} entering={FadeInDown.delay(220 + i * 70).duration(400)}>
                <FilaAviso
                  aviso={aviso}
                  nuevo={nuevos.includes(aviso.id)}
                  primera={i === 0}
                  onPress={
                    aviso.destino
                      ? () => {
                          haptics.tap();
                          if (aviso.destino) alAbrir(aviso.destino);
                        }
                      : undefined
                  }
                />
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </Marco>
  );
}

/** Sin `onPress`, la fila no se toca ni lleva flecha: es un mensaje para leer ahí. */
type FilaAvisoProps = { aviso: Aviso; nuevo: boolean; primera: boolean; onPress?: () => void };

function FilaAviso({ aviso, nuevo, primera, onPress }: FilaAvisoProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${nuevo ? 'Nuevo. ' : ''}${aviso.titulo}. ${aviso.texto}`}
      style={({ pressed }) => [
        styles.fila,
        {
          gap: spacing.md,
          paddingVertical: spacing.lg,
          borderTopWidth: primera ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.primarySoft : 'transparent',
        },
      ]}>
      <View style={[styles.punto, { backgroundColor: nuevo ? colors.primary : 'transparent' }]} />
      <View style={[styles.flex, { gap: spacing.xxs }]}>
        <AppText variant="headline">{aviso.titulo}</AppText>
        <AppText variant="subhead" color="textSecondary">
          {aviso.texto}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {fechaCorta(aviso.fecha)}
        </AppText>
      </View>
      {onPress ? <Icon name="forward" size={18} color="textSecondary" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  punto: { width: 8, height: 8, borderRadius: 4 },
});
