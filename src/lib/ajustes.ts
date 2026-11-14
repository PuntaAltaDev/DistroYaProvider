import type { ThemeMode } from '@/theme';

import { guardar, leer } from './almacen';

const CLAVE_MODO = 'ajustes.modo';
const MODOS: readonly ThemeMode[] = ['light', 'dark', 'system'];

/** El modo (claro, oscuro o automático) que eligió el usuario. Si no eligió, claro. */
export async function cargarModo(): Promise<ThemeMode> {
  const guardado = await leer<ThemeMode>(CLAVE_MODO);
  return guardado && MODOS.includes(guardado) ? guardado : 'light';
}

export const guardarModo = (modo: ThemeMode) => guardar(CLAVE_MODO, modo);
