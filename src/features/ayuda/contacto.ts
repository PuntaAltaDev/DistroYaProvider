import { Linking } from 'react-native';

import { haptics } from '@/lib/haptics';

import { CONTACTO } from './contenido';

/** Abre un link (WhatsApp, email…). Si el teléfono no puede, avisa en consola y la app sigue. */
export async function abrirUrl(url: string) {
  haptics.tap();
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn(`No se pudo abrir ${url}`, error);
  }
}

/** Abre el chat de soporte con un mensaje ya escrito. */
export const abrirWhatsApp = (mensaje: string) =>
  abrirUrl(`https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}`);
