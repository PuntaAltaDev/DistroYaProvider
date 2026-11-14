import { estadoDe, type Suscripcion } from './datos';

/**
 * Planes que se pueden contratar. PRECIOS DE PRUEBA: los define el negocio y después vienen de la API.
 * El pago real va con Mercado Pago a través del backend; hoy se simula.
 */
export type Plan = {
  id: 'mensual' | 'trimestral' | 'anual';
  nombre: string;
  meses: number;
  /** Precio total del período, en pesos. */
  precio: number;
  /** Ahorro frente a pagar mes a mes, si hay. */
  ahorro?: string;
};

export const PLANES: readonly Plan[] = [
  { id: 'mensual', nombre: 'Mensual', meses: 1, precio: 15000 },
  { id: 'trimestral', nombre: 'Trimestral', meses: 3, precio: 40500, ahorro: '10% menos' },
  { id: 'anual', nombre: 'Anual', meses: 12, precio: 144000, ahorro: '20% menos' },
];

/** "$ 15.000" */
export const precio = (pesos: number) =>
  pesos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

/** Suma meses sin pasarse de mes: 31/1 + 1 mes = 28/2 (o 29/2). */
export function sumarMeses(fecha: Date, meses: number) {
  const resultado = new Date(fecha);
  const dia = resultado.getDate();
  resultado.setDate(1);
  resultado.setMonth(resultado.getMonth() + meses);
  const ultimoDia = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
  resultado.setDate(Math.min(dia, ultimoDia));
  return resultado;
}

/**
 * La suscripción después de pagar un plan. Si la actual sigue vigente, el tiempo nuevo se suma
 * al que queda (no se pierde nada); si venció o no había, arranca hoy.
 */
export function contratar(plan: Plan, actual?: Suscripcion, ahora = new Date()): Suscripcion {
  const vigente = actual && estadoDe(actual, ahora) !== 'vencida';
  const desde = vigente ? actual.endDate : ahora;
  return {
    planName: plan.nombre,
    startDate: vigente ? actual.startDate : ahora,
    endDate: sumarMeses(desde, plan.meses),
  };
}
