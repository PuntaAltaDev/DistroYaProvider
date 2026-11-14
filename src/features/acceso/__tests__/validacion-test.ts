import { emailValido, LARGO_CODIGO, limpiarCodigo, limpiarEmail } from '../validacion';

describe('email', () => {
  it('se guarda sin espacios y en minúsculas', () => {
    expect(limpiarEmail('  Juan@Mail.COM ')).toBe('juan@mail.com');
  });

  it('acepta la forma nombre@dominio.algo', () => {
    expect(emailValido('juan@mail.com')).toBe(true);
    expect(emailValido(' Juan@Mail.com.ar ')).toBe(true);
  });

  it('rechaza lo que no tiene esa forma', () => {
    for (const malo of ['', 'juan', 'juan@', 'juan@mail', 'juan@mail.c', 'ju an@mail.com']) {
      expect(emailValido(malo)).toBe(false);
    }
  });
});

describe('código', () => {
  it('deja solo números y corta en 6', () => {
    expect(LARGO_CODIGO).toBe(6);
    expect(limpiarCodigo('12a3 45-678')).toBe('123456');
  });
});
