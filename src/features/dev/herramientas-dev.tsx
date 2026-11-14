import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { useAppTheme } from '@/theme';

import { useSimulaciones } from './simulaciones';

/**
 * Herramientas para probar el flujo sin servidor. Solo existen mientras se desarrolla:
 * van en la barra de arriba a través de `RanuraDev` y en la app publicada no aparecen.
 * - Flecha circular: borra todo y vuelve a la bienvenida.
 * - Probeta: hace de administrador o de servidor (aprobar, rechazar, vencer el plan…).
 */
export function HerramientasDev() {
  const { spacing } = useAppTheme();
  const { reiniciar } = useCuenta();
  const simulaciones = useSimulaciones();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable
        onPress={async () => {
          await reiniciar();
          // Las rutas protegidas sacan las pantallas de la cuenta; esto cierra también las
          // abiertas sin cuenta (entrada, ayuda, legal) y deja solo la bienvenida.
          router.dismissTo('/');
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio (solo para pruebas)">
        <Icon name="restart" size={16} color="textSecondary" />
      </Pressable>
      <Pressable
        onPress={() => setAbierto(true)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Simular (solo para pruebas)">
        <Icon name="simular" size={16} color="textSecondary" />
      </Pressable>

      <BottomSheet visible={abierto} onClose={() => setAbierto(false)} title="Simular">
        <AppText variant="footnote" color="textSecondary">
          Solo para pruebas. Hace lo que después va a hacer el servidor.
        </AppText>
        <View style={{ gap: spacing.xxs }}>
          {simulaciones.length === 0 ? (
            <AppText variant="subhead" color="textSecondary">
              Nada para simular en esta pantalla.
            </AppText>
          ) : (
            simulaciones.map((s) => (
              <Pressable
                key={s.etiqueta}
                onPress={() => {
                  setAbierto(false);
                  void s.hacer();
                }}
                accessibilityRole="button"
                style={styles.accion}>
                <AppText variant="headline">{s.etiqueta}</AppText>
              </Pressable>
            ))
          )}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  accion: { minHeight: 48, justifyContent: 'center' },
});
