import { borrar, guardar, leer } from '@/lib/almacen';
import { FORM_INICIAL, type RegistroForm } from '@/features/registro/validacion';
import { aGuardada, desdeGuardada, type SuscripcionGuardada } from '@/features/suscripcion/datos';

/**
 * En qué punto está el proveedor:
 * - `borrador`: está completando el registro.
 * - `pendiente`: envió el registro y espera la aprobación del administrador.
 * - `aprobado`: ya puede usar el panel.
 * - `rechazado`: el administrador pidió correcciones (`motivoRechazo`). Al corregir vuelve a `borrador`.
 *
 * Todavía no hay servidor: el estado se guarda en el teléfono. Cuando esté la API,
 * `pendiente`, `aprobado` y `rechazado` los define el servidor y acá queda solo el borrador.
 */
export type EstadoCuenta = 'borrador' | 'pendiente' | 'aprobado' | 'rechazado';

/** Cómo entró: con un código al email o con su cuenta de Google. */
export type MetodoAcceso = 'email' | 'google';

export type Cuenta = {
  /** Ya confirmó su acceso (email o Google) en las pantallas de bienvenida. */
  iniciada: boolean;
  /** Cómo entró. Falta en lo guardado antes de que existiera el acceso. */
  metodo?: MetodoAcceso;
  /** Email con el que entró. Con Google todavía no se conoce: lo va a dar la API. */
  email?: string;
  /** Qué versión de los términos y la privacidad aceptó, y cuándo (ISO). Ver `features/legal`. */
  terminos?: { version: string; fecha: string };
  estado: EstadoCuenta;
  /** Pantalla del registro en la que quedó (empieza en 0). */
  paso: number;
  form: RegistroForm;
  /** Cuándo se envió el registro, en formato ISO. */
  fechaEnvio?: string;
  /** Qué pidió corregir el administrador. Se borra al reenviar el registro. */
  motivoRechazo?: string;
  /** Cuándo lo aprobó el administrador (ISO). Con la API lo manda el servidor. */
  fechaAprobacion?: string;
  /** Plan contratado. Falta hasta que elige el primero (después de ser aprobado). */
  suscripcion?: SuscripcionGuardada;
  /** Avisos: si los quiere y cuáles ya leyó. Falta hasta que se le pregunta por primera vez. */
  avisos?: PreferenciaAvisos;
};

export type PreferenciaAvisos = {
  /** Quiere avisos del teléfono (además, el sistema tiene que dar permiso). */
  activos: boolean;
  /** Ids de los avisos de la bandeja que ya vio. */
  leidos: string[];
};

export const CUENTA_INICIAL: Cuenta = {
  iniciada: false,
  estado: 'borrador',
  paso: 0,
  form: FORM_INICIAL,
};

/** La "v1" permite cambiar la forma de los datos más adelante sin romper lo ya guardado. */
const CLAVE = 'cuenta.v1';
const ESTADOS: readonly EstadoCuenta[] = ['borrador', 'pendiente', 'aprobado', 'rechazado'];

/** Lee la cuenta guardada. Si no hay nada, o está dañada, empieza de cero. */
export async function cargarCuenta(): Promise<Cuenta> {
  const guardada = await leer<Partial<Cuenta>>(CLAVE);
  if (!guardada?.estado || !ESTADOS.includes(guardada.estado)) return CUENTA_INICIAL;

  const estado = guardada.estado;
  const paso = Number.isInteger(guardada.paso) ? Math.max(0, guardada.paso as number) : 0;
  // Si el formulario ganó campos nuevos desde que se guardó, quedan con su valor inicial.
  const form = { ...FORM_INICIAL, ...guardada.form };
  const suscripcion = desdeGuardada(guardada.suscripcion);

  return {
    // Lo guardado antes de que existiera la bienvenida no trae este dato: si ya hay avance,
    // se da por iniciada para no mostrarle la bienvenida a alguien que ya empezó.
    iniciada: guardada.iniciada ?? (estado !== 'borrador' || paso > 0 || !!form.razonSocial.trim()),
    metodo:
      guardada.metodo === 'email' || guardada.metodo === 'google' ? guardada.metodo : undefined,
    email: typeof guardada.email === 'string' ? guardada.email : undefined,
    terminos:
      typeof guardada.terminos?.version === 'string' && typeof guardada.terminos.fecha === 'string'
        ? guardada.terminos
        : undefined,
    estado,
    paso,
    form,
    fechaEnvio: guardada.fechaEnvio,
    motivoRechazo: typeof guardada.motivoRechazo === 'string' ? guardada.motivoRechazo : undefined,
    fechaAprobacion:
      typeof guardada.fechaAprobacion === 'string' ? guardada.fechaAprobacion : undefined,
    // Se valida pasándola a fechas: si está dañada, queda sin plan (y se le pide elegir uno).
    suscripcion: suscripcion ? aGuardada(suscripcion) : undefined,
    avisos:
      typeof guardada.avisos?.activos === 'boolean'
        ? {
            activos: guardada.avisos.activos,
            leidos: Array.isArray(guardada.avisos.leidos) ? guardada.avisos.leidos : [],
          }
        : undefined,
  };
}

export const guardarCuenta = (cuenta: Cuenta) => guardar(CLAVE, cuenta);

export const borrarCuenta = () => borrar(CLAVE);
