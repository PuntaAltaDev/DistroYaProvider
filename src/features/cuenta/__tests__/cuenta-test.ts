import { leer } from '@/lib/almacen';

import { cargarCuenta, CUENTA_INICIAL } from '../cuenta';

// En lugar del almacén del teléfono, cada prueba dice qué hay guardado.
jest.mock('@/lib/almacen', () => ({ leer: jest.fn(), guardar: jest.fn(), borrar: jest.fn() }));
const guardado = (valor: unknown) => jest.mocked(leer).mockResolvedValue(valor);

describe('cargarCuenta', () => {
  it('sin nada guardado, empieza de cero', async () => {
    guardado(null);
    expect(await cargarCuenta()).toEqual(CUENTA_INICIAL);
  });

  it('con un estado desconocido, empieza de cero', async () => {
    guardado({ estado: 'otro', iniciada: true });
    expect(await cargarCuenta()).toEqual(CUENTA_INICIAL);
  });

  it('completa con valores iniciales los campos nuevos del formulario', async () => {
    guardado({ estado: 'borrador', iniciada: true, form: { razonSocial: 'Distri Sur' } });
    const cuenta = await cargarCuenta();
    expect(cuenta.form).toEqual({ ...CUENTA_INICIAL.form, razonSocial: 'Distri Sur' });
  });

  it('lo guardado antes de piso y depto los trae vacíos', async () => {
    guardado({ estado: 'borrador', iniciada: true, form: { direccion: 'Sarmiento 123' } });
    const { form } = await cargarCuenta();
    expect(form.piso).toBe('');
    expect(form.depto).toBe('');
  });

  it('la descripción: se conserva prolija, y vacía o con otra forma queda sin descripción', async () => {
    guardado({ estado: 'aprobado', iniciada: true, descripcion: '  Vendemos bebidas.  ' });
    expect((await cargarCuenta()).descripcion).toBe('Vendemos bebidas.');
    guardado({ estado: 'aprobado', iniciada: true, descripcion: '   ' });
    expect((await cargarCuenta()).descripcion).toBeUndefined();
    guardado({ estado: 'aprobado', iniciada: true, descripcion: 42 });
    expect((await cargarCuenta()).descripcion).toBeUndefined();
    guardado({ estado: 'aprobado', iniciada: true });
    expect((await cargarCuenta()).descripcion).toBeUndefined();
  });

  it('lo guardado antes de la bienvenida, con avance, se da por iniciado', async () => {
    guardado({ estado: 'borrador', paso: 2 });
    expect((await cargarCuenta()).iniciada).toBe(true);
    guardado({ estado: 'borrador', paso: 0 });
    expect((await cargarCuenta()).iniciada).toBe(false);
    guardado({ estado: 'pendiente' });
    expect((await cargarCuenta()).iniciada).toBe(true);
  });

  it('corrige un paso inválido', async () => {
    guardado({ estado: 'borrador', paso: -3 });
    expect((await cargarCuenta()).paso).toBe(0);
    guardado({ estado: 'borrador', paso: 1.5 });
    expect((await cargarCuenta()).paso).toBe(0);
  });

  it('un plan dañado queda como sin plan', async () => {
    guardado({
      estado: 'aprobado',
      iniciada: true,
      suscripcion: { planName: 'Mensual', startDate: 'x', endDate: 'y' },
    });
    expect((await cargarCuenta()).suscripcion).toBeUndefined();
  });

  it('descarta datos con otra forma', async () => {
    guardado({
      estado: 'aprobado',
      iniciada: true,
      metodo: 'facebook',
      terminos: { version: 1 },
      avisos: { activos: true, leidos: 'todos' },
    });
    const cuenta = await cargarCuenta();
    expect(cuenta.metodo).toBeUndefined();
    expect(cuenta.terminos).toBeUndefined();
    expect(cuenta.avisos).toEqual({ activos: true, leidos: [] });
  });
});
