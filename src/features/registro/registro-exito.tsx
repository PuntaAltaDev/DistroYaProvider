import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useAppTheme } from '@/theme';

import { BarraSuperior, Titular } from './editorial';

type RegistroExitoProps = {
  nombre: string;
  alRevisar: () => void;
};

/** Pantalla final: el registro se envió y queda esperando la aprobación del administrador. */
export function RegistroExito({ nombre, alRevisar }: RegistroExitoProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.column}>
        <BarraSuperior derecha="REGISTRO ENVIADO" />

        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contenido}
        >
          <View
            style={[styles.reparto, {
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xxl,
              paddingBottom: spacing.xxl,
              gap: spacing.xxl,
            }]}
          >
            <View style={{ gap: spacing.md }}>
              <Titular
                lineas={['Listo.', 'Ya estás']}
                acento="en camino."
                clave="exito"
              />
              <Animated.View entering={FadeIn.delay(260).duration(400)}>
                <AppText variant="subhead" color="textSecondary">
                  Estamos revisando los datos de {nombre}. Te avisamos cuando tu
                  perfil esté activo.
                </AppText>
              </Animated.View>
            </View>

            <Animated.View
              entering={FadeInDown.delay(380).duration(400)}
              style={[
                styles.estado,
                {
                  gap: spacing.sm,
                  paddingVertical: spacing.md,
                  borderColor: colors.text,
                },
              ]}
            >
              <Icon name="clock" size={18} color="primary" />
              <AppText variant="callout">Pendiente de aprobación</AppText>
            </Animated.View>
          </View>

        </ScrollView>
      </SafeAreaView>

      <View style={styles.barraInferior}>
        <ActionBar label="Revisar mis datos" onPress={alRevisar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  barraInferior: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  contenido: { flexGrow: 1 },
  reparto: {},
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
});
