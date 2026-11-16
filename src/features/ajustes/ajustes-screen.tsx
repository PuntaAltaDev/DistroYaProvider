import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { InterruptorAvisos } from '@/features/avisos/interruptor-avisos';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import { Marco } from '@/components/ui/marco';
import { Titular } from '@/components/ui/editorial';
import { verLegal } from '@/features/legal/ver-legal';
import { haptics } from '@/lib/haptics';
import { useAppTheme, type AppColors, type ThemeMode } from '@/theme';

const MODOS: { valor: ThemeMode; etiqueta: string }[] = [
  { valor: 'light', etiqueta: 'Claro' },
  { valor: 'dark', etiqueta: 'Oscuro' },
  { valor: 'system', etiqueta: 'Como el teléfono' },
];

/** Ajustes del proveedor: cómo se ve la app, los avisos, su cuenta y lo legal. */
export function AjustesScreen({ alVolver }: { alVolver: () => void }) {
  const { spacing, mode, setMode } = useAppTheme();
  const { actualizar, reiniciar } = useCuenta();
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cerrarSesion = () => {
    haptics.tap();
    // Se cierra el acceso pero se conservan el perfil y el avance del registro: al volver a
    // entrar, sigue donde estaba. Con la API, acá también se cierra la sesión en el servidor.
    actualizar({ iniciada: false, metodo: undefined, email: undefined });
  };

  const eliminarCuenta = async () => {
    setEliminando(true);
    // Todavía no hay servidor: se borra lo guardado en el teléfono. Con la API, primero se
    // pide al servidor que elimine la cuenta y recién después se borra acá.
    await reiniciar();
    haptics.success();
  };

  return (
    <Marco alVolver={alVolver}>
      <Titular lineas={['Tus']} acento="ajustes." clave="ajustes" />

      <Grupo titulo="APARIENCIA" orden={0}>
        {MODOS.map((opcion) => (
          <Fila
            key={opcion.valor}
            etiqueta={opcion.etiqueta}
            rol="radio"
            seleccionada={mode === opcion.valor}
            onPress={() => {
              haptics.select();
              setMode(opcion.valor);
            }}
            derecha={
              mode === opcion.valor ? <Icon name="check" size={20} color="primaryText" /> : null
            }
          />
        ))}
      </Grupo>

      <Grupo titulo="AVISOS" orden={1}>
        <InterruptorAvisos />
      </Grupo>

      <Grupo titulo="CUENTA" orden={2}>
        <Fila etiqueta="Cerrar sesión" onPress={cerrarSesion} />
        <Fila etiqueta="Eliminar cuenta" color="danger" onPress={() => setConfirmando(true)} />
      </Grupo>

      <Grupo titulo="AYUDA Y LEGAL" orden={3}>
        <Fila etiqueta="Ayuda y contacto" flecha onPress={() => router.push('/ayuda')} />
        <Fila etiqueta="Términos y condiciones" flecha onPress={() => verLegal('terminos')} />
        <Fila etiqueta="Política de privacidad" flecha onPress={() => verLegal('privacidad')} />
      </Grupo>

      <BottomSheet
        visible={confirmando}
        onClose={() => !eliminando && setConfirmando(false)}
        title="¿Eliminar tu cuenta?">
        <AppText variant="subhead" color="textSecondary">
          Se borran tu perfil, tu logo y tu lista de precios, y volvés al registro. No se puede
          deshacer.
        </AppText>
        <View style={{ gap: spacing.xs }}>
          <Pressable
            onPress={eliminarCuenta}
            disabled={eliminando}
            accessibilityRole="button"
            style={styles.accion}>
            <AppText variant="headline" color="danger">
              {eliminando ? 'Eliminando…' : 'Eliminar cuenta'}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setConfirmando(false)}
            disabled={eliminando}
            accessibilityRole="button"
            style={styles.accion}>
            <AppText variant="headline">Cancelar</AppText>
          </Pressable>
        </View>
      </BottomSheet>
    </Marco>
  );
}

/** Un bloque de filas con su título. `orden` escalona la animación de entrada. */
function Grupo({
  titulo,
  orden,
  children,
}: {
  titulo: string;
  orden: number;
  children: ReactNode;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(200 + orden * 80).duration(400)}
      style={{ gap: spacing.sm }}>
      <AppText variant="overline" color="textSecondary">
        {titulo}
      </AppText>
      <View style={[styles.grupo, { borderTopColor: colors.border }]}>{children}</View>
    </Animated.View>
  );
}

type FilaProps = {
  etiqueta: string;
  onPress: () => void;
  color?: keyof AppColors;
  /** Lleva una flecha: abre otra pantalla. */
  flecha?: boolean;
  /** Lo que va a la derecha (un tilde, un interruptor). */
  derecha?: ReactNode;
  rol?: 'button' | 'radio' | 'switch';
  seleccionada?: boolean;
};

function Fila({
  etiqueta,
  onPress,
  color = 'text',
  flecha,
  derecha,
  rol = 'button',
  seleccionada,
}: FilaProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={rol}
      accessibilityState={
        rol === 'radio'
          ? { selected: seleccionada }
          : rol === 'switch'
            ? { checked: seleccionada }
            : undefined
      }
      style={[styles.fila, { borderBottomColor: colors.border }]}>
      <AppText variant="body" color={color}>
        {etiqueta}
      </AppText>
      {flecha ? <Icon name="forward" size={18} color="textSecondary" /> : derecha}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grupo: { borderTopWidth: StyleSheet.hairlineWidth },
  fila: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accion: { minHeight: 52, justifyContent: 'center' },
});
