import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { haptics } from '@/lib/haptics';
import { useAppTheme } from '@/theme';

import { AppText } from './app-text';

type BotonGoogleProps = {
  onPress: () => void;
  label?: string;
};

/** La "G" de Google, con sus cuatro colores. Los colores de la marca no cambian con el modo. */
function LogoG({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <Path
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
        fill="#4285F4"
      />
      <Path
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
        fill="#34A853"
      />
      <Path
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
        fill="#FBBC05"
      />
      <Path
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/** Botón secundario para entrar con la cuenta de Google. */
export function BotonGoogle({ onPress, label = 'Continuar con Google' }: BotonGoogleProps) {
  const { spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.boton,
        {
          gap: spacing.md,
          paddingVertical: spacing.lg,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <LogoG size={20} />
      <AppText variant="headline">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    // Alineado a la izquierda, como el resto de la pantalla.
    justifyContent: 'flex-start',
  },
});
