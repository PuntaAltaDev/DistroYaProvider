import { router } from 'expo-router';

import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { VERSION_LEGAL } from '@/features/legal/textos';
import { verLegal } from '@/features/legal/ver-legal';

import { EntradaScreen } from './entrada-screen';

/**
 * Registro o inicio de sesión (Google, o email y código en la misma pantalla).
 * Todavía no hay servidor: el código y Google se simulan (cualquier código sirve). Cuando esté
 * el login de Seba, se cambia lo que hacen `alEnviarCodigo`, `alConfirmar` y `alGoogle`;
 * las pantallas quedan igual. Al entrar, las rutas protegidas llevan solas a la etapa que sigue.
 */
export function Acceso() {
  const { actualizar } = useCuenta();

  // Entrar implica aceptar los términos vigentes (lo dice la pantalla): se guarda cuáles y cuándo.
  const aceptados = () => ({ version: VERSION_LEGAL, fecha: new Date().toISOString() });

  return (
    <EntradaScreen
      alVolver={() => router.back()}
      alVerLegal={verLegal}
      alGoogle={() => actualizar({ iniciada: true, metodo: 'google', terminos: aceptados() })}
      alEnviarCodigo={() => {}}
      alConfirmar={(email) =>
        actualizar({ iniciada: true, metodo: 'email', email, terminos: aceptados() })
      }
    />
  );
}
