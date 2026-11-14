import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { LegalScreen } from '@/features/legal/legal-screen';
import { TEXTOS_LEGALES, type DocumentoLegal } from '@/features/legal/textos';

/** "/legal/terminos" y "/legal/privacidad". Siempre disponibles. */
export default function Legal() {
  const { documento } = useLocalSearchParams<{ documento: string }>();
  if (!(documento in TEXTOS_LEGALES)) return <Redirect href="/" />;
  return <LegalScreen documento={documento as DocumentoLegal} alVolver={() => router.back()} />;
}
