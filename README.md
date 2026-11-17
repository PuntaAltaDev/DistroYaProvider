# DistroYa Proveedores

App móvil (iPhone, Android y web) para que los proveedores de DistroYa se registren, mantengan su perfil, vean su plan y suban su lista de precios. Es una de las cuatro piezas del proyecto:

| Repo                   | Qué es                                |
| ---------------------- | ------------------------------------- |
| `DistroYaAdmin`        | Panel web del administrador (React)   |
| `DistroYaClient`       | App de los clientes (Expo)            |
| **`DistroYaProvider`** | **Esta app, para proveedores (Expo)** |
| `DistroYaApiBackend`   | API en .NET (Seba)                    |

## Cómo correrla

Hace falta Node.js (LTS) y, para probar en el celular, la app **Expo Go**.

```bash
npm install
npx expo start
```

Después se escanea el QR con Expo Go (el celular tiene que estar en la misma Wi‑Fi que la PC) o se abre la versión web con `w`.

### Variables de entorno

Copiá `.env.example` como `.env.local` y completá la clave. **Nunca** subas `.env.local`: git ya lo ignora.

| Variable                        | Para qué                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_GOOGLE_PLACES_KEY` | Clave de Google Maps Platform (Places API New) para las sugerencias de dirección. Sin ella, la dirección se escribe a mano. |

## Scripts

| Comando              | Qué hace                                                         |
| -------------------- | ---------------------------------------------------------------- |
| `npm run check`      | Tipos + lint + formato + pruebas. Correrlo antes de cada commit. |
| `npm test`           | Corre las pruebas automáticas.                                   |
| `npm run test:watch` | Las vuelve a correr con cada cambio.                             |
| `npm run typecheck`  | Revisa los tipos de TypeScript.                                  |
| `npm run lint`       | Revisa el código con ESLint.                                     |
| `npm run format`     | Acomoda el formato con Prettier.                                 |

## Estado actual

Hecho: pantalla de bienvenida, acceso con email (código simulado) o Google (simulado) aceptando términos y privacidad, registro en 6 pantallas (nombre, logo, contacto, dirección con Google, rubros y lista de precios), espera de aprobación, perfil rechazado con corregir y reenviar, panel con inicio, perfil editable, licencia Free de 15 días con contador y renovación por WhatsApp, lista de precios con historial, avisar a clientes (a favoritos o a todos), avisos (bandeja con los mensajes de DistroYa, interruptor y recordatorios de vencimiento en el teléfono), ayuda y contacto, y ajustes (apariencia, avisos, cerrar sesión, eliminar cuenta, ayuda y legal). Lo que se escribe en el registro y el estado del proveedor se guardan en el teléfono: si cierra la app, sigue donde estaba.

Falta, y depende de la API de Seba: login real, envío real del registro, subida de logo y PDF, aprobación o rechazo real, creación de la licencia Free al aprobar, rubros desde el servidor, envío real de avisos a clientes y avisos push. Hoy esas partes funcionan con datos de prueba; la lista completa está en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md#datos-de-prueba-que-se-reemplazan-con-la-api).

Para probar sin servidor, la barra de arriba tiene dos íconos que solo aparecen en desarrollo: la flecha circular borra todo y vuelve a la bienvenida, y la probeta simula lo que hace el servidor (aprobar o rechazar el perfil, dar o vencer la licencia, mandar un aviso).

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): cómo está organizado el código y por qué.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): cómo trabajamos con ramas, commits y pull requests.
- [`AGENTS.md`](AGENTS.md): reglas para trabajar con Expo (cambia mucho entre versiones).

## Licencia

GPL-3.0 (ver `LICENSE`).
