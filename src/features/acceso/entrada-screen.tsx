import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { BotonGoogle } from '@/components/ui/boton-google';
import { Titular } from '@/components/ui/editorial';
import { LineField } from '@/components/ui/line-field';
import { Marco } from '@/components/ui/marco';
import type { DocumentoLegal } from '@/features/legal/textos';
import { useAtras } from '@/lib/atras';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { CampoCodigo } from './campo-codigo';
import { emailValido, LARGO_CODIGO, limpiarEmail } from './validacion';

type EntradaScreenProps = {
  alVolver: () => void;
  /** Abre los términos o la política de privacidad. */
  alVerLegal: (documento: DocumentoLegal) => void;
  /** Acá va a ir el inicio de sesión con Google. */
  alGoogle: () => void;
  /** Acá va a ir el pedido del código a la API de Seba. */
  alEnviarCodigo: (email: string) => void;
  /** Recibe el email y el código ya completos. Acá va a ir la confirmación con la API de Seba. */
  alConfirmar: (email: string, codigo: string) => void;
};

/**
 * Registro e inicio de sesión en una sola pantalla: con la cuenta de Google o con el email. Al enviar el email, el campo se
 * reemplaza por las casillas del código, en la misma pantalla.
 */
export function EntradaScreen({
  alVolver,
  alVerLegal,
  alGoogle,
  alEnviarCodigo,
  alConfirmar,
}: EntradaScreenProps) {
  const { spacing } = useAppTheme();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string>();

  const enviar = () => {
    if (!emailValido(email)) {
      setError('Revisá el email: tiene que ser algo como nombre@correo.com.');
      haptics.error();
      return;
    }
    alEnviarCodigo(limpiarEmail(email));
    setEnviado(true);
  };

  const confirmar = (completo: string) => {
    if (completo.length < LARGO_CODIGO) {
      setError(`El código tiene ${LARGO_CODIGO} números.`);
      haptics.error();
      return;
    }
    alConfirmar(limpiarEmail(email), completo);
  };

  /** Del código, vuelve al email (para corregirlo). */
  const cambiarEmail = () => {
    setEnviado(false);
    setCodigo('');
    setError(undefined);
  };

  // Con el código a la vista, el "atrás" de Android también vuelve al email.
  useAtras(enviado ? cambiarEmail : undefined);

  return (
    <Marco
      alVolver={enviado ? cambiarEmail : alVolver}
      accion={
        enviado
          ? { label: 'Confirmar', onPress: () => confirmar(codigo) }
          : { label: 'Enviar código', onPress: enviar }
      }>
      <Titular lineas={['Registrate o']} acento="iniciá sesión." clave="entrada" />

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={{ gap: spacing.xl }}>
        {enviado ? (
          <Animated.View
            key="codigo"
            entering={FadeInDown.duration(350)}
            style={{ gap: spacing.md }}>
            <AppText variant="overline" color="primaryText" style={styles.etiqueta}>
              CÓDIGO
            </AppText>
            <CampoCodigo
              valor={codigo}
              alCambiar={(valor) => {
                setCodigo(valor);
                setError(undefined);
              }}
              alCompletar={confirmar}
              error={error}
            />
            <Pressable onPress={cambiarEmail} hitSlop={8} accessibilityRole="button">
              <AppText variant="footnote" color="textSecondary">
                Enviado a {limpiarEmail(email)} ·{' '}
                <AppText variant="footnote" color="primaryText">
                  Cambiar
                </AppText>
              </AppText>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View key="email" entering={FadeInDown.duration(350)}>
            <LineField
              label="Email"
              placeholder="nombre@correo.com"
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                setError(undefined);
              }}
              error={error}
              helper="Te mandamos un código."
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={enviar}
            />
          </Animated.View>
        )}

        <BotonGoogle onPress={alGoogle} />

        <AppText variant="footnote" color="textSecondary">
          Al continuar aceptás{' '}
          <AppText
            variant="footnote"
            color="primaryText"
            accessibilityRole="link"
            onPress={() => alVerLegal('terminos')}>
            Términos
          </AppText>{' '}
          y{' '}
          <AppText
            variant="footnote"
            color="primaryText"
            accessibilityRole="link"
            onPress={() => alVerLegal('privacidad')}>
            Privacidad
          </AppText>
          .
        </AppText>
      </Animated.View>
    </Marco>
  );
}

const styles = StyleSheet.create({
  etiqueta: { letterSpacing: 2 },
});
