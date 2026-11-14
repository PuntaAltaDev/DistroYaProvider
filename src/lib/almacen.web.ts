/**
 * Versión web de `almacen.ts`: usa el almacenamiento del navegador.
 * SQLite en la web pide configuración extra y acá solo sirve para probar el diseño.
 */

export async function leer<T>(clave: string): Promise<T | null> {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? null : (JSON.parse(texto) as T);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}"`, error);
    return null;
  }
}

export async function guardar(clave: string, valor: unknown): Promise<void> {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn(`No se pudo guardar "${clave}"`, error);
  }
}

export async function borrar(clave: string): Promise<void> {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.warn(`No se pudo borrar "${clave}"`, error);
  }
}
