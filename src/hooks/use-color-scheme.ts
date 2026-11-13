import { useAppTheme } from '@/theme';

/** Devuelve el modo activo de la app (claro u oscuro), no el del teléfono. */
export function useColorScheme() {
  return useAppTheme().scheme;
}
