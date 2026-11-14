import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useCuenta } from '@/features/cuenta/cuenta-provider';

/**
 * Ícono chico, al lado del cambio de modo, para probar el flujo completo: borra la cuenta
 * y vuelve a la bienvenida. Solo existe mientras se desarrolla (`__DEV__`): en la app publicada no aparece.
 */
export function VolverAlInicio() {
  const { reiniciar } = useCuenta();

  if (!__DEV__) return null;

  return (
    <Pressable
      onPress={reiniciar}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Volver al inicio (solo para pruebas)">
      <Icon name="restart" size={16} color="textSecondary" />
    </Pressable>
  );
}
