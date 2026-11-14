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
 * El modo se cambia con `setMode` (desde Ajustes) y, si se pasa `onModeChange`, se avisa
 * para poder guardarlo.
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
  onModeChange,
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
  /** Se llama cada vez que cambia el modo. Tiene que ser una función fija (no una nueva por render). */
  onModeChange?: (mode: ThemeMode) => void;
}) {
  const systemScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const scheme: ColorScheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      setMode: (nuevo) => {
        setMode(nuevo);
        onModeChange?.(nuevo);
      },
      scheme,
      colors: colors[scheme],
      typography,
      spacing,
      radius,
      sizes,
      motion,
    }),
    [mode, scheme, onModeChange],
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
