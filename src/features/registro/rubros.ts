/**
 * Reglas de los rubros que escribe el proveedor. Un rubro nuevo no se crea si ya existe uno igual
 * (sin importar mayúsculas, tildes, espacios de más ni el plural), así el catálogo no se ensucia.
 */

/** Cuántos rubros nuevos puede proponer un proveedor. */
export const MAX_RUBROS_NUEVOS = 3;
export const RUBRO_MIN = 2;
export const RUBRO_MAX = 30;
/** Cuántas sugerencias se muestran como máximo. */
const MAX_SUGERENCIAS = 6;

/** "  Lácteos  " → "lacteos": para comparar, nunca para mostrar. */
export function normalizarRubro(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿Es el mismo rubro? "cerveza" y "Cervezas" sí; "licor" y "licores" también. */
export function mismoRubro(a: string, b: string) {
  const x = normalizarRubro(a);
  const y = normalizarRubro(b);
  return x === y || x + 's' === y || y + 's' === x || x + 'es' === y || y + 'es' === x;
}

/** Deja escribir solo letras, números y espacios, hasta el largo máximo. */
export const limpiarRubro = (texto: string) =>
  texto.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, RUBRO_MAX);

/** Cómo se guarda: sin espacios de más y con la primera letra en mayúscula. */
export function formatearRubro(texto: string) {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  return limpio.charAt(0).toLocaleUpperCase('es-AR') + limpio.slice(1).toLocaleLowerCase('es-AR');
}

/** Se puede proponer como rubro nuevo si tiene el largo justo. */
export const esRubroValido = (texto: string) => {
  const largo = texto.replace(/\s+/g, ' ').trim().length;
  return largo >= RUBRO_MIN && largo <= RUBRO_MAX;
};

/** Los rubros del catálogo que coinciden con lo escrito: primero los que empiezan igual. */
export function buscarRubros(consulta: string, catalogo: readonly string[]) {
  const buscado = normalizarRubro(consulta);
  if (buscado === '') return [];
  const coincidencias = catalogo
    .map((rubro) => ({ rubro, clave: normalizarRubro(rubro) }))
    .filter(({ clave }) => clave.includes(buscado));
  const empiezan = (clave: string) => clave.startsWith(buscado) || clave.includes(` ${buscado}`);
  return coincidencias
    .sort((a, b) => Number(empiezan(b.clave)) - Number(empiezan(a.clave)))
    .slice(0, MAX_SUGERENCIAS)
    .map(({ rubro }) => rubro);
}
