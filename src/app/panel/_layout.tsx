import { Stack } from 'expo-router';

import { ListasProvider } from '@/features/panel/listas';
import { useAppTheme } from '@/theme';

/** "/panel/…": todo lo del proveedor aprobado. Las listas de precios se comparten entre sus pantallas. */
export default function PanelLayout() {
  const { colors } = useAppTheme();
  return (
    <ListasProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </ListasProvider>
  );
}
