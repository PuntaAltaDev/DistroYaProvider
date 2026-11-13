import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { BarraSuperior } from '@/features/registro/editorial';
import { useAppTheme } from '@/theme';

type MarcoProps = {
  /** Texto de la barra de arriba, a la derecha (ej.: "MI PLAN"). */
  derecha: string;
  alVolver?: () => void;
  /** Botón negro de abajo. Si no está, la pantalla no lleva barra inferior. */
  accion?: { label: string; onPress: () => void };
  children: ReactNode;
};

/** Esqueleto de las pantallas del panel: barra de arriba, contenido con scroll y barra negra abajo. */
export function Marco({ derecha, alVolver, accion, children }: MarcoProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={accion ? ['top'] : ['top', 'bottom']} style={styles.column}>
        <BarraSuperior derecha={derecha} alVolver={alVolver} />
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xxl,
            gap: spacing.xxl,
          }}>
          {children}
        </ScrollView>
      </SafeAreaView>

      {accion ? (
        <View style={styles.barraInferior}>
          <ActionBar label={accion.label} onPress={accion.onPress} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** En pantallas anchas (tablet, web) el contenido no se estira de más. */
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  barraInferior: { width: '100%', maxWidth: 520, alignSelf: 'center' },
});
