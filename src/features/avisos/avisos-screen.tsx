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
  alVolver: () => void;
};

/** Bandeja de avisos. Al tocar uno, lleva a la pantalla que corresponde. */
export function AvisosScreen({ avisos, nuevos, alAbrir, alVolver }: AvisosScreenProps) {
  return (
    <Marco derecha="AVISOS" alVolver={alVolver}>
      <Titular lineas={['Tus']} acento="avisos." clave="avisos" />

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
                onPress={() => {
                  haptics.tap();
                  alAbrir(aviso.destino);
                }}
              />
            </Animated.View>
          ))}
        </View>
      )}
    </Marco>
  );
}

type FilaAvisoProps = { aviso: Aviso; nuevo: boolean; primera: boolean; onPress: () => void };

function FilaAviso({ aviso, nuevo, primera, onPress }: FilaAvisoProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
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
      <Icon name="forward" size={18} color="textSecondary" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  punto: { width: 8, height: 8, borderRadius: 4 },
});
