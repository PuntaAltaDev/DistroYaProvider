import { router } from 'expo-router';

import { AyudaScreen } from '@/features/ayuda/ayuda-screen';

/** "/ayuda": contacto y preguntas frecuentes. Siempre disponible. */
export default function Ayuda() {
  return <AyudaScreen alVolver={() => router.back()} />;
}
