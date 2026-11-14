import { borrar, guardar, leer } from '@/lib/almacen';
import { FORM_INICIAL, type RegistroForm } from '@/features/registro/validacion';

/**
 * En qué punto está el proveedor:
 * - `borrador`: está completando el registro.
 * - `pendiente`: envió el registro y espera la aprobación del administrador.
 * - `aprobado`: ya puede usar el panel.
 *
 * Todavía no hay servidor: el estado se guarda en el teléfono. Cuando esté la API,
 * `pendiente` y `aprobado` los define el servidor y acá queda solo el borrador.
 */
export type EstadoCuenta = 'borrador' | 'pendiente' | 'aprobado';

export type Cuenta = {
  estado: EstadoCuenta;
  /** Pantalla del registro en la que quedó (empieza en 0). */
  paso: number;
  form: RegistroForm;
  /** Cuándo se envió el registro, en formato ISO. */
  fechaEnvio?: string;
};

export const CUENTA_INICIAL: Cuenta = { estado: 'borrador', paso: 0, form: FORM_INICIAL };

/** La "v1" permite cambiar la forma de los datos más adelante sin romper lo ya guardado. */
const CLAVE = 'cuenta.v1';
const ESTADOS: readonly EstadoCuenta[] = ['borrador', 'pendiente', 'aprobado'];

/** Lee la cuenta guardada. Si no hay nada, o está dañada, empieza de cero. */
export async function cargarCuenta(): Promise<Cuenta> {
  const guardada = await leer<Partial<Cuenta>>(CLAVE);
  if (!guardada?.estado || !ESTADOS.includes(guardada.estado)) return CUENTA_INICIAL;

  return {
    estado: guardada.estado,
    paso: Number.isInteger(guardada.paso) ? Math.max(0, guardada.paso as number) : 0,
    // Si el formulario ganó campos nuevos desde que se guardó, quedan con su valor inicial.
    form: { ...FORM_INICIAL, ...guardada.form },
    fechaEnvio: guardada.fechaEnvio,
  };
}

export const guardarCuenta = (cuenta: Cuenta) => guardar(CLAVE, cuenta);

export const borrarCuenta = () => borrar(CLAVE);
