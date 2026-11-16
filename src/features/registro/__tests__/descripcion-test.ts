import { DESCRIPCION_MAX, limpiarDescripcion } from '../validacion';

describe('limpiarDescripcion', () => {
  it('saca los espacios del principio y del final', () => {
    expect(limpiarDescripcion('  Vendemos bebidas.  \n ')).toBe('Vendemos bebidas.');
  });

  it('deja a lo sumo una línea en blanco seguida', () => {
    expect(limpiarDescripcion('Hola\n\n\n\nChau')).toBe('Hola\n\nChau');
  });

  it('saca los espacios al final de cada línea y unifica los saltos', () => {
    expect(limpiarDescripcion('Uno   \r\nDos\t\nTres')).toBe('Uno\nDos\nTres');
  });

  it('no pasa de 300 caracteres', () => {
    expect(DESCRIPCION_MAX).toBe(300);
    expect(limpiarDescripcion('a'.repeat(500))).toHaveLength(300);
  });

  it('solo espacios queda vacío', () => {
    expect(limpiarDescripcion('   \n  ')).toBe('');
  });
});
