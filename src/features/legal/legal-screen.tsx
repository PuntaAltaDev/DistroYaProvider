import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Titular } from '@/components/ui/editorial';
import { Marco } from '@/components/ui/marco';
import { useAppTheme } from '@/theme';

import { TEXTOS_LEGALES, VERSION_LEGAL, type DocumentoLegal } from './textos';

const [anio, mes, dia] = VERSION_LEGAL.split('-');

type LegalScreenProps = {
  documento: DocumentoLegal;
  alVolver: () => void;
};

/** Términos y condiciones o política de privacidad: título y secciones cortas. */
export function LegalScreen({ documento, alVolver }: LegalScreenProps) {
  const { spacing } = useAppTheme();
  const { lineas, acento, secciones } = TEXTOS_LEGALES[documento];

  return (
    <Marco alVolver={alVolver}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={lineas} acento={acento} clave={documento} />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="footnote" color="textSecondary">
            Vigente desde el {dia}/{mes}/{anio}
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={{ gap: spacing.xl }}>
        {secciones.map((seccion) => (
          <View key={seccion.titulo} style={{ gap: spacing.xs }}>
            <AppText variant="headline">{seccion.titulo}</AppText>
            <AppText variant="subhead" color="textSecondary">
              {seccion.texto}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </Marco>
  );
}
