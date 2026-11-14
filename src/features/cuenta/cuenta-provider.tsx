import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { AppState } from 'react-native';

import { borrarImagenes } from '@/features/registro/logo';

import { borrarCuenta, CUENTA_INICIAL, guardarCuenta, type Cuenta } from './cuenta';

/** Espera después del último cambio antes de guardar, para no escribir con cada tecla. */
const ESPERA_GUARDADO_MS = 300;

type Cambios = Partial<Cuenta> | ((actual: Cuenta) => Partial<Cuenta>);

type CuentaValor = {
  cuenta: Cuenta;
  /** Cambia la cuenta y la guarda. Con una función recibe el valor más reciente. */
  actualizar: (cambios: Cambios) => void;
  /** Borra todo lo guardado (datos y fotos) y vuelve al registro vacío. */
  reiniciar: () => Promise<void>;
};

const CuentaContext = createContext<CuentaValor | null>(null);

type Temporizador = ReturnType<typeof setTimeout>;

/** Guarda ya lo que esté pendiente. */
function volcar(pendiente: RefObject<Temporizador | null>, ultima: RefObject<Cuenta>) {
  if (!pendiente.current) return;
  clearTimeout(pendiente.current);
  pendiente.current = null;
  void guardarCuenta(ultima.current);
}

export function CuentaProvider({ inicial, children }: { inicial: Cuenta; children: ReactNode }) {
  const [cuenta, setCuenta] = useState(inicial);
  const ultima = useRef(inicial);
  const pendiente = useRef<Temporizador | null>(null);

  // Si el usuario sale de la app o la cierra, se guarda lo último antes de que el sistema la frene.
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') volcar(pendiente, ultima);
    });
    return () => {
      suscripcion.remove();
      volcar(pendiente, ultima);
    };
  }, []);

  const actualizar = (cambios: Cambios) => {
    const siguiente = {
      ...ultima.current,
      ...(typeof cambios === 'function' ? cambios(ultima.current) : cambios),
    };
    ultima.current = siguiente;
    setCuenta(siguiente);

    if (pendiente.current) clearTimeout(pendiente.current);
    pendiente.current = setTimeout(() => volcar(pendiente, ultima), ESPERA_GUARDADO_MS);
  };

  const reiniciar = async () => {
    if (pendiente.current) clearTimeout(pendiente.current);
    pendiente.current = null;
    ultima.current = CUENTA_INICIAL;
    setCuenta(CUENTA_INICIAL);
    await Promise.all([borrarCuenta(), borrarImagenes()]);
  };

  return (
    <CuentaContext.Provider value={{ cuenta, actualizar, reiniciar }}>
      {children}
    </CuentaContext.Provider>
  );
}

/** Acceso a la cuenta del proveedor desde cualquier pantalla. */
export function useCuenta() {
  const valor = useContext(CuentaContext);
  if (!valor) throw new Error('useCuenta tiene que usarse dentro de <CuentaProvider>');
  return valor;
}
