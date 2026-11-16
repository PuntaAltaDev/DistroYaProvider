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
| Pruebas             | Jest 30 con jest-expo                                                             |

## Carpetas

```
src/
  app/            Rutas. Cada archivo es una pantalla: arma la de features/ y le dice adónde ir
                  (router). _layout.tsx decide qué rutas existen según la etapa de la cuenta.
    panel/        "/panel/…": inicio, perfil, plan, lista, avisos y ajustes.
    legal/        "/legal/terminos" y "/legal/privacidad".
  components/ui/  Piezas reutilizables sin lógica de negocio: texto, campo, chip, ícono, barra de acción,
                  barra superior y titular (editorial), marco de pantalla (marco) y el lugar de las
                  herramientas de prueba en la barra (ranura-dev).
  features/       Una carpeta por tema de negocio, con sus pantallas y su lógica.
    acceso/       Cómo se entra: bienvenida → registro (Google, o email y su código en la misma pantalla).
    bienvenida/   Primera pantalla de la app: logo, nombre, frase y el botón "Empezar".
    legal/        Términos y condiciones, política de privacidad y su versión vigente.
    registro/     Alta del proveedor: pasos, validación, logo y dirección; en revisión y rechazado.
    panel/        Lo que ve el proveedor ya aprobado: inicio, perfil y lista de precios.
    suscripcion/  Licencia del proveedor (Free de 15 días, cuánto queda, cuándo renovar) y lista de precios con historial.
    avisos/       Bandeja de avisos, interruptor de avisos y recordatorios del vencimiento en el teléfono.
    ayuda/        Contacto (WhatsApp y email) y preguntas frecuentes.
    cuenta/       Estado del proveedor guardado en el teléfono.
    ajustes/      Apariencia, avisos, cerrar sesión, eliminar cuenta, ayuda y legal.
    dev/          Herramientas de prueba (solo en desarrollo): volver al inicio y simular al servidor.
  data/           Datos de ejemplo (se reemplazan por la API).
  lib/            Servicios y ayudas sin pantalla (Google Places, almacén de datos, ajustes, vibración,
                  avisos del teléfono, botón "atrás" de Android).
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
9. **Las reglas del negocio tienen pruebas automáticas** (licencia Free, vencimientos, avisos, validaciones, lectura de lo guardado). Van en una carpeta `__tests__` al lado del código, en archivos `*-test.ts`, y corren con `npm test` (también dentro de `npm run check`). Si se cambia una regla, se cambia su prueba en el mismo commit.

## Diseño

- Claro sobre blanco y oscuro sobre `#041F21`; turquesa `#18A4A3` de acento. La paleta y los contrastes están en `theme/tokens.ts`.
- Inter 600 para titulares, Inter 200 solo en tamaños grandes, números de ancho fijo (`tabular-nums`) y textos de al menos 13 px.
- Prioridad cuando hay duda: **la eficiencia y la legibilidad ganan sobre lo estético.**
- El círculo a medio llenar de la barra superior cambia entre claro y oscuro. Es solo para revisar el diseño.

## Datos de prueba que se reemplazan con la API

| Qué                            | Dónde                                                                              | Se reemplaza por                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Rubros                         | `src/data/rubros.ts`                                                               | Tags de la API                                                        |
| Descripción del negocio        | `descripcion` en la cuenta, se edita en `features/ajustes/descripcion-negocio.tsx` | Campo del perfil del proveedor en la API (máx. 300)                   |
| Rubros nuevos                  | `rubrosNuevos` en el formulario (`features/registro`)                              | Alta del tag en la API, pendiente de aprobación                       |
| Licencia del proveedor         | `suscripcion` en la cuenta (`features/cuenta/cuenta.ts`)                           | Licencia que crea el servidor (Free al aprobar) y que asigna el Admin |
| Licencia Free al aprobar       | `licenciaFree` en `features/suscripcion/datos.ts`                                  | El servidor la crea al aprobar el perfil                              |
| Historial de listas            | `historialDePrueba` en `features/suscripcion/datos.ts`                             | Historial de listas de la API                                         |
| Envío del registro             | `alEnviar` en `app/registro.tsx`                                                   | Alta del proveedor en la API                                          |
| Aprobación o rechazo           | Simulador en `features/dev/simulaciones.ts`                                        | Estado y motivo que devuelve la API                                   |
| Avisos de la bandeja           | `avisosDe` en `features/avisos/avisos.ts`                                          | Avisos de la API (y push)                                             |
| Textos legales                 | `features/legal/textos.ts` (borrador)                                              | Textos revisados por un abogado                                       |
| Contacto de soporte            | `CONTACTO` en `features/ayuda/contenido.ts`                                        | Número y email reales                                                 |
| Estado y borrador de la cuenta | `features/cuenta/` (se guarda en el teléfono)                                      | Borrador local y estado desde la API                                  |
| Guardado del perfil            | `actualizar({ form })` en `app/panel/perfil.tsx`                                   | Actualización del perfil en la API                                    |
| Eliminar cuenta                | `eliminarCuenta` en `features/ajustes/ajustes-screen.tsx`                          | Baja de la cuenta en la API, y después borrar lo local                |
| Búsqueda de direcciones        | `src/lib/places.ts` (la app habla directo con Google)                              | Llamadas al backend, sin clave en la app                              |
| Logo y lista en el teléfono    | `features/registro/logo.ts`                                                        | Subida a Blob Storage                                                 |

