import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { LineField } from '@/components/ui/line-field';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

/** Largo máximo de cada campo: alcanza para "12", "PB", "Local 3" o "2° B". */
export const LARGO_PISO_DEPTO = 10;

type CampoPisoDeptoProps = {
  piso: string;
  depto: string;
  alCambiar: (cambios: { piso?: string; depto?: string }) => void;
};

/**
 * Piso y depto de la dirección, solo para quien los tiene. La pantalla queda limpia: se ve un
 * link, y los campos aparecen al tocarlo (o ya abiertos si hay algo cargado).
 */
export function CampoPisoDepto({ piso, depto, alCambiar }: CampoPisoDeptoProps) {
  const { spacing } = useAppTheme();
  const [abierto, setAbierto] = useState(piso !== '' || depto !== '');
  /** Solo al abrirlo con el link el teclado va al primer campo; si ya venía abierto, no. */
  const [recienAbierto, setRecienAbierto] = useState(false);

  if (!abierto) {
    return (
      <Pressable
        onPress={() => {
          haptics.tap();
          setRecienAbierto(true);
          setAbierto(true);
        }}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.link}>
        <AppText variant="subhead" color="primaryText">
          + Agregar piso o depto
        </AppText>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.fila, { gap: spacing.lg }]}>
      <View style={styles.campo}>
        <LineField
          label="Piso"
          placeholder="2"
          value={piso}
          onChangeText={(texto) => alCambiar({ piso: texto })}
          maxLength={LARGO_PISO_DEPTO}
          autoFocus={recienAbierto}
          returnKeyType="next"
        />
      </View>
      <View style={styles.campo}>
        <LineField
          label="Depto"
          placeholder="B"
          value={depto}
          onChangeText={(texto) => alCambiar({ depto: texto })}
          maxLength={LARGO_PISO_DEPTO}
          returnKeyType="done"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  fila: { flexDirection: 'row' },
  campo: { flex: 1 },
});
