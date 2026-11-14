import { router } from 'expo-router';

import type { DocumentoLegal } from './textos';

/** Abre los términos o la privacidad encima de la pantalla actual. */
export function verLegal(documento: DocumentoLegal) {
  router.push({ pathname: '/legal/[documento]', params: { documento } });
}
