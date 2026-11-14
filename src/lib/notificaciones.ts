import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Avisos locales del teléfono (expo-notifications, SDK 58). Funcionan sin servidor y en Expo Go.
 * Los avisos push (que manda el servidor) necesitan una development build y el backend de Seba.
 * Nada de acá lanza errores: si falla, se avisa en consola y la app sigue.
 * En web no hay avisos: ver `notificaciones.web.ts`.
 */

export type EstadoPermiso = 'concedido' | 'denegado' | 'sin-preguntar';

/** Canal de Android para los avisos del plan. */
const CANAL = 'avisos';

let configuracion: Promise<void> | undefined;

/**
 * Prepara los avisos una sola vez. Lo llaman solas las funciones de abajo antes de hacer nada:
 * Android 13+ necesita el canal creado antes de pedir permiso o programar.
 */
function configurar() {
  configuracion ??= crearCanalYManejador();
  return configuracion;
}

async function crearCanalYManejador() {
  Notifications.setNotificationHandler({
    // Con la app abierta, el aviso también se muestra arriba.
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CANAL, {
        name: 'Avisos del plan',
        importance: AndroidImportance.DEFAULT,
      });
    } catch (error) {
      console.warn('No se pudo crear el canal de avisos', error);
    }
  }
}

function leerPermiso(permiso: Notifications.NotificationPermissionsStatus): EstadoPermiso {
  // En iPhone, "provisional" (llegan en silencio al centro de notificaciones) también sirve.
  if (permiso.granted || permiso.ios?.status === IosAuthorizationStatus.PROVISIONAL)
    return 'concedido';
  return permiso.canAskAgain ? 'sin-preguntar' : 'denegado';
}

export async function estadoPermiso(): Promise<EstadoPermiso> {
  try {
    await configurar();
    return leerPermiso(await Notifications.getPermissionsAsync());
  } catch (error) {
    console.warn('No se pudo leer el permiso de avisos', error);
    return 'denegado';
  }
}

/** Muestra el pedido de permiso del sistema (si todavía se puede). Devuelve si quedó concedido. */
export async function pedirPermiso(): Promise<boolean> {
  try {
    await configurar();
    return leerPermiso(await Notifications.requestPermissionsAsync()) === 'concedido';
  } catch (error) {
    console.warn('No se pudo pedir el permiso de avisos', error);
    return false;
  }
}

export type AvisoProgramado = { id: string; titulo: string; texto: string; fecha: Date };

/** Programa un aviso para una fecha. Si ya había uno con el mismo id, lo reemplaza. */
export async function programarAviso({ id, titulo, texto, fecha }: AvisoProgramado) {
  try {
    await configurar();
    await Notifications.cancelScheduledNotificationAsync(id);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title: titulo, body: texto },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fecha,
        channelId: CANAL,
      },
    });
  } catch (error) {
    console.warn(`No se pudo programar el aviso "${id}"`, error);
  }
}

export async function cancelarAviso(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.warn(`No se pudo cancelar el aviso "${id}"`, error);
  }
}
