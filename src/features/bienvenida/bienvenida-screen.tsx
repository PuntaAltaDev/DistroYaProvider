import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { AppText } from '@/components/ui/app-text';
import { BarraSuperior } from '@/components/ui/editorial';
import { fonts, useAppTheme } from '@/theme';
import { palette } from '@/theme/tokens';

import { LineaQueSeDibuja, LogoAnimado } from './animaciones';

/** Lo que va a pasar, en tres líneas. */
const PUNTOS = ['Armá tu perfil', 'Subí la lista de precios', 'Te encuentran por rubro'];

type BienvenidaScreenProps = {
  alEmpezar: () => void;
};

/** Primera pantalla de la app: el logo, el nombre, la frase y los tres pasos que siguen. */
export function BienvenidaScreen({ alEmpezar }: BienvenidaScreenProps) {
  const { colors, scheme, spacing } = useAppTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.column, styles.flex]}>
        <BarraSuperior />

        <View style={[styles.reparto, { paddingHorizontal: spacing.xl, gap: spacing.xxl }]}>
          <View style={[styles.marca, { gap: spacing.lg }]}>
            <Animated.View entering={FadeIn.duration(500)}>
              {/* En oscuro el cuadrado va un poco más claro que el fondo para que se note. */}
              <LogoAnimado
                size={96}
                fondo={scheme === 'dark' ? palette.deep800 : palette.deep900}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.textos}>
              <AppText variant="largeTitle" style={styles.centrado}>
                Distro
                <AppText variant="largeTitle" color="primary">
                  Ya
                </AppText>
              </AppText>
              <AppText variant="subhead" color="textSecondary" style={styles.centrado}>
                Proveedores y comercios, conectados.
              </AppText>
            </Animated.View>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            {/* Las líneas se dibujan de izquierda a derecha, una tras otra, mientras entran los pasos. */}
            <LineaQueSeDibuja demora={380} />
            {PUNTOS.map((punto, i) => (
              <View key={punto}>
                <Animated.View
                  entering={FadeInDown.delay(380 + i * 80).duration(400)}
                  style={[styles.fila, { gap: spacing.lg, paddingVertical: spacing.lg }]}>
                  <AppText style={[styles.numero, { color: colors.primaryText }]}>
                    {String(i + 1).padStart(2, '0')}
                  </AppText>
                  <AppText variant="headline" style={styles.texto}>
                    {punto}
                  </AppText>
                </Animated.View>
                <LineaQueSeDibuja demora={460 + i * 120} />
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.column}>
        <ActionBar label="Empezar" onPress={alEmpezar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** En pantallas anchas (tablet, web) el contenido no se estira de más. */
  column: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  reparto: { flex: 1, justifyContent: 'center' },
  marca: { alignItems: 'center' },
  textos: { alignItems: 'center', gap: 8 },
  centrado: { textAlign: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center' },
  numero: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 22,
    width: 26,
    fontVariant: ['tabular-nums'],
  },
  texto: { flex: 1 },
});
