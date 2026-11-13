import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
  type AppColors,
  type ColorScheme,
} from './tokens';

/**
 * `light` y `dark` fuerzan un modo; `system` sigue al teléfono.
 * Por ahora la app arranca en claro. El botón de modo oscuro
 * solo tiene que llamar a `setMode('dark')`.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  scheme: ColorScheme;
  colors: AppColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  sizes: typeof sizes;
  motion: typeof motion;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function AppThemeProvider({
  children,
  initialMode = 'light',
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) {
  const systemScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const scheme: ColorScheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      setMode,
      scheme,
      colors: colors[scheme],
      typography,
      spacing,
      radius,
      sizes,
      motion,
    }),
    [mode, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Acceso al tema desde cualquier pantalla o componente. */
export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme tiene que usarse dentro de <AppThemeProvider>');
  }
  return value;
}
