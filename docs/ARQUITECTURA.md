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
| Avisos              | expo-notifications (locales; los push llegan con el backend)                      |

## Carpetas

```
src/
  app/            Rutas. Cada archivo es una pantalla y solo arma la pantalla de features/.
  components/ui/  Piezas reutilizables sin lógica de negocio: texto, campo, chip, ícono, barra de acción,
                  barra superior y titular (editorial), marco de pantalla (marco) y el lugar de las
                  herramientas de prueba en la barra (ranura-dev).
  features/       Una carpeta por tema de negocio, con sus pantallas y su lógica.
    acceso/       Cómo se entra: bienvenida → registro (Google, o email y su código en la misma pantalla).
    bienvenida/   Primera pantalla de la app: logo, nombre, frase y el botón "Empezar".
    legal/        Términos y condiciones, política de privacidad y su versión vigente.
    registro/     Alta del proveedor: pasos, validación, logo y dirección; en revisión y rechazado.
    panel/        Lo que ve el proveedor ya aprobado: inicio, perfil y lista de precios.
    suscripcion/  Plan del proveedor (ver, elegir, renovar) y lista de precios con historial.
    avisos/       Bandeja de avisos, permiso, y recordatorios del vencimiento en el teléfono.
    ayuda/        Contacto (WhatsApp y email) y preguntas frecuentes.
    cuenta/       Estado del proveedor guardado en el teléfono, y qué pantalla abrir.
    ajustes/      Apariencia, avisos, cerrar sesión, eliminar cuenta, ayuda y legal.
    dev/          Herramientas de prueba (solo en desarrollo): volver al inicio y simular al servidor.
  data/           Datos de ejemplo (se reemplazan por la API).
  lib/            Servicios y ayudas sin pantalla (Google Places, almacén de datos, ajustes, vibración,
                  avisos del teléfono).
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

| Qué                            | Dónde                                                          | Se reemplaza por                                       |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| Rubros                         | `src/data/rubros.ts`                                           | Tags de la API                                         |
| Plan del proveedor             | `suscripcion` en la cuenta (`features/cuenta/cuenta.ts`)       | Suscripción del proveedor                              |
| Planes y precios               | `PLANES` en `features/suscripcion/planes.ts`                   | Planes de la API                                       |
| Pago del plan                  | `pagar` en `features/suscripcion/planes-screen.tsx`            | Mercado Pago a través del backend                      |
| Historial de listas            | `historialDePrueba` en `features/suscripcion/datos.ts`         | Historial de listas de la API                          |
| Envío del registro             | `continuar` en `features/registro/registro-screen.tsx`         | Alta del proveedor en la API                           |
| Aprobación o rechazo           | Simulador en `features/dev/simulaciones.ts`                    | Estado y motivo que devuelve la API                    |
| Avisos de la bandeja           | `avisosDe` en `features/avisos/avisos.ts`                      | Avisos de la API (y push)                              |
| Textos legales                 | `features/legal/textos.ts` (borrador)                          | Textos revisados por un abogado                        |
| Contacto de soporte            | `CONTACTO` en `features/ayuda/contenido.ts`                    | Número y email reales                                  |
| Estado y borrador de la cuenta | `features/cuenta/` (se guarda en el teléfono)                  | Borrador local y estado desde la API                   |
| Guardado del perfil            | `actualizar({ form })` en `features/panel/panel-proveedor.tsx` | Actualización del perfil en la API                     |
| Eliminar cuenta                | `eliminarCuenta` en `features/ajustes/ajustes-screen.tsx`      | Baja de la cuenta en la API, y después borrar lo local |
| Búsqueda de direcciones        | `src/lib/places.ts` (la app habla directo con Google)          | Llamadas al backend, sin clave en la app               |
| Logo y lista en el teléfono    | `features/registro/logo.ts`                                    | Subida a Blob Storage                                  |

## Deudas conocidas

Cosas que hoy no cumplen del todo las reglas de arriba:

- `cuenta` guarda el formulario de `registro` y `registro` usa a `cuenta`: no hay ciclo de archivos, pero las dos carpetas se necesitan entre sí.
- Las pantallas no tienen pruebas automáticas todavía.
- La navegación entre pantallas es por estado (`useState`) y no por rutas de Expo Router: no hay botón "atrás" de Android ni transiciones nativas, y abrir los términos desde el acceso pierde el email escrito.

## Decisiones

- **Identificador de la app: `com.puntaaltadev.distroya.proveedor`** (iOS y Android). Una vez publicada en las tiendas no se puede cambiar. El ícono, la imagen de la pantalla de inicio y el ícono de iOS siguen siendo los de la plantilla de Expo hasta que estén los de la marca.

- **Logo en WebP, 512 px.** Pesa poco y conserva la transparencia. Hay que confirmar con Seba que el backend lo acepta.
- **La dirección sale de la lista de Google.** Así siempre queda la localidad y la provincia, y se guardan las coordenadas para buscar proveedores cerca.
- **La foto se mueve y se agranda dentro del círculo** en lugar de recortarse sola: solo el proveedor sabe qué parte quiere mostrar.
- **El logo se guarda en la carpeta de documentos de la app**, no en el caché: el teléfono puede vaciar el caché cuando necesita lugar.
- **El borrador y el estado se guardan en SQLite, sin cifrar.** Son datos del negocio, no secretos. Las claves y tokens del login van en `expo-secure-store`.
- **El modo claro/oscuro es una preferencia aparte de la cuenta:** eliminar la cuenta no la borra.
- **El logo es el carrito** (`components/ui/logo.tsx`). El ícono, el splash y el favicon salen de `scripts/generar-iconos.mjs` (`npm run iconos`); si se cambia el dibujo, se cambia en los dos lugares. Frase: "Proveedores y comercios, conectados."
- **La bienvenida se muestra una sola vez** (`iniciada` en la cuenta). Se entra con el email (código de 6 números) o con Google. **Ambos están simulados**: cualquier código sirve y Google entra sin pedir nada. Con el login de Seba se cambia lo que hacen `alEnviarCodigo`, `alConfirmar` y `alGoogle` en `features/acceso/acceso.tsx`; las pantallas quedan igual. La cuenta guarda `metodo` y `email` (con Google, el email lo va a dar la API). Registrarse e iniciar sesión son la misma pantalla: con la API, la respuesta decide si sigue el registro del negocio, la espera o el panel.
- **"Cerrar sesión" (Ajustes) pone `iniciada` en falso** y conserva el perfil y el avance: al volver a entrar, sigue donde estaba. `PantallaInicial` pasa siempre por el acceso cuando no hay sesión. Con la API, además se cierra la sesión en el servidor.
- **Términos y privacidad se aceptan al entrar** ("Al continuar aceptás…"). La cuenta guarda la versión aceptada (`VERSION_LEGAL`) y la fecha; si cambian los textos, se sube la versión. Los textos son un borrador hasta que los revise un abogado.
- **Perfil rechazado:** el administrador manda un motivo; "Corregir y reenviar" vuelve al registro con los datos cargados y el motivo a la vista en cada paso. Al reenviar, el motivo se borra.
- **Planes:** si el plan sigue vigente, lo que se paga se suma al tiempo que queda (no se pierde nada al renovar antes). Sin plan, el perfil no aparece en el buscador y el inicio pide elegir uno.
- **Avisos:** el permiso del sistema se pide una sola vez y en contexto (después de contratar el primer plan), con una pantalla propia antes, porque el sistema no vuelve a preguntar si se niega. Los recordatorios son locales (llegan sin servidor): 7 días antes a las 10 y el día que vence. Los push del servidor necesitan una development build y el backend; cuando lleguen, se suma el plugin `expo-notifications` en `app.json`. Tocar un aviso del teléfono todavía no abre la bandeja: llega con la navegación por rutas.
- **Las herramientas de prueba no viven en `components`:** la barra las recibe por contexto (`RanuraDev`), así se respeta la regla de dependencias. Solo existen con `__DEV__`.
- **Sin pantallas de carga, error o sin conexión todavía** en lo que depende de la API: se hacen cuando exista el contrato de la API, para no escribir código a ciegas.
