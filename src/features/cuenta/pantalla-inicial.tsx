import { useState } from 'react';

import { Acceso } from '@/features/acceso/acceso';
import { AyudaScreen } from '@/features/ayuda/ayuda-screen';
import { PanelProveedor } from '@/features/panel/panel-proveedor';
import { RegistroExito } from '@/features/registro/registro-exito';
import { RegistroRechazado } from '@/features/registro/registro-rechazado';
import { RegistroScreen } from '@/features/registro/registro-screen';

import { useCuenta } from './cuenta-provider';

/**
 * Elige qué pantalla mostrar al abrir la app, según en qué punto quedó el proveedor:
 * acceso → registro (borrador) → en revisión (pendiente) → panel (aprobado),
 * o "Revisá tus datos" (rechazado) → registro de nuevo con los datos cargados.
 */
export function PantallaInicial() {
  const { cuenta, actualizar } = useCuenta();
  const [ayuda, setAyuda] = useState(false);
  const nombre = cuenta.form.razonSocial.trim();

  // Sin sesión iniciada (primera vez, o después de "Cerrar sesión"), siempre se pasa por el acceso.
  if (!cuenta.iniciada) return <Acceso />;

  switch (cuenta.estado) {
    case 'aprobado':
      return <PanelProveedor />;
    case 'borrador':
      return <RegistroScreen />;
  }

  // En revisión o rechazado: desde ahí se puede pedir ayuda.
  if (ayuda) return <AyudaScreen alVolver={() => setAyuda(false)} />;

  if (cuenta.estado === 'pendiente') {
    return <RegistroExito nombre={nombre} alAyuda={() => setAyuda(true)} />;
  }
  return (
    <RegistroRechazado
      nombre={nombre}
      motivo={cuenta.motivoRechazo ?? 'Revisá tus datos.'}
      // El motivo queda guardado para mostrarlo mientras corrige; se borra al reenviar.
      alCorregir={() => actualizar({ estado: 'borrador', paso: 0 })}
      alAyuda={() => setAyuda(true)}
    />
  );
}
