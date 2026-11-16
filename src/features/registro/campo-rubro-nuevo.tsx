import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { LineField } from '@/components/ui/line-field';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import {
  buscarRubros,
  esRubroValido,
  formatearRubro,
  limpiarRubro,
  mismoRubro,
  RUBRO_MAX,
} from './rubros';

type CampoRubroNuevoProps = {
  /** Todos los rubros que ya existen (los de la lista y los que propuso este proveedor). */
  catalogo: readonly string[];
  /** Los que ya eligió. */
  elegidos: readonly string[];
  alElegir: (rubro: string) => void;
  /** Un rubro que no existe: queda propuesto, a la espera del administrador. */
  alProponer: (rubro: string) => void;
};

/**
 * "Otro rubro": un link que abre un campo con sugerencias, como el buscador de direcciones.
 * Mientras escribe aparecen los rubros que ya existen; si no hay uno igual, se ofrece agregarlo.
 */
export function CampoRubroNuevo({
  catalogo,
  elegidos,
  alElegir,
  alProponer,
}: CampoRubroNuevoProps) {
  const { spacing } = useAppTheme();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');

  if (!abierto) {
    return (
      <Pressable
        onPress={() => {
          haptics.tap();
          setAbierto(true);
        }}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.link}>
        <AppText variant="subhead" color="primaryText">
          + Otro rubro
        </AppText>
      </Pressable>
    );
  }

  const cerrar = () => {
    setTexto('');
    setAbierto(false);
  };

  const sugerencias = buscarRubros(texto, catalogo);
  const yaExiste = catalogo.some((rubro) => mismoRubro(rubro, texto));
  const puedeProponer = esRubroValido(texto) && !yaExiste;

  const elegir = (rubro: string) => {
    haptics.select();
    if (!elegidos.includes(rubro)) alElegir(rubro);
    cerrar();
  };

  const proponer = () => {
    haptics.select();
    alProponer(formatearRubro(texto));
    cerrar();
  };

  /** Con "Enter": si ya existe, lo elige; si no, lo propone. */
  const confirmar = () => {
    const igual = catalogo.find((rubro) => mismoRubro(rubro, texto));
    if (igual) elegir(igual);
    else if (puedeProponer) proponer();
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <LineField
        label="Otro rubro"
        placeholder="Ej.: Lácteos"
        value={texto}
        onChangeText={(nuevo) => setTexto(limpiarRubro(nuevo))}
        maxLength={RUBRO_MAX}
        autoFocus
        autoCapitalize="sentences"
        returnKeyType="done"
        onSubmitEditing={confirmar}
        helper="Si ya existe, lo elegimos. Si es nuevo, lo revisamos antes de mostrarlo a otros."
      />

      {sugerencias.length > 0 || puedeProponer ? (
        <Animated.View entering={FadeIn.duration(150)}>
          {sugerencias.map((rubro) => {
            const elegido = elegidos.includes(rubro);
            return (
              <Fila key={rubro} onPress={() => elegir(rubro)} disabled={elegido}>
                <AppText variant="callout" numberOfLines={1}>
                  {rubro}
                </AppText>
                {elegido ? (
                  <AppText variant="footnote" color="textSecondary">
                    Ya lo elegiste
                  </AppText>
                ) : null}
              </Fila>
            );
          })}
          {puedeProponer ? (
            <Fila onPress={proponer}>
              <AppText variant="callout" color="primaryText" numberOfLines={1}>
                + Agregar “{formatearRubro(texto)}”
              </AppText>
            </Fila>
          ) : null}
        </Animated.View>
      ) : null}

      <Pressable onPress={cerrar} hitSlop={8} accessibilityRole="button" style={styles.link}>
        <AppText variant="footnote" color="textSecondary">
          Cancelar
        </AppText>
      </Pressable>
    </View>
  );
}

function Fila({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.fila,
        {
          paddingVertical: spacing.md,
          borderBottomColor: colors.border,
          backgroundColor: pressed ? colors.primarySoft : 'transparent',
          opacity: disabled ? 0.55 : 1,
        },
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  fila: { minHeight: 52, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
});
