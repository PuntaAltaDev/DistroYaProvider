import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { PillField } from '@/components/ui/pill-field';
import { RUBROS } from '@/data/rubros';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { formatearTamano, limpiarTelefono, type Errores, type RegistroForm } from './validacion';

/** Lo que recibe cada pantalla: los datos, los errores y cómo cambiar un dato. */
export type PasoProps = {
  form: RegistroForm;
  errores: Errores;
  cambiar: (cambios: Partial<RegistroForm>) => void;
  /** Se llama al apretar "siguiente" en el teclado del último campo. */
  alTerminar: () => void;
};

/* ───────────── ¿Cómo se llama tu negocio? ───────────── */

export function PasoNombre({ form, errores, cambiar, alTerminar }: PasoProps) {
  return (
    <PillField
      label="Razón social"
      placeholder="Ej.: Distribuidora del Sur"
      value={form.razonSocial}
      onChangeText={(razonSocial) => cambiar({ razonSocial })}
      error={errores.razonSocial}
      autoCapitalize="words"
      autoComplete="organization"
      returnKeyType="next"
      onSubmitEditing={alTerminar}
    />
  );
}

/* ───────────── Ponele cara a tu marca ───────────── */

export function PasoLogo({ form, cambiar }: PasoProps) {
  const { colors, spacing } = useAppTheme();

  const elegirLogo = async () => {
    haptics.select();
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!resultado.canceled) cambiar({ logoUri: resultado.assets[0].uri });
  };

  return (
    <View style={[styles.fila, { gap: spacing.xl }]}>
      <Pressable
        onPress={elegirLogo}
        accessibilityRole="button"
        accessibilityLabel={form.logoUri ? 'Cambiar logo' : 'Subir logo'}
        style={({ pressed }) => [
          styles.logo,
          {
            borderColor: colors.text,
            borderStyle: form.logoUri ? 'solid' : 'dashed',
            backgroundColor: pressed ? colors.primarySoft : colors.background,
          },
        ]}>
        {form.logoUri ? (
          <Image source={{ uri: form.logoUri }} style={styles.logoImagen} contentFit="cover" />
        ) : (
          <Icon name="camera" size={32} />
        )}
      </Pressable>
      <View style={[styles.flex, { gap: spacing.xs }]}>
        <AppText variant="headline">{form.logoUri ? 'Se ve bien.' : 'Tocá para elegir'}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {form.logoUri ? 'Tocá el círculo para cambiarlo.' : 'Cuadrado y con fondo liso se ve mejor.'}
        </AppText>
        {form.logoUri ? (
          <Pressable onPress={() => cambiar({ logoUri: undefined })} hitSlop={10}>
            <AppText variant="callout" color="primaryText">
              Quitar
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ───────────── ¿Cómo te contactan? ───────────── */

export function PasoContacto({ form, errores, cambiar, alTerminar }: PasoProps) {
  const { spacing } = useAppTheme();
  const telefonoRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={{ gap: spacing.lg }}>
      <PillField
        label="WhatsApp"
        placeholder="WhatsApp · 11 5555 0000"
        value={form.whatsapp}
        onChangeText={(texto) => cambiar({ whatsapp: limpiarTelefono(texto) })}
        error={errores.whatsapp}
        helper="Con código de área, sin 0 ni 15."
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => telefonoRef.current?.focus()}
      />
      <PillField
        inputRef={telefonoRef}
        label="Teléfono fijo (opcional)"
        placeholder="Teléfono fijo (opcional)"
        value={form.telefono}
        onChangeText={(texto) => cambiar({ telefono: limpiarTelefono(texto) })}
        error={errores.telefono}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={alTerminar}
      />
    </View>
  );
}

/* ───────────── ¿Dónde te encuentran? ───────────── */

export function PasoDireccion({ form, errores, cambiar, alTerminar }: PasoProps) {
  return (
    <PillField
      label="Dirección"
      placeholder="Calle, número y localidad"
      value={form.direccion}
      onChangeText={(direccion) => cambiar({ direccion })}
      error={errores.direccion}
      autoCapitalize="words"
      autoComplete="street-address"
      returnKeyType="next"
      onSubmitEditing={alTerminar}
    />
  );
}

/* ───────────── ¿Qué vendés? ───────────── */

export function PasoRubros({ form, errores, cambiar }: PasoProps) {
  const { spacing } = useAppTheme();
  const cantidad = form.rubros.length;

  const alternar = (rubro: string) =>
    cambiar({
      rubros: form.rubros.includes(rubro)
        ? form.rubros.filter((r) => r !== rubro)
        : [...form.rubros, rubro],
    });

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[styles.wrap, { gap: spacing.sm }]}>
        {RUBROS.map((rubro) => (
          <Chip
            key={rubro}
            label={rubro}
            selected={form.rubros.includes(rubro)}
            onToggle={() => alternar(rubro)}
          />
        ))}
      </View>

      {errores.rubros ? (
        <Animated.View entering={FadeInDown.duration(250)}>
          <AppText variant="footnote" color="danger">
            {errores.rubros}
          </AppText>
        </Animated.View>
      ) : (
        <AppText variant="footnote" color="textSecondary">
          {cantidad === 0
            ? 'Podés elegir varios.'
            : cantidad === 1
              ? '1 rubro elegido.'
              : `${cantidad} rubros elegidos.`}
        </AppText>
      )}
    </View>
  );
}

