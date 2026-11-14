import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { alTocarAviso } from '@/lib/notificaciones';

/**
 * Al tocar un aviso del teléfono, abre la pantalla que trae (la bandeja). Va en el inicio del
 * panel: solo escucha con la sesión aprobada y el navegador ya listo, incluso si el aviso abrió
 * la app estando cerrada.
 */
export function useAbrirAvisoTocado() {
  useEffect(() => alTocarAviso((url) => router.push(url as Href)), []);
}
