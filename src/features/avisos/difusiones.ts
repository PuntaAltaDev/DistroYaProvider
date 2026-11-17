/**
 * Difusiones: avisos que el administrador de DistroYa les manda a los proveedores (a todos o a
 * algunos). Llegan como notificación al teléfono y quedan en la bandeja. Con la API, vienen del servidor.
 */
export type Difusion = {
  id: string;
  titulo: string;
  texto: string;
  /** Cuándo la mandó (ISO). */
  fecha: string;
};

/** Cuántas se guardan. */
export const DIFUSIONES_MAX = 30;

/** Lee las difusiones guardadas: descarta las que tengan otra forma. */
export function difusionesGuardadas(valor: unknown): Difusion[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  const validas = valor.filter(
    (d): d is Difusion =>
      typeof d?.id === 'string' &&
      typeof d.titulo === 'string' &&
      typeof d.texto === 'string' &&
      typeof d.fecha === 'string' &&
      !Number.isNaN(new Date(d.fecha).getTime()),
  );
  return validas.length > 0 ? validas.slice(0, DIFUSIONES_MAX) : undefined;
}

/** Suma la que llegó al principio, sin pasar de `DIFUSIONES_MAX`. */
export const sumarDifusion = (nueva: Difusion, difusiones: Difusion[] = []) =>
  [nueva, ...difusiones].slice(0, DIFUSIONES_MAX);
