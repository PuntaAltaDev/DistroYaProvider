import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { StepProgress } from '@/components/ui/step-progress';
import { TextField } from '@/components/ui/text-field';
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

const TAGS = ['Cervezas', 'Vinos', 'Destilados', 'Gaseosas', 'Aguas', 'Sin alcohol'];
const TOTAL_STEPS = 4;

export default function DesignSystemScreen() {
  const { colors, spacing, radius, mode, setMode } = useAppTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const [tags, setTags] = useState<string[]>(['Cervezas']);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const validatePhone = () =>
    setPhoneError(phone.replace(/\D/g, '').length < 8 ? 'Ingresá un número válido.' : undefined);

  const fakeSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxxl,
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
            <AppButton label="Guardar perfil" loading={saving} onPress={fakeSave} />
            <AppButton label="Botón secundario" variant="secondary" />
            <AppButton label="Omitir por ahora" variant="ghost" />
          </View>
        </Section>

        {/* Campos */}
        <Section title="Campos">
          <View style={{ gap: spacing.md }}>
            <TextField
              label="Razón social"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextField
              label="WhatsApp"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (phoneError) setPhoneError(undefined);
              }}
              onBlur={validatePhone}
              error={phoneError}
              helper="Con código de área, sin 0 ni 15."
              keyboardType="phone-pad"
            />
          </View>
        </Section>

        {/* Tags */}
        <Section title="Rubros">
          <View style={[styles.grid, { gap: spacing.sm }]}>
            {TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={tags.includes(tag)}
                onToggle={() => toggleTag(tag)}
              />
            ))}
          </View>
        </Section>

        {/* Pasos */}
        <Section title="Avance por pasos">
          <View style={{ gap: spacing.md }}>
            <StepProgress current={step} total={TOTAL_STEPS} label="Tu negocio" />
            <View style={[styles.row, { gap: spacing.md }]}>
              <View style={styles.flex}>
                <AppButton
                  label="Atrás"
                  variant="secondary"
                  disabled={step === 1}
                  onPress={() => setStep((s) => Math.max(1, s - 1))}
                />
              </View>
              <View style={styles.flex}>
                <AppButton
                  label="Siguiente"
                  disabled={step === TOTAL_STEPS}
                  onPress={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                />
              </View>
            </View>
          </View>
        </Section>

        {/* Panel inferior */}
        <Section title="Panel inferior">
          <AppButton label="Abrir panel" variant="secondary" onPress={() => setSheetOpen(true)} />
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

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Elegí tus rubros">
        <View style={[styles.grid, { gap: spacing.sm }]}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onToggle={() => toggleTag(tag)}
            />
          ))}
        </View>
        <AppButton label="Listo" onPress={() => setSheetOpen(false)} />
      </BottomSheet>
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
});