## Deudas conocidas

Cosas que hoy no cumplen del todo las reglas de arriba:

- Las pantallas no tienen pruebas automáticas todavía (solo las reglas del negocio). Para recorrer el flujo en el teléfono, Expo recomienda pruebas de punta a punta con Maestro.

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
- **"Cerrar sesión" (Ajustes) pone `iniciada` en falso** y conserva el perfil y el avance: al volver a entrar, sigue donde estaba. Sin sesión, las rutas protegidas solo dejan ver la bienvenida y el acceso. Con la API, además se cierra la sesión en el servidor.
- **Términos y privacidad se aceptan al entrar** ("Al continuar aceptás…"). La cuenta guarda la versión aceptada (`VERSION_LEGAL`) y la fecha; si cambian los textos, se sube la versión. Los textos son un borrador hasta que los revise un abogado.
- **Perfil rechazado:** el administrador manda un motivo; "Corregir y reenviar" vuelve al registro con los datos cargados y el motivo a la vista en cada paso. Al reenviar, el motivo se borra.
- **Licencia Free y sin pagos en la app.** Al aprobar el perfil arranca la licencia **Free de 15 días** (`PLAN_FREE`, `DIAS_FREE`); con la API la crea el servidor. "Mi plan" muestra qué licencia tiene, un contador de días que se acorta con la barra, cuándo debe renovar y, al pie, el interruptor de avisos. No se cobra acá: los planes pagos los asigna el Admin y, para activar o renovar, el botón abre el WhatsApp de soporte (`abrirWhatsApp`). Sin licencia vigente, el perfil no aparece en el buscador. Cuentas viejas sin licencia ven cómo activarla. Pendiente de Seba: crear la Free al aprobar; del Admin: asignar o extender un plan.
- **Avisos:** el permiso del sistema se pide al activar el interruptor de "Mi plan" (o el de Ajustes: es el mismo dato), sin pantalla aparte; si el teléfono los tiene bloqueados, se ofrece ir a sus ajustes. Los recordatorios son locales (llegan sin servidor): 7 días antes a las 10 y el día que vence; con la Free hablan de la prueba gratis. Los push del servidor necesitan una development build y el backend; cuando lleguen, se suma el plugin `expo-notifications` en `app.json`. Tocar un aviso del teléfono abre la bandeja (`/panel/avisos`), también con la app cerrada.
- **Navegación con rutas protegidas** (`Stack.Protected` en `app/_layout.tsx`). Cada etapa de la cuenta tiene sus rutas: sin sesión, `/` y `/entrada`; después `/registro`, `/en-revision`, `/rechazado` o `/panel/…`. Ayuda y legales están siempre. Cuando cambia la etapa (entrar, enviar, aprobar, cerrar sesión, eliminar), el router saca las pantallas viejas y lleva a la de la etapa nueva (`redirectTo`): ninguna pantalla navega a mano entre etapas. Una ruta que no corresponde (ej.: un link a `/panel` sin sesión) lleva a la etapa actual. Dentro de una pantalla con pasos (registro, código del acceso), el "atrás" de Android vuelve al paso anterior (`lib/atras.ts`).
- **Piso y depto son opcionales y no ocupan lugar:** la dirección muestra solo el link "+ Agregar piso o depto"; los campos aparecen al tocarlo (o ya abiertos si hay algo cargado). Se guardan como `piso` y `depto` en el formulario (`features/registro/campo-piso-depto.tsx`, usado en el registro y en Mi perfil). Los nombres definitivos los confirma Seba con la API.
- **Rubros nuevos con aprobación del Admin.** En "¿Qué vendés?" el link "+ Otro rubro" abre un campo con sugerencias de los rubros que ya existen (`features/registro/campo-rubro-nuevo.tsx`). Si no hay uno igual, se ofrece agregarlo: el proveedor lo usa enseguida (queda en `rubros` y en `rubrosNuevos`) y los demás lo ven cuando el Admin lo aprueba. Para no repetir, se compara sin tildes, mayúsculas, espacios de más ni plural (`features/registro/rubros.ts`, con pruebas). Entre 2 y 30 caracteres, solo letras y números, hasta 3 nuevos por proveedor. Un rubro propuesto que se desmarca se descarta. **Falta de Seba y del Admin:** endpoint para crear un tag en estado pendiente (único sin importar tildes, mayúsculas ni plural) y para aprobarlo, rechazarlo o unirlo a uno existente; y una pantalla "Rubros nuevos" en el Admin.
- **Descripción del negocio ("Contanos más").** Opcional, hasta 300 caracteres (`DESCRIPCION_MAX`). Se edita en Ajustes: una fila que, al tocarla, abre el campo con contador, y "Guardar" o "Cancelar". La guarda la cuenta como `descripcion`. En la App Cliente va en el perfil del proveedor como un bloque plegado: no se ve en los resultados y solo aparece si el cliente lo despliega; si está vacía, el bloque no se muestra. Pendiente de Seba: el campo `descripcion` en el perfil del proveedor.
- **Las herramientas de prueba no viven en `components`:** la barra las recibe por contexto (`RanuraDev`), así se respeta la regla de dependencias. Solo existen con `__DEV__`.
- **Sin pantallas de carga, error o sin conexión todavía** en lo que depende de la API: se hacen cuando exista el contrato de la API, para no escribir código a ciegas.
