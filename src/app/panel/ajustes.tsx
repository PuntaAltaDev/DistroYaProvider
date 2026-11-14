import { router } from 'expo-router';

import { AjustesScreen } from '@/features/ajustes/ajustes-screen';

/** "/panel/ajustes": apariencia, avisos, cuenta, ayuda y legal. */
export default function Ajustes() {
  return <AjustesScreen alVolver={() => router.back()} />;
}
