import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { DESCRIPCION_MAX, limpiarDescripcion } from '@/features/registro/validacion';
import { haptics } from '@/lib/haptics';
import { fonts, useAppTheme } from '@/theme';

type DescripcionNegocioProps = {
  /** Lo que escribió, si escribió algo. */
  descripcion?: string;
  /** Se llama con cada cambio: se guarda sola, sin botón. Sin texto (o solo espacios) la borra. */
  alGuardar: (descripcion: string | undefined) => void;
};

/**
 * "Contanos más sobre tu negocio": una fila que, al tocarla, abre un campo de hasta 300 caracteres
 * con contador. Se guarda sola mientras escribe y el campo se cierra al salir de él. Los clientes
 * la ven en el perfil del proveedor, solo si la despliegan.
 */
export function DescripcionNegocio({ descripcion, alGuardar }: DescripcionNegocioProps) {
  const { colors, spacing } = useAppTheme();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');

  const abrir = () => {
    haptics.tap();
    setTexto(descripcion ?? '');
    setEditando(true);
  };

  const cambiar = (nuevo: string) => {
    setTexto(nuevo);
    alGuardar(limpiarDescripcion(nuevo) || undefined);
  };

  if (!editando) {
    return (
      <Pressable
        onPress={abrir}
        accessibilityRole="button"
        style={[styles.fila, { borderBottomColor: colors.border, paddingVertical: spacing.md }]}>
        <View style={styles.textos}>
          <AppText variant="body">Contanos más sobre tu negocio</AppText>
          <AppText variant="footnote" color="textSecondary" numberOfLines={2}>
            {descripcion ?? 'Qué hacen y quiénes son. Los clientes la ven si la despliegan.'}
          </AppText>
        </View>
        <Icon name="forward" size={18} color="textSecondary" />
      </Pressable>
    );
  }

  const restantes = DESCRIPCION_MAX - texto.length;
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.editor, { borderBottomColor: colors.border, paddingVertical: spacing.md }]}>
      <AppText variant="overline" color="primaryText" style={styles.etiqueta}>
        CONTANOS MÁS
      </AppText>
      <TextInput
        value={texto}
        onChangeText={cambiar}
        onBlur={() => setEditando(false)}
        multiline
        autoFocus
        maxLength={DESCRIPCION_MAX}
        placeholder="Qué hacen, quiénes son, qué los distingue…"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        accessibilityLabel="Descripción del negocio"
        textAlignVertical="top"
        style={[styles.campo, { color: colors.text, borderColor: colors.primary }]}
      />
      <View style={styles.pie}>
        <AppText variant="footnote" color="textSecondary">
          Borrador guardado
        </AppText>
        <AppText
          variant="footnote"
          color={restantes <= 20 ? 'primaryText' : 'textSecondary'}
          style={styles.contador}>
          {texto.length} / {DESCRIPCION_MAX}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textos: { flex: 1, gap: 2 },
  editor: { gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  etiqueta: { letterSpacing: 2 },
  campo: {
    minHeight: 120,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    outlineStyle: 'none',
  } as object,
  pie: { flexDirection: 'row', justifyContent: 'space-between' },
  contador: { fontVariant: ['tabular-nums'] },
});
