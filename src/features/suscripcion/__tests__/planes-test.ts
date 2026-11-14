import { contratar, PLANES, precio, sumarMeses } from '../planes';

const [mensual, trimestral, anual] = PLANES;

describe('sumarMeses', () => {
  it('suma meses sin cambiar el día', () => {
    expect(sumarMeses(new Date(2026, 2, 15), 1)).toEqual(new Date(2026, 3, 15));
    expect(sumarMeses(new Date(2026, 2, 15), 12)).toEqual(new Date(2027, 2, 15));
  });

  it('no se pasa de mes: 31/1 + 1 mes es el último día de febrero', () => {
    expect(sumarMeses(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(sumarMeses(new Date(2028, 0, 31), 1)).toEqual(new Date(2028, 1, 29)); // bisiesto
  });

  it('cruza el año', () => {
    expect(sumarMeses(new Date(2026, 9, 31), 3)).toEqual(new Date(2027, 0, 31));
  });

  it('conserva la hora', () => {
    expect(sumarMeses(new Date(2026, 4, 10, 18, 30), 1)).toEqual(new Date(2026, 5, 10, 18, 30));
  });
});

describe('contratar', () => {
  const ahora = new Date(2026, 10, 14, 12);

  it('sin plan, arranca hoy', () => {
    expect(contratar(trimestral, undefined, ahora)).toEqual({
      planName: 'Trimestral',
      startDate: ahora,
      endDate: new Date(2027, 1, 14, 12),
    });
  });

  it('con el plan vigente, suma al tiempo que queda y conserva el inicio', () => {
    const actual = {
      planName: 'Mensual',
      startDate: new Date(2026, 10, 1),
      endDate: new Date(2026, 11, 1),
    };
    expect(contratar(mensual, actual, ahora)).toEqual({
      planName: 'Mensual',
      startDate: new Date(2026, 10, 1),
      endDate: new Date(2027, 0, 1),
    });
  });

  it('con el plan por vencer, también suma (no se pierden los días que quedan)', () => {
    const actual = {
      planName: 'Mensual',
      startDate: new Date(2026, 9, 17),
      endDate: new Date(2026, 10, 17),
    };
    expect(contratar(anual, actual, ahora).endDate).toEqual(new Date(2027, 10, 17));
  });

  it('con el plan vencido, arranca hoy', () => {
    const vencido = {
      planName: 'Mensual',
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 9, 1),
    };
    expect(contratar(mensual, vencido, ahora)).toEqual({
      planName: 'Mensual',
      startDate: ahora,
      endDate: new Date(2026, 11, 14, 12),
    });
  });
});

describe('precio', () => {
  it('muestra pesos con punto de miles y sin centavos', () => {
    expect(precio(15000)).toMatch(/^\$\s15\.000$/);
    expect(precio(144000)).toMatch(/^\$\s144\.000$/);
  });
});
