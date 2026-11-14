import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/**
 * Botón "atrás" de Android dentro de una misma pantalla (ej.: volver al paso anterior del registro).
 * Si se pasa una función, el botón la ejecuta en lugar de salir de la pantalla. Sin función,
 * el botón hace lo de siempre. Solo escucha mientras la pantalla está a la vista, así las que
 * quedan abajo en la pila no se lo quitan. En iPhone y web no hace nada.
 */
export function useAtras(alVolver?: () => void) {
  const ultima = useRef(alVolver);
  useEffect(() => {
    ultima.current = alVolver;
  });

  useFocusEffect(
    useCallback(() => {
      const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!ultima.current) return false;
        ultima.current();
        return true;
      });
      return () => suscripcion.remove();
    }, []),
  );
}
