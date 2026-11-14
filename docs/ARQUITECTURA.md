# Arquitectura

Cómo está organizado el código de DistroYa Proveedores y las reglas que se siguen. Si algo de acá deja de ser verdad, se corrige en el mismo pull request que lo cambia.

## Stack

| Qué                 | Con qué                                                                           |
| ------------------- | --------------------------------------------------------------------------------- |
| Base                | Expo SDK 58, React Native 0.88, React 19, TypeScript estricto                     |
| Navegación          | Expo Router (las rutas son archivos dentro de `src/app`)                          |
| Animaciones         | Reanimated 4 y Gesture Handler 3                                                  |
| Fuente              | Inter (200, 400, 500, 600 y 700)                                                  |
| Direcciones         | Google Places API (New), por HTTP                                                 |
| Imágenes y archivos | expo-image-picker, expo-image-manipulator, expo-file-system, expo-document-picker |

## Carpetas

```
src/
  app/            Rutas. Cada archivo es una pantalla y solo arma la pantalla de features/.
  components/ui/  Piezas reutilizables sin lógica de negocio (texto, campo, chip, ícono, barra de acción).
  features/       Una carpeta por tema de negocio, con sus pantallas y su lógica.
    registro/     Alta del proveedor: pasos, validación, logo y dirección.
    panel/        Lo que ve el proveedor ya aprobado: inicio, perfil y lista de precios.
    suscripcion/  Plan del proveedor y lista de precios con historial.
  data/           Datos de ejemplo (se reemplazan por la API).
  lib/            Servicios y ayudas sin pantalla (Google Places, vibración).
  theme/          Colores, tipografía, espacios y animaciones.
```

Regla de dependencias: `app` usa `features`; `features` usa `components`, `lib`, `data` y `theme`; `components` usa solo `lib` y `theme`. Nada de `components` importa de `features`.

## Reglas del código

1. **Ninguna pantalla escribe un color o un tamaño a mano.** Todo sale de `theme/tokens.ts` a través de `useAppTheme()`.
2. **Los textos que ve el usuario están en español rioplatense** (voseo: "Elegí", "Tocá").
3. **Los nombres del código están en español** cuando nombran algo del negocio (`suscripcion`, `lista`, `proveedor`) y en inglés cuando son términos técnicos (`token`, `props`).
4. **Una pantalla, un archivo.** Si crece, se parte en piezas dentro de su carpeta de `features/`.
5. **Todo lo que depende de la API va aislado** (ver la tabla de abajo), para reemplazarlo sin tocar las pantallas.
6. **Las librerías de Expo se instalan con `npx expo install`** y antes de usar una API se mira la documentación de la versión instalada (ver `AGENTS.md`).
7. **Los secretos no se suben.** Van en `.env.local`.
8. **Alto de línea de Inter: nunca menos de 1,25 veces el tamaño.** Con menos, Android corta las colas de la "g" y la "p".

## Diseño

- Claro sobre blanco y oscuro sobre `#041F21`; turquesa `#18A4A3` de acento. La paleta y los contrastes están en `theme/tokens.ts`.
- Inter 600 para titulares, Inter 200 solo en tamaños grandes, números de ancho fijo (`tabular-nums`) y textos de al menos 13 px.
- Prioridad cuando hay duda: **la eficiencia y la legibilidad ganan sobre lo estético.**
- El círculo a medio llenar de la barra superior cambia entre claro y oscuro. Es solo para revisar el diseño.

## Datos de prueba que se reemplazan con la API

| Qué                         | Dónde                                                     | Se reemplaza por                         |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| Rubros                      | `src/data/rubros.ts`                                      | Tags de la API                           |
| Plan del proveedor          | `suscripcionDePrueba` en `features/suscripcion/datos.ts`  | Suscripción del proveedor                |
| Historial de listas         | `historialDePrueba` en `features/suscripcion/datos.ts`    | Historial de listas de la API            |
| Envío del registro          | `continuar` en `features/registro/registro-screen.tsx`    | Alta del proveedor en la API             |
| Aprobación del proveedor    | "Revisar mis datos" en `registro-exito.tsx`               | Estado real que devuelve la API          |
| Guardado del perfil         | `alGuardarPerfil` en `features/panel/panel-proveedor.tsx` | Actualización del perfil en la API       |
| Búsqueda de direcciones     | `src/lib/places.ts` (la app habla directo con Google)     | Llamadas al backend, sin clave en la app |
| Logo y lista en el teléfono | `features/registro/logo.ts`                               | Subida a Blob Storage                    |

## Deudas conocidas

Cosas que hoy no cumplen las reglas de arriba y se van a ordenar en su propio PR:

- `features/registro/editorial.tsx` (barra superior y titular) lo usan también `panel` y `suscripcion`: tiene que pasar a `components/ui/`.
- `features/panel/marco.tsx` (esqueleto de pantalla) lo usa `suscripcion`, y `panel` usa a `suscripcion`: hay un ciclo. También pasa a `components/ui/`.
- Las pantallas no tienen pruebas automáticas todavía.

## Decisiones

- **Logo en WebP, 512 px.** Pesa poco y conserva la transparencia. Hay que confirmar con Seba que el backend lo acepta.
- **La dirección sale de la lista de Google.** Así siempre queda la localidad y la provincia, y se guardan las coordenadas para buscar proveedores cerca.
- **La foto se mueve y se agranda dentro del círculo** en lugar de recortarse sola: solo el proveedor sabe qué parte quiere mostrar.
- **El logo se guarda en la carpeta de documentos de la app**, no en el caché: el teléfono puede vaciar el caché cuando necesita lugar.
- **Sin pantallas de carga, error o sin conexión todavía** en lo que depende de la API: se hacen cuando exista el contrato de la API, para no escribir código a ciegas.
