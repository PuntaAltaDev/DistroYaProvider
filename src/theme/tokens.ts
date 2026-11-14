/**
 * Sistema de diseño DistroYa.
 * Todos los colores, tamaños y animaciones salen de este archivo.
 * Regla: ninguna pantalla escribe un color o un tamaño "a mano".
 */

/** Paleta base: valores fijos. Las pantallas NO la usan directo, usan `colors`. */
export const palette = {
  white: '#FFFFFF',

  // Verdes agua (clara).
  mint25: '#EAF6F5',
  mint50: '#E0F2F1',
  mint100: '#D3ECEA',
  mint150: '#C8E7E5',
  mint200: '#A9D3D1',
  mint300: '#7FB9B6',

  // Turquesa (acento).
  teal400: '#18A4A3',
  teal500: '#0F8584',
  teal600: '#0A6E6D',

  // Grises verdosos para texto secundario.
  slate300: '#8FB3B3',
  slate400: '#6F9496',
  slate500: '#517273',
  slate600: '#3E5F60',

  // Fondos oscuros.
  deep600: '#2A5658',
  deep700: '#1D4446',
  deep800: '#0F3335',
  deep850: '#0A2A2C',
  deep900: '#041F21',
  foam: '#EAF3F2',

  lime: '#BECF6E',

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
  | 'accent'
  | 'actionBg'
  | 'actionText'
  | 'actionAccent'
  | 'success'
  | 'danger'
  | 'overlay';

export type AppColors = Record<ColorToken, string>;

/** Colores con significado. Mismas claves en claro y oscuro. */
const light: AppColors = {
  background: palette.white,
  surface: palette.mint25,
  surfaceAlt: palette.mint50,
  border: palette.mint200,
  borderStrong: palette.mint300,

  text: palette.deep900,
  textSecondary: palette.slate600,
  /** Textos de ejemplo (placeholder): llega a 4,5:1 sobre el fondo. */
  textMuted: palette.slate500,

  /** Cursor, avance y líneas activas. No se usa para texto chico. */
  primary: palette.teal400,
  primaryPressed: palette.teal500,
  onPrimary: palette.deep900,
  primarySoft: palette.mint150,
  /** Turquesa oscurecido para texto chico, números y flechas. */
  primaryText: palette.teal600,
  /** Frase de acento de los titulares (texto grande). */
  accent: palette.teal500,

  actionBg: palette.deep900,
  actionText: palette.white,
  actionAccent: palette.lime,

  success: palette.green600,
  danger: palette.red600,
  overlay: 'rgba(4, 31, 33, 0.4)',
};

const dark: AppColors = {
  background: palette.deep900,
  surface: palette.deep850,
  surfaceAlt: palette.deep800,
  border: palette.deep700,
  borderStrong: palette.deep600,

  text: palette.foam,
  textSecondary: palette.slate300,
  textMuted: palette.slate400,

  primary: palette.lime,
  primaryPressed: palette.lime,
  onPrimary: palette.deep900,
  primarySoft: palette.deep800,
  primaryText: palette.teal400,
  accent: palette.teal400,

  actionBg: palette.lime,
  actionText: palette.deep900,
  actionAccent: palette.deep900,

  success: palette.green300,
  danger: palette.red300,
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const colors = { light, dark };
export type ColorScheme = keyof typeof colors;

/** Familias de Inter (se cargan en `_layout.tsx`). */
export const fonts = {
  /** Solo en tamaños grandes (frase de acento de los titulares). */
  light: 'Inter_200ExtraLight',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Números del mismo ancho: fechas, teléfonos y contadores quedan alineados. */
const tabular = ['tabular-nums'] as ('tabular-nums')[];

/** Escala tipográfica. Mínimo 13px; cuerpo 15–17px con renglón de ~1,4. */
export const typography = {
  largeTitle: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.6, fontVariant: tabular },
  title: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, fontVariant: tabular },
  title2: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3, fontVariant: tabular },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23, letterSpacing: -0.2, fontVariant: tabular },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, letterSpacing: -0.1, fontVariant: tabular },
  callout: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, letterSpacing: -0.1, fontVariant: tabular },
  subhead: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, letterSpacing: 0, fontVariant: tabular },
  footnote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0, fontVariant: tabular },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0, fontVariant: tabular },
  overline: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 2.5, fontVariant: tabular },
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
