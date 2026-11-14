import { useState } from 'react';

import { BienvenidaScreen } from '@/features/bienvenida/bienvenida-screen';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { LegalScreen } from '@/features/legal/legal-screen';
import { VERSION_LEGAL, type DocumentoLegal } from '@/features/legal/textos';

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
  const [legal, setLegal] = useState<DocumentoLegal>();

  if (!empezo) return <BienvenidaScreen alEmpezar={() => setEmpezo(true)} />;
  if (legal) return <LegalScreen documento={legal} alVolver={() => setLegal(undefined)} />;

  // Entrar implica aceptar los términos vigentes (lo dice la pantalla): se guarda cuáles y cuándo.
  const aceptados = () => ({ version: VERSION_LEGAL, fecha: new Date().toISOString() });

  return (
    <EntradaScreen
      alVolver={() => setEmpezo(false)}
      alVerLegal={setLegal}
      alGoogle={() => actualizar({ iniciada: true, metodo: 'google', terminos: aceptados() })}
      alEnviarCodigo={() => {}}
      alConfirmar={(email) =>
        actualizar({ iniciada: true, metodo: 'email', email, terminos: aceptados() })
      }
    />
  );
}
