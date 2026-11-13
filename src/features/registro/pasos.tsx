import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { RUBROS } from '@/data/rubros';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { formatearTamano, limpiarTelefono, type Errores, type RegistroForm } from './validacion';

/** Lo que recibe cada paso: los datos, los errores y cómo cambiar un dato. */
export type PasoProps = {
  form: RegistroForm;
  errores: Errores;
  cambiar: (cambios: Partial<RegistroForm>) => void;
  /** Se llama al apretar "siguiente" en el teclado del último campo. */
  alTerminar: () => void;
};

/* ───────────── Paso 1: Tu negocio ───────────── */

export function PasoNegocio({ form, errores, cambiar, alTerminar }: PasoProps) {
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
    <View style={{ gap: spacing.xl }}>
      <Pressable
        onPress={elegirLogo}
        accessibilityRole="button"
        accessibilityLabel={form.logoUri ? 'Cambiar logo' : 'Subir logo'}
        style={[styles.logoRow, { gap: spacing.lg }]}>
        <View
          style={[
            styles.logo,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.primary,
              borderStyle: form.logoUri ? 'solid' : 'dashed',
            },
          ]}>
          {form.logoUri ? (
            <Image source={{ uri: form.logoUri }} style={styles.logoImage} contentFit="cover" />
          ) : (
            <Icon name="camera" size={28} color="primary" />
          )}
        </View>
        <View style={styles.flex}>
          <AppText variant="headline" color="primaryText">
            {form.logoUri ? 'Cambiar logo' : 'Subir logo'}
          </AppText>
          <AppText variant="footnote" color="textSecondary">
            Opcional. Cuadrado, se ve mejor.
          </AppText>
        </View>
      </Pressable>

      <TextField
        label="Razón social"
        value={form.razonSocial}
        onChangeText={(razonSocial) => cambiar({ razonSocial })}
        error={errores.razonSocial}
        helper="El nombre con el que te conocen tus clientes."
        autoCapitalize="words"
        autoComplete="organization"
        returnKeyType="next"
        onSubmitEditing={alTerminar}
      />
    </View>
  );
}

/* ───────────── Paso 2: Contacto ───────────── */

export function PasoContacto({ form, errores, cambiar, alTerminar }: PasoProps) {
  const { spacing } = useAppTheme();
  const telefonoRef = useRef<ComponentRef<typeof TextInput>>(null);
  const direccionRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={{ gap: spacing.lg }}>
      <TextField
        label="WhatsApp"
        value={form.whatsapp}
        onChangeText={(texto) => cambiar({ whatsapp: limpiarTelefono(texto) })}
        error={errores.whatsapp}
        helper="Con código de área, sin 0 ni 15. Ej.: 11 5555 0000"
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => telefonoRef.current?.focus()}
      />
      <TextField
        inputRef={telefonoRef}
        label="Teléfono fijo (opcional)"
        value={form.telefono}
        onChangeText={(texto) => cambiar({ telefono: limpiarTelefono(texto) })}
        error={errores.telefono}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => direccionRef.current?.focus()}
      />
      <TextField
        inputRef={direccionRef}
        label="Dirección"
        value={form.direccion}
        onChangeText={(direccion) => cambiar({ direccion })}
        error={errores.direccion}
        helper="Calle, número y localidad."
        autoCapitalize="words"
        autoComplete="street-address"
        returnKeyType="next"
        onSubmitEditing={alTerminar}
      />
    </View>
  );
}

/* ───────────── Paso 3: Rubros ───────────── */

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

/* ───────────── Paso 4: Catálogo ───────────── */

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
            styles.fileCard,
            {
              gap: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.lg,
              borderColor: errores.catalogo ? colors.danger : colors.primary,
              backgroundColor: colors.primarySoft,
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
          styles.dropzone,
          {
            gap: spacing.sm,
            padding: spacing.xxl,
            borderRadius: radius.lg,
            borderColor: colors.primary,
            backgroundColor: pressed ? colors.primarySoft : colors.surface,
          },
        ]}>
        <Icon name="upload" size={32} color="primary" />
        <AppText variant="headline">Elegir archivo PDF</AppText>
        <AppText variant="footnote" color="textSecondary">
          Hasta 10 MB
        </AppText>
      </Pressable>
      <AppText variant="footnote" color="textSecondary">
        Si no lo tenés a mano, podés subirlo más tarde desde tu perfil.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  fileCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  dropzone: { alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
});
