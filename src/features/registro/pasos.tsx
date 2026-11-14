import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { LineField } from '@/components/ui/line-field';
import { RUBROS } from '@/data/rubros';
import { haptics } from '@/lib/haptics';
import { palette, useAppTheme } from '@/theme';

import { AJUSTE_INICIAL, necesitaAjuste, prepararImagen, recortarLogo, type AjusteLogo } from './logo';
import { LogoEditor } from './logo-editor';
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
    <LineField
      label="Razón social"
      autoFocus
      placeholder="Distribuidora del Sur"
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
  const [procesando, setProcesando] = useState(false);
  const [ajustando, setAjustando] = useState(false);
  const [error, setError] = useState<string>();

  /** Achica la foto y arma el logo con la parte del centro. Después se puede acomodar. */
  const usarFoto = async (uri: string) => {
    setProcesando(true);
    setError(undefined);
    try {
      const logoOriginal = await prepararImagen(uri);
      const logoUri = await recortarLogo(logoOriginal, AJUSTE_INICIAL);
      cambiar({ logoUri, logoOriginal, logoAjuste: AJUSTE_INICIAL });
    } catch {
      setError('No pudimos abrir esa imagen. Probá con otra.');
    } finally {
      setProcesando(false);
    }
  };

  const elegirDeGaleria = async () => {
    haptics.select();
    // Calidad 1: la foto se achica una sola vez, en `prepararImagen`.
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!resultado.canceled) await usarFoto(resultado.assets[0].uri);
  };

  const sacarFoto = async () => {
    haptics.select();
    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        setError('Para sacar la foto, permití el uso de la cámara en los ajustes del teléfono.');
        return;
      }
    }
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (!resultado.canceled) await usarFoto(resultado.assets[0].uri);
  };

  const guardarAjuste = async (logoAjuste: AjusteLogo) => {
    if (!form.logoOriginal) return;
    const logoUri = await recortarLogo(form.logoOriginal, logoAjuste);
    cambiar({ logoUri, logoAjuste });
    setAjustando(false);
  };

  const quitar = () => {
    setError(undefined);
    cambiar({ logoUri: undefined, logoOriginal: undefined, logoAjuste: undefined });
  };

  const original = form.logoOriginal;
  const sinAcomodar = !form.logoAjuste || form.logoAjuste === AJUSTE_INICIAL;
  // Foto ancha o alta que todavía no acomodó: se le avisa que elija qué parte se ve.
  const convieneAjustar = !!original && necesitaAjuste(original) && sinAcomodar;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.fila, { gap: spacing.xl }]}>
        <Pressable
          onPress={form.logoUri && original ? () => setAjustando(true) : elegirDeGaleria}
          disabled={procesando}
          accessibilityRole="button"
          accessibilityLabel={form.logoUri ? 'Acomodar la foto' : 'Elegir una foto de la galería'}
          style={({ pressed }) => [
            styles.logo,
            {
              borderColor: colors.text,
              borderStyle: form.logoUri ? 'solid' : 'dashed',
              // Con foto, fondo blanco siempre: los logos con fondo transparente están hechos para blanco.
              backgroundColor: pressed ? colors.primarySoft : form.logoUri ? palette.white : colors.background,
            },
          ]}>
          {procesando ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : form.logoUri ? (
            <Image source={{ uri: form.logoUri }} style={styles.logoImagen} contentFit="cover" />
          ) : (
            <Icon name="camera" size={32} />
          )}
        </Pressable>

        <View style={[styles.flex, { gap: spacing.xs }]}>
          <AppText variant="headline">
            {!form.logoUri ? 'Tocá para elegir' : convieneAjustar ? 'Acomodá la foto' : 'Se ve bien.'}
          </AppText>
          {form.logoUri ? (
            <AppText variant="footnote" color="textSecondary">
              Tocá la foto para moverla o agrandarla.
            </AppText>
          ) : null}
          <View style={[styles.fila, { gap: spacing.xl }]}>
            {form.logoUri ? (
              <>
                {original ? <Enlace texto="Ajustar" onPress={() => setAjustando(true)} /> : null}
                <Enlace texto="Quitar" onPress={quitar} />
              </>
            ) : (
              <Enlace texto="Sacar foto" onPress={sacarFoto} />
            )}
          </View>
        </View>
      </View>

      {error ? (
        <Animated.View entering={FadeInDown.duration(250)}>
          <AppText variant="footnote" color="danger">
            {error}
          </AppText>
        </Animated.View>
      ) : null}

      {ajustando && original ? (
        <LogoEditor
          imagen={original}
          ajusteInicial={form.logoAjuste ?? AJUSTE_INICIAL}
          alListo={guardarAjuste}
          alCancelar={() => setAjustando(false)}
        />
      ) : null}
    </View>
  );
}

function Enlace({ texto, onPress }: { texto: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button">
      <AppText variant="callout" color="primaryText">
        {texto}
      </AppText>
    </Pressable>
  );
}

/* ───────────── ¿Cómo te contactan? ───────────── */

export function PasoContacto({ form, errores, cambiar, alTerminar }: PasoProps) {
  const { spacing } = useAppTheme();
  const telefonoRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={{ gap: spacing.xl }}>
      <LineField
        label="WhatsApp"
        autoFocus
        placeholder="291 455-0000"
        value={form.whatsapp}
        onChangeText={(texto) => cambiar({ whatsapp: limpiarTelefono(texto) })}
        error={errores.whatsapp}
        helper="Con código de área, sin 0 ni 15."
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => telefonoRef.current?.focus()}
      />
      <LineField
        inputRef={telefonoRef}
        label="Teléfono fijo · opcional"
        placeholder="0291 455-0000"
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
    <LineField
      label="Dirección"
      autoFocus
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
  const { colors, spacing } = useAppTheme();

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
              paddingVertical: spacing.lg,
              borderColor: errores.catalogo ? colors.danger : colors.text,
            },
          ]}>
          <Icon name="document" size={28} color="primaryText" />
          <View style={styles.flex}>
            <AppText variant="headline" numberOfLines={1} ellipsizeMode="middle">
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
      <AppText variant="footnote" color="textSecondary">
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
  archivo: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 2, borderBottomWidth: 2 },
  zona: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
});
