import type { AvisoProgramado, EstadoPermiso } from './notificaciones';

/**
 * En web no hay avisos del teléfono (expo-notifications es solo iOS y Android).
 * Para poder probar el flujo en el navegador, el permiso se simula: queda concedido al pedirlo
 * y dura hasta recargar la página. Programar y cancelar no hacen nada.
 */
let concedido = false;

export async function estadoPermiso(): Promise<EstadoPermiso> {
  return concedido ? 'concedido' : 'sin-preguntar';
}

export async function pedirPermiso(): Promise<boolean> {
  concedido = true;
  return true;
}

export async function programarAviso(aviso: AvisoProgramado) {
  console.info(`[web] Aviso "${aviso.id}" para el ${aviso.fecha.toLocaleString('es-AR')}`);
}

export async function cancelarAviso(_id: string) {}

export function alTocarAviso(_abrir: (url: string) => void) {
  return () => {};
}
