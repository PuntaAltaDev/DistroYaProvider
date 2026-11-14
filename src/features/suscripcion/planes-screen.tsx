import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Icon } from '@/components/ui/icon';
import { Marco } from '@/components/ui/marco';
import { haptics } from '@/lib/haptics';
import { fonts, useAppTheme } from '@/theme';

import { estadoDe, fechaCorta, type Suscripcion } from './datos';
import { PLANES, precio, type Plan } from './planes';

type PlanesScreenProps = {
  /** La suscripción actual, si tiene. */
  actual?: Suscripcion;
  /** Se llama con el plan ya pagado. */
  alContratar: (plan: Plan) => void;
  alVolver: () => void;
};

/** Elegir un plan (la primera vez) o renovarlo / cambiarlo, y pagarlo. */
export function PlanesScreen({ actual, alContratar, alVolver }: PlanesScreenProps) {
  const { spacing } = useAppTheme();
  const [elegido, setElegido] = useState<Plan>(
    () => PLANES.find((p) => p.nombre === actual?.planName) ?? PLANES[0],
  );
  const [pagando, setPagando] = useState(false);
  const vigente = actual && estadoDe(actual) !== 'vencida';

  const pagar = () => {
    setPagando(true);
    // Todavía no hay servidor: el pago se simula. Con la API, acá se abre el pago de
    // Mercado Pago que arma el backend, y la suscripción nueva la devuelve el servidor.
    setTimeout(() => {
      haptics.success();
      alContratar(elegido);
    }, 1200);
  };

  return (
    <Marco
      alVolver={pagando ? undefined : alVolver}
      accion={{ label: `Pagar ${precio(elegido.precio)}`, onPress: pagar, loading: pagando }}>
      <View style={{ gap: spacing.md }}>
        <Titular
          lineas={[actual ? 'Renová' : 'Elegí']}
          acento="tu plan."
          clave={actual ? 'renovar' : 'elegir'}
        />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            {vigente
              ? `Se suma a lo que te queda: tu plan actual vence el ${fechaCorta(actual.endDate)}.`
              : 'Tu perfil aparece en el buscador mientras tu plan esté vigente.'}
          </AppText>
        </Animated.View>
      </View>

      <View accessibilityRole="radiogroup">
        {PLANES.map((plan, i) => (
          <Animated.View key={plan.id} entering={FadeInDown.delay(280 + i * 80).duration(400)}>
            <FilaPlan
              plan={plan}
              primera={i === 0}
              seleccionado={plan.id === elegido.id}
              alElegir={() => {
                if (pagando) return;
                haptics.select();
                setElegido(plan);
              }}
            />
          </Animated.View>
        ))}
      </View>
    </Marco>
  );
}

type FilaPlanProps = {
  plan: Plan;
  primera: boolean;
  seleccionado: boolean;
  alElegir: () => void;
};

function FilaPlan({ plan, primera, seleccionado, alElegir }: FilaPlanProps) {
  const { colors, spacing } = useAppTheme();
  const duracion = plan.meses === 1 ? '1 mes' : `${plan.meses} meses`;

  return (
    <Pressable
      onPress={alElegir}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionado }}
      accessibilityLabel={`${plan.nombre}, ${duracion}, ${precio(plan.precio)}`}
      style={[
        styles.fila,
        {
          gap: spacing.lg,
          paddingVertical: spacing.xl,
          borderTopWidth: primera ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
          backgroundColor: seleccionado ? colors.primarySoft : 'transparent',
        },
      ]}>
      <View style={[styles.flex, { gap: spacing.xxs, paddingLeft: spacing.md }]}>
        <AppText style={[styles.nombre, { color: colors.text }]}>{plan.nombre}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {duracion} · {precio(plan.precio)}
          {plan.ahorro ? (
            <AppText variant="footnote" color="primaryText">
              {' '}
              · {plan.ahorro}
            </AppText>
          ) : null}
        </AppText>
      </View>
      <View style={{ paddingRight: spacing.md }}>
        {seleccionado ? <Icon name="check" size={22} color="primaryText" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nombre: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.7 },
});
