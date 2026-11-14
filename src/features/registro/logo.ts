import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** La foto que eligió el proveedor, ya achicada, con su tamaño en píxeles. */
export type ImagenLogo = { uri: string; width: number; height: number };

/**
 * Cómo quedó acomodada la foto dentro del círculo.
 * `escala` 1 = la foto llena el círculo justo. `x` e `y` = cuánto se corrió, en fracción del círculo.
 */
export type AjusteLogo = { escala: number; x: number; y: number };

export const AJUSTE_INICIAL: AjusteLogo = { escala: 1, x: 0, y: 0 };
export const ESCALA_MAX = 4;

/** Lado más largo de la copia de trabajo. Alcanza para acercar sin que pese. */
const LADO_TRABAJO = 1600;
/** Lado del logo que se envía. */
const LADO_FINAL = 512;

/** Si la foto es casi cuadrada llena el círculo sola; si no, conviene acomodarla. */
export function necesitaAjuste({ width, height }: ImagenLogo) {
  const proporcion = Math.max(width, height) / Math.min(width, height);
  return proporcion > 1.15;
}

/**
 * Achica la foto recién elegida (las de cámara pesan varios MB) y devuelve su tamaño real.
 * WebP: pesa poco y conserva el fondo transparente de los logos.
 */
export async function prepararImagen(uri: string): Promise<ImagenLogo> {
  const imagen = await ImageManipulator.manipulate(uri, {
    maxWidth: LADO_TRABAJO,
    maxHeight: LADO_TRABAJO,
  }).renderAsync();
  const guardada = await imagen.saveAsync({ format: SaveFormat.WEBP, compress: 0.9 });
  return { uri: guardada.uri, width: guardada.width, height: guardada.height };
}

/** Hasta dónde se puede correr la foto sin que el círculo quede con huecos (en fracción del círculo). */
export function limiteDeCorrimiento({ width, height }: ImagenLogo, escala: number) {
  'worklet';
  const menor = Math.min(width, height);
  return {
    x: ((width / menor) * escala - 1) / 2,
    y: ((height / menor) * escala - 1) / 2,
  };
}

/** Recorta el cuadrado que se ve en el círculo y lo deja en 512 px, listo para enviar. */
export async function recortarLogo(imagen: ImagenLogo, ajuste: AjusteLogo): Promise<string> {
  const menor = Math.min(imagen.width, imagen.height);
  const lado = Math.round(menor / ajuste.escala);
  // Un círculo de ancho 1 muestra `lado` píxeles de la foto: correrla `x` mueve el recorte para el otro lado.
  const centroX = imagen.width / 2 - ajuste.x * lado;
  const centroY = imagen.height / 2 - ajuste.y * lado;
  const originX = Math.min(Math.max(Math.round(centroX - lado / 2), 0), imagen.width - lado);
  const originY = Math.min(Math.max(Math.round(centroY - lado / 2), 0), imagen.height - lado);

  const contexto = ImageManipulator.manipulate(imagen.uri).crop({
    originX,
    originY,
    width: lado,
    height: lado,
  });
  // Nunca se agranda: una foto chica queda del tamaño que tiene.
  if (lado > LADO_FINAL) contexto.resize({ width: LADO_FINAL, height: LADO_FINAL });
  const recorte = await contexto.renderAsync();
  const guardado = await recorte.saveAsync({ format: SaveFormat.WEBP, compress: 0.85 });
  return guardado.uri;
}
