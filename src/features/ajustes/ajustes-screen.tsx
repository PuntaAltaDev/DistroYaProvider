import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { Marco } from '@/features/panel/marco';
import { Titular } from '@/features/registro/editorial';
import { haptics } from '@/lib/haptics';
import { useAppTheme, type ThemeMode } from '@/theme';

const MODOS: { valor: ThemeMode; etiqueta: string }[] = [
  { valor: 'light', etiqueta: 'Claro' },
  { valor: 'dark', etiqueta: 'Oscuro' },
  { valor: 'system', etiqueta: 'Como el teléfono' },
];

/** Ajustes del proveedor: cómo se ve la app y su cuenta. */
export function AjustesScreen({ alVolver }: { alVolver: () => void }) {
  const { colors, spacing, mode, setMode } = useAppTheme();
  const { reiniciar } = useCuenta();
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const eliminarCuenta = async () => {
    setEliminando(true);
    // Todavía no hay servidor: se borra lo guardado en el teléfono. Con la API, primero se
    // pide al servidor que elimine la cuenta y recién después se borra acá.
    await reiniciar();
    haptics.success();
  };

  return (
    <Marco derecha="AJUSTES" alVolver={alVolver}>
      <Titular lineas={['Tus']} acento="ajustes." clave="ajustes" />

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          APARIENCIA
        </AppText>
        <View style={[styles.grupo, { borderTopColor: colors.border }]}>
          {MODOS.map((opcion) => (
            <Pressable
              key={opcion.valor}
              onPress={() => {
                haptics.select();
                setMode(opcion.valor);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === opcion.valor }}
              style={[styles.fila, { borderBottomColor: colors.border }]}>
              <AppText variant="body">{opcion.etiqueta}</AppText>
              {mode === opcion.valor ? <Icon name="check" size={20} color="primaryText" /> : null}
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          CUENTA
        </AppText>
        <View style={[styles.grupo, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={() => setConfirmando(true)}
            accessibilityRole="button"
            style={[styles.fila, { borderBottomColor: colors.border }]}>
            <AppText variant="body" color="danger">
              Eliminar cuenta
            </AppText>
          </Pressable>
        </View>
      </Animated.View>

      <BottomSheet
        visible={confirmando}
        onClose={() => !eliminando && setConfirmando(false)}
        title="¿Eliminar tu cuenta?">
        <AppText variant="subhead" color="textSecondary">
          Se borran tu perfil, tu logo y tu lista de precios, y volvés al registro. No se puede
          deshacer.
        </AppText>
        <View style={{ gap: spacing.xs }}>
          <Pressable
            onPress={eliminarCuenta}
            disabled={eliminando}
            accessibilityRole="button"
            style={styles.accion}>
            <AppText variant="headline" color="danger">
              {eliminando ? 'Eliminando…' : 'Eliminar cuenta'}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setConfirmando(false)}
            disabled={eliminando}
            accessibilityRole="button"
            style={styles.accion}>
            <AppText variant="headline">Cancelar</AppText>
          </Pressable>
        </View>
      </BottomSheet>
    </Marco>
  );
}

const styles = StyleSheet.create({
  grupo: { borderTopWidth: StyleSheet.hairlineWidth },
  fila: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accion: { minHeight: 52, justifyContent: 'center' },
});
