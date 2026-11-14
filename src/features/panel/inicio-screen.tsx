import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { haptics } from '@/lib/haptics';
import { Titular } from '@/features/registro/editorial';
import { fonts, useAppTheme } from '@/theme';

import { Marco } from './marco';

export type Acceso = {
  titulo: string;
  /** Una línea con el dato más útil de esa sección. */
  detalle: string;
  /** Si es true, el detalle se pinta en ámbar (ej.: el plan vence pronto). */
  aviso?: boolean;
  onPress: () => void;
};

type InicioScreenProps = {
  nombre: string;
  accesos: Acceso[];
};

/** Pantalla de inicio del proveedor: saludo y los accesos a su perfil, su plan y su lista de precios. */
export function InicioScreen({ nombre, accesos }: InicioScreenProps) {
  const { spacing } = useAppTheme();

  return (
    <Marco derecha="INICIO">
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Hola,']} acento={`${nombre || 'proveedor'}.`} clave="inicio" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Todo lo de tu negocio, en un solo lugar.
          </AppText>
        </Animated.View>
      </View>

      <View>
        {accesos.map((acceso, i) => (
          <Animated.View key={acceso.titulo} entering={FadeInDown.delay(280 + i * 80).duration(400)}>
            <FilaAcceso numero={i + 1} primera={i === 0} {...acceso} />
          </Animated.View>
        ))}
      </View>
    </Marco>
  );
}

function FilaAcceso({
  numero,
  primera,
  titulo,
  detalle,
  aviso,
  onPress,
}: Acceso & { numero: number; primera: boolean }) {
  const { colors, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${detalle}`}
      style={({ pressed }) => [
        styles.fila,
        {
          gap: spacing.lg,
          paddingVertical: spacing.xl,
          borderTopWidth: primera ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.primarySoft : 'transparent',
        },
      ]}>
      <AppText style={[styles.numero, { color: colors.primaryText }]}>
        {String(numero).padStart(2, '0')}
      </AppText>
      <View style={[styles.flex, { gap: spacing.xxs }]}>
        <AppText style={[styles.titulo, { color: colors.text }]}>{titulo}</AppText>
        <AppText variant="footnote" color={aviso ? 'primaryText' : 'textSecondary'} numberOfLines={1} ellipsizeMode="middle">
          {detalle}
        </AppText>
      </View>
      <Icon name="forward" size={20} color="primaryText" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numero: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22, width: 26, fontVariant: ['tabular-nums'] },
  titulo: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 28, letterSpacing: -0.7 },
});
