import { Text, type TextProps } from 'react-native';

import { useAppTheme, type AppColors, type TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  /** Estilo tipográfico de la escala (por defecto `body`). */
  variant?: TypographyVariant;
  /** Color del tema (por defecto `text`). */
  color?: keyof AppColors;
};

/** Texto base de DistroYa: siempre usa la tipografía y los colores del tema. */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { typography, colors } = useAppTheme();
  return <Text {...rest} style={[typography[variant], { color: colors[color] }, style]} />;
}
