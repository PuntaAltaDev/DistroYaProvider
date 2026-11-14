import { createContext, useContext, useState, type ReactNode } from 'react';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import {
  historialDePrueba,
  sumarAlHistorial,
  type ArchivoLista,
} from '@/features/suscripcion/datos';

type ListasValor = {
  /** La lista vigente, si subió alguna. */
  actual?: ArchivoLista;
  historial: ArchivoLista[];
  /** La vigente pasa al historial y la nueva queda como actual. */
  subir: (nueva: ArchivoLista) => void;
};

const ListasContext = createContext<ListasValor | null>(null);

/**
 * Listas de precios del proveedor, compartidas por las pantallas del panel (inicio y lista).
 * Viven mientras el panel está abierto: el historial es de prueba y la subida todavía no se
 * guarda. Con la API, las dos cosas vienen del servidor.
 */
export function ListasProvider({ children }: { children: ReactNode }) {
  const { cuenta } = useCuenta();
  const { catalogo } = cuenta.form;

  // La lista que subió en el registro, si la subió.
  const [actual, setActual] = useState<ArchivoLista | undefined>(() =>
    catalogo && cuenta.fechaEnvio
      ? { nombre: catalogo.name, tamano: catalogo.size, fecha: new Date(cuenta.fechaEnvio) }
      : undefined,
  );
  const [historial, setHistorial] = useState<ArchivoLista[]>(historialDePrueba);

  const subir = (nueva: ArchivoLista) => {
    if (actual) setHistorial((h) => sumarAlHistorial(actual, h));
    setActual(nueva);
  };

  return (
    <ListasContext.Provider value={{ actual, historial, subir }}>{children}</ListasContext.Provider>
  );
}

export function useListas() {
  const valor = useContext(ListasContext);
  if (!valor) throw new Error('useListas tiene que usarse dentro de <ListasProvider>');
  return valor;
}
