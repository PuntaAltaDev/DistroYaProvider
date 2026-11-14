import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { permitirAvisos } from '@/features/avisos/avisos';
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
  const { colors, spacing, mode, setMode } = useAppTheme();
  const { cuenta, actualizar, reiniciar } = useCuenta();
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  /** El teléfono tiene los avisos bloqueados: se ofrece ir a sus ajustes. */
  const [bloqueados, setBloqueados] = useState(false);
  const avisosActivos = !!cuenta.avisos?.activos;

  const cerrarSesion = () => {
    haptics.tap();
    // Se cierra el acceso pero se conservan el perfil y el avance del registro: al volver a
    // entrar, sigue donde estaba. Con la API, acá también se cierra la sesión en el servidor.
    actualizar({ iniciada: false, metodo: undefined, email: undefined });
  };

  const cambiarAvisos = async (quiere: boolean) => {
    haptics.select();
    const activos = quiere && (await permitirAvisos());
    setBloqueados(quiere && !activos);
    actualizar((actual) => ({ avisos: { activos, leidos: actual.avisos?.leidos ?? [] } }));
  };

  const eliminarCuenta = async () => {
    setEliminando(true);
    // Todavía no hay servidor: se borra lo guardado en el teléfono. Con la API, primero se
    // pide al servidor que elimine la cuenta y recién después se borra acá.
    await reiniciar();
    haptics.success();
  };

  return (
    <Marco derecha="AJUSTES" alVolver={alVolver}>
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
        <Fila
          etiqueta="Avisos de vencimiento"
          rol="switch"
          seleccionada={avisosActivos}
          onPress={() => cambiarAvisos(!avisosActivos)}
          derecha={
            <Switch
              value={avisosActivos}
              onValueChange={cambiarAvisos}
              trackColor={{ true: colors.primary, false: colors.borderStrong }}
              accessibilityLabel="Avisos de vencimiento"
            />
          }
        />
      </Grupo>
      {bloqueados && Platform.OS !== 'web' ? (
        <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link">
          <AppText variant="footnote" color="textSecondary">
            Los avisos están bloqueados en tu teléfono.{' '}
            <AppText variant="footnote" color="primaryText">
              Abrir ajustes del teléfono
            </AppText>
          </AppText>
        </Pressable>
      ) : null}

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
