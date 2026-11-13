/**
 * Sistema de diseño DistroYa.
 * Todos los colores, tamaños y animaciones salen de este archivo.
 * Regla: ninguna pantalla escribe un color o un tamaño "a mano".
 */

/** Paleta base: valores fijos. Las pantallas NO la usan directo, usan `colors`. */
export const palette = {
  amber50: '#FBF3E6',
  amber100: '#F5E1BF',
  amber300: '#E0AE5C',
  amber400: '#D99A3E',
  amber500: '#C98A2E',
  amber600: '#B07524',
  amber700: '#8F5D1A',
  amber900: '#2A2014',

  white: '#FFFFFF',
  stone25: '#FAF9F7',
  stone50: '#F5F3EF',
  stone100: '#E7E2D8',
  stone200: '#D3CEC4',
  stone400: '#B4AFA6',
  stone500: '#8A867E',
  stone600: '#6E6A63',
  stone650: '#9A958C',
  ink700: '#3A3733',
  ink750: '#2E2C29',
  ink800: '#242220',
  ink850: '#1C1B1A',
  ink900: '#121212',
  ink950: '#141414',
  cream: '#F4F1EA',

  green600: '#2F7A4F',
  green300: '#5FB27F',
  red600: '#B3402E',
  red300: '#E0735F',
} as const;

/** Nombres de los colores con significado. Claro y oscuro tienen que tener todos. */
type ColorToken =
  | 'background'
  | 'surface'
  | 'surfaceAlt'
  | 'border'
  | 'borderStrong'
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'primary'
  | 'primaryPressed'
  | 'onPrimary'
  | 'primarySoft'
  | 'primaryText'
  | 'success'
  | 'danger'
  | 'overlay';

export type AppColors = Record<ColorToken, string>;

/** Colores con significado. Mismas claves en claro y oscuro. */
const light: AppColors = {
  background: palette.white,
  surface: palette.stone25,
  surfaceAlt: palette.stone50,
  border: palette.stone100,
  borderStrong: palette.stone200,

  text: palette.ink950,
  textSecondary: palette.stone500,
  textMuted: palette.stone400,

  primary: palette.amber500,
  primaryPressed: palette.amber600,
  onPrimary: palette.ink950,
  primarySoft: palette.amber50,
  /** Ámbar oscurecido para texto chico sobre blanco (se lee mejor). */
  primaryText: palette.amber700,

  success: palette.green600,
  danger: palette.red600,
  overlay: 'rgba(20, 20, 20, 0.4)',
};

const dark: AppColors = {
  background: palette.ink900,
  surface: palette.ink850,
  surfaceAlt: palette.ink800,
  border: palette.ink750,
  borderStrong: palette.ink700,

  text: palette.cream,
  textSecondary: palette.stone650,
  textMuted: palette.stone600,

  primary: palette.amber400,
  primaryPressed: palette.amber500,
  onPrimary: palette.ink900,
  primarySoft: palette.amber900,
  primaryText: palette.amber300,

  success: palette.green300,
  danger: palette.red300,
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const colors = { light, dark };
export type ColorScheme = keyof typeof colors;

/** Familias de Inter (se cargan en `_layout.tsx`). */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Escala tipográfica inspirada en iOS. */
export const typography = {
  largeTitle: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.6 },
  title: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title2: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: -0.1 },
  callout: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  subhead: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  footnote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  overline: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 3 },
} as const;
export type TypographyVariant = keyof typeof typography;

/** Espacios (múltiplos de 4). */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Redondeos. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Tamaños de controles (táctiles cómodos, estilo tope de gama). */
export const sizes = {
  buttonHeight: 54,
  inputHeight: 58,
  iconSm: 18,
  iconMd: 22,
  iconLg: 28,
  avatar: 64,
} as const;

/** Animaciones: duraciones y "resortes" para que todo se mueva igual. */
export const motion = {
  duration: { fast: 150, base: 250, slow: 400 },
  spring: {
    /** Botones y toques: rápido y firme. */
    snappy: { damping: 18, stiffness: 260, mass: 0.8 },
    /** Pantallas y paneles: suave. */
    gentle: { damping: 22, stiffness: 140, mass: 1 },
  },
  /** Cuánto se achica un botón al tocarlo. */
  pressScale: 0.97,
} as const;
