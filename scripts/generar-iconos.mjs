// Genera el ícono, el splash y el favicon de la app a partir del logo (el carrito).
// Uso: npm run iconos
// El mismo dibujo está en src/components/ui/logo.tsx: si cambia uno, cambia el otro.
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const SALIDA = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images');

const COLOR = {
  fondo: '#041F21',
  cuadrado: '#0F3335',
  turquesa: '#18A4A3',
  aqua: '#7FE0D8',
  blanco: '#FFFFFF',
};

/** El carrito, dibujado en un cuadrado de 130 × 130. */
const carrito = ({ canasta, trazo, ruedas }) => `
  <polygon points="44,52 98,52 90,78 51,78" fill="${canasta}"/>
  <path d="M26 36H40L51 78H90L98 52H44" fill="none" stroke="${trazo}" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="58" cy="94" r="7" fill="${ruedas}"/>
  <circle cx="84" cy="94" r="7" fill="${ruedas}"/>`;

const colores = { canasta: COLOR.turquesa, trazo: COLOR.blanco, ruedas: COLOR.aqua };

/** El carrito centrado: su dibujo ocupa x 26–98 e y 36–101, así que se corre 3 y -3,5. */
const centrado = (contenido) => `<g transform="translate(3 -3.5)">${contenido}</g>`;

const svg = (contenido) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">${contenido}</svg>`;

const piezas = {
  // Ícono: cuadrado completo (iOS y Android le dan la forma).
  'icon.png': [
    1024,
    svg(`<rect width="130" height="130" fill="${COLOR.fondo}"/>${centrado(carrito(colores))}`),
  ],
  // Android: capa de adelante (transparente), capa de atrás (lisa) y versión de un solo color.
  'android-icon-foreground.png': [1024, svg(centrado(carrito(colores)))],
  'android-icon-background.png': [
    1024,
    svg(`<rect width="130" height="130" fill="${COLOR.fondo}"/>`),
  ],
  'android-icon-monochrome.png': [
    1024,
    svg(centrado(carrito({ canasta: COLOR.blanco, trazo: COLOR.blanco, ruedas: COLOR.blanco }))),
  ],
  // Splash y favicon: el logo con su cuadrado, igual que en la bienvenida.
  'splash-icon.png': [
    512,
    svg(`<rect width="130" height="130" rx="30" fill="${COLOR.cuadrado}"/>${carrito(colores)}`),
  ],
  'favicon.png': [
    64,
    svg(`<rect width="130" height="130" rx="30" fill="${COLOR.fondo}"/>${carrito(colores)}`),
  ],
};

await mkdir(SALIDA, { recursive: true });
for (const [archivo, [lado, dibujo]] of Object.entries(piezas)) {
  await sharp(Buffer.from(dibujo), { density: 600 })
    .resize(lado, lado)
    .png()
    .toFile(join(SALIDA, archivo));
  console.log(`✓ ${archivo} (${lado} px)`);
}
