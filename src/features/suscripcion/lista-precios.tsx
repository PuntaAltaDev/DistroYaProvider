import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { CATALOGO_MAX_BYTES, formatearTamano } from '@/features/registro/validacion';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { fechaCorta, type ArchivoLista } from './datos';

type ListaDePreciosProps = {
  /** La lista vigente (si subió alguna). */
  actual?: ArchivoLista;
  /** Las anteriores: solo nombre y fecha, hasta 5. */
  historial: ArchivoLista[];
  /** Se llama con el archivo nuevo. Quien lo recibe pasa el actual al historial. */
  alSubir: (nuevo: ArchivoLista) => void;
};

/** La lista de precios actual y las últimas anteriores (solo nombre y fecha). */
export function ListaDePrecios({ actual, historial, alSubir }: ListaDePreciosProps) {
  const { colors, spacing } = useAppTheme();
  const [error, setError] = useState<string>();

  const subir = async () => {
    haptics.select();
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (resultado.canceled) return;
    const archivo = resultado.assets[0];
    if (archivo.size && archivo.size > CATALOGO_MAX_BYTES) {
      setError('El archivo supera los 10 MB. Probá con uno más liviano.');
      haptics.error();
      return;
    }
    setError(undefined);
    alSubir({ nombre: archivo.name, fecha: new Date(), tamano: archivo.size });
    haptics.success();
  };

  const linea = { borderColor: colors.border };

  return (
    <View style={{ gap: spacing.xxl }}>
      {/* Lista actual */}
      <View style={{ gap: spacing.sm }}>
        <AppText variant="overline" color="textSecondary">
          LISTA DE PRECIOS
        </AppText>
        <Animated.View
          key={actual?.nombre ?? 'sin-lista'}
          entering={FadeIn.duration(300)}
          style={[styles.fila, styles.bordes, linea, { gap: spacing.md, paddingVertical: spacing.lg }]}>
          <Icon name="document" size={26} color={actual ? 'primaryText' : 'textMuted'} />
          <View style={styles.flex}>
            {actual ? (
              <>
                <AppText variant="headline" numberOfLines={1} ellipsizeMode="middle">
                  {actual.nombre}
                </AppText>
                <AppText variant="footnote" color="textSecondary">
                  Subida el {fechaCorta(actual.fecha)}
                  {actual.tamano ? ` · ${formatearTamano(actual.tamano)}` : ''}
                </AppText>
              </>
            ) : (
              <AppText variant="callout" color="textSecondary">
                Todavía no subiste tu lista.
              </AppText>
            )}
          </View>
          <Pressable onPress={subir} hitSlop={10} accessibilityRole="button">
            <AppText variant="callout" color="primaryText">
              {actual ? 'Cambiar' : 'Subir'}
            </AppText>
          </Pressable>
        </Animated.View>
        {error ? (
          <AppText variant="footnote" color="danger">
            {error}
          </AppText>
        ) : null}
      </View>

      {/* Anteriores: solo nombre y fecha, hasta 5 */}
      {historial.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="overline" color="textSecondary">
            ANTERIORES
          </AppText>
          <View style={[styles.bordeArriba, linea]}>
            {historial.map((archivo) => (
              <Animated.View
                key={`${archivo.nombre}-${archivo.fecha.getTime()}`}
                entering={FadeInDown.duration(300)}
                layout={LinearTransition.duration(250)}
                style={[styles.fila, styles.bordeAbajo, linea, { gap: spacing.md, paddingVertical: spacing.md }]}>
                <AppText variant="callout" color="textSecondary" numberOfLines={1} ellipsizeMode="middle" style={styles.flex}>
                  {archivo.nombre}
                </AppText>
                <AppText variant="footnote" color="textSecondary">
                  {fechaCorta(archivo.fecha)}
                </AppText>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: { flexDirection: 'row', alignItems: 'center' },
  bordes: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  bordeArriba: { borderTopWidth: StyleSheet.hairlineWidth },
  bordeAbajo: { borderBottomWidth: StyleSheet.hairlineWidth },
});
