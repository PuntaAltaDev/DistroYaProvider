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

| Comando             | Qué hace                                               |
| ------------------- | ------------------------------------------------------ |
| `npm run check`     | Tipos + lint + formato. Correrlo antes de cada commit. |
| `npm run typecheck` | Revisa los tipos de TypeScript.                        |
| `npm run lint`      | Revisa el código con ESLint.                           |
| `npm run format`    | Acomoda el formato con Prettier.                       |

## Estado actual

Hecho: registro en 6 pantallas (nombre, logo, contacto, dirección con Google, rubros y lista de precios), panel con inicio, perfil editable, plan y lista de precios con historial, ajustes (modo claro, oscuro o automático, y eliminar cuenta). Lo que se escribe en el registro y el estado del proveedor se guardan en el teléfono: si cierra la app, sigue donde estaba.

Falta, y depende de la API de Seba: login (Entra), envío real del registro, subida de logo y PDF, estado real de aprobación y plan, rubros desde el servidor y notificaciones. Hoy esas partes funcionan con datos de prueba; la lista completa está en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md#datos-de-prueba-que-se-reemplazan-con-la-api).

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): cómo está organizado el código y por qué.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): cómo trabajamos con ramas, commits y pull requests.
- [`AGENTS.md`](AGENTS.md): reglas para trabajar con Expo (cambia mucho entre versiones).

## Licencia

GPL-3.0 (ver `LICENSE`).
