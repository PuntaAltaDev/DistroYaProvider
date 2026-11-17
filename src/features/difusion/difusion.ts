/**
 * Avisos que el proveedor les manda a sus clientes (promos, novedades). Les llegan como
 * notificación en el teléfono. Sin límite de envíos: el cliente puede apagar los avisos de un
 * proveedor sin sacarlo de favoritos.
 *
 * Además, cuando sube una lista de precios nueva, el servidor les avisa solo a los que lo tienen
 * de favorito (no hace falta escribir nada).
 *
 * Todavía no hay servidor: el envío se simula y el historial se guarda en el teléfono.
 */

/** A quién le llega: a los que lo tienen de favorito, a todos sus clientes o a los que eligió. */
export type Destinatarios = 'favoritos' | 'todos' | 'elegidos';

/** Un cliente, para buscarlo y elegirlo como destinatario. */
export type Cliente = { id: string; nombre: string; localidad: string };

export type AvisoEnviado = {
  id: string;
  titulo: string;
  texto: string;
  a: Destinatarios;
  /** Con `elegidos`: a quiénes (nombres, para el historial). */
  nombres?: string[];
  /** A cuántos clientes les llegó (lo dice el servidor al enviar). */
  alcance: number;
  /** Cuándo se envió (ISO). */
  fecha: string;
};

export const TITULO_AVISO_MAX = 50;
export const TEXTO_AVISO_MAX = 200;
/** Cuántos enviados se guardan para mostrar. */
export const ENVIADOS_MAX = 20;

/** Cuántos clientes hay de cada lado. Dato de prueba: con la API lo manda el servidor. */
export const ALCANCE_DE_PRUEBA = { favoritos: 18, todos: 64 };

/** Algunos clientes para probar el buscador. Con la API, la búsqueda la hace el servidor. */
export const CLIENTES_DE_PRUEBA: Cliente[] = [
  { id: 'c1', nombre: 'Almacén Don Pepe', localidad: 'Bahía Blanca' },
  { id: 'c2', nombre: 'Autoservicio El Sol', localidad: 'Bahía Blanca' },
  { id: 'c3', nombre: 'Kiosco La Esquina', localidad: 'Punta Alta' },
  { id: 'c4', nombre: 'Despensa María', localidad: 'Punta Alta' },
  { id: 'c5', nombre: 'Maxikiosco 24 h', localidad: 'Bahía Blanca' },
  { id: 'c6', nombre: 'Almacén Los Andes', localidad: 'Ingeniero White' },
  { id: 'c7', nombre: 'Súper Ñandú', localidad: 'Monte Hermoso' },
  { id: 'c8', nombre: 'Bar El Puerto', localidad: 'Ingeniero White' },
  { id: 'c9', nombre: 'Rotisería Doña Rosa', localidad: 'Punta Alta' },
  { id: 'c10', nombre: 'Almacén San Martín', localidad: 'Bahía Blanca' },
];

/** Cuántos resultados muestra el buscador de clientes. */
export const RESULTADOS_MAX = 6;

/** Cómo se llama cada opción en el historial de enviados. */
export const NOMBRE_DESTINATARIOS: Record<Destinatarios, string> = {
  favoritos: 'Mis favoritos',
  todos: 'Todos mis clientes',
  elegidos: 'Clientes elegidos',
};

/** Sin tildes ni mayúsculas, para comparar al buscar. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/**
 * Busca clientes por nombre o localidad, sin los ya elegidos. Primero los que empiezan con lo
 * escrito. Hacen falta al menos 2 letras.
 */
export function buscarClientes(texto: string, todos: Cliente[], elegidos: string[] = []) {
  const busqueda = normalizar(texto);
  if (busqueda.length < 2) return [];
  const encontrados = todos.filter(
    (c) =>
      !elegidos.includes(c.id) &&
      (normalizar(c.nombre).includes(busqueda) || normalizar(c.localidad).includes(busqueda)),
  );
  const empieza = (c: Cliente) => (normalizar(c.nombre).startsWith(busqueda) ? 0 : 1);
  return encontrados.sort((a, b) => empieza(a) - empieza(b)).slice(0, RESULTADOS_MAX);
}

/** "1 cliente", "18 clientes". */
export const clientes = (n: number) => (n === 1 ? '1 cliente' : `${n} clientes`);

/** Saca espacios de más: en el título, todo en una línea; en el texto, sin líneas en blanco seguidas. */
export function limpiarAviso(titulo: string, texto: string) {
  return {
    titulo: titulo.replace(/\s+/g, ' ').trim().slice(0, TITULO_AVISO_MAX),
    texto: texto
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim()
      .slice(0, TEXTO_AVISO_MAX),
  };
}

export type ErroresAviso = { clientes?: string; titulo?: string; texto?: string };

/** Revisa el aviso antes de enviarlo. `elegidos`: cuántos clientes eligió (si eligió a mano). Vacío = todo bien. */
export function validarAviso(titulo: string, texto: string, elegidos?: number): ErroresAviso {
  const limpio = limpiarAviso(titulo, texto);
  const errores: ErroresAviso = {};
  if (elegidos === 0) errores.clientes = 'Buscá y elegí al menos un cliente.';
  if (limpio.titulo.length < 3) errores.titulo = 'Escribí un título.';
  if (limpio.texto.length < 5) errores.texto = 'Escribí el mensaje.';
  return errores;
}

/** Suma el recién enviado al principio, sin pasar de `ENVIADOS_MAX`. */
export const sumarEnviado = (nuevo: AvisoEnviado, enviados: AvisoEnviado[] = []) =>
  [nuevo, ...enviados].slice(0, ENVIADOS_MAX);

/** Lee los enviados guardados: descarta los que tengan otra forma. */
export function enviadosGuardados(valor: unknown): AvisoEnviado[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  const validos = valor.filter(
    (a): a is AvisoEnviado =>
      typeof a?.id === 'string' &&
      typeof a.titulo === 'string' &&
      typeof a.texto === 'string' &&
      (a.a === 'favoritos' || a.a === 'todos' || a.a === 'elegidos') &&
      (a.nombres === undefined ||
        (Array.isArray(a.nombres) && a.nombres.every((n: unknown) => typeof n === 'string'))) &&
      typeof a.alcance === 'number' &&
      typeof a.fecha === 'string' &&
      !Number.isNaN(new Date(a.fecha).getTime()),
  );
  return validos.length > 0 ? validos.slice(0, ENVIADOS_MAX) : undefined;
}
