import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { fechaCorta } from '@/features/suscripcion/datos';

import { avisosDe, sinLeer } from './avisos';
import { AvisosScreen } from './avisos-screen';

/** Avisos: enviar a clientes y la bandeja de entrada. Al abrirla, todo cuenta como leído, pero lo que era nuevo sigue marcado mientras está abierta. */
export function Bandeja() {
  const { cuenta, actualizar } = useCuenta();
  const avisos = avisosDe(cuenta);
  const [nuevos] = useState(() => sinLeer(avisos, cuenta.avisos?.leidos).map((a) => a.id));
  const ids = avisos.map((a) => a.id).join('|');
  const leidos = (cuenta.avisos?.leidos ?? []).join('|');
  const ultimo = cuenta.enviados?.[0];

  // Marca todo como leído (también lo que llegue con la bandeja abierta). Solo escribe si cambió.
  useEffect(() => {
    if (leidos === ids) return;
    actualizar((actual) => ({
      avisos: { activos: actual.avisos?.activos ?? false, leidos: ids ? ids.split('|') : [] },
    }));
  }, [ids, leidos, actualizar]);

  return (
    <AvisosScreen
      avisos={avisos}
      nuevos={nuevos}
      alAbrir={(destino) => router.push(destino === 'plan' ? '/panel/plan' : '/panel/perfil')}
      alEnviar={() => router.push('/panel/avisar')}
      ultimoEnviado={
        ultimo ? `Último: ${ultimo.titulo} · ${fechaCorta(new Date(ultimo.fecha))}` : undefined
      }
      alVolver={() => router.back()}
    />
  );
}
