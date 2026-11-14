import { createContext, useContext, type ReactNode } from 'react';

/**
 * Lugar en la barra de arriba para las herramientas de prueba (`features/dev`).
 * Las pone `app/_layout.tsx`: así `components` no importa nada de `features`.
 * En la app publicada (`__DEV__` falso) no se muestra nada.
 */
export const RanuraDev = createContext<ReactNode>(null);

export function useRanuraDev(): ReactNode {
  const contenido = useContext(RanuraDev);
  return __DEV__ ? contenido : null;
}
