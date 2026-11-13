import { useRef, useState, type ComponentRef } from 'react';
import { type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { LineField } from '@/components/ui/line-field';
import { Titular } from '@/features/registro/editorial';
import { PasoLogo, PasoRubros } from '@/features/registro/pasos';
import {
  limpiarTelefono,
  validarPaso,
  type Errores,
  type RegistroForm,
} from '@/features/registro/validacion';
import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { Marco } from './marco';

type PerfilScreenProps = {
  form: RegistroForm;
  alVolver: () => void;
  /** Recibe el perfil ya revisado. Acá va a ir la llamada a la API de Seba. */
  alGuardar: (form: RegistroForm) => void;
};

const sinAccion = () => {};

/** El perfil del proveedor: se puede cambiar todo (logo, nombre, contacto, dirección y rubros) y guardar. */
export function PerfilScreen({ form, alVolver, alGuardar }: PerfilScreenProps) {
  const { spacing } = useAppTheme();
  const telefonoRef = useRef<ComponentRef<typeof TextInput>>(null);
  const direccionRef = useRef<ComponentRef<typeof TextInput>>(null);

  // Se trabaja sobre una copia: nada cambia de verdad hasta tocar "Guardar cambios".
  const [borrador, setBorrador] = useState<RegistroForm>(form);
  const [errores, setErrores] = useState<Errores>({});
  const [guardado, setGuardado] = useState(false);

  const cambiar = (cambios: Partial<RegistroForm>) => {
    setBorrador((actual) => ({ ...actual, ...cambios }));
    setGuardado(false);
    setErrores((actuales) => {
      const siguientes = { ...actuales };
      for (const campo of Object.keys(cambios)) delete siguientes[campo as keyof Errores];
      return siguientes;
    });
  };

  const guardar = () => {
    // Las mismas reglas que en el registro.
    const encontrados: Errores = {
      ...validarPaso('nombre', borrador),
      ...validarPaso('contacto', borrador),
      ...validarPaso('direccion', borrador),
      ...validarPaso('rubros', borrador),
    };
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      haptics.error();
      return;
    }
    const limpio = {
      ...borrador,
      razonSocial: borrador.razonSocial.trim(),
      direccion: borrador.direccion.trim(),
    };
    setBorrador(limpio);
    alGuardar(limpio);
    setGuardado(true);
    haptics.success();
  };

  const pasoProps = { form: borrador, errores, cambiar, alTerminar: sinAccion };

  return (
    <Marco
      derecha="MI PERFIL"
      alVolver={alVolver}
      accion={{ label: guardado ? 'Cambios guardados' : 'Guardar cambios', onPress: guardar }}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Tu']} acento="perfil." clave="perfil" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Así te ven los bares y restaurantes. Cambiá lo que necesites.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280).duration(400)}>
        <PasoLogo {...pasoProps} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340).duration(400)} style={{ gap: spacing.xl }}>
        <LineField
          label="Razón social"
          placeholder="Distribuidora del Sur"
          value={borrador.razonSocial}
          onChangeText={(razonSocial) => cambiar({ razonSocial })}
          error={errores.razonSocial}
          autoCapitalize="words"
          autoComplete="organization"
        />
        <LineField
          label="WhatsApp"
          placeholder="11 5555 0000"
          value={borrador.whatsapp}
          onChangeText={(texto) => cambiar({ whatsapp: limpiarTelefono(texto) })}
          error={errores.whatsapp}
          helper="Con código de área, sin 0 ni 15."
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="next"
          onSubmitEditing={() => telefonoRef.current?.focus()}
        />
        <LineField
          inputRef={telefonoRef}
          label="Teléfono fijo · opcional"
          placeholder="0291 455 0000"
          value={borrador.telefono}
          onChangeText={(texto) => cambiar({ telefono: limpiarTelefono(texto) })}
          error={errores.telefono}
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => direccionRef.current?.focus()}
        />
        <LineField
          inputRef={direccionRef}
          label="Dirección"
          placeholder="Calle, número y localidad"
          value={borrador.direccion}
          onChangeText={(direccion) => cambiar({ direccion })}
          error={errores.direccion}
          autoCapitalize="words"
          autoComplete="street-address"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ gap: spacing.md }}>
        <AppText variant="overline" color="textSecondary">
          RUBROS
        </AppText>
        <PasoRubros {...pasoProps} />
      </Animated.View>
    </Marco>
  );
}
