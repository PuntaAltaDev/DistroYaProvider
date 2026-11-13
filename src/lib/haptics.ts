import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Vibraciones cortas del teléfono ("háptica").
 * En la web no existen, así que ahí no hacen nada.
 * Si el teléfono no las soporta, se ignoran sin romper la app.
 */
function run(action: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  action().catch(() => {});
}

export const haptics = {
  /** Toque suave: botones. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Clic mínimo: elegir un tag, cambiar una opción. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Algo salió bien: guardado, paso completado. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Algo salió mal: error de validación. */
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
