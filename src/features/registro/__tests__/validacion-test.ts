import {
  CATALOGO_MAX_BYTES,
  FORM_INICIAL,
  formatearTamano,
  limpiarTelefono,
  validarPaso,
  type RegistroForm,
} from '../validacion';

// Sin clave de Google: la dirección se escribe a mano.
jest.mock('@/lib/places', () => ({ PLACES_ACTIVO: false }));

const form = (cambios: Partial<RegistroForm>) => ({ ...FORM_INICIAL, ...cambios });

describe('validarPaso', () => {
  it('nombre: al menos 2 letras, sin contar espacios', () => {
    expect(validarPaso('nombre', form({ razonSocial: ' a ' })).razonSocial).toBeDefined();
    expect(validarPaso('nombre', form({ razonSocial: 'Distri Sur' }))).toEqual({});
  });

  it('logo: es opcional', () => {
    expect(validarPaso('logo', form({}))).toEqual({});
  });

  it('contacto: WhatsApp de 10 a 13 números; teléfono opcional pero completo', () => {
    expect(validarPaso('contacto', form({ whatsapp: '291 455' })).whatsapp).toBeDefined();
    expect(validarPaso('contacto', form({ whatsapp: '291 455-0000' }))).toEqual({});
    expect(validarPaso('contacto', form({ whatsapp: '+54 9 291 455-0000' }))).toEqual({});
    expect(
      validarPaso('contacto', form({ whatsapp: '291 455-0000', telefono: '455' })).telefono,
    ).toBeDefined();
  });

  it('dirección: calle y número; si viene de la lista, con calle y localidad', () => {
    expect(validarPaso('direccion', form({ direccion: 'Sol' })).direccion).toBeDefined();
    expect(validarPaso('direccion', form({ direccion: 'Sarmiento 123' }))).toEqual({});
    const incompleta = form({
      direccion: 'Bahía Blanca',
      lugar: { localidad: 'Bahía Blanca' } as RegistroForm['lugar'],
    });
    expect(validarPaso('direccion', incompleta).direccion).toBeDefined();
  });

  it('rubros: al menos uno', () => {
    expect(validarPaso('rubros', form({})).rubros).toBeDefined();
    expect(validarPaso('rubros', form({ rubros: ['bebidas'] }))).toEqual({});
  });

  it('catálogo: opcional y hasta 10 MB', () => {
    const pdf = (size: number) => form({ catalogo: { name: 'lista.pdf', uri: 'x', size } });
    expect(validarPaso('catalogo', form({}))).toEqual({});
    expect(validarPaso('catalogo', pdf(CATALOGO_MAX_BYTES))).toEqual({});
    expect(validarPaso('catalogo', pdf(CATALOGO_MAX_BYTES + 1)).catalogo).toBeDefined();
  });
});

describe('limpiarTelefono', () => {
  it('agrupa según el código de área', () => {
    expect(limpiarTelefono('2914550000')).toBe('291 455-0000');
    expect(limpiarTelefono('1145678901')).toBe('11 4567-8901');
    expect(limpiarTelefono('02914550000')).toBe('0291 455-0000');
  });

  it('los separadores aparecen recién con el dígito siguiente', () => {
    expect(limpiarTelefono('291')).toBe('291');
    expect(limpiarTelefono('2914')).toBe('291 4');
  });

  it('borra letras y deja un solo + al inicio', () => {
    expect(limpiarTelefono('29a1b')).toBe('291');
    expect(limpiarTelefono('+54 9 291+')).toBe('+54 9 291');
  });

  it('no pasa de 20 caracteres', () => {
    expect(limpiarTelefono('+'.concat('1'.repeat(30)))).toHaveLength(20);
  });
});

describe('formatearTamano', () => {
  it('KB hasta 1 MB y MB con coma decimal', () => {
    expect(formatearTamano(undefined)).toBe('');
    expect(formatearTamano(100)).toBe('1 KB');
    expect(formatearTamano(850 * 1024)).toBe('850 KB');
    expect(formatearTamano(2.4 * 1024 * 1024)).toBe('2,4 MB');
  });
});
