import { CUENTA_INICIAL, type Cuenta } from '@/features/cuenta/cuenta';
import {
  aGuardada,
  DIA,
  licenciaFree,
  PLAN_FREE,
  type Suscripcion,
} from '@/features/suscripcion/datos';

import { avisosDe, recordatoriosDelPlan, RUTA_AVISOS, sinLeer } from '../avisos';

const ahora = new Date(2026, 10, 14, 12);

/** Una licencia que vence dentro de `dias` días (negativo: ya venció). */
const licencia = (dias: number, planName = 'Mensual'): Suscripcion => ({
  planName,
  startDate: new Date(2026, 9, 1),
  endDate: new Date(ahora.getTime() + dias * DIA),
});

/** Cuenta aprobada; con `dias`, tiene una licencia que vence en esa cantidad de días. */
function aprobada(dias?: number, planName?: string): Cuenta {
  return {
    ...CUENTA_INICIAL,
    iniciada: true,
    estado: 'aprobado',
    fechaAprobacion: new Date(2026, 10, 1).toISOString(),
    suscripcion: dias === undefined ? undefined : aGuardada(licencia(dias, planName)),
  };
}

const ids = (cuenta: Cuenta) => avisosDe(cuenta, ahora).map((a) => a.id.split('-2')[0]);

describe('avisos de la bandeja', () => {
  it('con la licencia activa: solo el de perfil activo', () => {
    expect(ids(aprobada(20))).toEqual(['aprobado']);
  });

  it('sin licencia (cuenta vieja): solo el de perfil activo, sin pedir elegir un plan', () => {
    expect(ids(aprobada())).toEqual(['aprobado']);
  });

  it('por vencer: dice cuántos días faltan, y "mañana" si falta uno', () => {
    const [porVencer] = avisosDe(aprobada(3), ahora);
    expect(porVencer.titulo).toBe('Tu plan vence en 3 días');
    expect(porVencer.destino).toBe('plan');
    expect(avisosDe(aprobada(1), ahora)[0].titulo).toBe('Tu plan vence mañana');
  });

  it('vencido: avisa que dejó de aparecer', () => {
    expect(ids(aprobada(-2))).toEqual(['vencido', 'aprobado']);
  });

  it('del más nuevo al más viejo', () => {
    const fechas = avisosDe(aprobada(3), ahora).map((a) => a.fecha.getTime());
    expect(fechas).toEqual([...fechas].sort((a, b) => b - a));
  });

  it('si renueva y vuelve a estar por vencer, el aviso cuenta como nuevo', () => {
    const antes = avisosDe(aprobada(3), ahora).map((a) => a.id);
    const despues = avisosDe(aprobada(5), ahora);
    expect(sinLeer(despues, antes).map((a) => a.id.split('-2')[0])).toEqual(['por-vencer']);
  });
});

describe('avisos de la licencia Free', () => {
  it('al aprobar, cuenta los 15 días de prueba', () => {
    const cuenta = { ...aprobada(), suscripcion: aGuardada(licenciaFree(ahora)) };
    const [aviso] = avisosDe(cuenta, ahora);
    expect(aviso.texto).toContain('15 días de prueba gratis');
  });

  it('por terminar: habla de la prueba y pide escribir a soporte', () => {
    const [aviso] = avisosDe(aprobada(3, PLAN_FREE), ahora);
    expect(aviso.titulo).toBe('Tu prueba gratis termina en 3 días');
    expect(aviso.texto).toContain('Escribinos');
    expect(avisosDe(aprobada(1, PLAN_FREE), ahora)[0].titulo).toBe(
      'Tu prueba gratis termina mañana',
    );
  });

  it('terminada: avisa que el perfil dejó de aparecer', () => {
    const [aviso] = avisosDe(aprobada(-1, PLAN_FREE), ahora);
    expect(aviso.titulo).toBe('Tu prueba gratis terminó');
  });
});

describe('sinLeer', () => {
  it('deja los que no se leyeron', () => {
    const avisos = avisosDe(aprobada(3), ahora);
    expect(sinLeer(avisos, ['aprobado']).map((a) => a.id.split('-2')[0])).toEqual(['por-vencer']);
    expect(sinLeer(avisos)).toHaveLength(2);
  });
});

describe('recordatorios del teléfono', () => {
  it('7 días antes a las 10, y el día que vence a la hora del vencimiento', () => {
    const fin = new Date(2026, 11, 20, 15, 30);
    expect(recordatoriosDelPlan({ ...licencia(0), endDate: fin }, ahora)).toEqual([
      expect.objectContaining({ id: 'plan-por-vencer', fecha: new Date(2026, 11, 13, 10) }),
      expect.objectContaining({ id: 'plan-vencido', fecha: fin }),
    ]);
  });

  it('nunca de madrugada: si vence a las 4, avisa a las 10', () => {
    const fin = new Date(2026, 11, 20, 4);
    const vencido = recordatoriosDelPlan({ ...licencia(0), endDate: fin }, ahora).find(
      (r) => r.id === 'plan-vencido',
    );
    expect(vencido?.fecha).toEqual(new Date(2026, 11, 20, 10));
  });

  it('solo los que todavía no pasaron', () => {
    const fin = new Date(2026, 10, 17, 15); // faltan 3 días: el de 7 días antes ya pasó
    expect(recordatoriosDelPlan({ ...licencia(0), endDate: fin }, ahora).map((r) => r.id)).toEqual([
      'plan-vencido',
    ]);
    expect(recordatoriosDelPlan(licencia(-13), ahora)).toEqual([]);
  });

  it('con la licencia Free hablan de la prueba gratis', () => {
    const [antes, vencido] = recordatoriosDelPlan(licenciaFree(ahora), ahora);
    expect(antes.titulo).toBe('Tu prueba gratis termina en 7 días');
    expect(vencido.titulo).toBe('Tu prueba gratis terminó');
  });

  it('con un plan pago hablan del vencimiento del plan', () => {
    const [antes] = recordatoriosDelPlan(licencia(20), ahora);
    expect(antes.titulo).toBe('Tu plan vence en 7 días');
  });

  it('al tocarlos abren la bandeja', () => {
    const recordatorios = recordatoriosDelPlan(licencia(20), ahora);
    expect(recordatorios.every((r) => r.url === RUTA_AVISOS)).toBe(true);
  });
});
