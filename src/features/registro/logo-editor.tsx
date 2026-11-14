import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/ui/action-bar';
import { AppText } from '@/components/ui/app-text';
import { haptics } from '@/lib/haptics';
import { palette, useAppTheme } from '@/theme';

import { ESCALA_MAX, limiteDeCorrimiento, type AjusteLogo, type ImagenLogo } from './logo';

type LogoEditorProps = {
  imagen: ImagenLogo;
  ajusteInicial: AjusteLogo;
  /** Devuelve cómo quedó acomodada la foto. Puede tardar (se recorta la imagen). */
  alListo: (ajuste: AjusteLogo) => Promise<void>;
  alCancelar: () => void;
};

const entre = (valor: number, minimo: number, maximo: number) => {
  'worklet';
  return Math.min(Math.max(valor, minimo), maximo);
};

/**
 * Pantalla para acomodar la foto: se arrastra con un dedo y se agranda con dos.
 * Lo que queda dentro del círculo es lo que van a ver los clientes.
 */
export function LogoEditor({ imagen, ajusteInicial, alListo, alCancelar }: LogoEditorProps) {
  const { colors, spacing, motion } = useAppTheme();
  const { width } = useWindowDimensions();
  const [guardando, setGuardando] = useState(false);

  const diametro = Math.min(width - spacing.xl * 2, 320);
  // Con escala 1 el lado más corto de la foto ocupa justo el círculo.
  const menor = Math.min(imagen.width, imagen.height);
  const ancho = (imagen.width / menor) * diametro;
  const alto = (imagen.height / menor) * diametro;

  const escala = useSharedValue(ajusteInicial.escala);
  const x = useSharedValue(ajusteInicial.x * diametro);
  const y = useSharedValue(ajusteInicial.y * diametro);

  const mover = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      const limite = limiteDeCorrimiento(imagen, escala.get());
      x.set(entre(x.get() + e.changeX, -limite.x * diametro, limite.x * diametro));
      y.set(entre(y.get() + e.changeY, -limite.y * diametro, limite.y * diametro));
    },
  });

  const agrandar = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      const nueva = entre(escala.get() * e.scaleChange, 1, ESCALA_MAX);
      const limite = limiteDeCorrimiento(imagen, nueva);
      escala.set(nueva);
      // Al achicar, la foto vuelve para adentro así el círculo nunca queda con huecos.
      x.set(entre(x.get(), -limite.x * diametro, limite.x * diametro));
      y.set(entre(y.get(), -limite.y * diametro, limite.y * diametro));
    },
  });

  const gestos = useSimultaneousGestures(mover, agrandar);

  const fotoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: escala.get() }],
  }));

  /** Botones − y +: para mouse (web) y para quien no puede usar dos dedos. */
  const zoom = (factor: number) => {
    haptics.select();
    const nueva = entre(escala.get() * factor, 1, ESCALA_MAX);
    const limite = limiteDeCorrimiento(imagen, nueva);
    const animacion = { duration: motion.duration.fast };
    escala.set(withTiming(nueva, animacion));
    x.set(withTiming(entre(x.get(), -limite.x * diametro, limite.x * diametro), animacion));
    y.set(withTiming(entre(y.get(), -limite.y * diametro, limite.y * diametro), animacion));
  };

  const listo = async () => {
    setGuardando(true);
    try {
      await alListo({ escala: escala.get(), x: x.get() / diametro, y: y.get() / diametro });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible animationType="fade" onRequestClose={alCancelar} statusBarTranslucent>
      {/* Los modales necesitan su propia raíz de gestos. */}
      <GestureHandlerRootView style={[styles.flex, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={styles.column}>
          <View style={[styles.barra, { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }]}>
            <Pressable onPress={alCancelar} hitSlop={14} accessibilityRole="button">
              <AppText variant="callout" color="textSecondary">
                Cancelar
              </AppText>
            </Pressable>
            <AppText variant="caption" style={styles.titulo}>
              ACOMODAR FOTO
            </AppText>
          </View>

          <View style={[styles.centro, { gap: spacing.xl, paddingHorizontal: spacing.xl }]}>
            <GestureDetector gesture={gestos} touchAction="none" userSelect="none">
              <View
                accessibilityLabel="Foto. Arrastrá para moverla."
                style={[
                  styles.circulo,
                  {
                    width: diametro,
                    height: diametro,
                    borderRadius: diametro / 2,
                    borderColor: colors.text,
                    backgroundColor: palette.white,
                  },
                ]}>
                <Animated.View
                  style={[
                    styles.foto,
                    { width: ancho, height: alto, left: (diametro - ancho) / 2, top: (diametro - alto) / 2 },
                    fotoStyle,
                  ]}>
                  <Image
                    source={{ uri: imagen.uri }}
                    style={styles.lleno}
                    contentFit="fill"
                    pointerEvents="none"
                  />
                </Animated.View>
              </View>
            </GestureDetector>

            <AppText variant="subhead" color="textSecondary" style={styles.ayuda}>
              Arrastrá la foto para moverla. Con dos dedos la agrandás.
            </AppText>

            <View style={[styles.fila, { gap: spacing.lg }]}>
              <BotonZoom signo="−" etiqueta="Achicar" onPress={() => zoom(1 / 1.25)} />
              <BotonZoom signo="+" etiqueta="Agrandar" onPress={() => zoom(1.25)} />
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.barraInferior}>
          <ActionBar label="Listo" loading={guardando} onPress={listo} />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function BotonZoom({ signo, etiqueta, onPress }: { signo: string; etiqueta: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [
        styles.zoom,
        { borderColor: colors.borderStrong, backgroundColor: pressed ? colors.primarySoft : 'transparent' },
      ]}>
      <AppText variant="title2" color="textSecondary">
        {signo}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  barraInferior: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { letterSpacing: 2 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circulo: { borderWidth: 1.5, overflow: 'hidden' },
  foto: { position: 'absolute' },
  lleno: { width: '100%', height: '100%' },
  ayuda: { textAlign: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center' },
  zoom: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
