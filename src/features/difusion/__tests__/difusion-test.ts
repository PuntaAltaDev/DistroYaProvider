import {
  buscarClientes,
  clientes,
  ENVIADOS_MAX,
  enviadosGuardados,
  limpiarAviso,
  sumarEnviado,
  TEXTO_AVISO_MAX,
  TITULO_AVISO_MAX,
  validarAviso,
  type AvisoEnviado,
} from '../difusion';

const enviado = (n: number): AvisoEnviado => ({
  id: `a${n}`,
  titulo: `Aviso ${n}`,
  texto: 'Llegó mercadería nueva.',
  a: 'favoritos',
  alcance: 18,
  fecha: new Date(2026, 10, n).toISOString(),
});

describe('limpiarAviso', () => {
  it('el título queda en una línea y sin espacios de más', () => {
    expect(limpiarAviso('  Promo \n de   bebidas ', 'x').titulo).toBe('Promo de bebidas');
  });

  it('el texto no deja líneas en blanco ni espacios al final', () => {
    expect(limpiarAviso('x', ' Hola  \r\n\n\nChau ').texto).toBe('Hola\nChau');
  });

  it('respeta los largos máximos', () => {
    const { titulo, texto } = limpiarAviso('a'.repeat(80), 'b'.repeat(400));
    expect(titulo).toHaveLength(TITULO_AVISO_MAX);
    expect(texto).toHaveLength(TEXTO_AVISO_MAX);
  });
});

describe('validarAviso', () => {
  it('pide título y mensaje', () => {
    expect(validarAviso(' ', '   ')).toEqual({
      titulo: 'Escribí un título.',
      texto: 'Escribí el mensaje.',
    });
  });

  it('con los dos completos, está bien', () => {
    expect(validarAviso('10% en bebidas', 'Solo esta semana.')).toEqual({});
  });
});

describe('enviados', () => {
  it('el nuevo queda primero y no pasan de 20', () => {
    const viejos = Array.from({ length: ENVIADOS_MAX }, (_, i) => enviado(i + 1));
    const lista = sumarEnviado(enviado(99), viejos);
    expect(lista).toHaveLength(ENVIADOS_MAX);
    expect(lista[0].id).toBe('a99');
  });

  it('de lo guardado descarta lo que tiene otra forma', () => {
    expect(enviadosGuardados('nada')).toBeUndefined();
    expect(enviadosGuardados([{ id: 1 }, { ...enviado(1), a: 'otros' }])).toBeUndefined();
    expect(enviadosGuardados([enviado(1), { ...enviado(2), fecha: 'x' }])).toEqual([enviado(1)]);
  });

  it('cuenta los clientes en singular y plural', () => {
    expect(clientes(1)).toBe('1 cliente');
    expect(clientes(18)).toBe('18 clientes');
  });
});

describe('buscarClientes', () => {
  const todos = [
    { id: '1', nombre: 'Almacén Don Pepe', localidad: 'Bahía Blanca' },
    { id: '2', nombre: 'Kiosco La Esquina', localidad: 'Punta Alta' },
    { id: '3', nombre: 'Súper Almacén', localidad: 'Punta Alta' },
  ];
  const ids = (texto: string, elegidos?: string[]) =>
    buscarClientes(texto, todos, elegidos).map((c) => c.id);

  it('busca por nombre o localidad, sin tildes ni mayúsculas', () => {
    expect(ids('ALMACEN')).toEqual(['1', '3']);
    expect(ids('punta')).toEqual(['2', '3']);
    expect(ids('super')).toEqual(['3']);
  });

  it('primero los que empiezan con lo escrito', () => {
    expect(ids('alm')).toEqual(['1', '3']);
    expect(ids('almac', ['1'])).toEqual(['3']);
  });

  it('con menos de 2 letras no busca', () => {
    expect(ids('a')).toEqual([]);
  });

  it('pide elegir al menos un cliente si eligió a mano', () => {
    expect(validarAviso('Promo', 'Solo hoy.', 0).clientes).toBe(
      'Buscá y elegí al menos un cliente.',
    );
    expect(validarAviso('Promo', 'Solo hoy.', 2)).toEqual({});
  });
});
