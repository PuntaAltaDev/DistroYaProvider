/** Largo del código que llega por email. */
export const LARGO_CODIGO = 6;

/** Deja el email prolijo: sin espacios y en minúsculas. */
export const limpiarEmail = (texto: string) => texto.trim().toLowerCase();

/** Revisa solo la forma (algo@dominio.com). Que el email exista lo confirma el código. */
export const emailValido = (texto: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpiarEmail(texto));

/** Deja solo los números del código y corta en el largo esperado. */
export const limpiarCodigo = (texto: string) => texto.replace(/\D/g, '').slice(0, LARGO_CODIGO);
