import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { RegistroScreen } from '@/features/registro/registro-screen';

/** Espera de prueba mientras no hay servidor. */
const esperar = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/**
 * "/registro": alta del proveedor, una pregunta por paso. Solo con la cuenta en borrador.
 * Lo que se escribe y el paso se guardan en la cuenta: si cierra la app, sigue donde estaba.
 */
export default function Registro() {
  const { cuenta, actualizar } = useCuenta();
  return (
    <RegistroScreen
      form={cuenta.form}
      paso={cuenta.paso}
      motivoRechazo={cuenta.motivoRechazo}
      alCambiar={(cambios) => actualizar((actual) => ({ form: { ...actual.form, ...cambios } }))}
      alIrAPaso={(paso) => actualizar({ paso })}
      alEnviar={async () => {
        // Todavía no hay servidor: se simula el envío. Acá va la llamada a la API de Seba.
        // Al pasar a `pendiente`, las rutas protegidas llevan a "Listo. Ya estás en camino".
        await esperar(1200);
        actualizar({
          estado: 'pendiente',
          fechaEnvio: new Date().toISOString(),
          motivoRechazo: undefined,
        });
      }}
    />
  );
}
