import Almacen from 'expo-sqlite/kv-store';

/**
 * Guarda y lee datos chicos en el teléfono (SQLite), como texto JSON.
 * Nada de acá lanza errores: si falla, se avisa en consola y la app sigue (sin dato guardado).
 * No es un lugar para secretos: las claves y tokens van en expo-secure-store.
 */

export async function leer<T>(clave: string): Promise<T | null> {
  try {
    const texto = await Almacen.getItem(clave);
    return texto === null ? null : (JSON.parse(texto) as T);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}"`, error);
    return null;
  }
}

export async function guardar(clave: string, valor: unknown): Promise<void> {
  try {
    await Almacen.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn(`No se pudo guardar "${clave}"`, error);
  }
}

export async function borrar(clave: string): Promise<void> {
  try {
    await Almacen.removeItem(clave);
  } catch (error) {
    console.warn(`No se pudo borrar "${clave}"`, error);
  }
}
