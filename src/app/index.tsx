import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BottomTabInset } from '@/constants/theme';
import { useAppTheme, type AppColors, type ThemeMode, type TypographyVariant } from '@/theme';

/**
 * Pantalla de muestra del sistema de diseño.
 * Es temporal: sirve para revisar colores, letras y botones.
 * Se reemplaza cuando empecemos con el registro.
 */

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

const SWATCHES: { key: keyof AppColors; label: string }[] = [
  { key: 'primary', label: 'Ámbar' },
  { key: 'primarySoft', label: 'Ámbar suave' },
  { key: 'text', label: 'Texto' },
  { key: 'textSecondary', label: 'Secundario' },
  { key: 'surfaceAlt', label: 'Superficie' },
  { key: 'border', label: 'Borde' },
  { key: 'success', label: 'Éxito' },
  { key: 'danger', label: 'Error' },
];

const TYPE_SAMPLES: { variant: TypographyVariant; label: string }[] = [
  { variant: 'largeTitle', label: 'Título grande' },
  { variant: 'title', label: 'Título' },
  { variant: 'title2', label: 'Título 2' },
  { variant: 'headline', label: 'Encabezado' },
  { variant: 'body', label: 'Texto principal' },
  { variant: 'subhead', label: 'Texto de apoyo' },
  { variant: 'footnote', label: 'Nota al pie' },
  { variant: 'caption', label: 'Etiqueta' },
];

export default function DesignSystemScreen() {
  const { colors, spacing, radius, sizes, mode, setMode, motion } = useAppTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: BottomTabInset + spacing.xxxl,
          gap: spacing.xxl,
        }}>
        {/* Encabezado */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="overline">
            DISTROYA<AppText variant="overline" color="primary">.</AppText>
          </AppText>
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
          <AppText variant="largeTitle">Sistema de diseño</AppText>
          <AppText variant="subhead" color="textSecondary">
            Colores, letras y piezas base de la app.
          </AppText>
        </View>

        {/* Modo claro / oscuro */}
        <Section title="Modo">
          <View
            style={[
              styles.segmented,
              { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.xs },
            ]}>
            {MODES.map((item) => {
              const active = mode === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setMode(item.value)}
                  style={[
                    styles.segment,
                    {
                      borderRadius: radius.sm,
                      paddingVertical: spacing.sm,
                      backgroundColor: active ? colors.background : 'transparent',
                    },
                  ]}>
                  <AppText variant="callout" color={active ? 'text' : 'textSecondary'}>
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Colores */}
        <Section title="Colores">
          <View style={[styles.grid, { gap: spacing.md }]}>
            {SWATCHES.map((swatch) => (
              <View key={swatch.key} style={styles.swatchItem}>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: colors[swatch.key],
                      borderRadius: radius.md,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <AppText variant="caption" color="textSecondary">
                  {swatch.label}
                </AppText>
              </View>
            ))}
          </View>
        </Section>

        {/* Tipografía */}
        <Section title="Tipografía · Inter">
          <View style={{ gap: spacing.md }}>
            {TYPE_SAMPLES.map((sample) => (
              <AppText key={sample.variant} variant={sample.variant}>
                {sample.label}
              </AppText>
            ))}
          </View>
        </Section>

        {/* Botones */}
        <Section title="Botones">
          <View style={{ gap: spacing.md }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  height: sizes.buttonHeight,
                  borderRadius: radius.md,
                  backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                  transform: [{ scale: pressed ? motion.pressScale : 1 }],
                },
              ]}>
              <AppText variant="headline" color="onPrimary">
                Botón principal
              </AppText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  height: sizes.buttonHeight,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                  transform: [{ scale: pressed ? motion.pressScale : 1 }],
                },
              ]}>
              <AppText variant="headline">Botón secundario</AppText>
            </Pressable>
          </View>
        </Section>

        {/* Campo */}
        <Section title="Campos">
          <View style={{ gap: spacing.md }}>
            <FieldSample label="Razón social" value="Distribuidora del Sur" />
            <FieldSample label="WhatsApp" value="+54 9 11 5555 0000" focused />
          </View>
        </Section>

        {/* Redondeos */}
        <Section title="Redondeos">
          <View style={[styles.row, { gap: spacing.md }]}>
            {(['sm', 'md', 'lg', 'xl'] as const).map((key) => (
              <View key={key} style={styles.swatchItem}>
                <View
                  style={[
                    styles.radiusBox,
                    {
                      borderRadius: radius[key],
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.primary,
                    },
                  ]}
                />
                <AppText variant="caption" color="textSecondary">
                  {radius[key]}px
                </AppText>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="caption" color="primaryText">
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

/** Muestra estática de un campo. El campo animado de verdad viene en el paso 2. */
function FieldSample({ label, value, focused }: { label: string; value: string; focused?: boolean }) {
  const { colors, radius, sizes, spacing } = useAppTheme();
  return (
    <View
      style={{
        height: sizes.inputHeight,
        borderRadius: radius.md,
        borderWidth: focused ? 1.5 : 1,
        borderColor: focused ? colors.primary : colors.border,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
      }}>
      <AppText variant="caption" color={focused ? 'primaryText' : 'textSecondary'}>
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  accentBar: { width: 28, height: 3 },
  segmented: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row' },
  swatchItem: { width: 72, gap: 6 },
  swatch: { width: 72, height: 56, borderWidth: StyleSheet.hairlineWidth },
  radiusBox: { width: 56, height: 56, borderWidth: 1 },
  button: { alignItems: 'center', justifyContent: 'center' },
});
