import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { AppText } from '@/components/ui/app-text';
import { useAtras } from '@/lib/atras';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { BarraSuperior, Titular } from '@/components/ui/editorial';
import {
  PasoCatalogo,
  PasoContacto,
  PasoDireccion,
  PasoLogo,
  PasoNombre,
  PasoRubros,
  type PasoProps,
} from './pasos';
import { validarPaso, type Errores, type PasoId, type RegistroForm } from './validacion';

/** Las pantallas del registro, en orden. Una pregunta por pantalla. */
const PASOS: {
  id: PasoId;
  lineas: string[];
  acento: string;
  bajada: string;
  Componente: (props: PasoProps) => React.JSX.Element;
}[] = [
  {
    id: 'nombre',
    lineas: ['¿Cómo', 'se llama'],
    acento: 'tu negocio?',
    bajada: 'Así te van a ver tus clientes.',
    Componente: PasoNombre,
  },
  {
    id: 'logo',
    lineas: ['Mostranos'],
    acento: 'tu logo.',
    bajada: 'Subí tu logo. Si no lo tenés a mano, seguí y lo cargás después.',
    Componente: PasoLogo,
  },
  {
    id: 'contacto',
    lineas: ['¿Cómo te'],
    acento: 'contactan?',
    bajada: 'Los negocios te escriben directo, sin intermediarios.',
    Componente: PasoContacto,
  },
  {
    id: 'direccion',
    lineas: ['¿Dónde te'],
    acento: 'encuentran?',
    bajada: 'La dirección de tu depósito o local.',
    Componente: PasoDireccion,
  },
  {
    id: 'rubros',
    lineas: ['¿Qué'],
    acento: 'vendés?',
    bajada: 'Marcá los rubros que vendés.',
    Componente: PasoRubros,
  },
  {
    id: 'catalogo',
    lineas: ['Tu lista'],
    acento: 'de precios.',
    bajada: 'Subí tu catálogo en PDF. Lo podés actualizar cuando quieras.',
    Componente: PasoCatalogo,
  },
];

const dosCifras = (n: number) => String(n).padStart(2, '0');

type RegistroScreenProps = {
  form: RegistroForm;
  /** Pantalla del registro en la que está (empieza en 0). */
  paso: number;
  /** Si el perfil fue rechazado, lo que hay que corregir. */
  motivoRechazo?: string;
  alCambiar: (cambios: Partial<RegistroForm>) => void;
  alIrAPaso: (paso: number) => void;
  /** Envía el registro ya validado. Acá va a ir la llamada a la API de Seba. */
  alEnviar: () => Promise<void>;
};

/**
 * El registro, una pregunta por pantalla. No sabe dónde se guarda: recibe el formulario y el
 * paso, y avisa los cambios (la ruta los guarda en la cuenta, así sigue donde estaba).
 */
export function RegistroScreen({
  form,
  paso: pasoGuardado,
  motivoRechazo,
  alCambiar,
  alIrAPaso,
  alEnviar,
}: RegistroScreenProps) {
  const { colors, spacing } = useAppTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);

  const total = PASOS.length;
  const paso = Math.min(pasoGuardado, total - 1);
  const esUltimo = paso === total - 1;
  const { id, lineas, acento, bajada, Componente } = PASOS[paso];

  /** Cambia datos del formulario y borra el error de los campos que se tocaron. */
  const cambiar = (cambios: Partial<RegistroForm>) => {
    alCambiar(cambios);
    setErrores((actuales) => {
      const siguientes = { ...actuales };
      for (const campo of Object.keys(cambios)) delete siguientes[campo as keyof Errores];
      return siguientes;
    });
  };

  const irA = (destino: number) => {
    setErrores({});
    alIrAPaso(destino);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  /** Al paso anterior. En el primero no hay: el "atrás" de Android sale de la app. */
  const anterior = paso > 0 ? () => irA(paso - 1) : undefined;
  useAtras(anterior);

  const continuar = async () => {
    if (enviando) return;
    const encontrados = validarPaso(id, form);
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      haptics.error();
      return;
    }
    if (!esUltimo) {
      irA(paso + 1);
      return;
    }
    setEnviando(true);
    try {
      await alEnviar();
      haptics.success();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['top']} style={styles.column}>
          <BarraSuperior
            derecha={`${dosCifras(paso + 1)} / ${dosCifras(total)}`}
            alVolver={anterior}
            progreso={(paso + 1) / total}
          />

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contenido}>
            <View
              style={[
                styles.reparto,
                {
                  paddingHorizontal: spacing.xl,
                  paddingTop: spacing.xxl,
                  paddingBottom: spacing.xxl,
                  gap: spacing.xxl,
                },
              ]}>
              <View style={{ gap: spacing.md }}>
                <Titular lineas={lineas} acento={acento} clave={paso} />
                <Animated.View
                  key={`bajada-${paso}`}
                  entering={FadeIn.delay(220).duration(400)}
                  style={{ gap: spacing.sm }}>
                  <AppText variant="subhead" color="textSecondary">
                    {bajada}
                  </AppText>
                  {/* Si el perfil fue rechazado, lo que hay que corregir queda a la vista en cada paso. */}
                  {motivoRechazo ? (
                    <AppText variant="footnote" color="danger">
                      A corregir: {motivoRechazo}
                    </AppText>
                  ) : null}
                </Animated.View>
              </View>

              <Animated.View key={`campos-${paso}`} entering={FadeIn.delay(280).duration(400)}>
                <Componente
                  form={form}
                  errores={errores}
                  cambiar={cambiar}
                  alTerminar={continuar}
                />
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>

        <View style={styles.barraInferior}>
          <ActionBar
            label={
              !esUltimo ? 'Siguiente' : motivoRechazo ? 'Reenviar registro' : 'Enviar registro'
            }
            loading={enviando}
            onPress={continuar}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** En pantallas anchas (tablet, web) el contenido no se estira de más. */
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  barraInferior: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  contenido: { flexGrow: 1 },
  reparto: {},
});
