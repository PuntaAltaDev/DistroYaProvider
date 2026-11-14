import { useState } from 'react';

import { BienvenidaScreen } from '@/features/bienvenida/bienvenida-screen';
import { useCuenta } from '@/features/cuenta/cuenta-provider';

import { EntradaScreen } from './entrada-screen';

/**
 * Cómo se entra a la app: bienvenida → registro o inicio de sesión (Google, o email y código en la misma pantalla).
 * Todavía no hay servidor: el código y Google se simulan (cualquier código sirve). Cuando esté
 * el login de Seba, se cambia lo que hacen `alEnviarCodigo`, `alConfirmar` y `alGoogle`;
 * las pantallas quedan igual.
 */
export function Acceso() {
  const { actualizar } = useCuenta();
  const [empezo, setEmpezo] = useState(false);

  if (!empezo) return <BienvenidaScreen alEmpezar={() => setEmpezo(true)} />;

  return (
    <EntradaScreen
      alVolver={() => setEmpezo(false)}
      alGoogle={() => actualizar({ iniciada: true, metodo: 'google' })}
      alEnviarCodigo={() => {}}
      alConfirmar={(email) => actualizar({ iniciada: true, metodo: 'email', email })}
    />
  );
}
