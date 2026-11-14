import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/app-text';

/** "¿Dudas? Escribinos": abre la ayuda desde cualquier pantalla donde el proveedor pueda trabarse. */
export function LinkAyuda({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="link">
      <AppText variant="footnote" color="textSecondary">
        ¿Dudas?{' '}
        <AppText variant="footnote" color="primaryText">
          Escribinos
        </AppText>
      </AppText>
    </Pressable>
  );
}
