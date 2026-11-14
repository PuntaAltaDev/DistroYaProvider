import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { AppText } from '@/components/ui/app-text';
import { PanelProveedor } from '@/features/panel/panel-proveedor';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { BarraSuperior, Titular } from './editorial';
import {
  PasoCatalogo,
  PasoContacto,
  PasoDireccion,
  PasoLogo,
  PasoNombre,
  PasoRubros,
  type PasoProps,
} from './pasos';
import { RegistroExito } from './registro-exito';
import {
  FORM_INICIAL,
  validarPaso,
  type Errores,
  type PasoId,
  type RegistroForm,
} from './validacion';

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

export function RegistroScreen() {
  const { colors, spacing } = useAppTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState<RegistroForm>(FORM_INICIAL);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enPanel, setEnPanel] = useState(false);
  const [fechaEnvio, setFechaEnvio] = useState<Date>();

  const total = PASOS.length;
  const esUltimo = paso === total - 1;
  const { id, lineas, acento, bajada, Componente } = PASOS[paso];

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
    setErrores({});
    setPaso(destino);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const continuar = () => {
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
    // Todavía no hay servidor: se simula el envío. Acá va a ir la llamada a la API de Seba.
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setFechaEnvio(new Date());
      haptics.success();
    }, 1200);
  };

  if (enviado && enPanel) {
    return (
      <PanelProveedor
        form={form}
        listaInicial={
          form.catalogo && fechaEnvio
            ? { nombre: form.catalogo.name, tamano: form.catalogo.size, fecha: fechaEnvio }
            : undefined
        }
        // Todavía no hay servidor: el perfil se guarda en la app. Acá va a ir la llamada a la API de Seba.
        alGuardarPerfil={setForm}
      />
    );
  }

  if (enviado) {
    // Simulación: el botón del final abre el panel, como si el admin ya lo hubiera aprobado.
    return <RegistroExito nombre={form.razonSocial.trim()} alRevisar={() => setEnPanel(true)} />;
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['top']} style={styles.column}>
          <BarraSuperior
            derecha={`${dosCifras(paso + 1)} / ${dosCifras(total)}`}
            alVolver={paso > 0 ? () => irA(paso - 1) : undefined}
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
                <Animated.View key={`bajada-${paso}`} entering={FadeIn.delay(220).duration(400)}>
                  <AppText variant="subhead" color="textSecondary">
                    {bajada}
                  </AppText>
                </Animated.View>
              </View>

              <Animated.View key={`campos-${paso}`} entering={FadeIn.delay(280).duration(400)}>
                <Componente form={form} errores={errores} cambiar={cambiar} alTerminar={continuar} />
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>

        <View style={styles.barraInferior}>
          <ActionBar
            label={esUltimo ? 'Enviar registro' : 'Siguiente'}
            loading={enviando}
            progress={(paso + 1) / total}
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
