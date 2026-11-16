import {
  buscarRubros,
  esRubroValido,
  formatearRubro,
  limpiarRubro,
  mismoRubro,
  normalizarRubro,
  RUBRO_MAX,
} from '../rubros';

const catalogo = ['Cervezas', 'Vinos', 'Sin alcohol', 'Insumos de barra', 'Licores'];

describe('mismoRubro', () => {
  it('ignora mayúsculas, tildes y espacios de más', () => {
    expect(normalizarRubro('  LÁCTEOS  ')).toBe('lacteos');
    expect(mismoRubro('lácteos', ' Lacteos ')).toBe(true);
    expect(mismoRubro('Sin  alcohol', 'sin alcohol')).toBe(true);
  });

  it('el singular y el plural son el mismo rubro', () => {
    expect(mismoRubro('Cerveza', 'Cervezas')).toBe(true);
    expect(mismoRubro('Licor', 'Licores')).toBe(true);
    expect(mismoRubro('Vinos', 'Vino')).toBe(true);
  });

  it('distingue rubros distintos', () => {
    expect(mismoRubro('Vinos', 'Espumantes')).toBe(false);
    expect(mismoRubro('Agua', 'Aguardiente')).toBe(false);
  });
});

describe('buscarRubros', () => {
  it('filtra mientras se escribe, sin importar tildes ni mayúsculas', () => {
    expect(buscarRubros('cer', catalogo)).toEqual(['Cervezas']);
    expect(buscarRubros('ALCOHOL', catalogo)).toEqual(['Sin alcohol']);
  });

  it('primero los que empiezan con lo escrito', () => {
    expect(buscarRubros('lic', catalogo)).toEqual(['Licores']);
    expect(buscarRubros('s', ['Insumos', 'Sidras', 'Vinos'])).toEqual([
      'Sidras',
      'Insumos',
      'Vinos',
    ]);
  });

  it('sin texto o sin coincidencias, no hay sugerencias', () => {
    expect(buscarRubros('', catalogo)).toEqual([]);
    expect(buscarRubros('   ', catalogo)).toEqual([]);
    expect(buscarRubros('xyz', catalogo)).toEqual([]);
  });

  it('muestra pocas sugerencias', () => {
    const muchos = Array.from({ length: 20 }, (_, i) => `Rubro ${i}`);
    expect(buscarRubros('rubro', muchos)).toHaveLength(6);
  });
});

describe('rubro nuevo', () => {
  it('se guarda prolijo: sin espacios de más y con mayúscula inicial', () => {
    expect(formatearRubro('  pRODUCTOS   lácteos ')).toBe('Productos lácteos');
  });

  it('deja escribir solo letras, números y espacios, hasta 30', () => {
    expect(limpiarRubro('Lác-teos! #1')).toBe('Lácteos 1');
    expect(limpiarRubro('a'.repeat(50))).toHaveLength(RUBRO_MAX);
  });

  it('necesita entre 2 y 30 caracteres', () => {
    expect(esRubroValido('a')).toBe(false);
    expect(esRubroValido('  a ')).toBe(false);
    expect(esRubroValido('Pan')).toBe(true);
    expect(esRubroValido('a'.repeat(31))).toBe(false);
  });
});