/* ───────────── Tu lista de precios ───────────── */

export function PasoCatalogo({ form, errores, cambiar }: PasoProps) {
  const { colors, radius, spacing } = useAppTheme();

  const elegirPdf = async () => {
    haptics.select();
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (resultado.canceled) return;
    const archivo = resultado.assets[0];
    cambiar({ catalogo: { name: archivo.name, size: archivo.size, uri: archivo.uri } });
  };

  if (form.catalogo) {
    return (
      <View style={{ gap: spacing.md }}>
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[
            styles.archivo,
            {
              gap: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.xl,
              borderColor: errores.catalogo ? colors.danger : colors.text,
            },
          ]}>
          <Icon name="document" size={28} color="primary" />
          <View style={styles.flex}>
            <AppText variant="headline" numberOfLines={1}>
              {form.catalogo.name}
            </AppText>
            <AppText variant="footnote" color="textSecondary">
              PDF{form.catalogo.size ? ` · ${formatearTamano(form.catalogo.size)}` : ''}
            </AppText>
          </View>
          <Pressable
            onPress={() => cambiar({ catalogo: undefined })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Quitar archivo">
            <Icon name="close" size={20} color="textSecondary" />
          </Pressable>
        </Animated.View>

        {errores.catalogo ? (
          <AppText variant="footnote" color="danger">
            {errores.catalogo}
          </AppText>
        ) : null}

        <Pressable onPress={elegirPdf} accessibilityRole="button" hitSlop={8}>
          <AppText variant="callout" color="primaryText">
            Cambiar archivo
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <Pressable
        onPress={elegirPdf}
        accessibilityRole="button"
        accessibilityLabel="Elegir archivo PDF"
        style={({ pressed }) => [
          styles.zona,
          {
            gap: spacing.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderColor: colors.text,
            backgroundColor: pressed ? colors.primarySoft : colors.background,
          },
        ]}>
        <Icon name="upload" size={24} />
        <View style={styles.flex}>
          <AppText variant="headline">Elegir archivo PDF</AppText>
          <AppText variant="footnote" color="textSecondary">
            Hasta 10 MB
          </AppText>
        </View>
      </Pressable>
      <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: spacing.xl }}>
        Si no lo tenés a mano, seguí y lo subís después desde tu perfil.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  logo: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImagen: { width: '100%', height: '100%' },
  archivo: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  zona: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 999,
  },
});
