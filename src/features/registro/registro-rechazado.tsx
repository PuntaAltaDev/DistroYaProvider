import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Marco } from '@/components/ui/marco';
import { useAppTheme } from '@/theme';

type RegistroRechazadoProps = {
  nombre: string;
  motivo: string;
  /** Vuelve al registro con los datos cargados, para corregir y reenviar. */
  alCorregir: () => void;
};

/** El administrador no aprobó el perfil: qué hay que corregir y el botón para hacerlo. */
export function RegistroRechazado({ nombre, motivo, alCorregir }: RegistroRechazadoProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Marco derecha="A CORREGIR" accion={{ label: 'Corregir y reenviar', onPress: alCorregir }}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Revisá']} acento="tus datos." clave="rechazado" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Todavía no pudimos aprobar el perfil de {nombre}. Corregí lo que falta y volvé a
            enviarlo.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(320).duration(400)}
        style={[
          styles.motivo,
          { gap: spacing.xs, paddingVertical: spacing.md, borderColor: colors.danger },
        ]}>
        <AppText variant="overline" color="danger">
          QUÉ CORREGIR
        </AppText>
        <AppText variant="callout">{motivo}</AppText>
      </Animated.View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  motivo: { borderTopWidth: 2, borderBottomWidth: 2 },
});
