import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

import { AppText } from './app-text';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** Alto desde el que entra el panel (fuera de la pantalla). */
const HIDDEN_OFFSET = 600;

/**
 * Panel que sube desde abajo, sobre un fondo oscurecido.
 * Se cierra tocando afuera. (Arrastrar para cerrar se suma al probar en el teléfono.)
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { colors, radius, spacing, motion } = useAppTheme();
  const insets = useSafeAreaInsets();
  /** El Modal queda montado hasta que termina la animación de salida. */
  const [mounted, setMounted] = useState(visible);
  /** 0 = oculto. 1 = abierto. */
  const progress = useSharedValue(0);

  // Al abrir, se monta enseguida (antes de animar).
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.set(withSpring(1, motion.spring.gentle));
      return;
    }
    progress.set(withTiming(0, { duration: motion.duration.base }));
    const timer = setTimeout(() => setMounted(false), motion.duration.base);
    return () => clearTimeout(timer);
  }, [visible, progress, motion.spring.gentle, motion.duration.base]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [HIDDEN_OFFSET, 0]) }],
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + spacing.xl,
              gap: spacing.lg,
            },
            sheetStyle,
          ]}>
          <View style={[styles.grabber, { backgroundColor: colors.borderStrong }]} />
          {title ? <AppText variant="title2">{title}</AppText> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2 },
});
