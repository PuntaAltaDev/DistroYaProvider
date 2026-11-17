import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { AvisarScreen } from '@/features/difusion/avisar-screen';
import {
  ALCANCE_DE_PRUEBA,
  buscarClientes,
  CLIENTES_DE_PRUEBA,
  limpiarAviso,
  sumarEnviado,
} from '@/features/difusion/difusion';

/** Simula lo que tarda el servidor en enviar. */
const espera = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/**
 * "/panel/avisar": avisos del proveedor a sus clientes (se entra desde Avisos).
 * Con la API, la búsqueda de clientes y el envío los hace el servidor.
 */
export default function Avisar() {
  const { cuenta, actualizar } = useCuenta();
  return (
    <AvisarScreen
      enviados={cuenta.enviados ?? []}
      alcance={ALCANCE_DE_PRUEBA}
      alBuscar={(texto, elegidos) => buscarClientes(texto, CLIENTES_DE_PRUEBA, elegidos)}
      alEnviar={async ({ titulo, texto, a, elegidos }) => {
        await espera(900);
        const alcance = a === 'elegidos' ? elegidos.length : ALCANCE_DE_PRUEBA[a];
        const fecha = new Date().toISOString();
        actualizar((actual) => ({
          enviados: sumarEnviado(
            {
              id: fecha,
              ...limpiarAviso(titulo, texto),
              a,
              nombres: a === 'elegidos' ? elegidos.map((c) => c.nombre) : undefined,
              alcance,
              fecha,
            },
            actual.enviados,
          ),
        }));
        return alcance;
      }}
      alVolver={() => router.back()}
    />
  );
}
