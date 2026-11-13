import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { StepProgress } from '@/components/ui/step-progress';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { PasoCatalogo, PasoContacto, PasoNegocio, PasoRubros, type PasoProps } from './pasos';
import { RegistroExito } from './registro-exito';
import { FORM_INICIAL, validarPaso, type Errores, type RegistroForm } from './validacion';

/** Los 4 pasos del registro, en orden. */
const PASOS: {
  nombre: string;
  titulo: string;
  bajada: string;
  Componente: (props: PasoProps) => React.JSX.Element;
}[] = [
  {
    nombre: 'Tu negocio',
    titulo: 'Contanos de tu negocio',
    bajada: 'Así te van a ver los bares y restaurantes.',
    Componente: PasoNegocio,
  },
  {
    nombre: 'Contacto',
    titulo: '¿Cómo te contactan?',
    bajada: 'Los negocios te escriben directo, sin intermediarios.',
    Componente: PasoContacto,
  },
  {
    nombre: 'Rubros',
    titulo: '¿Qué vendés?',
    bajada: 'Elegí tus rubros para que te encuentren más fácil.',
    Componente: PasoRubros,
  },
  {
    nombre: 'Catálogo',
    titulo: 'Tu lista de precios',
    bajada: 'Subí tu catálogo en PDF. Lo podés actualizar cuando quieras.',
    Componente: PasoCatalogo,
  },
];

export function RegistroScreen() {
  const { colors, spacing } = useAppTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [paso, setPaso] = useState(0);
  const [haciaAdelante, setHaciaAdelante] = useState(true);
  const [form, setForm] = useState<RegistroForm>(FORM_INICIAL);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const esUltimo = paso === PASOS.length - 1;
  const { titulo, bajada, nombre, Componente } = PASOS[paso];

  /** Cambia datos del formulario y borra el error de los campos que se tocaron. */
  const cambiar = (cambios: Partial<RegistroForm>) => {
    setForm((actual) => ({ ...actual, ...cambios }));
    setErrores((actuales) => {
      const siguientes = { ...actuales };
      for (const campo of Object.keys(cambios)) delete siguientes[campo as keyof Errores];
      return siguientes;
    });
  };

  const irA = (destino: number) => {
    setHaciaAdelante(destino > paso);
    setErrores({});
    setPaso(destino);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const continuar = () => {
    const encontrados = validarPaso(paso, form);
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      haptics.error();
      return;
    }
    if (!esUltimo) {
      irA(paso + 1);
      return;
    }
    // Todavía no hay servidor: se simula el envío. Acá va a ir la llamada a la API de Seba.
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      haptics.success();
    }, 1200);
  };

  if (enviado) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.column}>
          <RegistroExito
            nombre={form.razonSocial.trim()}
            alRevisar={() => {
              setEnviado(false);
              irA(0);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.column}>
          {/* Encabezado: volver + avance */}
          <View
            style={[
              styles.header,
              { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
            ]}>
            <Pressable
              onPress={() => irA(paso - 1)}
              disabled={paso === 0}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Volver al paso anterior"
              style={[styles.back, paso === 0 && styles.hidden]}>
              <Icon name="back" />
            </Pressable>
            <View style={styles.flex}>
              <StepProgress current={paso + 1} total={PASOS.length} label={nombre} />
            </View>
          </View>

          {/* Contenido del paso */}
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xxl,
              paddingBottom: spacing.xl,
            }}>
            <Animated.View
              key={paso}
              entering={(haciaAdelante ? FadeInRight : FadeInLeft).duration(280)}
              style={{ gap: spacing.xxl }}>
              <View style={{ gap: spacing.sm }}>
                <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
                <AppText variant="title">{titulo}</AppText>
                <AppText variant="body" color="textSecondary">
                  {bajada}
                </AppText>
              </View>

              <Componente form={form} errores={errores} cambiar={cambiar} alTerminar={continuar} />
            </Animated.View>
          </ScrollView>

          {/* Botón fijo abajo */}
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              paddingBottom: spacing.lg,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}>
            <AppButton
              label={esUltimo ? 'Enviar registro' : 'Continuar'}
              loading={enviando}
              onPress={continuar}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** En pantallas anchas (tablet, web) el contenido no se estira de más. */
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  hidden: { opacity: 0 },
  accentBar: { width: 28, height: 3, marginBottom: 8 },
});
