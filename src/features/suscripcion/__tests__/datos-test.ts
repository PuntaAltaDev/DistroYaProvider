import {
  aGuardada,
  DIA,
  desdeGuardada,
  diasRestantes,
  estadoDe,
  fraccionRestante,
  DIAS_FREE,
  esFree,
  HISTORIAL_MAX,
  licenciaFree,
  sumarAlHistorial,
} from '../datos';

const ahora = new Date(2026, 10, 14, 12);
/** Una suscripción que vence dentro de `dias` días (negativo: ya venció). */
const venceEn = (dias: number) => ({
  planName: 'Mensual',
  startDate: new Date(ahora.getTime() - 30 * DIA),
  endDate: new Date(ahora.getTime() + dias * DIA),
});

describe('estado del plan', () => {
  it('activa con más de 7 días', () => {
    expect(estadoDe(venceEn(8), ahora)).toBe('activa');
  });

  it('por vencer desde 7 días antes', () => {
    expect(estadoDe(venceEn(7), ahora)).toBe('por-vencer');
    expect(estadoDe(venceEn(0.5), ahora)).toBe('por-vencer');
  });

  it('vencida en el momento exacto del vencimiento y después', () => {
    expect(estadoDe(venceEn(0), ahora)).toBe('vencida');
    expect(estadoDe(venceEn(-3), ahora)).toBe('vencida');
  });
});

describe('diasRestantes', () => {
  it('redondea para arriba: medio día cuenta como 1', () => {
    expect(diasRestantes(venceEn(0.5), ahora)).toBe(1);
    expect(diasRestantes(venceEn(3), ahora)).toBe(3);
  });

  it('nunca da negativo', () => {
    expect(diasRestantes(venceEn(-5), ahora)).toBe(0);
  });
});

describe('fraccionRestante', () => {
  it('va de 0 a 1', () => {
    expect(fraccionRestante(venceEn(30), ahora)).toBeCloseTo(0.5);
    expect(fraccionRestante(venceEn(-1), ahora)).toBe(0);
  });

  it('con fechas al revés da 0', () => {
    const s = { planName: 'X', startDate: ahora, endDate: ahora };
    expect(fraccionRestante(s, ahora)).toBe(0);
  });
});

describe('suscripción guardada', () => {
  it('va y vuelve sin perder nada', () => {
    const s = venceEn(10);
    expect(desdeGuardada(aGuardada(s))).toEqual(s);
  });

  it('si falta o está dañada, queda sin plan', () => {
    expect(desdeGuardada(undefined)).toBeUndefined();
    expect(desdeGuardada({ startDate: 'x', endDate: 'y' })).toBeUndefined();
    expect(
      desdeGuardada({ planName: 'Mensual', startDate: '2026-11-14', endDate: 'no es fecha' }),
    ).toBeUndefined();
  });
});

describe('sumarAlHistorial', () => {
  it('la lista anterior queda primera y el historial no pasa de 5', () => {
    const lista = (n: number) => ({ nombre: `lista-${n}.pdf`, fecha: new Date(2026, 0, n) });
    const historial = [1, 2, 3, 4, 5].map(lista);
    const nuevo = sumarAlHistorial({ ...lista(9), tamano: 1000 }, historial);
    expect(nuevo).toHaveLength(HISTORIAL_MAX);
    expect(nuevo[0]).toEqual(lista(9)); // sin el tamaño
    expect(nuevo.at(-1)).toEqual(lista(4));
  });
});

describe('licencia Free', () => {
  it('dura 15 días desde que se aprueba el perfil', () => {
    const free = licenciaFree(ahora);
    expect(DIAS_FREE).toBe(15);
    expect(esFree(free)).toBe(true);
    expect(free.startDate).toEqual(ahora);
    expect(free.endDate.getTime() - ahora.getTime()).toBe(15 * DIA);
    expect(diasRestantes(free, ahora)).toBe(15);
    expect(estadoDe(free, ahora)).toBe('activa');
  });

  it('el contador baja con los días: por vencer a los 7 y vencida a los 15', () => {
    const free = licenciaFree(ahora);
    const pasan = (dias: number) => new Date(ahora.getTime() + dias * DIA);
    expect(diasRestantes(free, pasan(10))).toBe(5);
    expect(estadoDe(free, pasan(8))).toBe('por-vencer');
    expect(estadoDe(free, pasan(15))).toBe('vencida');
    expect(diasRestantes(free, pasan(20))).toBe(0);
  });

  it('la barra se va acortando', () => {
    const free = licenciaFree(ahora);
    expect(fraccionRestante(free, ahora)).toBe(1);
    expect(fraccionRestante(free, new Date(ahora.getTime() + 7.5 * DIA))).toBeCloseTo(0.5);
  });

  it('un plan pago no es Free', () => {
    expect(esFree({ ...licenciaFree(ahora), planName: 'Mensual' })).toBe(false);
  });
});
