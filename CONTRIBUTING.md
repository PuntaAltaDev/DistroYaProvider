# Cómo trabajamos

Reglas para que el historial de git se pueda leer, auditar y deshacer.

## Ramas

- **`main` es la rama estable.** No se trabaja directo sobre ella: todo entra por pull request.
- Cada tema va en su propia rama, creada desde `main`, con el nombre `tipo/descripcion-corta`:

| Prefijo    | Para qué                     | Ejemplo                         |
| ---------- | ---------------------------- | ------------------------------- |
| `feature/` | Algo nuevo para el usuario   | `feature/cuenta-y-ajustes`      |
| `fix/`     | Arreglar un error            | `fix/logo-vacio-en-perfil`      |
| `chore/`   | Mantenimiento, configuración | `chore/estructura-del-proyecto` |
| `docs/`    | Solo documentación           | `docs/guia-de-contribucion`     |

- Una rama = un tema. Si aparece otro tema, va en otra rama.
- Después de hacer merge, la rama se borra.

## Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/), escritos en español.

```
tipo(alcance): resumen en una línea, en presente, sin punto final

Cuerpo opcional: qué cambia y por qué (no cómo; el cómo está en el código).
```

| Tipo       | Cuándo                                |
| ---------- | ------------------------------------- |
| `feat`     | Una función nueva                     |
| `fix`      | Un error corregido                    |
| `refactor` | Cambia el código pero no lo que hace  |
| `style`    | Solo formato                          |
| `docs`     | Documentación                         |
| `chore`    | Configuración, dependencias, limpieza |
| `ci`       | Chequeos automáticos                  |

Reglas:

1. **Un commit, un tema.** Si el mensaje necesita un "y" para explicarse, son dos commits.
2. **Cada commit tiene que funcionar:** que compile y pase `npm run check`.
3. **El resumen dice qué cambió para el usuario o el código**, no "arreglos" ni "cambios varios".
4. **No se reescribe lo ya subido** (nada de `push --force` sobre ramas compartidas).
5. **Nunca se sube un secreto** (claves, `.env.local`, certificados). Si se sube por error, se avisa y se cambia la clave: borrar el commit no alcanza.

## Antes de subir

```bash
npm run check
```

Revisa tipos, lint y formato. El mismo chequeo corre solo en cada pull request, y si falla, no se mezcla.

## Pull requests

- Se abren contra `main` con la plantilla que trae el repo.
- Se explica qué cambia, por qué, y cómo se probó.
- Si el cambio se ve, se adjunta una captura.
- Si toca el contrato con la API, se avisa a Seba en el mismo PR.
- Se mezcla con **merge** (no squash), para que cada commit siga contando su historia.

## Dependencias

- Se instalan con `npx expo install <paquete>` para que la versión sea compatible con el SDK.
- No se suma una librería sin necesidad. Si ya no se usa, se saca.
- Antes de usar una API de Expo se lee la documentación de la versión instalada (`AGENTS.md`).
