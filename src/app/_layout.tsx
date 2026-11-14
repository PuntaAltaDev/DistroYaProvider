import {
  Inter_200ExtraLight,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { CuentaProvider } from '@/features/cuenta/cuenta-provider';
import { cargarCuenta, type Cuenta } from '@/features/cuenta/cuenta';
import { AppThemeProvider, useAppTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

/** Lo que se lee del teléfono antes de mostrar la primera pantalla. */
type Guardado = { cuenta: Cuenta };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_200ExtraLight,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [guardado, setGuardado] = useState<Guardado | null>(null);

  // Se lee la cuenta guardada mientras se cargan las fuentes. La lectura
  // no falla: si no hay nada guardado, vuelve la cuenta vacía.
  useEffect(() => {
    cargarCuenta().then((cuenta) => setGuardado({ cuenta }));
  }, []);

  const ready = (fontsLoaded || !!fontError) && guardado !== null;

  // La pantalla de inicio (splash) se oculta recién cuando todo está listo: así no se ve
  // un destello del registro vacío antes de mostrar el panel.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppThemeProvider initialMode="light">
      <CuentaProvider inicial={guardado.cuenta}>
        <ThemedNavigation />
      </CuentaProvider>
    </AppThemeProvider>
  );
}

/** Pasa los colores de DistroYa a la navegación y a la barra de estado. */
function ThemedNavigation() {
  const { scheme, colors } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.border,
        },
      }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </ThemeProvider>
  );
}
