import { Acceso } from '@/features/acceso/acceso';
import { PanelProveedor } from '@/features/panel/panel-proveedor';
import { RegistroExito } from '@/features/registro/registro-exito';
import { RegistroScreen } from '@/features/registro/registro-screen';

import { useCuenta } from './cuenta-provider';

/** Elige qué pantalla mostrar al abrir la app, según en qué punto quedó el proveedor. */
export function PantallaInicial() {
  const { cuenta, actualizar } = useCuenta();

  // Sin sesión iniciada (primera vez, o después de "Cerrar sesión"), siempre se pasa por el acceso.
  if (!cuenta.iniciada) return <Acceso />;

  if (cuenta.estado === 'aprobado') return <PanelProveedor />;

  if (cuenta.estado === 'pendiente') {
    return (
      <RegistroExito
        nombre={cuenta.form.razonSocial.trim()}
        // Simulación: este botón hace de administrador y aprueba el perfil.
        // Con la API, el estado `aprobado` lo define el servidor.
        alRevisar={() => actualizar({ estado: 'aprobado' })}
      />
    );
  }

  return <RegistroScreen />;
}
