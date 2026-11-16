import { Linking, Platform, Pressable, StyleSheet, Switch } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme';

import { useAvisosActivos } from './use-avisos-activos';

/** "Avisos de vencimiento": el interruptor, con el aviso si el teléfono los tiene bloqueados. */
export function InterruptorAvisos() {
  const { colors } = useAppTheme();
  const { activos, bloqueados, cambiar } = useAvisosActivos();

  return (
    <>
      <Pressable
        onPress={() => cambiar(!activos)}
        accessibilityRole="switch"
        accessibilityState={{ checked: activos }}
        style={[styles.fila, { borderBottomColor: colors.border }]}>
        <AppText variant="body">Avisos de vencimiento</AppText>
        <Switch
          value={activos}
          onValueChange={cambiar}
          trackColor={{ true: colors.primary, false: colors.borderStrong }}
          accessibilityLabel="Avisos de vencimiento"
        />
      </Pressable>
      {bloqueados && Platform.OS !== 'web' ? (
        <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link">
          <AppText variant="footnote" color="textSecondary">
            Los avisos están bloqueados en tu teléfono.{' '}
            <AppText variant="footnote" color="primaryText">
              Abrir ajustes del teléfono
            </AppText>
          </AppText>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
