import { router } from 'expo-router';

import { BienvenidaScreen } from '@/features/bienvenida/bienvenida-screen';

/** "/": bienvenida. Solo sin sesión iniciada. */
export default function Bienvenida() {
  return <BienvenidaScreen alEmpezar={() => router.push('/entrada')} />;
}
