import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { LineField, type LineFieldRef } from '@/components/ui/line-field';
import { haptics } from '@/lib/haptics';
import {
  buscarDirecciones,
  detalleDeLugar,
  nuevaSesion,
  PLACES_ACTIVO,
  type Lugar,
  type Sugerencia,
} from '@/lib/places';
import { useAppTheme } from '@/theme';

/** Espera después de la última tecla antes de buscar, para no consultar a Google por cada letra. */
const ESPERA_MS = 300;
const MIN_LETRAS = 3;

type CampoDireccionProps = Pick<TextInputProps, 'autoFocus' | 'returnKeyType' | 'onSubmitEditing'> & {
  valor: string;
  lugar?: Lugar;
  error?: string;
  /** Cada cambio informa el texto y la dirección elegida (vacía si se volvió a escribir). */
  alCambiar: (cambios: { direccion: string; lugar?: Lugar }) => void;
  inputRef?: LineFieldRef;
};

/**
 * Campo de dirección con sugerencias de Google: se escribe la calle, se elige una opción
 * y la localidad y la provincia quedan cargadas solas, así no se olvida la ciudad.
 */
export function CampoDireccion({
  valor,
  lugar,
  error,
  alCambiar,
  inputRef,
  ...campo
}: CampoDireccionProps) {
  const { colors, spacing } = useAppTheme();
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [fallo, setFallo] = useState<string>();
  const sesion = useRef<string>(null);
  const espera = useRef<ReturnType<typeof setTimeout>>(null);
  const consulta = useRef<AbortController>(null);

  // Al salir de la pantalla se cancela cualquier búsqueda pendiente.
  useEffect(
    () => () => {
      if (espera.current) clearTimeout(espera.current);
      consulta.current?.abort();
    },
    [],
  );

  const cancelar = () => {
    if (espera.current) clearTimeout(espera.current);
    consulta.current?.abort();
  };

  const escribir = (texto: string) => {
    // Si vuelve a escribir, la dirección elegida ya no vale.
    alCambiar({ direccion: texto, lugar: undefined });
    setFallo(undefined);
    cancelar();

    if (!PLACES_ACTIVO) return;
    if (texto.trim().length < MIN_LETRAS) {
      setSugerencias([]);
      return;
    }

    espera.current = setTimeout(async () => {
      const control = new AbortController();
      consulta.current = control;
      sesion.current ??= nuevaSesion();
      try {
        setSugerencias(await buscarDirecciones(texto.trim(), sesion.current, control.signal));
      } catch {
        // Una búsqueda cancelada no es un error: solo se avisa si la pidió el usuario y falló.
        if (!control.signal.aborted) setFallo('No pudimos buscar la dirección. Revisá tu conexión.');
      }
    }, ESPERA_MS);
  };

  const elegir = async (sugerencia: Sugerencia) => {
    haptics.select();
    cancelar();
    setSugerencias([]);
    setFallo(undefined);
    try {
      const elegida = await detalleDeLugar(sugerencia.placeId, sesion.current ?? nuevaSesion());
      sesion.current = null;
      alCambiar({ direccion: elegida.texto, lugar: elegida.lugar });
    } catch {
      setFallo('No pudimos cargar esa dirección. Probá con otra.');
    }
  };

  const ubicacion = lugar ? [lugar.localidad, lugar.provincia].filter(Boolean).join(', ') : '';

  return (
    <View style={{ gap: spacing.sm }}>
      <LineField
        {...campo}
        inputRef={inputRef}
        label="Dirección"
        placeholder="Calle y número"
        value={valor}
        onChangeText={escribir}
        error={error ?? fallo}
        helper={ubicacion || (PLACES_ACTIVO ? 'Calle y número, ciudad, provincia' : undefined)}
        autoCapitalize="words"
        autoComplete="street-address"
      />

      {sugerencias.length > 0 ? (
        <Animated.View entering={FadeIn.duration(150)}>
          {sugerencias.map((s) => (
            <Pressable
              key={s.placeId}
              onPress={() => elegir(s)}
              accessibilityRole="button"
              accessibilityLabel={`${s.principal}. ${s.secundario}`}
              style={({ pressed }) => [
                styles.fila,
                {
                  paddingVertical: spacing.md,
                  borderBottomColor: colors.border,
                  backgroundColor: pressed ? colors.primarySoft : 'transparent',
                },
              ]}>
              <AppText variant="callout" numberOfLines={1}>
                {s.principal}
              </AppText>
              {s.secundario ? (
                <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
                  {s.secundario}
                </AppText>
              ) : null}
            </Pressable>
          ))}
          {/* Google pide mostrar su nombre cuando las sugerencias no van sobre un mapa suyo. */}
          <AppText variant="footnote" color="textSecondary" style={styles.google}>
            Google Maps
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { minHeight: 52, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  google: { textAlign: 'right', paddingTop: 6 },
});
